import logging
import time

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from core import adaptive, add_topic


class ChatRequest(BaseModel):
    message: str
    profile: str = "normal"
    state: str = "calm"


class ChatResponse(BaseModel):
    reply: str


app = FastAPI(title="NeuroAdaptive Chatbot API")
logger = logging.getLogger("chat_api")
MAX_CHAT_RETRIES = 3
BASE_BACKOFF = 0.8


def _call_adaptive(payload: ChatRequest) -> str:
    return adaptive(payload.profile, payload.state, payload.message.strip())


@app.post("/api/chat", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    prompt = payload.message.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="message is required")

    for attempt in range(1, MAX_CHAT_RETRIES + 1):
        try:
            reply = _call_adaptive(payload)
        except Exception as exc:  # pragma: no cover - external API
            logger.warning("LLM request attempt %s failed: %s", attempt, exc)
            if attempt == MAX_CHAT_RETRIES:
                raise HTTPException(status_code=502, detail=f"LLM error: {exc}")
        else:
            if "429" in reply:
                logger.warning("LLM attempt %s hit rate limit: %s", attempt, reply)
                if attempt == MAX_CHAT_RETRIES:
                    raise HTTPException(
                        status_code=503,
                        detail="LLM rate limit reached; please retry in a moment.",
                    )
            else:
                add_topic(prompt[:40])
                return ChatResponse(reply=reply)

        time.sleep(BASE_BACKOFF * (2 ** (attempt - 1)))

    raise HTTPException(status_code=503, detail="Chatbot temporarily unavailable; please retry shortly.")
