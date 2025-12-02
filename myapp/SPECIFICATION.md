# 🧠 Neuroadaptive Learning Companion — Full Project Execution Report

This document is the master specification for building the Neuroadaptive Learning Companion. It is intended to be copy-paste ready and used as the authoritative implementation plan for the Frontend (PWA), Backend, and AI/ML core.

---

## I. Architectural Overview & Tech Stack

The application uses a microservices architecture centered around an adaptive AI core. All development must remain inside the existing workspace and adhere to the approved stack (no new frameworks or DBs).

- Frontend (PWA): React.js, Tailwind CSS, Framer Motion (responsive UI, dynamic effects, adaptive animations)
- Backend: Node.js (APIs, user data) and Python (AI/NLP microservices)
- AI/ML Layer: Gemini (placeholder API for content generation) and Brain.js (real-time EEG signal classification)
- Database: MongoDB (user profiles, sessions, generated content) and TimeScaleDB (EEG signals)
- BCI Integration: OpenBCI JS SDK and NeuroSky MindWave
- Content Ingestion: Tesseract OCR (image-to-text) and BeautifulSoup (web scraping)
- Deployment: Docker, GitHub Actions, Vercel / Firebase / AWS

Constraints: implement within the existing workspace; do not introduce new languages, frameworks, or databases.

---

## II. Frontend Development Specification (UI/UX)

The UI must be dynamic, multi-colored, gamified, animated, and PWA-friendly. Smooth transitions using Framer Motion are required.

1) Core Pages & Navigation
- Login/Signup Page
  - Fields: Email, Password, User Type (Normal / ADHD)
  - Aesthetic: dynamic, multi-colored floating background effects and entrance animations
- Left Ribbon Navigation
  - Links: `Learning Zone` (Chat), `Chat History`, `Dashboard`, `Profile` (static only), `Settings`
  - Store & Avatar Customization: deferred/removed for now
- Dashboard
  - Visualize user stats: XP, Level progression, Badges, cognitive pattern timeline and stress events

2) Learning Zone (Main Chatbot Interface)
- Layout Optimization (CRUCIAL)
  - Header + Cognitive State selectors + Intervention buttons must occupy no more than 35% of viewport height combined.
  - Chat/Conversation area must occupy ~60–70% of the viewport and be visible immediately without scrolling.
- Input Features
  - Icons for: Text input, File Upload, URL Upload, Photo Upload (camera/local files)
- BCI Settings Modal
  - Include a high-contrast, clearly visible Close/Confirm button accessible in Light and Dark themes.

3) Cognitive State & Intervention Logic
- Visual theme adapts by cognitive state (Attention, Calm, Drowsiness)
- Interventions per-state:
  - Attention: Mini Quiz, Deeper Dive — send lesson context to AI to generate content
  - Calm: Analogy Creator — provide input area + submit to AI for evaluation
  - Drowsiness: Ambient Music, Breathing Exercise, Mini Game — open full-screen overlays (music controls, breathing animation, mini-game)
- Colors and contrast: ensure visibility across Light/Dark/Dynamic themes

---

## III. Backend & AI/ML Implementation

1) Data Ingestion & Processing
- Uploaded content (PDF/Image/URL) flows to a Node.js ingestion service.
  - Images -> Tesseract OCR -> text
  - URLs -> BeautifulSoup -> cleaned text
- Store processed text in MongoDB with metadata (source, timestamp, userId, contentId)

2) Cognitive State Pipeline
- Dual-mode operation: BCI Auto or Manual selection
- BCI flow (Auto): BCI Device -> streaming to backend (WebSocket) -> Brain.js model classifies state (Attention/Calm/Drowsiness) -> log in TimeScaleDB -> emit state change event to frontend
- Manual flow: UI selection -> write state to the user's session in MongoDB -> emit state change event

3) Adaptive Content Generation (Gemini Core — placeholder API initially)
- Mini Quiz: pass current lesson context -> Gemini returns questions and answers
- Deeper Dive: pass topic/context -> Gemini returns expanded explanation and references
- Analogy Evaluation: send user-provided analogy + source content -> Gemini returns evaluation and suggestions
- Additional features: summaries, mnemonics, personalized feedback

