import asyncio
import os
from services.llm_service import call_llm
from config import settings

async def test():
    print(f"API Key: {settings.GEMINI_API_KEY[:10]}...")
    print(f"Mock LLM: {settings.MOCK_LLM}")
    
    prompt = "Conduct a deep research analysis for Copper (copper). Return JSON."
    system = "You are a market analyst."
    
    try:
        response = await call_llm(prompt, system_instruction=system, use_search=True)
        print("Response received:")
        print(response[:500])
    except Exception as e:
        print(f"Test failed: {e}")

if __name__ == "__main__":
    import sys
    sys.path.append(os.path.join(os.getcwd()))
    asyncio.run(test())
