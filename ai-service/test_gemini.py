from dotenv import load_dotenv
load_dotenv()
import os
from groq import Groq

key = os.getenv("GEMINI_API_KEY", "")
print(f"Key loaded: {'YES ✓' if key else 'NO ✗'}")
print(f"Key preview: {key[:12]}...")

client = Groq(api_key=key)
print("Sending test message to Groq (llama-3.1-8b-instant)...")
response = client.chat.completions.create(
    model="llama-3.1-8b-instant",
    messages=[{"role": "user", "content": "Say 'Hello from PSX AI' in one sentence."}],
    max_tokens=50
)
print("Response:", response.choices[0].message.content)
