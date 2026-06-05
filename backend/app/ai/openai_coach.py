from app.ai.mock_coach import generate_mock_coaching_response
from app.coaching.prompts import build_coaching_prompt
from app.config import get_settings
from app.models import CoachingContext, CoachingResponse


async def get_coach_response(context: CoachingContext) -> CoachingResponse:
    settings = get_settings()
    if settings.use_mock_ai or not settings.openai_api_key:
        return await generate_mock_coaching_response(context)

    try:
        from openai import AsyncOpenAI
    except ImportError:
        response = await generate_mock_coaching_response(context)
        response.summary = (
            "Mock coach: the OpenAI SDK is not installed, so I am using development "
            "coaching feedback instead."
        )
        return response

    client = AsyncOpenAI(api_key=settings.openai_api_key)
    prompt = build_coaching_prompt(context)
    completion = await client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a clear, practical chess coach. Explain mistakes simply, "
                    "name recurring patterns, and suggest focused training."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.4,
    )
    content = completion.choices[0].message.content or ""
    return CoachingResponse(
        provider="openai",
        summary=content,
        key_takeaways=[],
        suggested_training=[],
        is_mock=False,
    )
