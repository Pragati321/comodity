import asyncio
from agents.agent3_insights import run_agent3
from database import init_db

async def test():
    await init_db()
    result = await run_agent3()
    print("Result:", result)

if __name__ == "__main__":
    asyncio.run(test())
