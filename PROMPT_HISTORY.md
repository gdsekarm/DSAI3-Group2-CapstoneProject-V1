# AI Resume Matcher - Development Prompt History

This document contains the chronological history of prompts and requests used to guide the AI in developing the AI Resume Matcher project from scratch to final deployment.

## Phase 1: Project Initialization & Architecture

**Prompt 1 - Project Conception:**
> "create necessary code to match the job description and CVs. CVS and Descriptions will be uploaded as pdf file. The application should be frontend website. and backend server. Python is preferred / I have Gemini pro subscription. create complete project with well organized structure. with documentation to explian the process."

## Phase 2: Frontend & Upload Debugging

**Prompt 2 - Resolving initial server errors:**
> "INFO: 127.0.0.1:50404 - "GET / HTTP/1.1" 200 OK... [Various server logs] How to fix?"

**Prompt 3 - Addressing file upload blockages (Attempt 1):**
> "In http://127.0.0.1:8000 page , I am unable to upload the pdf files."

**Prompt 4 - Addressing file upload blockages (Attempt 2):**
> "I am unable to upload the file still. please fix it"

**Prompt 5 - Providing visual context for the disabled UI:**
> "Already refreshed. Still unable to upload in front end issue. it does not open finder if I click to browse. All the buttons are disabled. refer attached image"

**Prompt 6 - Requesting the AI to investigate the browser directly:**
> "Still not working, please try again control the browser."
*(This led to the discovery of the absolute Tailwind gradient overlay blocking the pointer events).*

## Phase 3: Backend & AI Integration Debugging

**Prompt 7 - Frontend resolved, moving to backend testing:**
> "Frontend is OK. Thanks.. But backend is not working. please find attached screen short. Use JD folder for sample job description and CV folder for Cvs sample. to test the application."

**Prompt 8 - Requesting further backend investigation:**
> "Still not working. can you control the browser"
*(This led to the refactoring of python-dotenv to dynamically load the Gemini API key).*

**Prompt 9 - Encountering Gemini Free-Tier limits:**
> "Error calling Gemini API: 429 RESOURCE_EXHAUSTED. {'error': {'code': 429, 'message': 'You exceeded your current quota...'"

**Prompt 10 - Optimizing the AI Model:**
> "Yes use gemini-2.5-flash"

## Phase 4: Feature Enhancement

**Prompt 11 - Adding Final AI Recommendations:**
> "Good It works.. Add Recomendations on the matching results."
*(This led to the addition of the strict Pydantic 'Recommendation' field and dynamic frontend injection).*

## Phase 5: Deployment & Documentation

**Prompt 12 - Requesting AWS Deployment strategy:**
> "Thaks. It is working. I would like to deploy the solution in to AWS, and share the weblnk to the public. Share the step by step process."

**Prompt 13 - Selecting Elastic Beanstalk & Architecture Documentation:**
> "I want to use the Elastic Beanstalk..Save the deployment guide to the same current project folder. also provide the documentstion of the code project structure and flows to explain about this project to others."

**Prompt 14 - Updating Deployment Guide for GUI accessibility:**
> "In the deployment procedure. Giv em step by step in the AWS website manually. instead of via CLI"

**Prompt 15 - Exporting the Development Process:**
> "Save the prompt to another markdown file."
> "no. I want to save the prompt history to develop this project"
