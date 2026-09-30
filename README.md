# 🤖 Nexus AI Agent — Multi-Tool Autonomous System

A modern AI Agent architecture built with **LangChain**, **Groq (LLaMA / GPT-OSS)**, **Wikipedia**, **Tavily Web Search**, and **Custom Math Tools**, featuring a 3D interactive web interface powered by **Three.js**, **React 18**, and **FastAPI**.

---

## ✨ Features

- 🧠 **Groq High-Speed Inference**: Powered by Groq's high-speed inference engine.
- 🛠️ **Autonomous Tool Calling**:
  - **Wikipedia Tool**: Encyclopedic facts, biographies, and historical knowledge.
  - **Tavily Search Tool**: Real-time web search and breaking news.
  - **Math Tools (`@tool`)**: Deterministic addition and multiplication.
- 🎨 **3D Interactive Studio Web UI (Matching Reference Design)**:
  - **Three.js & React Three Fiber**: Recreated luxury cobalt blue studio with a procedural veined marble circular podium, semicircular elevated marble back tier, and metallic copper accent ribbon.
  - **Interactive Centerpieces**: Switchable 3D models (Nexus Neural Core, Quantum Lattice, Intelligence Globe, Compute Matrix) with reactive pulse during agent reasoning.
  - **Tailwind CSS & Glassmorphism**: Ultra-modern frosted glass HUD, status indicators, and collapsible command center.
  - **Framer Motion**: Smooth spring physics, staggered entry animations, collapsible tool inspection badges, and interactive cards.
  - **Camera Controls**: Orbit, pan, zoom, and instant preset camera angles (Studio View, Podium Focus, Cinematic, Top View).
- 📓 **Google Colab / Jupyter Notebook**: Fully structured step-by-step tutorial in `Untitled433.ipynb`.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure API Keys

Add your keys to `.env` (or use the pre-configured keys):

```bash
GROQ_API_KEY=your_groq_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

---

## 💻 Ways to Run

### Option 1: 🌐 3D Interactive Web Interface (Recommended)

Start the local server:

```bash
python server.py
```

Open your browser at: **[http://localhost:8000](http://localhost:8000)**

---

### Option 2: 📓 Google Colab / Jupyter Notebook

1. Open **[Untitled433.ipynb](Untitled433.ipynb)** in Jupyter Notebook, VS Code, or upload it to [Google Colab](https://colab.research.google.com).
2. Run through each cell sequentially.

---

### Option 3: 💻 Terminal Interactive CLI

Run directly in your terminal:

```bash
python agent.py
```

---

## 📁 Project Structure

```
.
├── Untitled433.ipynb    # Jupyter / Colab notebook with step-by-step implementation
├── agent.py             # Core LangChain agent with custom tools and runner
├── server.py            # FastAPI web server with REST API
├── static/
│   └── index.html       # 3D Three.js + React 18 frontend UI
├── test_agent.py        # Automated test suite for tool verification
├── requirements.txt     # Python dependencies
├── .env                 # API Keys configuration
└── README.md            # Documentation
```
