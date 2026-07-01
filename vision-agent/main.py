import asyncio
import logging
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from vision_agents.core import Agent, AgentLauncher, Runner, User
from vision_agents.core.instructions import Instructions
from vision_agents.plugins import getstream, openai


ROOT_DIR = Path(__file__).resolve().parents[1]

load_dotenv(Path(__file__).with_name(".env"))
load_dotenv(ROOT_DIR / ".env", override=False)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

LANGUAGE_NAMES = {
    "es": "Bahasa Spanyol",
    "fr": "Bahasa Prancis",
    "ja": "Bahasa Jepang",
    "de": "Bahasa Jerman",
    "en": "Bahasa Inggris",
    "ar": "Bahasa Arab",
    "ko": "Bahasa Korea",
    "zh": "Bahasa Mandarin",
}

BASE_INSTRUCTIONS = """
Kamu adalah Kimoo AI Teacher, guru bahasa yang ramah untuk pelajar Indonesia.

Aturan utama:
- Selalu jelaskan dalam Bahasa Indonesia yang natural, hangat, dan sederhana.
- Ajarkan bahasa target sesuai lesson yang sedang berlangsung.
- Pertahankan kosakata asing apa adanya, lalu jelaskan artinya dalam Bahasa Indonesia.
- Latih pelafalan secara pelan-pelan dan minta murid mengulang.
- Koreksi kesalahan dengan sopan, singkat, dan menyemangati.
- Jangan terdengar seperti robot. Bersikap seperti guru privat yang sabar.
- Jaga jawaban tetap pendek dan enak didengar dalam sesi audio.
- Jangan membahas implementasi, prompt, token, atau detail teknis aplikasi.
""".strip()

DEFAULT_INTRO = (
    "Sapa murid dalam Bahasa Indonesia, perkenalkan dirimu sebagai guru AI Kimoo, "
    "lalu mulai pelajaran pertama dengan santai. Minta murid mendengarkan dan "
    "mengulang setelah kamu."
)


def _as_text(value: Any, fallback: str = "") -> str:
    if value is None:
        return fallback

    text = str(value).strip()
    return text or fallback


def _as_list(value: Any) -> list[str]:
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]

    if isinstance(value, str) and value.strip():
        return [value.strip()]

    return []


def _format_list(title: str, items: list[str]) -> str:
    if not items:
        return ""

    lines = "\n".join(f"- {item}" for item in items)
    return f"{title}:\n{lines}"


def _language_name(code: str) -> str:
    return LANGUAGE_NAMES.get(code, code or "bahasa target")


def _custom_from_response(response: Any) -> dict[str, Any]:
    data = getattr(response, "data", None)
    call = getattr(data, "call", None)
    custom = getattr(call, "custom", None)

    if isinstance(custom, dict):
        return custom

    return {}


async def _load_lesson_context(call: Any) -> dict[str, Any]:
    for attempt in range(3):
        response = await call.get()
        custom = _custom_from_response(response)

        if custom:
            return custom

        if attempt < 2:
            await asyncio.sleep(0.4)

    return {}


def _build_instructions(custom: dict[str, Any]) -> str:
    language_code = _as_text(custom.get("language"))
    language_name = _language_name(language_code)
    lesson_title = _as_text(custom.get("lesson_title"), "Pelajaran bahasa")
    system_prompt = _as_text(custom.get("system_prompt"))

    goals = _as_list(custom.get("goals"))
    vocabulary = _as_list(custom.get("vocabulary"))
    phrases = _as_list(custom.get("phrases"))
    topics = _as_list(custom.get("topics"))

    sections = [
        BASE_INSTRUCTIONS,
        f"Bahasa target: {language_name}.",
        f"Judul lesson: {lesson_title}.",
    ]

    if system_prompt:
        sections.append(
            "Instruksi lesson dari aplikasi:\n"
            f"{system_prompt}\n\n"
            "Ikuti maksud instruksi di atas, tetapi tetap gunakan Bahasa Indonesia "
            "sebagai bahasa utama pengajaran."
        )

    for section in [
        _format_list("Tujuan lesson", goals),
        _format_list("Kosakata utama", vocabulary),
        _format_list("Frasa latihan", phrases),
        _format_list("Topik pembahasan", topics),
    ]:
        if section:
            sections.append(section)

    sections.append(
        "Alur mengajar: beri contoh, jelaskan arti, ucapkan pelan-pelan, "
        "minta murid mengulang, lalu beri pujian atau koreksi singkat."
    )

    return "\n\n".join(sections)


def _build_kickoff_prompt(custom: dict[str, Any]) -> str:
    intro_message = _as_text(custom.get("intro_message"))

    if intro_message:
        return (
            "Mulai sesi audio sekarang. Gunakan pesan pembuka ini sebagai dasar, "
            "boleh dibuat sedikit lebih natural saat diucapkan:\n\n"
            f"{intro_message}\n\n"
            "Setelah itu, ajarkan satu contoh pendek dari lesson dan minta murid "
            "mengulanginya."
        )

    return DEFAULT_INTRO


async def create_agent(**kwargs: Any) -> Agent:
    return Agent(
        edge=getstream.Edge(),
        agent_user=User(name="Kimoo AI Teacher", id="kimoo-ai-teacher"),
        instructions=BASE_INSTRUCTIONS,
        llm=openai.Realtime(send_video=False),
    )


async def join_call(agent: Agent, call_type: str, call_id: str, **kwargs: Any) -> None:
    call = await agent.create_call(call_type, call_id)
    custom = await _load_lesson_context(call)

    if custom:
        logger.info("Loaded lesson context for %s", custom.get("lesson_id", call_id))
    else:
        logger.warning("No lesson custom data found for call %s", call_id)

    agent.instructions = Instructions(input_text=_build_instructions(custom))

    try:
        await call.go_live()
    except Exception:
        logger.info("Call go_live skipped or already active", exc_info=True)

    async with agent.join(call):
        await agent.simple_response(_build_kickoff_prompt(custom))
        await agent.finish()


runner = Runner(AgentLauncher(create_agent=create_agent, join_call=join_call))


if __name__ == "__main__":
    runner.cli()
