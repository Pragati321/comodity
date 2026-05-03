from google import genai
import os
from dotenv import load_dotenv

load_dotenv(r'c:\Users\PragatiArora\Downloads\Deep Research\backend\.env')
api_key = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=api_key)

try:
    print("Listing models...")
    for model in client.models.list():
        print(f"Model: {model.name}, Supported Actions: {model.supported_actions}")
except Exception as e:
    print(f"Error listing models: {e}")
