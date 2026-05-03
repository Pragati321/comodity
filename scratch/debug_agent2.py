import asyncio
import os
import sys

# Add the backend directory to sys.path
sys.path.append(r"c:\Users\PragatiArora\Downloads\Deep Research\backend")

from agents.agent2_research import run_agent2
from config import settings

async def main():
    try:
        # Mocking some parts if necessary, or just run it
        await run_agent2()
    except Exception as e:
        print(f"Caught error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
