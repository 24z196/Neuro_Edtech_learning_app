import logging
import time
import base64
from pathlib import Path

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel

from core import (
    adaptive, 
    add_topic, 
    summarize_text, 
    extract_text_from_url, 
    extract_text_from_file,
    analyze_image
)


class ChatRequest(BaseModel):
    message: str
    profile: str = "normal"
    state: str = "calm"


class ChatResponse(BaseModel):
    reply: str

class SummaryResponse(BaseModel):
    summary: str

class UrlRequest(BaseModel):
    url: str

class SnapshotRequest(BaseModel):
    image: str # base64 encoded string


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
                logger.info(
                    f"Chat reply length: {len(reply)} chars. First 100 chars: {reply[:100]}"
                )
                return ChatResponse(reply=reply)

        time.sleep(BASE_BACKOFF * (2 ** (attempt - 1)))

<<<<<<< HEAD
    raise HTTPException(
        status_code=503, detail="Chatbot temporarily unavailable; please retry shortly."
    )
=======
    raise HTTPException(status_code=503, detail="Chatbot temporarily unavailable; please retry shortly.")


# --- NEW ENDPOINTS ---

@app.post("/api/process-url", response_model=SummaryResponse)
def process_url(payload: UrlRequest):
    """Processes a URL, extracts text, and returns a summary."""
    if not payload.url:
        raise HTTPException(status_code=400, detail="URL is required")
    
    text = extract_text_from_url(payload.url)
    if text.startswith("Error:"):
        raise HTTPException(status_code=500, detail=text)
        
    summary = summarize_text(text, context=f"from the URL {payload.url}")
    if summary.startswith("Model unavailable"):
        raise HTTPException(status_code=502, detail=summary)
        
    return SummaryResponse(summary=summary)


@app.post("/api/upload-file", response_model=SummaryResponse)
async def upload_file(file: UploadFile = File(...)):
    """Processes an uploaded file, extracts text, and returns a summary."""
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")

    # Save file temporarily
    temp_dir = Path("temp_uploads")
    temp_dir.mkdir(exist_ok=True)
    file_path = temp_dir / file.filename
    
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    # Extract text from the file
    text = extract_text_from_file(file_path)
    
    # Clean up the temp file
    file_path.unlink()

    if text.startswith("Error:"):
        raise HTTPException(status_code=500, detail=text)
    
    summary = summarize_text(text, context=f"from the file {file.filename}")
    if summary.startswith("Model unavailable"):
        raise HTTPException(status_code=502, detail=summary)

    return SummaryResponse(summary=summary)


@app.post("/api/process-snapshot", response_model=SummaryResponse)
def process_snapshot(payload: SnapshotRequest):
    """Processes a base64 image snapshot, analyzes it, and returns a summary."""
    if not payload.image:
        raise HTTPException(status_code=400, detail="No image data provided")

    try:
        # The frontend sends a data URL: "data:image/jpeg;base64,..."
        # We need to strip the header to get the pure base64 data.
        header, encoded = payload.image.split(",", 1)
        image_data = base64.b64decode(encoded)
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Invalid base64 image format")

    summary = analyze_image(image_data, prompt="Describe the content of this image.")
    if summary.startswith("Error:"):
        raise HTTPException(status_code=500, detail=summary)

    return SummaryResponse(summary=summary)
>>>>>>> branch_peru