4) Gamification & Rewards
- XP awarding rules: time studying, completed interventions, level of attention sustained
- Backend tracks XP -> levels & badges logic -> store in MongoDB

---

## IV. Integration, Observability & Deployment

- PWA: ensure service worker, offline caching for key resources, and smooth Framer Motion transitions
- Exit confirmation modal when leaving the PWA
- Logging & Monitoring: centralized logs (stdout -> Docker logs), basic Prometheus metrics if available
- CI/CD: GitHub Actions to build/test and deploy to Vercel/Firebase/AWS; containerize microservices with Docker

---

## V. Implementation Plan & Prioritized Tasks (One-by-one execution)

Start with the frontend and incremental integration to backend placeholder endpoints. Each step below is implemented within the current workspace.

1) Frontend Foundation (PWA)
- Initialize or verify `Frontend` app is present in workspace
- Ensure dependencies: `react`, `react-dom`, `tailwindcss`, `framer-motion`, `vite`
- Create page skeletons: `LoginScreen`, `LearningZone`, `Dashboard`, `Sidebar`, `GamificationHeader`, `Profile`, `Settings`
- Implement layout optimization in `LearningZone` to guarantee chat area occupies target height percentage

2) Backend Foundation
- Create Node.js API (Express) with endpoints:
  - `POST /api/upload` (ingestion)
  - `POST /api/generate/quiz` (placeholder Gemini)
  - `POST /api/generate/deeper` (placeholder Gemini)
  - `POST /api/analyze/analogy` (placeholder Gemini)
  - `POST /api/bci/stream` (WebSocket or SSE placeholder for BCI)
- Add minimal Python microservice stub for heavier AI tasks (optional): `ai_service/` with `api.py` exposing placeholder endpoints

3) Database & Storage
- Add MongoDB schema (user, sessions, xp events, generated content refs)
- Add TimeScaleDB schema for EEG streams (timestamp, userId, sample values, predictedState)

4) BCI Integration (placeholder)
- Implement client & server stubs for streaming EEG data (simulate sample data during development)
- Plug Brain.js classifier in the Node.js service or as a separate microservice (stubbed model initially)

5) Adaptive Content Integration
- Wire intervention buttons to backend placeholder endpoints that return deterministic sample responses; later swap with Gemini API

6) Testing & CI
- Add unit tests for critical backend endpoints and frontend components where feasible
- Add GitHub Actions workflow to build and run tests; on merge push to deployment target

7) Security & Privacy
- Secure APIs, adhere to best practices for PII and health data (encrypt secrets, do not log raw EEG data in plaintext)

---

## VI. File & Artifact Suggestions (what I'll create first in the repo)
- `SPECIFICATION.md` (this document)
- `Frontend/` skeleton with pages and `LearningZone` layout fix
- `backend/` Express project with placeholder endpoints
- `ai_service/` Python stub for later AI integration
- `infra/` Dockerfiles and `docker-compose.yml` for local integration
- `scripts/` for lightweight simulation of EEG streams during dev

---

## VII. Quick Run & Developer Notes

To run the frontend dev server (from repository root):

```powershell
cd Frontend
npm install --legacy-peer-deps
npm run dev
```

If `vite` is not available on PATH, run:

```powershell
cd Frontend
npx vite
```

To run a local backend stub (example):

```powershell
cd backend
npm install
npm run dev
# or if using node directly
node index.js
```

To simulate EEG BCI stream during development:

```powershell
python scripts/simulate_eeg.py --userId test-user --rate 25
```

---

## VIII. Next Steps (I can implement these one-by-one)

1. Create `SPECIFICATION.md` in workspace (done).
2. Scaffold `Frontend/` skeleton with `LearningZone` layout fix and pages.
3. Add `backend/` Express API with placeholder Gemini & Brain.js endpoints.
4. Add `ai_service/` Python microservice stub.
5. Add `infra/` Dockerfiles and `docker-compose.yml` to run everything locally.

Tell me which of the above I should implement now (I recommend starting with step 2: scaffold the `Frontend/` skeleton and layout fix). If you confirm, I will scaffold the `Frontend` pages and implement the `LearningZone` layout optimization next.

---

*Document created and saved to `SPECIFICATION.md` in the repository root.*
