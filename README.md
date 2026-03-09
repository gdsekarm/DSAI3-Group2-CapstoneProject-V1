# AI Resume Matcher

A sleek, full-stack web application designed to intelligently match Candidate CVs against a specific Job Description (JD) using **Google Gemini 2.5 Flash AI**. The system extracts key skills, identifies weaknesses, and provides a direct hiring recommendation alongside an overall match score.

---

## 🏗️ Architecture Overview

This project uses a monolithic architecture serving both the API backend and the static frontend from a single Python process, optimizing it for easy deployment (e.g., AWS Elastic Beanstalk).

*   **Frontend**: Native HTML5, Vanilla JavaScript, and Tailwind CSS (via CDN). No heavy Node.js built-step is required. It features native drag-and-drop file readers and dynamic DOM manipulation.
*   **Backend**: Python **FastAPI**. It handles asynchronous file uploads, parses the PDFs in memory (without saving to disk), and interfaces with the Google Gemini AI.
*   **AI Engine**: `google-genai` SDK communicating with the `gemini-2.5-flash` model. It leverages Pydantic strict schemas to guarantee the AI returns a perfectly formatted JSON response containing scores and arrays.

---

## 📂 Project Structure

```text
Capstone-SGJob/
│
├── main.py                     # Entry point. Mounts static files, templates, and API routes.
├── requirements.txt            # Python dependencies (fastapi, uvicorn, google-genai, pydantic, etc.)
├── .env                        # Local environment variables containing GEMINI_API_KEY
├── AWS_DEPLOYMENT.md           # Deployment manual for AWS Elastic Beanstalk
│
├── backend/                    # Python Backend Logic
│   ├── api/
│   │   └── routes.py           # Defines the POST /api/match endpoint for file uploads
│   └── services/
│       └── gemini_service.py   # AI Logic. Defines the MatchResult Pydantic schema and calls Gemini API
│
└── frontend/                   # Vanilla Web Client
    ├── index.html              # The main UI (Jinja2 Template format)
    └── static/
        ├── css/styles.css      # Custom animations and scrollbar CSS
        └── js/app.js           # Drag & Drop handling, FormData building, and UI rendering logic
```

---

## ⚙️ Data Flow: How It Works

1.  **User Interaction**: The user drags a **Job Description (PDF)** and multiple **Candidate CVs (PDFs)** into the UI dropzones on `index.html`.
2.  **API Request**: When "Run AI Matcher" is clicked, `app.js` bundles the files into a standard `FormData` mult-part object and POSTs it to the `/api/match` endpoint.
3.  **Concurrency (FastAPI)**: The `routes.py` backend receives the bytes. It uses Python's `asyncio.gather` feature to process multiple CVs simultaneously in parallel across threadpools, vastly speeding up the total wait time.
4.  **AI Analysis**: For every CV, `gemini_service.py` sends the raw PDF bytes of the JD and the CV directly to the **Gemini 2.5 Flash** vision/document model alongside a strict `GenerateContentConfig` requiring it to map its answer to the `MatchResult` schema.
5.  **Scoring & Validation**: Gemini returns a guaranteed JSON structure containing the Score, Strengths, Missing Skills, and a Recommendation (e.g., "Strong Hire").
6.  **UI Update**: The backend aggregates the JSONs and returns them to the frontend. `app.js` iterates through the list, sorting the candidates by match score (highest to lowest), and dynamically injects specialized HTML cards into the DOM.

---

## 🚀 Running Locally

1. Create a virtual environment and activate it:
   `python3 -m venv .venv` and `source .venv/bin/activate`
2. Install dependencies:
   `pip install -r requirements.txt`
3. Add your API Key to a `.env` file in the root directory:
   `GEMINI_API_KEY="AIzaSy..."`
4. Start the server:
   `python main.py`
5. Visit `http://127.0.0.1:8000` in your browser.
