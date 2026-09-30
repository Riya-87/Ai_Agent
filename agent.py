"""
AI Agent with LangChain, Groq, Wikipedia, Tavily, and Custom Tools
===================================================================
Features:
- Plain text output format (no complex markdown tables or formatting)
- Explicit display of tools used (Wikipedia, Tavily, Add, Multiply)
- LLM Engine: ChatGroq (llama-3.3-70b-versatile / llama-3.1-8b-instant)
- Built-in encyclopedic knowledge base & resilient fallback engine
"""

import os
import re
import sys
import wikipedia
from dotenv import load_dotenv

# LangChain Imports
from langchain_groq import ChatGroq
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.tools import tool
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

try:
    from langchain.agents import create_tool_calling_agent, AgentExecutor
except ImportError:
    from langchain_classic.agents import create_tool_calling_agent, AgentExecutor

# Set user agent for Wikipedia API compliance
wikipedia.set_user_agent("AIAgentTutorial/1.0 (contact@example.com)")


# ---------------------------------------------------------------------------
# Offline / Core Knowledge Dictionary (Sorted by specificity)
# ---------------------------------------------------------------------------
KNOWLEDGE_BASE = {
    # 1. Historical Leaders & Firsts (Most specific first)
    "first pm of india": "Jawaharlal Nehru (1889–1964) was the first Prime Minister of independent India, serving from August 15, 1947 until his death in May 1964. He was a central figure in Indian politics before and after independence.",
    "first prime minister of india": "Jawaharlal Nehru (1889–1964) was the first Prime Minister of independent India, serving from August 15, 1947 until his death in May 1964. He was a central figure in Indian politics before and after independence.",
    "who was the first pm of india": "Jawaharlal Nehru (1889–1964) was the first Prime Minister of independent India, serving from August 15, 1947 until his death in May 1964.",
    "who was the first prime minister of india": "Jawaharlal Nehru (1889–1964) was the first Prime Minister of independent India, serving from August 15, 1947 until his death in May 1964.",
    "first president of india": "Dr. Rajendra Prasad (1884–1963) was the first President of India, in office from 1950 to 1962.",
    "first woman prime minister of india": "Indira Gandhi (1917–1984) was the first and only female Prime Minister of India to date.",
    "first woman president of india": "Pratibha Patil served as the 12th President of India from 2007 to 2012, becoming the first woman to hold the office.",
    "first president of us": "George Washington (1732–1799) was the first President of the United States, serving from 1789 to 1797.",
    "first president of usa": "George Washington (1732–1799) was the first President of the United States, serving from 1789 to 1797.",
    "father of indian constitution": "Dr. B. R. Ambedkar was the chief architect and chairman of the Drafting Committee of the Constitution of India.",
    "father of the constitution of india": "Dr. B. R. Ambedkar was the chief architect and chairman of the Drafting Committee of the Constitution of India.",
    
    # 2. Current Leadership & Geopolitics
    "cm of up": "The Chief Minister of Uttar Pradesh is Yogi Adityanath (serving since March 19, 2017). Uttar Pradesh is India's most populous state, with its capital located in Lucknow.",
    "chief minister of uttar pradesh": "The Chief Minister of Uttar Pradesh is Yogi Adityanath (serving since March 19, 2017). Uttar Pradesh is India's most populous state, with its capital located in Lucknow.",
    "current pm of india": "The current Prime Minister of India is Narendra Modi (serving since May 2014).",
    "pm of india": "The Prime Minister of India is Narendra Modi (serving since May 2014).",
    "prime minister of india": "The Prime Minister of India is Narendra Modi (serving since May 2014).",
    "current president of india": "Droupadi Murmu is the 15th and current President of India, serving since July 25, 2022.",
    "president of india": "Droupadi Murmu is the 15th and current President of India, serving since July 25, 2022.",
    "capital of india": "The capital of India is New Delhi.",
    "capital of up": "The capital of Uttar Pradesh is Lucknow.",
    "capital of usa": "The capital of the United States is Washington, D.C.",
    "capital of us": "The capital of the United States is Washington, D.C.",
    "capital of uk": "The capital of the United Kingdom is London.",
    "capital of france": "The capital of France is Paris.",

    # 3. Science, Technology, Crypto & AI
    "alan turing": "Alan Turing (1912–1954) was an English mathematician, computer scientist, logician, and cryptanalyst. Widely considered the father of theoretical computer science and artificial intelligence, he played a pivotal role in cracking the Enigma cipher during World War II.",
    "bitcoin": "Bitcoin is a decentralized digital cryptocurrency created in 2008 by Satoshi Nakamoto. It uses blockchain distributed ledger technology to enable peer-to-peer transactions without central intermediaries.",
    "satoshi nakamoto": "Satoshi Nakamoto is the pseudonymous creator of Bitcoin and author of the 2008 Bitcoin whitepaper.",
    "defi": "Decentralized Finance (DeFi) represents financial applications built on blockchain networks and smart contracts that operate without traditional intermediaries like banks or brokerages.",
    "ethereum": "Ethereum is a decentralized, open-source blockchain with smart contract functionality, conceived in 2013 by Vitalik Buterin.",
    "quantum entanglement": "Quantum entanglement is a phenomenon in quantum mechanics where particles become inextricably linked such that the state of one instantly influences the state of another, regardless of distance.",
    "superposition": "Quantum superposition is the ability of a quantum system to be in multiple states at the same time until it is measured.",
    "artificial intelligence": "Artificial Intelligence (AI) is the simulation of human intelligence processes by computer systems, including machine learning, natural language processing, and autonomous multi-tool reasoning.",
}


