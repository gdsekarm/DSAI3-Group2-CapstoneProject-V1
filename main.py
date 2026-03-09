from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import os

from backend.api.routes import router as api_router

app = FastAPI(title="AI Resume Matcher API")

# Setup API Routes First
app.include_router(api_router, prefix="/api")

# Setup templates and static files
frontend_dir = os.path.join(os.path.dirname(__file__), "frontend")
templates = Jinja2Templates(directory=frontend_dir)
app.mount("/static", StaticFiles(directory=os.path.join(frontend_dir, "static")), name="static")

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
