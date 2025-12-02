# CHATB0T_TESTING.PY
# -----------------------------
# SILENCE STARTUP LOGS
# -----------------------------
import os
os.environ["GRPC_VERBOSITY"] = "NONE"
os.environ["GRPC_CPP_VERBOSITY"] = "NONE"
os.environ["GRPC_TRACE"] = ""
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
import re, json, time, logging
from pathlib import Path
from collections import OrderedDict
from dotenv import load_dotenv
import pypdf, docx, pptx, pyttsx3, speech_recognition as sr
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted
# -----------------------------
# CLEAN FILE LOGGING
# -----------------------------
logging.basicConfig(
    filename="companion_debug.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
# -----------------------------
# CONFIG
# -----------------------------
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError(" 🔴  GEMINI_API_KEY missing from .env")
genai.configure(api_key=API_KEY)
MODEL_NAME = "gemini-2.5-pro"  # enforced
DEFAULT_GEN_CONFIG = {"temperature": 0.6, "top_p": 0.9, "top_k": 40, "max_output_tokens": 2048}
MAX_FILE_SIZE = 50 * 1024 * 1024
MEMORY_PATH = Path("neuro_memory_v5_5.json")
MEMORY_MAX_TOPICS = 200  # LRU cache limit
# -----------------------------
# MEMORY WITH LRU CACHE
# -----------------------------
def load_memory():
    if MEMORY_PATH.exists():
        try:
            mem_data = json.loads(MEMORY_PATH.read_text(encoding="utf-8"))
            topics = mem_data.get("topics", [])
            ordered = OrderedDict((t, None) for t in topics[-MEMORY_MAX_TOPICS:])
            mem_data["topics"] = list(ordered.keys())
            mem_data["history"] = mem_data.get("history", [])
            return mem_data
        except Exception:
            return {"topics": [], "history": []}
    return {"topics": [], "history": []}
def save_memory(mem):
    MEMORY_PATH.write_text(json.dumps(mem, ensure_ascii=False, indent=2), encoding="utf-8")
memory = load_memory()
def add_topic_memory(topic):
    topic = topic.strip()[:100]
    if topic in memory["topics"]:
        memory["topics"].remove(topic)
    memory["topics"].append(topic)
    while len(memory["topics"]) > MEMORY_MAX_TOPICS:
        memory["topics"].pop(0)
    memory["history"].append({"topic": topic, "ts": time.time()})
    save_memory(memory)
# -----------------------------
# TTS ENGINE
# -----------------------------
def speak(text, enabled=False):
    if enabled and text.strip():
        engine = None # Ensure a clean start
        try:
            # 1. Initialize the engine *inside* the function
            engine = pyttsx3.init()
            engine.setProperty("rate", 165)
            engine.setProperty("volume", 1.0)

            # 2. Say the text and run the loop
            engine.say(text)
            engine.runAndWait()

            # 3. Explicitly stop the engine loop
            engine.stop()
        except Exception as e:
            print(f"ERROR: TTS failed: {e}")
            logging.error(f"TTS failed: {e}")
        finally:
            # 4. Clean up the engine object
            if engine:
                del engine
# -----------------------------
# SPEECH-TO-TEXT
# -----------------------------
sr_recog = sr.Recognizer()
def init_mic():
    try:
        import pyaudio
        with sr.Microphone() as src:
            sr_recog.adjust_for_ambient_noise(src, duration=0.8)
    except ImportError:
        print("WARN: PyAudio not found. Voice input disabled.")
    except Exception as e:
        print(f"WARN: Mic init failed: {e}")
init_mic()
def get_voice_input(timeout=5, phrase_time_limit=10):
    audio = None
    try:
        with sr.Microphone() as src:
            print(" 🎤  Listening...")
            audio = sr_recog.listen(src, timeout=timeout, phrase_time_limit=phrase_time_limit)
        recognized_text = sr_recog.recognize_google(audio)
        return recognized_text
    except Exception as e:
        print(f"WARN: Voice input failed: {e}")
        return ""
    finally:
        if audio:
            del audio
# -----------------------------
# FILE EXTRACTION
# -----------------------------
def extract_text(path, max_chars=20000):
    p = Path(path); ext = p.suffix.lower()
    if ext == ".pdf":
        with open(path, "rb") as f:
            reader = pypdf.PdfReader(f)
            pages = [pg.extract_text() or "" for pg in reader.pages[:50]]
        return "\n".join(pages)[:max_chars]
    if ext == ".docx":
        doc = docx.Document(path)
        return "\n".join(p.text for p in doc.paragraphs)[:max_chars]
    if ext == ".pptx":
        pres = pptx.Presentation(path)
        return "\n".join(shape.text for s in pres.slides for shape in s.shapes if hasattr(shape, "text"))[:max_chars]
    if ext in [".xls", ".xlsx"]:
        try:
            import openpyxl
            wb = openpyxl.load_workbook(path, data_only=True)
            texts=[]
            for sheet in wb.worksheets:
                for row in sheet.iter_rows(values_only=True):
                    texts.append(" | ".join(str(c) if c is not None else "" for c in row))
            return "\n".join(texts)[:max_chars]
        except Exception as e: return f"[EXCEL ERROR: {e}]"
    if ext in [".png", ".jpg", ".jpeg"]:
        return f"[IMAGE: {p.name}] (OCR not yet supported.)"
    raise ValueError("Unsupported file type")
# -----------------------------
# HELPERS
# -----------------------------
def sanitize(text): return re.sub(r"\b\d{9,19}\b", "[REDACTED]", (text or ""))
def build_conversation_context(memory, max_topics=5):
    if not memory.get("topics"): return ""
    recent = memory["topics"][-max_topics:]
    return f"Recent topics covered: {', '.join(recent)}"
# -----------------------------
# MODEL CALL
# -----------------------------
def call_model(prompt_text, cfg=None, retries=3):
    cfg = cfg or DEFAULT_GEN_CONFIG
    for attempt in range(retries):
        try:
            model = genai.GenerativeModel(MODEL_NAME, generation_config=cfg)
            resp = model.generate_content(prompt_text)
            if not resp.candidates: return " ⚠️  Model error: No response."
            finish_reason = resp.candidates[0].finish_reason.name
            if finish_reason == "STOP":
                return getattr(resp, "text", "").strip() or " ⚠️  Empty response."
            return f" ⚠️  Model stopped ({finish_reason})."
        except ResourceExhausted:
            if attempt >= retries - 1: return " ⚠️  Quota exceeded. Try later."
            time.sleep(2 ** attempt)
        except Exception as e:
            return f" ⚠️  Error: {e}"
    return " ⚠️  Failed after retries."
# -----------------------------
# MASTER PROMPT SYSTEM
# -----------------------------
def get_adaptive_instructions(profile, state):
    if state == "focus":
        state_instruction = (
            "**State: Focused.** Deep Dive content with technical details and applications."
        )
    elif state == "confused":
        state_instruction = (
            "**State: Confused.** Explain step-by-step with analogies and examples."
        )
    elif state == "stressed":
        state_instruction = (
            "**State: Stressed.** Calm, supportive, motivating explanation."
        )
    else:
        state_instruction = "**State: Normal.** Standard clear explanation."
    profile_modifier = ""
    if profile == "adhd":
        profile_modifier = "Keep concise, high energy, use bullets and short sentences."
    elif profile == "dyslexic":
        profile_modifier = "Use simple language, bullets, and described visuals/audio analogies."
    elif profile == "normal":
        profile_modifier = "No modifications."
    return f"{state_instruction}\n{profile_modifier}"
def build_prompt(profile, state, mode, user_input, context=""):
    adaptive_instructions = get_adaptive_instructions(profile, state)
    prompt = f"""
You are the NeuroAdaptive Learning Companion, expert tutor, adaptive and concise.
**ADAPTIVE FRAMEWORK:**
{adaptive_instructions}
Mode: {mode}
Context: {context[:5000]}
User input: {sanitize(user_input)}
Rules:
- Explain clearly and concisely, following the ADAPTIVE FRAMEWORK above.
- **CRITICAL: No mini quizzes, no 'Next step' suggestions.**
- Safety: redact PII, be cautious with sensitive queries
"""
    return prompt
# -----------------------------
# HANDLER FUNCTIONS
# -----------------------------
def handle_turn(profile, state, use_voice_input=False, user_text=None):
    if not user_text:
        user_text = get_voice_input() if use_voice_input else input("You: ").strip()
    if not user_text: return
    context = build_conversation_context(memory)
    mode = "voice" if use_voice_input else "text"
    prompt = build_prompt(profile, state, mode, user_text, context)
    response = call_model(prompt)
    response_cleaned = re.sub(r"[*#]{1,}", "", response).strip()
    print("\n 🤖  Companion:\n" + response_cleaned + "\n")
    add_topic_memory(user_text[:50])

    # --- MODIFIED BLOCK ---
    # Only speak if voice input was used OR the profile is 'dyslexic'.
    if use_voice_input or profile == "dyslexic":
        speak(response_cleaned, True)
    # --- END MODIFIED BLOCK ---

def upload_flow(profile, state):
    user_line = input("Enter file path (and optional prompt): ").strip()
    if not user_line: return
    path_match = re.search(r'^(?:"(.*?)"|' + r"'(.*?)'|" + r'([^\s]+))', user_line)
    if not path_match: return print(" ⚠️  Could not find a file path.")
    path = (path_match.group(1) or path_match.group(2) or path_match.group(3)).strip()
    user_prompt_text = user_line[path_match.end(0):].strip()
    if not path or not os.path.exists(path):
        return print(f"File not found: {path}")
    if os.path.getsize(path) > MAX_FILE_SIZE:
        print(" ⚠️  File too large. Only first 20,000 characters analyzed.")
    try:
        raw_content = extract_text(path)
        print(f" ✅  File '{Path(path).name}' uploaded successfully.")
    except Exception as e:
        return print(f" ⚠️  Extraction error: {e}")
    add_topic_memory(Path(path).stem[:50])
    if not user_prompt_text:
        user_prompt_text = f"Summarize this document: {Path(path).stem}"
    prompt = build_prompt(profile, state, "upload", user_prompt_text, context=raw_content[:5000])
    out = call_model(prompt)
    out_cleaned = re.sub(r"[*#]{1,}", "", out).strip()
    print("\n 🤖  Companion:\n" + out_cleaned + "\n")

    # --- MODIFIED BLOCK ---
    # Call to speak() has been removed from upload_flow.
    # --- END MODIFIED BLOCK ---
    
# -----------------------------
# FLASK API FOR FRONTEND INTEGRATION
# -----------------------------
try:
    from flask import Flask, request, jsonify
    import threading
    app = Flask(__name__)

    @app.route('/api/chat', methods=['POST'])
    def chat_endpoint():
        data = request.get_json(force=True)
        user_text = data.get('message', '')
        profile = data.get('profile', 'normal')
        state = data.get('state', 'normal')
        if not user_text:
            return jsonify({'error': 'No message provided'}), 400
        context = build_conversation_context(memory)
        prompt = build_prompt(profile, state, 'text', user_text, context)
        response = call_model(prompt)
        response_cleaned = re.sub(r"[*#]{1,}", "", response).strip()
        add_topic_memory(user_text[:50])
        return jsonify({'reply': response_cleaned})

    def run_flask():
        app.run(host='0.0.0.0', port=5000)

    # Start Flask in a separate thread if running as main
    if __name__ == "__main__":
        threading.Thread(target=run_flask, daemon=True).start()
except ImportError:
    print("Flask not installed. API integration disabled.")
# -----------------------------
# MAIN LOOP
# -----------------------------
def main():
    print("\n 🤖  NeuroAdaptive Learning Companion v5.5")
    profile = ""
    while profile not in ("normal", "adhd", "dyslexic"):
        ch = input("Select profile: (" \
            "n) normal  (a) adhd  (d) dyslexic: ").strip().lower()
        profile = {"n": "normal", "a": "adhd", "d": "dyslexic"}.get(ch, "")
    state = "normal"
    print(f"Profile set: {profile}. State: {state}.\n")
    # 'read_aloud_flag' has been removed as it's no longer needed.
    while True:
        try:
            print("Actions: (t) text  (v) voice  (u) upload  (m) set state  (exit) quit")
            cmd = input("Choice: ").strip().lower()
            if cmd in ("exit", "quit"):
                print("Saving memory... bye!")
                save_memory(memory)
                break
            # --- MODIFIED CALLS ---
            elif cmd == "t":
                handle_turn(profile, state, use_voice_input=False)
            elif cmd == "v":
                handle_turn(profile, state, use_voice_input=True)
            elif cmd == "u":
                upload_flow(profile, state)
            # --- END MODIFIED CALLS ---
            elif cmd == "m":
                print("Set state: (f) focus  (c) confused  (s) stressed  (n) normal")
                k = input("Choice: ").strip().lower()
                state = {"f": "focus", "c": "confused", "s": "stressed", "n": "normal"}.get(k, "normal")
                print(f"State set to {state}.")
            else:
                print("Unknown choice. Please select a valid action.")
        except KeyboardInterrupt:
            print("\nInterrupted. Exiting safely.")
            save_memory(memory)
            break
        except Exception as e:
            print(f" ⚠️  Runtime error: {e}")
            logging.error(f"Runtime error: {e}")
if __name__ == "__main__":
    main()