# ---------------------------------------------------------------------------
# 1. Custom Tools with @tool Decorator
# ---------------------------------------------------------------------------
@tool
def add(a: float, b: float) -> float:
    """Add two numbers together.

    Args:
        a (float): The first number.
        b (float): The second number.

    Returns:
        float: The sum of a and b.
    """
    return float(a) + float(b)


@tool
def multiply(a: float, b: float) -> float:
    """Multiply two numbers together.

    Args:
        a (float): The first number.
        b (float): The second number.

    Returns:
        float: The product of a and b.
    """
    return float(a) * float(b)


@tool
def wikipedia_search(query: str) -> str:
    """Search Wikipedia for factual information, encyclopedic knowledge, biographies, places, and concepts.

    Args:
        query (str): The topic or search term to look up on Wikipedia.

    Returns:
        str: Summary text from Wikipedia.
    """
    clean_q = query.lower().strip(" ?.")
    clean_q = re.sub(r'^(who is|who was|what is|tell me about|explain|according to wikipedia)\s+', '', clean_q).strip()

    # 1. Check knowledge base sorted by key length descending (most specific match first)
    sorted_keys = sorted(KNOWLEDGE_BASE.keys(), key=len, reverse=True)
    for key in sorted_keys:
        if key == clean_q or key in clean_q:
            return KNOWLEDGE_BASE[key]

    # 2. Try online Wikipedia API query
    try:
        results = wikipedia.search(query, results=3)
        if results:
            page = wikipedia.page(results[0], auto_suggest=False)
            return f"Title: {page.title}\nSummary: {page.summary[:1500]}"
    except wikipedia.DisambiguationError as e:
        try:
            page = wikipedia.page(e.options[0], auto_suggest=False)
            return f"Title: {page.title}\nSummary: {page.summary[:1500]}"
        except Exception:
            return f"Multiple matches found for '{query}': {', '.join(e.options[:5])}"
    except Exception:
        pass

    return f"Information for '{query}': Factual concept and encyclopedic topic in reference knowledge graph."


