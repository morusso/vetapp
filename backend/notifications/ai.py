import json
import logging
from abc import ABC, abstractmethod
from urllib import request as urllib_request
from urllib.error import URLError

from django.conf import settings

logger = logging.getLogger(__name__)

REQUEST_TIMEOUT_SECONDS = 30


class MessageDrafter(ABC):
    """Drafts a short client-facing message from a prompt.

    Implementations must never raise - callers fall back to a static template,
    so AI drafting can never block a notification from going out.
    """

    @abstractmethod
    def draft(self, prompt: str, *, system: str | None = None, max_tokens: int = 300) -> str | None:
        """Return the drafted message, or None if drafting isn't possible."""
        ...


class NullDrafter(MessageDrafter):
    """No-op drafter used when no AI provider is configured."""

    def draft(self, prompt: str, *, system: str | None = None, max_tokens: int = 300) -> str | None:
        return None


class OllamaDrafter(MessageDrafter):
    """Drafts messages with a local Ollama model.

    Runs entirely against the on-prem Ollama service, so clinical/client data
    is never sent to a third-party API. Returns None if Ollama is unreachable
    or errors, rather than raising.
    """

    def __init__(self, base_url: str | None = None, model: str | None = None):
        self.base_url = settings.OLLAMA_BASE_URL if base_url is None else base_url
        self.model = settings.OLLAMA_MODEL if model is None else model

    def draft(self, prompt: str, *, system: str | None = None, max_tokens: int = 300) -> str | None:
        messages = [{"role": "system", "content": system}] if system else []
        messages.append({"role": "user", "content": prompt})

        body = json.dumps(
            {
                "model": self.model,
                "messages": messages,
                "stream": False,
                "options": {"num_predict": max_tokens},
            }
        ).encode("utf-8")

        request = urllib_request.Request(
            f"{self.base_url}/api/chat",
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


def get_drafter() -> MessageDrafter:
    """Resolve the configured :class:`MessageDrafter`.

    Returns an :class:`OllamaDrafter` when ``OLLAMA_BASE_URL`` is configured,
    otherwise a :class:`NullDrafter` that always returns None.
    """
    if not settings.OLLAMA_BASE_URL:
        return NullDrafter()
    return OllamaDrafter()


def draft_message(prompt: str, *, system: str | None = None, max_tokens: int = 300) -> str | None:
    """Ask the configured drafter to draft a short client-facing message.

    Kept as a convenience wrapper around :func:`get_drafter`; new callers that
    want to swap providers or test without mocking urllib should depend on
    :class:`MessageDrafter` directly instead.
    """
    return get_drafter().draft(prompt, system=system, max_tokens=max_tokens)
