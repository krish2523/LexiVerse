# LexiVerse — Frontend (React + Vite)

This repository contains the LexiVerse frontend application. LexiVerse is a small web app that helps legal professionals and teams analyze, summarize, and interact with legal documents using generative AI. The UI includes a document upload + analysis flow, a RAG-style chat assistant, and an interactive 3D scales-of-justice visual for added polish.

## What is this project about

LexiVerse makes it faster to extract insights from contracts and legal files. Upload a document and the backend analyzer processes its contents so the chatbot can answer questions with context. The app is useful for quick summaries, clause extraction, and conversational exploration of documents.

Primary capabilities:

- Upload PDF/DOCX/TXT files and receive a concise summary.
- Extract and list important clauses with quick navigation.
- Open a chat session grounded in the uploaded document (RAG-style).
- Interactive 3D visual element to improve UX and engagement.

## Features

- Document upload (PDF/DOCX/TXT)
- Backend analysis endpoint integration: `/analyze-document`
- Conversational chat endpoint: `/chat` with session context
- Important clause extraction and highlighted views
- 3D model viewer (GLB) using react-three/fiber and @react-three/drei
- Smooth micro-interactions via framer-motion
- Lightweight, componentized frontend structure (pages + components)

## Tech Stack

- React (functional components + hooks)
- Vite (development server and build)
- react-router-dom (routing)
- three.js with @react-three/fiber and @react-three/drei (3D)
- framer-motion (animations)
- Tailwind (present in dev dependencies for utility CSS)

## Frontend dependencies

These dependencies are taken from `package.json` and are used at runtime:

- @react-three/drei: ^10.7.5
- @react-three/fiber: ^9.3.0
- axios: ^1.11.0
- firebase: ^12.2.1
- framer-motion: ^12.23.16
- lucide-react: ^0.544.0
- react: ^19.1.1
- react-dom: ^19.1.1
- react-router-dom: ^7.9.1
- three: ^0.180.0

Dev dependencies (tooling):

- vite: ^7.1.2
- @vitejs/plugin-react: ^5.0.0
- eslint: ^9.33.0
- @eslint/js: ^9.33.0
- eslint-plugin-react-hooks: ^5.2.0
- eslint-plugin-react-refresh: ^0.4.20
- tailwindcss: ^4.1.13
- postcss: ^8.5.6
- autoprefixer: ^10.4.21
- @types/react: ^19.1.10
- @types/react-dom: ^19.1.7

If you change dependencies, run `npm install` and commit the lockfile.

## Quick start

1. Install dependencies

```powershell
npm install
```

2. Run the dev server (with HMR)

```powershell
npm run dev
```

3. Build for production

```powershell
npm run build
```

4. Preview the production build locally

```powershell
npm run preview
```

## Important notes

- Favicon / static assets: Vite fingerprints assets during build. If you
	reference `/Logo.png` statically in `index.html` it will only work if the
	file is copied as-is to the build root (for example by placing it in
	`public/Logo.png`) or if you set the favicon at runtime using the imported
	asset URL (the repo sets it at runtime in `src/main.jsx`).
- 3D model (GLB): the scales model is loaded using `useGLTF`. For production
	ensure the GLB file is available at the expected path or move it to
	`public/` so it's copied unchanged.
- Base path / subpath hosting: If you host under a subpath (e.g.,
	`https://example.com/myapp/`) set `base` in `vite.config.js` or use
	`import.meta.env.BASE_URL` so asset URLs and the router resolve correctly.

## Deployment hints

- Static hosts like Vercel or Netlify work well with Vite. Deploy the
	`dist/` directory produced by `npm run build`.
- If something (favicon or GLB) is missing after deploy, check the network
	tab for 404 responses and confirm the files are present in the deployed
	artifact.

## Contributing

- Run lint before committing: `npm run lint`.
- Keep changes small and focused. If you refactor a widely imported file
	(like `src/components/Dashboard.jsx`) preserve compatibility or update
	imports in `src/App.jsx`.

## Where things live

- `src/pages` — top-level pages (LandingPage, DashboardPage)
- `src/components` — reusable components (LeftPanel, RightPanel,
	ThreeDModel, ScalesOfJustice)
- `src/assets` — images and static assets managed by Vite
- `index.html` — base HTML. This repo sets favicon at runtime for production
	compatibility.

## Troubleshooting

- Browser caching: favicons are cached aggressively. Use a hard refresh
	(Ctrl+F5) or private/incognito mode to validate changes.
- If a 3D model fails to load, check the console for loader errors; consider
	placing the GLB in `public/` to avoid path issues.

---

If you'd like, I can also:

- Move `src/assets/Logo.png` to `public/` and restore a static favicon link
	inside `index.html` (simple and stable).  
- Or run a production build locally and verify the favicon and emitted
	asset URLs. 

Which would you prefer? (move logo to public, or run a production build now)