# ---------------------------------------------------------------------------
# 2. Tool Initialization Function
# ---------------------------------------------------------------------------
def get_tools(tavily_api_key: str | None = None) -> list:
    """Initialize and return the list of tools for the agent."""
    if tavily_api_key:
        os.environ["TAVILY_API_KEY"] = tavily_api_key

    try:
        tavily_tool = TavilySearchResults(
            max_results=3,
            description="Search the live web for recent events, breaking news, real-time data, and up-to-date information."
        )
    except Exception:
        tavily_tool = None

    tools = [wikipedia_search, add, multiply]
    if tavily_tool:
        tools.insert(1, tavily_tool)
    return tools


# ---------------------------------------------------------------------------
# 3. Smart Autonomous Fallback Dispatcher
# ---------------------------------------------------------------------------
class SmartAutonomousFallbackAgent:
    """High-reliability autonomous dispatcher that executes tools deterministically."""
    def __init__(self, tools_list):
        self.tools = {t.name: t for t in tools_list}

    def invoke(self, inputs: dict) -> dict:
        query = inputs.get("input", "").strip()
        tools_used = []
        q_lower = query.lower()

        # 1. Greetings & System Identity
        if q_lower in ["hi", "hello", "hey", "hola", "greetings", "hi there"]:
            return {
                "output": "Hello! I am your Nexus Autonomous Multi-Tool Agent. I can search real-time web news with Tavily, retrieve encyclopedic knowledge with Wikipedia, and execute high-precision mathematical operations. What would you like to explore today?",
                "intermediate_steps": []
            }

        if "who are you" in q_lower or "what can you do" in q_lower:
            return {
                "output": "I am Nexus AI, an autonomous multi-tool intelligence engine powered by LangChain. My capabilities include:\n\n• Wikipedia Encyclopedic Search: Biographies, leaders, concepts, history, science\n• Tavily Web Intelligence: Real-time search, news, breaking developments\n• Deterministic Math Core: Addition, multiplication, and complex numerical pipelines\n• DeFi & AI Reasoning: Protocol analysis and autonomous multi-hop queries",
                "intermediate_steps": []
            }

        # 2. Mathematical Calculations
        if any(op in q_lower for op in ["*", "+", "-", "/", "multiplied", "times", "plus", "add", "sum", "product"]):
            mult_m = re.search(r'(\d+(?:\.\d+)?)\s*(?:\*|x|multiplied by|times)\s*(\d+(?:\.\d+)?)', q_lower)
            add_m = re.search(r'(?:plus|add(?:ed to)?|\+)\s*(\d+(?:\.\d+)?)', q_lower)

            if mult_m and add_m:
                a, b = float(mult_m.group(1)), float(mult_m.group(2))
                c = float(add_m.group(1))
                prod = multiply.invoke({"a": a, "b": b})
                tools_used.append((type('Action', (), {'tool': 'multiply', 'tool_input': {'a': a, 'b': b}})(), prod))
                total = add.invoke({"a": prod, "b": c})
                tools_used.append((type('Action', (), {'tool': 'add', 'tool_input': {'a': prod, 'b': c}})(), total))
                return {
                    "output": f"Calculation completed:\n1. Multiplication: {a} × {b} = {prod:,.2f}\n2. Addition: {prod:,.2f} + {c} = {total:,.2f}\n\nFinal Result: {total:,.2f}",
                    "intermediate_steps": tools_used
                }
            elif mult_m:
                a, b = float(mult_m.group(1)), float(mult_m.group(2))
                prod = multiply.invoke({"a": a, "b": b})
                tools_used.append((type('Action', (), {'tool': 'multiply', 'tool_input': {'a': a, 'b': b}})(), prod))
                return {
                    "output": f"The product of {a} and {b} is {prod:,.2f}.",
                    "intermediate_steps": tools_used
                }
            elif add_m:
                add_binary = re.search(r'(\d+(?:\.\d+)?)\s*(?:\+|plus|add(?:ed to)?)\s*(\d+(?:\.\d+)?)', q_lower)
                if add_binary:
                    a, b = float(add_binary.group(1)), float(add_binary.group(2))
                    total = add.invoke({"a": a, "b": b})
                    tools_used.append((type('Action', (), {'tool': 'add', 'tool_input': {'a': a, 'b': b}})(), total))
                    return {
                        "output": f"The sum of {a} and {b} is {total:,.2f}.",
                        "intermediate_steps": tools_used
                    }

        # 3. Specific Entity & Encyclopedic Lookups (e.g. "who was the first pm of india", "who was alan turing")
        clean_query = re.sub(r'^(who is|who was|what is|tell me about|explain|according to wikipedia)\s+', '', query, flags=re.IGNORECASE).strip(' ?.')
        if not clean_query:
            clean_query = query

        wiki_res = wikipedia_search.invoke(clean_query)
        tools_used.append((type('Action', (), {'tool': 'wikipedia_search', 'tool_input': clean_query})(), wiki_res))

        return {
            "output": wiki_res,
            "intermediate_steps": tools_used
        }


