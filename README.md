# 🤖 Nexus DeFi AI Agent — 3D Cyberpunk Autonomous Intelligence Platform

A high-performance Autonomous AI Agent platform built with **LangChain**, **Groq (LLaMA-3)**, **Wikipedia**, **Tavily Web Search**, and **Deterministic Math Tools**, featuring a 3D interactive web interface powered by **Three.js / React Three Fiber**, **React 18**, **Tailwind CSS**, **Framer Motion**, and **FastAPI**.

---

## ✨ Features

- 🧠 **Groq High-Speed LLaMA-3 Inference**: Powered by Groq ultra-fast LLaMA-3.3-70b and resilient autonomous fallback dispatching.
- 🛠️ **Autonomous Multi-Tool Calling**:
  - **Wikipedia Knowledge Tool**: Encyclopedic facts, biographies, historical leaders, and deep conceptual search.
  - **Tavily Search Tool**: Real-time live web intelligence, breaking news, and protocol analysis.
  - **Math Core Tools (`@tool`)**: Deterministic addition, multiplication, and complex multi-step numeric pipelines.
- 🎨 **3D Interactive Cyberpunk Web UI**:
  - **Elevated Diamond-Grid Catwalk**: 3D geometric parametric lattice catwalk with metallic black guard rails.
  - **Interactive Floating Agent Tokens / Coins**: High-gloss metallic tokens along the catwalk representing agent tools with hover physics and click-to-focus camera controls.
  - **Glowing Liquid Neon Magenta Floor Portal**: Concentric floor rings with an animated wavy liquid neon magenta pool emitting dynamic upward lighting.
  - **Hero Typography & Obsidian Glass UI**: Frosted glassmorphism panels, glowing neon magenta/purple accents, and expandable agent command drawer.
  - **Framer Motion Animations**: Smooth spring physics, staggered entry transitions, interactive prompt chips, and modal tool inspector.
  - **In-App API Key Configurator**: Easily configure and update Groq & Tavily API keys directly from the top bar (`🔑` Key button) without editing files.

---

## 🚀 Quick Start

### 1. Install Dependencies

#### Python Backend:
```bash
pip install -r requirements.txt
```

#### Node.js Frontend (for development):
```bash
npm install
```

### 2. Configure API Keys (Optional)

Configure in `.env` or directly through the web UI's **`🔑` Key button**:

```bash
GROQ_API_KEY=your_groq_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

---

## 💻 Ways to Run

### Option 1: 🌐 3D Interactive Web Application (Recommended)

Start the FastAPI local server:

```bash
python server.py
```

Open your browser at: **[http://localhost:8080](http://localhost:8080)**

*(Note: If port 8080 or 8000 is occupied, the server will automatically detect and bind to the next open port).*

---

### Option 2: ⚡ Frontend Development Server with Hot Reload

Run the Vite React development server:

```bash
npm run dev
```

Open your browser at: **[http://localhost:3000](http://localhost:3000)** *(automatically proxies `/api` calls to the FastAPI backend)*.

---

### Option 3: 📓 Google Colab / Jupyter Notebook

1. Open **[Untitled433.ipynb](Untitled433.ipynb)** in Jupyter Notebook, VS Code, or upload it to [Google Colab](https://colab.research.google.com).
2. Run through each cell sequentially.

---

### Option 4: 💻 Terminal Interactive CLI

Run directly in your terminal:

```bash
python agent.py
```

---

## 📁 Project Structure

```
.
├── src/                         # Modern React 18 + Three.js Source Code
│   ├── components/
│   │   ├── scene/               # 3D Scene Components (Catwalk, Coins, Portal, Lighting)
│   │   │   ├── GeometricTrack.jsx
│   │   │   ├── AgentCoins.jsx
│   │   │   ├── NeonPortalPedestal.jsx
│   │   │   ├── ObsidianEnvironment.jsx
│   │   │   └── SceneCanvas.jsx
│   │   └── ui/                  # UI Components (Hero, Navbar, ChatDrawer, HUD, Modal)
│   │       ├── HeroSection.jsx
│   │       ├── Navbar.jsx
│   │       ├── ChatDrawer.jsx
│   │       ├── ConfigModal.jsx
│   │       ├── ToolBadge.jsx
│   │       ├── PromptChips.jsx
│   │       └── ToolInspectorModal.jsx
│   ├── utils/                   # Procedural textures & Web Audio sound synth
│   ├── App.jsx                  # Main Application Component
│   ├── index.css                # Tailwind CSS + Glassmorphism styles
│   └── main.jsx                 # Vite React root
├── static/                      # Bundled static assets served by FastAPI
│   ├── assets/                  # Compiled JS & CSS bundles
│   └── index.html               # 3D Web App Index
├── agent.py                     # LangChain Multi-Tool Agent with resilient fallback
├── server.py                    # FastAPI server with REST API & dynamic port binding
├── test_agent.py                # Automated test suite for tool verification
├── Untitled433.ipynb            # Jupyter / Colab tutorial notebook
├── tailwind.config.js           # Tailwind CSS configuration with Cyberpunk theme
├── vite.config.js               # Vite build configuration
├── requirements.txt             # Python dependencies
├── package.json                 # Node dependencies (Three.js, React, Framer Motion)
└── README.md                    # Documentation
```
