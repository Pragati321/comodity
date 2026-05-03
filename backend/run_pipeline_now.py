import asyncio
import os
import sys

# Add current directory to path so we can import routers/agents
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import init_db
from agents.agent1_scraper import run_agent1
from agents.agent2_research import run_agent2
from agents.agent3_insights import run_agent3
from config import settings

async def main():
    print("Initializing database...")
    await init_db()
    
    print("Running Agent 1 (Scraper)...")
    await run_agent1()
    
    print("Running Agent 2 (Research)...")
    await run_agent2()
    
    print(f"Waiting for API cooling ({settings.AGENT_SLEEP_SECONDS}s)...")
    await asyncio.sleep(settings.AGENT_SLEEP_SECONDS)
    
    print("Running Agent 3 (Insights)...")
    await run_agent3()
    
    print("Pipeline execution complete.")

if __name__ == "__main__":
    asyncio.run(main())
