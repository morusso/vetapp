import json
import logging
from urllib import request as urllib_request
from urllib.error import URLError

from django.conf import settings

logger = logging.getLogger(__name__)

REQUEST_TIMEOUT_SECONDS = 30


def draft_message(prompt, *, system=None, max_tokens=300):
    """Ask a local Ollama model to draft a short client-facing message.

    Runs entirely against the on-prem Ollama service at OLLAMA_BASE_URL, so
    clinical/client data is never sent to a third-party API. Returns None if
    Ollama isn't configured, unreachable, or errors, so callers must fall back
    to a static template - AI drafting can never block a reminder from going out.
    """
    if not settings.OLLAMA_BASE_URL:
        return None

    messages = [{"role": "system", "content": system}] if system else []
    messages.append({"role": "user", "content": prompt})

    body = json.dumps(
        {
            "model": settings.OLLAMA_MODEL,
            "messages": messages,
            "stream": False,
            "options": {"num_predict": max_tokens},
        }
    ).encode("utf-8")

    request = urllib_request.Request(
        f"{settings.OLLAMA_BASE_URL}/api/chat",
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib_request.urlopen(request, timeout=REQUEST_TIMEOUT_SECONDS) as response:
            data = json.loads(response.read())
        text = data["message"]["content"].strip()
        return text or None
    except (URLError, OSError, KeyError, ValueError, TimeoutError):
        logger.exception("AI message drafting failed; falling back to static template.")
        return None
