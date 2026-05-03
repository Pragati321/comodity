import asyncio
import sys
import os

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'backend', '.env'))

from agents.agent3_insights import run_agent3
from database import init_db

async def test_agent3():
    print("Initializing DB...")
    await init_db()
    print("Running Agent 3...")
    result = await run_agent3()
    print(f"Result: {result}")

if __name__ == "__main__":
    asyncio.run(test_agent3())
