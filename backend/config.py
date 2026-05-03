"""
Configuration loader for the Commodity Intelligence Platform.
Loads environment variables with sensible defaults.
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    MOCK_LLM: bool = os.getenv("MOCK_LLM", "false").lower() == "true"
    DATABASE_PATH: str = os.getenv("DATABASE_PATH", os.path.join(os.path.dirname(__file__), "commodity_intelligence.db"))
    AGENT_REFRESH_HOURS: int = int(os.getenv("AGENT_REFRESH_HOURS", "06"))
    AGENT_SLEEP_SECONDS: int = int(os.getenv("AGENT_SLEEP_SECONDS", "30"))
    INTELLIGENCE_WINDOW_HOURS: int = int(os.getenv("INTELLIGENCE_WINDOW_HOURS", "72"))
    CORS_ORIGINS: list = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

    @property
    def use_live_llm(self) -> bool:
        return not self.MOCK_LLM and bool(self.GEMINI_API_KEY)


settings = Settings()
