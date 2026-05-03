import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("No GEMINI_API_KEY found")
    exit(1)

client = genai.Client(api_key=api_key)

try:
    print("Available models:")
    for m in client.models.list():
        print(f"Name: {m.name}, Display Name: {m.display_name}, Supported: {m.supported_generation_methods}")
except Exception as e:
    print(f"Error listing models: {e}")
