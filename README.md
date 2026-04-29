# 🚀 Prototype Builder

> A **Multi-Agent Prototype Builder** powered by local LLMs via Ollama. Describe your web app in plain English and let an orchestrated pipeline of AI agents design, plan, and generate the full HTML/CSS/JS codebase — all from your browser.

---

## ✨ Features

- 🧠 **Multi-Agent Pipeline** — Specialized agents handle conversation analysis, requirement extraction, page discovery, architecture planning, and code generation
- 🎨 **AI-Powered Code Generation** — Produces semantic HTML5, responsive CSS, and clean JavaScript
- 🖥️ **Live Preview** — Preview generated web pages directly inside the app
- 📁 **Project Management** — Create, organize, and revisit multiple build projects
- 🔐 **JWT Authentication** — Secure user accounts with login/register flows
- 💬 **Chat Interface** — Chat with the AI to iterate on your project
- 🎭 **Multiple Color Themes** — Choose from Default Blue, Dark Mode, Ocean Breeze, Sunset Glow, Forest Green, and Rose Gold
- 📊 **Dashboard & Build Logs** — Monitor agent progress with real-time build logs
- 🦙 **Local LLM Support** — Runs fully on-device via Ollama (no cloud API key needed by default)
- 🌐 **Model Flexibility** — Supports multiple models: `qwen3-vl:8b`, `llama3.1:8b`, `deepseek-v3.1`, `qwen3-next:80b-cloud`, and more

---

## 🏗️ Architecture

```
webdev - 0.3/
├── launch.py              # 🚀 One-command launcher for both servers
│
├── backend/               # FastAPI REST API
│   ├── main.py            # App entry-point, router registration, CORS, DB lifecycle
│   ├── auth.py            # JWT authentication helpers
│   ├── .env               # Environment variables (MongoDB, JWT, Ollama config)
│   ├── api/               # Route handlers
│   │   ├── router_auth.py
│   │   ├── router_build.py        # Core AI build pipeline
│   │   ├── router_projects.py
│   │   ├── router_artifacts.py    # Generated file management
│   │   ├── router_dashboard.py
│   │   ├── router_chat.py
│   │   ├── router_settings.py
│   │   └── router_templates.py
│   └── database/          # MongoDB connection & repositories
│
├── transformer_core/      # AI agent engine
│   ├── main.py            # Agent orchestrator & pipeline logic
│   ├── config.py          # Model registry, themes, agent system prompts
│   ├── state_manager.py   # Build state management
│   ├── templates.py       # HTML/CSS template library
│   ├── agents/            # Individual AI agent implementations
│   ├── output/            # Generated project files
│   └── requirements.txt   # Python dependencies
│
├── frontend/              # React + Vite UI
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/         # landing_page, login_page, overview, project,
│   │   │                  # build_log, preview, history, settings, 404
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React context providers
│   │   └── services/      # API client services
│   ├── package.json
│   └── vite.config.js
│
└── database/              # Shared DB models & repositories
    ├── connection.py
    ├── models/
    └── repositories/
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TailwindCSS 4, React Router v7 |
| **Backend** | FastAPI, Uvicorn, Python 3.11+ |
| **Database** | MongoDB Atlas (via PyMongo / Motor) |
| **AI Engine** | Ollama (local LLMs) |
| **Auth** | JWT (python-jose, bcrypt) |
| **Charts** | Recharts |
| **Icons** | Lucide React |

---

## ⚙️ Prerequisites

Before running the project, make sure you have the following installed:

1. **Python 3.11+** — [python.org](https://www.python.org/downloads/)
2. **Node.js 18+ and npm** — [nodejs.org](https://nodejs.org/)
3. **Ollama** — [ollama.com](https://ollama.com/) for running local LLMs
4. **MongoDB Atlas account** (free tier works) — [mongodb.com/atlas](https://www.mongodb.com/atlas)

---

## 🚀 Quick Start

### 1. Clone & navigate

```bash
git clone <your-repo-url>
cd "webdev - 0.3"
```

### 2. Install Python dependencies

```bash
pip install -r transformer_core/requirements.txt
```

### 3. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

### 4. Configure environment variables

Edit `backend/.env` with your own values:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?appName=<appName>
MONGODB_DB_NAME=transformerDB

# JWT
JWT_SECRET_KEY=your_super_secret_key_here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1440

# API Server
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:3000

# Ollama
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=qwen3-vl:8b
```

### 5. Pull an Ollama model

```bash
ollama pull qwen3-vl:8b
```

> You can also use `llama3.1:8b`, `qwen3-vl:2b`, or any other model listed in `transformer_core/config.py`.

### 6. Launch everything

```bash
python launch.py
```

This single command:
- ✅ Starts the **FastAPI backend** on `http://localhost:8000`
- ✅ Waits for the backend to be ready
- ✅ Starts the **Vite dev server** on `http://localhost:5173`

Press **Ctrl+C** to gracefully stop both servers.

---

## 🌐 Running Servers Manually

If you prefer to run the servers separately:

**Backend:**
```bash
uvicorn backend.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev
```

---

## 📖 API Reference

Once the backend is running, interactive API docs are available at:

| Interface | URL |
|---|---|
| **Swagger UI** | `http://localhost:8000/api/docs` |
| **ReDoc** | `http://localhost:8000/api/redoc` |
| **Health Check** | `http://localhost:8000/api/health` |

---

## 🤖 Available AI Models

Configure the active model in `backend/.env` via `OLLAMA_MODEL`, or switch tiers through the UI settings:

| UI Tier | Model |
|---|---|
| Fast | `qwen3-vl:2b` |
| Balanced | `deepseek-v3.1:671b-cloud` |
| Advanced | `qwen3-vl:8b` *(default)* |
| Unique | `llama3.1:8b` |
| Creative | `qwen3-next:80b-cloud` |

---

## 🎨 Agent Pipeline

When you submit a prompt, the system runs these agents in sequence:

```
User Prompt
    │
    ▼
1. 💬 Conversation Agent   → Extracts app type, features, audience
    │
    ▼
2. 📋 Requirement Agent    → Produces functional & UX requirements
    │
    ▼
3. 🗺️ Page Discovery Agent → Lists all pages and navigation flow
    │
    ▼
4. 🏛️ Plan & Architecture Agent → Defines folder structure & tasks
    │
    ▼
5. 🖊️ HTML Agent           → Generates semantic HTML5 per page
    │
    ▼
6. 🎨 CSS Agent             → Generates responsive, themed CSS
    │
    ▼
7. ⚡ JavaScript Agent      → Generates interactive JS
    │
    ▼
8. 📝 README Agent          → Produces project documentation
    │
    ▼
Generated Web Application
```

---

## 📜 License

This project is for personal / educational use. Feel free to adapt it for your own experiments.

---

## 👤 Author

Built with ❤️ using FastAPI, React, and Ollama.
