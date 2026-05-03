from google import genai
import os
from dotenv import load_dotenv

load_dotenv(r'c:\Users\PragatiArora\Downloads\Deep Research\backend\.env')
api_key = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=api_key)

models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro"]

for model in models:
    try:
        print(f"Testing model: {model}")
        response = client.models.generate_content(
            model=model,
            contents="Hello, say 'Test successful'"
        )
        print(f"  Result: {response.text}")
    except Exception as e:
        print(f"  Error with {model}: {e}")
