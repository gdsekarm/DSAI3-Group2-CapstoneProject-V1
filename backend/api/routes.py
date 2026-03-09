import asyncio
from fastapi import APIRouter, File, UploadFile, HTTPException
from typing import List
from backend.services.gemini_service import analyze_resume

router = APIRouter()

@router.post("/match")
async def match_resumes(
    jd_file: UploadFile = File(...),
    cv_files: List[UploadFile] = File(...)
):
    if jd_file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Job description must be a PDF file.")
    
    cv_files = [f for f in cv_files if f.content_type == "application/pdf"]
    if not cv_files:
        raise HTTPException(status_code=400, detail="At least one PDF CV must be uploaded.")

    try:
        jd_bytes = await jd_file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read JD file: {str(e)}")

    async def process_cv(cv: UploadFile):
        try:
            cv_bytes = await cv.read()
            # Run the synchronous Gemini call in a threadpool
            result = await asyncio.to_thread(analyze_resume, jd_bytes, cv_bytes)
            # result is a Pydantic MatchResult
            return result.model_dump()
        except Exception as e:
            return {
                "candidate_name": cv.filename or "Unknown Document",
                "match_score": 0,
                "key_strengths": [],
                "missing_skills": ["Failed Analysis"],
                "ai_summary": f"An error occurred while analyzing this resume via Gemini AI: {str(e)}"
            }

    # Process all CVs concurrently
    results = await asyncio.gather(*(process_cv(cv) for cv in cv_files))
    
    return {"results": results}
