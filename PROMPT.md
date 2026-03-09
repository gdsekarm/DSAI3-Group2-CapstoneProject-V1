# AI Resume Matcher - System Prompt

This document contains the core instructions provided to the **Google Gemini 2.5 Flash** AI model in the backend of the application. 

It dictates how the AI should behave and what kind of structured output it should provide when comparing the CV to the Job Description.

## Main System Prompt

The following text block is sent to the Gemini API along with the raw PDF byte streams of both the Job Description and the Candidate CV:

```text
You are an expert technical recruiter and HR assistant. 
I have provided two PDF documents: 
1. The first document is a Job Description (JD).
2. The second document is a Candidate's Curriculum Vitae (CV).

Your task is to carefully analyze the CV against the JD and provide a comprehensive matching assessment.
Provide the output strictly matching the requested JSON schema.
```

## Structured JSON Response Schema

Along with the prompt, the application uses Pydantic to strictly type the response schema. Wait for the API to return the exact following JSON format parameters:

```json
{
  "candidate_name": "The full name of the candidate extracted from the CV",
  "match_score": "A score from 0 to 100 representing how well the CV matches the JD (integer)",
  "key_strengths": [
    "List of maximum 5 key strengths or matching skills from the CV"
  ],
  "missing_skills": [
    "List of maximum 5 key missing skills or weaknesses compared to JD"
  ],
  "ai_summary": "A brief 2-3 sentence summary explaining the match score",
  "recommendation": "A single clear recommendation statement, e.g. 'Strong Hire', 'Interview', 'Hold', or 'Pass'"
}
```

*Note: The Temperature is set to `0.2` in `backend/services/gemini_service.py` to ensure the responses remain analytical, consistent, and less deterministic (less creative variance).*