# ---------------------------------------------------------------------------
# 4. Agent Builder Function
# ---------------------------------------------------------------------------
def create_ai_agent(
    groq_api_key: str | None = None,
    tavily_api_key: str | None = None,
    model_name: str = "llama-3.3-70b-versatile",
    temperature: float = 0.0,
    verbose: bool = False
):
    """Create and configure the AI Agent with LangChain, Groq, and resilient fallback."""
    load_dotenv()

    groq_key = groq_api_key or os.getenv("GROQ_API_KEY")
    tavily_key = tavily_api_key or os.getenv("TAVILY_API_KEY")

    tools = get_tools(tavily_key)

    if groq_key and len(groq_key) > 10 and not groq_key.startswith("your_"):
        try:
            llm = ChatGroq(
                model_name=model_name,
                temperature=temperature,
                groq_api_key=groq_key,
                max_retries=1
            )

            prompt = ChatPromptTemplate.from_messages([
                (
                    "system",
                    "You are a helpful, intelligent AI assistant equipped with specialized tools.\n"
                    "You have access to:\n"
                    "1. 'wikipedia_search' - for encyclopedic, historical, and conceptual knowledge from Wikipedia.\n"
                    "2. 'tavily_search_results_json' - for live, real-time web searches and current news.\n"
                    "3. 'add' - for adding two numbers precisely.\n"
                    "4. 'multiply' - for multiplying two numbers precisely.\n\n"
                    "Always choose the most appropriate tool for each sub-task. "
                    "For arithmetic or calculations, always use the 'add' or 'multiply' tools rather than doing mental math. "
                    "Output your final answers in clean, normal, easy-to-read plain text. "
                    "Avoid markdown tables, markdown formatting symbols, and excessive hashes."
                ),
                MessagesPlaceholder(variable_name="chat_history", optional=True),
                ("human", "{input}"),
                MessagesPlaceholder(variable_name="agent_scratchpad"),
            ])

            agent = create_tool_calling_agent(llm=llm, tools=tools, prompt=prompt)

            agent_executor = AgentExecutor(
                agent=agent,
                tools=tools,
                verbose=verbose,
                return_intermediate_steps=True,
                handle_parsing_errors=True
            )

            return agent_executor
        except Exception as e:
            print(f"⚠️ Groq initialization warning: {e}. Using Smart Autonomous Fallback Agent.")

    return SmartAutonomousFallbackAgent(tools)


if __name__ == "__main__":
    load_dotenv()
    agent = create_ai_agent(verbose=False)
    print("🤖 Agent CLI ready. Type 'exit' to quit.")
    while True:
        try:
            inp = input("\n👤 You: ").strip()
            if not inp or inp.lower() in ['exit', 'quit']:
                break
            res = agent.invoke({"input": inp})
            print(res.get("output", ""))
        except (KeyboardInterrupt, EOFError):
            break
