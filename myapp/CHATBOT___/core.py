import json
import os
import random
import re
import sys
import time
from pathlib import Path

from dotenv import load_dotenv
import google.generativeai as genai


def _suppress_warnings():
    class HideStderr:
        def __enter__(self):
            self._original = sys.stderr
            sys.stderr = open(os.devnull, "w")

        def __exit__(self, exc_type, exc_val, exc_tb):
            sys.stderr.close()
            sys.stderr = self._original

    return HideStderr


HideStderr = _suppress_warnings()


load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY missing. Please set it in the .env file.")

genai.configure(api_key=API_KEY)

PRIMARY_MODEL = "gemini-2.5-flash"
FALLBACK_MODEL = "gemini-2.0-flash-lite"
GEN_CFG = {
    "temperature": 0.5,
    "top_p": 0.9,
    "max_output_tokens": 350,
}

MEM_PATH = Path("neuro_memory.json")
memory = {"topics": []}
if MEM_PATH.exists():
    try:
        memory = json.loads(MEM_PATH.read_text())
    except json.JSONDecodeError:
        memory = {"topics": []}


def _persist_memory():
    MEM_PATH.write_text(json.dumps(memory, indent=2))


def add_topic(topic: str) -> None:
    topic = (topic or "")[:60]
    if not topic:
        return
    if topic not in memory["topics"]:
        memory["topics"].append(topic)
    memory["topics"] = memory["topics"][-200:]
    _persist_memory()


def clean(text: str) -> str:
    return re.sub(r"[#*`]+", "", text or "").strip()


def call_model(prompt: str, model: str = PRIMARY_MODEL, cfg: dict | None = None) -> str:
    cfg = cfg or GEN_CFG
    last_error = None

    try:
        with HideStderr():
            gen = genai.GenerativeModel(model, generation_config=cfg)
            result = gen.generate_content(prompt)
        reply = clean(getattr(result, "text", "") or "")
        if reply:
            return reply
    except Exception as exc:  # pragma: no cover - external service
        last_error = exc
        if "429" in str(exc):
            time.sleep(1.2)

    if last_error:
        try:
            with HideStderr():
                gen = genai.GenerativeModel(FALLBACK_MODEL, generation_config=cfg)
                result = gen.generate_content(prompt)
            reply = clean(getattr(result, "text", "") or "")
            if reply:
                return reply
        except Exception as exc:  # pragma: no cover
            last_error = exc

    if last_error:
        try:
            with HideStderr():
                short_cfg = {"max_output_tokens": 120}
                gen = genai.GenerativeModel(FALLBACK_MODEL, generation_config=short_cfg)
                result = gen.generate_content("Short: " + prompt[:200])
            reply = clean(getattr(result, "text", "") or "")
            if reply:
                return reply
        except Exception as exc:  # pragma: no cover
            last_error = exc

    return f"Model unavailable: {last_error or 'unknown error'}"


def adaptive(profile: str, state: str, user_input: str, history: str | None = None) -> str:
    base = f"""
You are the NeuroAdaptive Learning Companion.

Profile: {profile}
State: {state}
User asked: {user_input}

Respond with SHORT, CLEAN TEXT. NO markdown.
"""

    if history:
        base = base.replace("User asked", f"History:\n{history}\n\nUser asked")

    if state == "attention":
        base += """
Give:
1) Short deep explanation
2) One real example
3) Tiny formula (if applicable)
4) Two related topics
"""

    elif state == "drowsiness":
        base += """
Give:
1) Soft simple explanation
2) One story-like analogy
3) A gentle refocus sentence
"""

    else:
        ask_analogy = random.random() < 0.20
        conceptual = any(word in user_input.lower() for word in ["what", "why", "how", "explain", "define", "concept"])

        base += "Give:\n1) Balanced explanation.\n"

        if ask_analogy and conceptual:
            base += "2) Ask user to create an analogy.\n"
        else:
            base += "2) Do NOT ask for analogy.\n"

    return call_model(base)
