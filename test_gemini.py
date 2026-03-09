import os
from google import genai
from pydantic import BaseModel, Field

# Check if the key is actually in our environment
key = os.environ.get("GEMINI_API_KEY")
print(f"Key in env: {'YES' if key else 'NO (None)'}")
print(f"Key preview: {key[:5]}..." if key else "")

class MatchResult(BaseModel):
    score: int
    
try:
    client = genai.Client()
    response = client.models.generate_content(
        model='gemini-2.5-pro',
        contents="Say hello",
    )
    print("Client Init: SUCCESS")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Client Init: FAILED - {e}")

