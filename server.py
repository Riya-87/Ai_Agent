"""
FastAPI Server for AI Agent Web Application
===========================================
Serves the 3D Three.js + React web interface and connects
to the LangChain + Groq + Wikipedia + Tavily multi-tool agent.
"""

import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv

from agent import create_ai_agent, get_tools, SmartAutonomousFallbackAgent

# Load environment
load_dotenv()

app = FastAPI(title="Nexus AI Agent Web Application")

# Static directory path
BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"

# Initialize the AI Agent
agent_executor = None

try:
    agent_executor = create_ai_agent(verbose=False)
    print("✅ AI Agent successfully initialized for Web App!")
except Exception as e:
    print(f"⚠️ Warning: AI Agent initialization: {e}")
    agent_executor = SmartAutonomousFallbackAgent(get_tools())


class ChatRequest(BaseModel):
    query: str


class ConfigRequest(BaseModel):
    groq_api_key: str | None = None
    tavily_api_key: str | None = None


@app.get("/")
async def serve_index():
    """Serve the single-page React + Three.js web application."""
    index_path = STATIC_DIR / "index.html"
    if not index_path.exists():
        raise HTTPException(status_code=404, detail="Frontend file not found.")
    return FileResponse(index_path)


@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    """Handle chat requests, execute agent tools, and return structured output."""
    global agent_executor
    if not agent_executor:
        agent_executor = create_ai_agent(verbose=False)

    query = request.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    try:
        # Try main agent execution (Groq + LangChain)
        try:
            result = agent_executor.invoke({"input": query})
        except Exception as api_err:
            print(f"⚠️ Primary Agent Notice ({api_err}). Executing through Autonomous Multi-Tool Dispatcher...")
            fallback = SmartAutonomousFallbackAgent(get_tools())
            result = fallback.invoke({"input": query})

        # Extract tools used
        tools_used = []
        for action, observation in result.get("intermediate_steps", []):
            tool_name = getattr(action, 'tool', 'tool')
            tool_input = getattr(action, 'tool_input', '')

            display_name = tool_name
            if "wikipedia" in tool_name.lower():
                display_name = "Wikipedia"
            elif "tavily" in tool_name.lower():
                display_name = "Tavily Search"
            elif "date" in tool_name.lower() or "time" in tool_name.lower():
                display_name = "Live DateTime"
            elif tool_name == "add":
                display_name = "Add"
            elif tool_name == "multiply":
                display_name = "Multiply"

            tools_used.append({
                "tool": tool_name,
                "name": display_name,
                "input": tool_input,
                "output": str(observation)[:500]
            })

        return {
            "status": "success",
            "output": result.get("output", ""),
            "tools_used": tools_used
        }

    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/config")
async def update_config(config: ConfigRequest):
    """Update API keys dynamically and reinitialize agent."""
    global agent_executor
    if config.groq_api_key:
        os.environ["GROQ_API_KEY"] = config.groq_api_key.strip()
    if config.tavily_api_key:
        os.environ["TAVILY_API_KEY"] = config.tavily_api_key.strip()

    try:
        agent_executor = create_ai_agent(
            groq_api_key=os.environ.get("GROQ_API_KEY"),
            tavily_api_key=os.environ.get("TAVILY_API_KEY"),
            verbose=False
        )
        return {"status": "success", "message": "API keys updated and Agent reinitialized successfully."}
    except Exception as e:
        return {"status": "warning", "message": f"Keys set, fallback active: {e}"}


@app.get("/api/health")
async def health_check():
    """Health status endpoint."""
    return {
        "status": "online",
        "agent_ready": agent_executor is not None,
        "tools": ["Wikipedia", "Tavily Search", "Add", "Multiply"]
    }


# Mount static and assets directories
if (STATIC_DIR / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(STATIC_DIR / "assets")), name="assets")
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

if __name__ == "__main__":
    import uvicorn
    import socket
    import sys

    port = int(os.getenv("PORT", 8080))
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        port = int(sys.argv[1])

    # Check if port is in use and auto-find next open port
    def is_port_in_use(p):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            return s.connect_ex(('127.0.0.1', p)) == 0

    if is_port_in_use(port):
        for alt_port in [8080, 8000, 8001, 8088, 5000, 3000]:
            if not is_port_in_use(alt_port):
                port = alt_port
                break

    print(f"\n✨ ====================================================")
    print(f"🚀 Nexus AI Web Application Running At:")
    print(f"👉 http://localhost:{port}")
    print(f"👉 http://127.0.0.1:{port}")
    print(f"====================================================\n")
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=False)
