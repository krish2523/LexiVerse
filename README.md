# LexiVerse

LexiVerse is a end-to-end project for analyzing legal documents using
generative AI. It includes a React + Vite frontend with a RAG-style chat assistant and 3D visual components, plus a FastAPI backend that performs document extraction, validation, and LLM-powered analysis. The backend uses a workflow built with LangGraph and LangChain helpers to provide structured analysis and chat capabilities.

## Project overview

- Frontend (client): a React application (in `LexiVerse/`) that provides the user interface, file upload, chat UI, and a 3D model viewer.
- Backend (server): FastAPI app (in `Google_genai/`) that exposes endpoints to analyze documents and to chat with document context. The backend handles text extraction, validation, analysis, and RAG-style chat workflows.

This repo is useful as a reference for combining document processing,
retrieval-augmented generation, and a modern frontend with 3D content.

## Features

- Upload legal documents (PDF/DOCX) and get an AI-generated summary.
- Document validation that can reject non-legal documents with a reason.
- Important clause extraction and summary fields returned by the analyzer.
- RAG-style chat endpoint that can bootstrap a conversational session from an uploaded document and continue chats with session IDs.
- Interactive 3D visual (scales-of-justice) using three.js and
	@react-three/fiber.

## Architecture & key components

- `LexiVerse/` — frontend app (React + Vite). Key folders:
	- `src/pages` — top-level pages (LandingPage, DashboardPage)
	- `src/components` — LeftPanel, RightPanel, ThreeDModel, ScalesOfJustice, etc.
	- `src/assets` — images and assets managed by Vite
- `Google_genai/` — backend (FastAPI)
	- `main.py` — FastAPI app and route declarations
	- `app/core/workflow.py` — document processing workflow built using LangGraph
	- `app/core/rag_workflow.py` — RAG chat workflow and session handling
	- `app/utils/doc_process.py` — file parsing and text extraction helpers

The backend exposes a small surface of endpoints used by the frontend.

## API Endpoints (backend)

- GET `/` — root metadata (service name, version, endpoints)
- GET `/health` — health check
- POST `/analyze-document` — upload a PDF/DOCX; returns decision, summary,
	document_type, and important_clauses (or a rejection reason)
- POST `/chat` — chat endpoint that accepts a `message`, optional
	`session_id`, and optional file; it can bootstrap a session from an
	uploaded file and then return chat responses. See `main.py` for behaviour.

## Tech stack

- Frontend: React, Vite, react-router-dom, three.js via @react-three/fiber and
	@react-three/drei, framer-motion
- Backend: FastAPI, Uvicorn, LangChain, LangGraph langchain-google-genai
- Document processing: pypdf, python-docx
- Vector store / similarity: faiss (used for RAG workflows)
- Deployment: typical static-host for frontend (Vercel/Netlify) and a
	containerized or serverless FastAPI deployment (e.g., using Uvicorn/Gunicorn)

## Dependencies

Backend (from `Google_genai/requirements.txt`):

- fastapi==0.115.0
- uvicorn[standard]==0.32.0
- python-multipart==0.0.12
- pydantic==2.9.2
- langchain==0.3.7
- langchain-google-genai==2.0.4
- langchain-community==0.3.5
- langchain-openai==0.2.9
- langgraph==0.2.34
- pypdf==5.0.1
- python-docx==1.1.2
- python-dotenv==1.0.1
- loguru==0.7.2
- faiss-cpu==1.12.0
- openai>=1.54.0,<2.0.0

Frontend (major runtime dependencies used by the React app):

- react
- react-dom
- react-router-dom
- three
- @react-three/fiber
- @react-three/drei
- framer-motion
- axios
- firebase
- lucide-react

Dev tooling includes Vite, ESLint, Tailwind/PostCSS (see the `LexiVerse/`
package.json and the `Google_genai/requirements.txt` for full details).

## Running locally

Prerequisites: Node.js + npm for the frontend, and Python 3.10+ with a venv
for the backend.

Backend (FastAPI):

1. Create and activate a Python virtual environment

```powershell
python -m venv .venv; .\.venv\Scripts\Activate.ps1
```

2. Install backend dependencies

```powershell
pip install -r Google_genai/requirements.txt
```

3. Configure environment variables (see `Google_genai/app/config.py`) — you
	 will need API keys for Google generative APIs and any other configured
	 providers.

4. Run the server (development)

```powershell
cd Google_genai
uvicorn main:app --reload --port 8000
```

Frontend (React + Vite):

1. Install dependencies

```powershell
cd LexiVerse
npm install
```

2. Start dev server

```powershell
npm run dev
```

3. Build for production

```powershell
npm run build
```

4. Preview production build

```powershell
npm run preview
```

The frontend communicates with the backend endpoints (`/analyze-document` and
`/chat`) — update the API base URL if you host the backend separately (you
can set it in your frontend config or environment variables).

## Favicon & static assets note

The frontend uses Vite which fingerprints assets at build time. The repo
includes logic to set the favicon at runtime (importing the image in
`src/main.jsx`) so the correct hashed URL is used in production. An
alternative is to place `Logo.png` and other files in `public/` so they are
copied unchanged to the build output and can be referenced statically.

## Contributing

- Run `npm run lint` in the frontend and keep commits small.
- Run backend tests/manual checks before pushing; follow the style in the
	`Google_genai/` package.

## Where to look in the repo

- `LexiVerse/` — frontend app (React + Vite)
- `Google_genai/` — backend FastAPI app and workflows
- `LICENSE` — project license

If you'd like, I can also:
- Move `src/assets/Logo.png` to `public/` and update `index.html` to use a
	static favicon link (simple stable fix), or
- Run a production build and verify that the favicon and GLB assets are
	present in the `dist/` output and that the Dashboard page builds/renders.


