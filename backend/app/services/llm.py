import json
import uuid
from typing import AsyncGenerator, Optional
from openai import AsyncOpenAI
from anthropic import AsyncAnthropic
from app.core.config import settings
from app.services.token_tracker import track_usage


class LLMService:
    def __init__(self):
        self.openai_client = AsyncOpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None
        self.anthropic_client = AsyncAnthropic(api_key=settings.anthropic_api_key) if settings.anthropic_api_key else None
        self.openrouter_client = AsyncOpenAI(
            api_key=settings.openrouter_api_key,
            base_url="https://openrouter.ai/api/v1"
        ) if settings.openrouter_api_key else None

    def get_client_and_provider(self, model: str):
        """Determine which client and provider to use based on config and model."""
        provider = settings.default_provider

        # Explicit provider selection via model prefix
        if model.startswith("openrouter/"):
            model = model.replace("openrouter/", "")
            return self.openrouter_client, "openrouter", model
        elif model.startswith("anthropic/"):
            model = model.replace("anthropic/", "")
            return self.anthropic_client, "anthropic", model

        # Use configured default provider
        if provider == "openrouter" and self.openrouter_client:
            return self.openrouter_client, "openrouter", model
        elif provider == "anthropic" and self.anthropic_client:
            return self.anthropic_client, "anthropic", model
        elif provider == "9router":
            return None, "9router", model
        elif provider == "surplus" and settings.surplus_intelligence_enabled:
            return None, "surplus", model
        elif provider == "openai" and self.openai_client:
            return self.openai_client, "openai", model

        # Fallback: use whatever is available
        if self.openrouter_client:
            return self.openrouter_client, "openrouter", model
        elif self.openai_client:
            return self.openai_client, "openai", model
        elif self.anthropic_client:
            return self.anthropic_client, "anthropic", model

        return None, "none", model

    async def stream_chat(
        self,
        messages: list[dict],
        model: str = "gpt-4o",
        system_prompt: str = "",
        temperature: float = 0.7,
        max_tokens: int = 4096,
        conversation_id: str = "",
    ) -> AsyncGenerator[str, None]:
        """Stream chat completion from the appropriate provider."""

        client, provider, model = self.get_client_and_provider(model)

        if provider == "9router":
            async for chunk in self._stream_9router(messages, model, system_prompt, temperature, max_tokens):
                yield chunk
        elif provider == "surplus":
            async for chunk in self._stream_surplus(messages, model, system_prompt, temperature, max_tokens):
                yield chunk
        elif provider in ("openrouter", "openai") and client:
            async for chunk in self._stream_openai_compatible(client, model, system_prompt, temperature, max_tokens, conversation_id, provider):
                yield chunk
        elif provider == "anthropic" and client:
            async for chunk in self._stream_anthropic(client, messages, model, system_prompt, temperature, max_tokens, conversation_id):
                yield chunk
        else:
            yield json.dumps({"error": f"No client available for provider: {provider}"})

    async def _stream_openai_compatible(self, client, model, system_prompt, temperature, max_tokens, conversation_id, provider):
        full_messages = []
        if system_prompt:
            full_messages.append({"role": "system", "content": system_prompt})
        full_messages.extend(messages)

        stream = await client.chat.completions.create(
            model=model,
            messages=full_messages,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=True,
        )

        total_prompt_tokens = 0
        total_completion_tokens = 0

        async for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                yield json.dumps({
                    "type": "token",
                    "content": chunk.choices[0].delta.content
                })

            # Capture usage from streaming response
            if hasattr(chunk, 'usage') and chunk.usage:
                total_prompt_tokens = chunk.usage.prompt_tokens
                total_completion_tokens = chunk.usage.completion_tokens

        # Track usage
        if settings.track_tokens and (total_prompt_tokens or total_completion_tokens):
            await track_usage(
                conversation_id=conversation_id,
                provider=provider,
                model=model,
                prompt_tokens=total_prompt_tokens,
                completion_tokens=total_completion_tokens,
            )

        yield json.dumps({"type": "done"})

    async def _stream_anthropic(self, client, messages, model, system_prompt, temperature, max_tokens, conversation_id):
        stream = await client.messages.create(
            model=model,
            system=system_prompt or "",
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=True,
        )

        prompt_tokens = 0
        completion_tokens = 0

        async for chunk in stream:
            if chunk.type == "content_block_delta" and chunk.delta.text:
                yield json.dumps({
                    "type": "token",
                    "content": chunk.delta.text
                })
            if chunk.type == "message_start":
                prompt_tokens = chunk.message.usage.input_tokens
            if chunk.type == "message_delta":
                completion_tokens = chunk.usage.output_tokens

        if settings.track_tokens and (prompt_tokens or completion_tokens):
            await track_usage(
                conversation_id=conversation_id,
                provider="anthropic",
                model=model,
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
            )

        yield json.dumps({"type": "done"})

    async def _stream_9router(self, messages, model, system_prompt, temperature, max_tokens):
        """Stream through 9Router local proxy."""
        import httpx

        full_messages = []
        if system_prompt:
            full_messages.append({"role": "system", "content": system_prompt})
        full_messages.extend(messages)

        try:
            async with httpx.AsyncClient() as http_client:
                async with http_client.stream(
                    "POST",
                    f"{settings.nine_router_url}/v1/chat/completions",
                    json={
                        "model": model,
                        "messages": full_messages,
                        "temperature": temperature,
                        "max_tokens": max_tokens,
                        "stream": True,
                    },
                    headers={"Content-Type": "application/json"},
                    timeout=120.0,
                ) as response:
                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            data = line[6:]
                            if data == "[DONE]":
                                yield json.dumps({"type": "done"})
                                return
                            try:
                                chunk = json.loads(data)
                                if chunk.get("choices") and chunk["choices"][0].get("delta", {}).get("content"):
                                    yield json.dumps({
                                        "type": "token",
                                        "content": chunk["choices"][0]["delta"]["content"]
                                    })
                                if "usage" in chunk:
                                    yield json.dumps({
                                        "type": "usage",
                                        "provider": "9router",
                                        "model": chunk.get("model", model),
                                        **chunk["usage"]
                                    })
                            except json.JSONDecodeError:
                                continue
        except Exception as e:
            yield json.dumps({"error": f"9Router error: {str(e)}"})

    async def _stream_surplus(self, messages, model, system_prompt, temperature, max_tokens):
        """Stream through Surplus Intelligence API."""
        import httpx

        full_messages = []
        if system_prompt:
            full_messages.append({"role": "system", "content": system_prompt})
        full_messages.extend(messages)

        try:
            async with httpx.AsyncClient(timeout=120.0) as http_client:
                async with http_client.stream(
                    "POST",
                    f"{settings.surplus_intelligence_url}/v1/chat/completions",
                    json={
                        "model": model,
                        "messages": full_messages,
                        "temperature": temperature,
                        "max_tokens": max_tokens,
                        "stream": True,
                    },
                    headers={
                        "Authorization": f"Bearer {settings.surplus_intelligence_api_key}",
                        "Content-Type": "application/json",
                    },
                ) as response:
                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            data = line[6:]
                            if data == "[DONE]":
                                yield json.dumps({"type": "done"})
                                return
                            try:
                                chunk = json.loads(data)
                                if chunk.get("choices") and chunk["choices"][0].get("delta", {}).get("content"):
                                    yield json.dumps({
                                        "type": "token",
                                        "content": chunk["choices"][0]["delta"]["content"]
                                    })
                            except json.JSONDecodeError:
                                continue
        except Exception as e:
            yield json.dumps({"error": f"Surplus Intelligence error: {str(e)}"})


llm_service = LLMService()
