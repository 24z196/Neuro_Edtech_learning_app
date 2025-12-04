import os
os.environ["GRPC_VERBOSITY"] = "NONE"
os.environ["GRPC_TRACE"] = ""
os.environ["GLOG_minloglevel"] = "3"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

# ---------------------------------------------------------
# IMPORTS
# ---------------------------------------------------------
import logging
from pathlib import Path
import speech_recognition as sr
import pyttsx3
from PIL import Image
import pypdf, docx, pptx
import pytesseract

from core import adaptive, add_topic, call_model

# ---------------------------------------------------------
# LOGGING
# ---------------------------------------------------------
logging.basicConfig(
    filename="companion.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)


# ---------------------------------------------------------
# TTS
# ---------------------------------------------------------
def speak(text):
    try:
        engine = pyttsx3.init()
        engine.say(text)
        engine.runAndWait()
    except:
        print("TTS Error")

# ---------------------------------------------------------
# VOICE INPUT
# ---------------------------------------------------------
rec = sr.Recognizer()

def get_voice():
    try:
        with sr.Microphone() as src:
            audio = rec.listen(src, timeout=3, phrase_time_limit=4)
            return rec.recognize_google(audio)
    except:
        return ""

# ---------------------------------------------------------
# FILE PARSING
# ---------------------------------------------------------
def extract_text(path):
    p = Path(path)
    ext = p.suffix.lower()

    if ext == ".pdf":
        r = pypdf.PdfReader(path)
        return "\n".join(pg.extract_text() or "" for pg in r.pages)

    if ext == ".docx":
        d = docx.Document(path)
        return "\n".join(par.text for par in d.paragraphs)

    if ext == ".pptx":
        pres = pptx.Presentation(path)
        return "\n".join(
            shape.text
            for slide in pres.slides
            for shape in slide.shapes
            if hasattr(shape, "text")
        )

    if ext in [".jpg", ".jpeg", ".png"]:
        return pytesseract.image_to_string(Image.open(path))

    return p.read_text(errors="ignore")

# HANDLE TURN  (QUIZ REMOVED)
# ---------------------------------------------------------
def handle(profile, state, voice=False):

    if voice:
        print("Listening...")
        user = get_voice()
        if not user:
            print("Could not recognize speech.\n")
            return
        print(f"You said: \"{user}\"\n")

    else:
        user = input("You: ").strip()
        if not user:
            return

    response = adaptive(profile, state, user)
    print("\nCompanion:\n" + response + "\n")

    if voice:
        speak(response)

    # The quiz feature has been removed here.
    add_topic(user[:40])

# ---------------------------------------------------------
# UPLOAD
# ---------------------------------------------------------
def upload(profile, state):
    path = input("File path: ").strip()
    p = Path(path)

    if not p.exists():
        print("File not found.")
        return

    text = extract_text(path)
    summary = call_model("Summarize:\n" + text[:4000])
    print("\nSummary:\n" + summary + "\n")

# ---------------------------------------------------------
# MAIN LOOP
# ---------------------------------------------------------
def main():
    print("\nNeuroAdaptive Learning Companion — TURBO STABLE MODE\n")

    profile = ""
    while profile not in ("normal", "adhd"):
        p = input("(n)=normal  (a)=adhd: ").lower()
        profile = {"n": "normal", "a": "adhd"}.get(p, "")

    state = "calm"
    print(f"Profile={profile}, State={state}\n")

    while True:
        cmd = input("(t)=text (v)=voice (u)=upload (m)=state (exit)=quit\nChoice: ").lower()

        if cmd == "exit":
            print("Saving memory... Goodbye.")
            return

        if cmd == "t":
            handle(profile, state, voice=False)

        elif cmd == "v":
            handle(profile, state, voice=True)

        elif cmd == "u":
            upload(profile, state)

        elif cmd == "m":
            s = input("(a)=attention (d)=drowsiness (c)=calm: ").lower()
            state = {"a": "attention", "d": "drowsiness", "c": "calm"}.get(s, state)
            print(f"State={state}\n")

        else:
            print("Unknown option.")

if __name__ == "__main__":
    main()
