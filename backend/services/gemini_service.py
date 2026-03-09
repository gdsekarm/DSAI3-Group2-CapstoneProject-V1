import os
from dotenv import load_dotenv

load_dotenv()
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

def get_gemini_client():
    try:
        return genai.Client()
    except Exception as e:
        print(f"Failed to intialize Gemini Client on-demand: {e}")
        return None

class MatchResult(BaseModel):
    candidate_name: str = Field(description="The full name of the candidate extracted from the CV")
    match_score: int = Field(description="A score from 0 to 100 representing how well the CV matches the JD")
    key_strengths: list[str] = Field(description="List of maximum 5 key strengths or matching skills from the CV")
    missing_skills: list[str] = Field(description="List of maximum 5 key missing skills or weaknesses compared to JD")
    ai_summary: str = Field(description="A brief 2-3 sentence summary explaining the match score")
    recommendation: str = Field(description="A single clear recommendation statement, e.g. 'Strong Hire', 'Interview', 'Hold', or 'Pass'")

def analyze_resume(jd_bytes: bytes, cv_bytes: bytes, mime_type="application/pdf") -> MatchResult:
    """
    Sends the Job Description and CV as PDF inline data to Gemini Pro
    and requests a structured JSON response matching MatchResult.
    """
    client = get_gemini_client()
    if not client:
        raise ValueError("Gemini Client could not be initialized. Please verify GEMINI_API_KEY in the environment runtime.")

    model_id = 'gemini-2.5-flash'
    
    prompt = """
    You are an expert technical recruiter and HR assistant. 
    I have provided two PDF documents: 
    1. The first document is a Job Description (JD).
    2. The second document is a Candidate's Curriculum Vitae (CV).
    
    Your task is to carefully analyze the CV against the JD and provide a comprehensive matching assessment.
    Provide the output strictly matching the requested JSON schema.
    """

    try:
        response = client.models.generate_content(
            model=model_id,
            contents=[
                types.Part.from_bytes(data=jd_bytes, mime_type=mime_type),
                types.Part.from_bytes(data=cv_bytes, mime_type=mime_type),
                prompt
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=MatchResult,
                temperature=0.2, # Low temp for more consistent analytical results
            ),
        )
        return MatchResult.model_validate_json(response.text)
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        raise e
