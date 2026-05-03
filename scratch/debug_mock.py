import asyncio
import sys
import os
import json

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'backend', '.env'))

import services.llm_service
print(f"Imported from: {services.llm_service.__file__}")

from services.llm_service import call_llm

async def debug_mock():
    prompt = "Use Google Search to find global events..."
    print(f"Calling LLM with prompt: {prompt[:50]}...")
    response = await call_llm(prompt)
    print(f"Response type: {type(response)}")
    print(f"Response start: {response[:100]}")

if __name__ == "__main__":
    asyncio.run(debug_mock())
