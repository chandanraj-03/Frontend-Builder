"""
Chat router — /api/chat

Routes
------
POST /api/chat   — send a message (with optional history) to Ollama, get a reply
"""

from __future__ import annotations
from typing import Optional, List
from pydantic import BaseModel
from fastapi import APIRouter, Depends

from backend.auth import get_current_user_id
from transformer_core.config import OLLAMA_MODEL

router = APIRouter(prefix="/api/chat", tags=["Chat"])


class ChatMessage(BaseModel):
    role: str      # "user" or "assistant"
    content: str


class ChatBody(BaseModel):
    message: str
    messages: Optional[List[ChatMessage]] = None  # full conversation history


@router.post("", summary="Chat with the AI assistant")
def chat(body: ChatBody, user_id: str = Depends(get_current_user_id)):
    try:
        import ollama

        system_msg = {
            "role": "system",
            "content": (
                "You are a helpful AI assistant embedded in Frontend AI Builder — "
                "a platform that generates React/HTML websites from natural-language prompts. "
                "Help users with web-dev questions, project ideas, CSS tricks, JS patterns, "
                "and anything related to their builds. Be concise and friendly."
            ),
        }

        # Build the full message list.
        # If the frontend sends the conversation history, use it (minus any system msgs).
        # Otherwise fall back to single-message mode.
        if body.messages:
            history = [
                {"role": m.role, "content": m.content}
                for m in body.messages
                if m.role in ("user", "assistant")
            ]
        else:
            history = [{"role": "user", "content": body.message}]

        messages = [system_msg] + history

        resp = ollama.chat(model=OLLAMA_MODEL, messages=messages)
        return {"reply": resp["message"]["content"]}
    except Exception as exc:
        return {"reply": f"⚠️ AI unavailable: {str(exc)[:120]}. Make sure Ollama is running."}
