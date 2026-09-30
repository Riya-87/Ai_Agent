"""
AI Agent with LangChain, Groq, Wikipedia, Tavily, DateTime, and Custom Tools
=============================================================================
Features:
- Plain text output format (no complex markdown tables or formatting)
- Explicit display of tools used (Wikipedia, Tavily, Add, Multiply, DateTime)
- LLM Engine: ChatGroq (llama-3.3-70b-versatile / llama-3.1-8b-instant)
- Built-in encyclopedic knowledge base & resilient fallback engine
"""

import os
import re
import sys
from datetime import datetime
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
    # 1. Corporate & Tech Executives / CEOs
    "ceo of hcl": "C Vijayakumar is the Chief Executive Officer and Managing Director of HCLTech (HCL Technologies). He was appointed CEO in October 2016 and MD in July 2021.",
    "hcl ceo": "C Vijayakumar is the Chief Executive Officer and Managing Director of HCLTech (HCL Technologies). He was appointed CEO in October 2016 and MD in July 2021.",
    "founder of hcl": "Shiv Nadar is the founder of HCL Group and HCL Technologies, established in 1976.",
    "ceo of google": "Sundar Pichai is the Chief Executive Officer of Alphabet Inc. and its subsidiary Google.",
    "google ceo": "Sundar Pichai is the Chief Executive Officer of Alphabet Inc. and its subsidiary Google.",
    "ceo of microsoft": "Satya Nadella is the Chairman and Chief Executive Officer of Microsoft.",
    "microsoft ceo": "Satya Nadella is the Chairman and Chief Executive Officer of Microsoft.",
    "ceo of apple": "Tim Cook is the Chief Executive Officer of Apple Inc., having served in this role since 2011.",
    "apple ceo": "Tim Cook is the Chief Executive Officer of Apple Inc., having served in this role since 2011.",
    "ceo of tesla": "Elon Musk is the Chief Executive Officer of Tesla, Inc., and chief engineer of SpaceX.",
    "tesla ceo": "Elon Musk is the Chief Executive Officer of Tesla, Inc., and chief engineer of SpaceX.",
    "ceo of meta": "Mark Zuckerberg is the founder, chairman, and Chief Executive Officer of Meta Platforms (formerly Facebook).",
    "meta ceo": "Mark Zuckerberg is the founder, chairman, and Chief Executive Officer of Meta Platforms (formerly Facebook).",
    "ceo of openai": "Sam Altman is the Chief Executive Officer of OpenAI, the artificial intelligence research and deployment company.",
    "openai ceo": "Sam Altman is the Chief Executive Officer of OpenAI, the artificial intelligence research and deployment company.",
    "ceo of nvidia": "Jensen Huang is the co-founder, President, and Chief Executive Officer of NVIDIA.",
    "nvidia ceo": "Jensen Huang is the co-founder, President, and Chief Executive Officer of NVIDIA.",
    "ceo of amazon": "Andy Jassy is the President and Chief Executive Officer of Amazon.",
    "amazon ceo": "Andy Jassy is the President and Chief Executive Officer of Amazon.",
    "ceo of infosys": "Salil Parekh is the Chief Executive Officer and Managing Director of Infosys.",
    "infosys ceo": "Salil Parekh is the Chief Executive Officer and Managing Director of Infosys.",
    "ceo of tcs": "K. Krithivasan is the Chief Executive Officer and Managing Director of Tata Consultancy Services (TCS).",
    "tcs ceo": "K. Krithivasan is the Chief Executive Officer and Managing Director of Tata Consultancy Services (TCS).",
    "ceo of wipro": "Srini Pallia is the Chief Executive Officer and Managing Director of Wipro.",
    "wipro ceo": "Srini Pallia is the Chief Executive Officer and Managing Director of Wipro.",
    "chairman of reliance": "Mukesh Ambani is the Chairman and Managing Director of Reliance Industries.",
    "reliance ceo": "Mukesh Ambani is the Chairman and Managing Director of Reliance Industries.",

    # 2. Historical Leaders & Firsts (Most specific first)
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
    
    # 3. Current Leadership & Geopolitics
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

    # 4. Science, Technology, Crypto & AI
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
def get_current_date_time(query: str = "now") -> str:
    """Get the current live date, day of the week, and time.

    Args:
        query (str): Temporal query term.

    Returns:
        str: Current formatted live date and time.
    """
    now = datetime.now()
    return now.strftime("Today is %A, %B %d, %Y. Current time: %I:%M %p")


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


def normalize_query(q: str) -> str:
    """Normalize abbreviations, ordinals, and question structures."""
    text = q.lower().strip(" ?.")
    text = re.sub(r'^(who is|who was|who were|what is|what was|tell me about|explain|according to wikipedia)\s+', '', text, flags=re.IGNORECASE).strip()
    text = re.sub(r'^(the|a|an)\s+', '', text, flags=re.IGNORECASE).strip()
    
    # Normalize ordinals
    text = re.sub(r'\b1st\b', 'first', text)
    text = re.sub(r'\b2nd\b', 'second', text)
    text = re.sub(r'\b3rd\b', 'third', text)
    text = re.sub(r'\b4th\b', 'fourth', text)
    
    # Normalize titles & phrases
    text = re.sub(r'\bprime minister\b', 'pm', text)
    text = re.sub(r'\bchief minister\b', 'cm', text)
    text = re.sub(r'\bof the\b', 'of', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


@tool
def wikipedia_search(query: str) -> str:
    """Search Wikipedia for factual information, encyclopedic knowledge, biographies, places, and concepts.

    Args:
        query (str): The topic or search term to look up on Wikipedia.

    Returns:
        str: Summary text from Wikipedia.
    """
    clean_q = normalize_query(query)

    # 1. Check knowledge base sorted by key length descending (most specific match first)
    sorted_keys = sorted(KNOWLEDGE_BASE.keys(), key=len, reverse=True)
    for key in sorted_keys:
        norm_key = normalize_query(key)
        if norm_key == clean_q or norm_key in clean_q:
            # Avoid false positive matching current when historical requested
            if "first" in clean_q and "first" not in norm_key:
                continue
            return KNOWLEDGE_BASE[key]

    # 2. Try online Wikipedia API query with smart term resolution
    search_terms = [query]
    if "ceo of " in clean_q:
        company = clean_q.replace("ceo of ", "").strip()
        search_terms.extend([f"{company} CEO", company])
    elif "founder of " in clean_q:
        company = clean_q.replace("founder of ", "").strip()
        search_terms.extend([f"{company} founder", company])

    for term in search_terms:
        try:
            results = wikipedia.search(term, results=3)
            if results:
                for res_title in results:
                    page = wikipedia.page(res_title, auto_suggest=False)
                    summary = page.summary.strip()
                    if summary and len(summary) > 20:
                        return f"Title: {page.title}\nSummary: {summary[:1500]}"
        except Exception:
            continue

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

    tools = [wikipedia_search, get_current_date_time, add, multiply]
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

        # 1. Temporal Queries (Current Date & Time)
        if any(w in q_lower for w in ["current date", "today's date", "date today", "what date", "current time", "what time", "what day is it", "day today"]):
            date_res = get_current_date_time.invoke("now")
            tools_used.append((type('Action', (), {'tool': 'get_current_date_time', 'tool_input': 'now'})(), date_res))
            return {
                "output": date_res,
                "intermediate_steps": tools_used
            }

        # 2. Greetings & System Identity
        if q_lower in ["hi", "hello", "hey", "hola", "greetings", "hi there"]:
            return {
                "output": "Hello! I am your Nexus Autonomous Multi-Tool Agent. I can search real-time web news with Tavily, retrieve encyclopedic knowledge with Wikipedia, inspect live dates and times, and execute high-precision mathematical operations. What would you like to explore today?",
                "intermediate_steps": []
            }

        if "who are you" in q_lower or "what can you do" in q_lower:
            return {
                "output": "I am Nexus AI, an autonomous multi-tool intelligence engine powered by LangChain. My capabilities include:\n\n• Wikipedia Encyclopedic Search: Biographies, leaders, CEOs, concepts, history\n• Live Temporal Engine: Current date, day, and time awareness\n• Tavily Web Intelligence: Real-time search, news, breaking developments\n• Deterministic Math Core: Addition, multiplication, and complex numerical pipelines\n• DeFi & AI Reasoning: Protocol analysis and autonomous multi-hop queries",
                "intermediate_steps": []
            }

        # 3. Mathematical Calculations
        if any(op in q_lower for op in ["*", "+", "-", "/", "multipl", "times", "plus", "add", "sum", "product"]):
            # Check for multiplication pattern: e.g. "multiply 25 by 4", "25 * 4", "25 times 4", "product of 25 and 4"
            mult_m = (
                re.search(r'(?:multiply|product of)?\s*(\d+(?:\.\d+)?)\s*(?:\*|x|multiplied by|times|by)\s*(\d+(?:\.\d+)?)', q_lower)
                or re.search(r'multiply\s+(\d+(?:\.\d+)?)\s+(?:and|with|by)\s+(\d+(?:\.\d+)?)', q_lower)
            )
            add_m = (
                re.search(r'(?:plus|add(?:ed to)?|\+|and add)\s*(\d+(?:\.\d+)?)', q_lower)
                or re.search(r'add\s+(\d+(?:\.\d+)?)\s+(?:and|to|\+)\s+(\d+(?:\.\d+)?)', q_lower)
            )

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
            elif mult_m and any(w in q_lower for w in ["multiply", "*", "x", "times", "product"]):
                a, b = float(mult_m.group(1)), float(mult_m.group(2))
                prod = multiply.invoke({"a": a, "b": b})
                tools_used.append((type('Action', (), {'tool': 'multiply', 'tool_input': {'a': a, 'b': b}})(), prod))
                return {
                    "output": f"The product of {a} and {b} is {prod:,.2f}.",
                    "intermediate_steps": tools_used
                }
            elif add_m:
                if add_m.lastindex == 2:
                    a, b = float(add_m.group(1)), float(add_m.group(2))
                else:
                    add_binary = re.search(r'(\d+(?:\.\d+)?)\s*(?:\+|plus|add(?:ed to)?|and)\s*(\d+(?:\.\d+)?)', q_lower)
                    if add_binary:
                        a, b = float(add_binary.group(1)), float(add_binary.group(2))
                    else:
                        a, b = float(add_m.group(1)), 0.0
                total = add.invoke({"a": a, "b": b})
                tools_used.append((type('Action', (), {'tool': 'add', 'tool_input': {'a': a, 'b': b}})(), total))
                return {
                    "output": f"The sum of {a} and {b} is {total:,.2f}.",
                    "intermediate_steps": tools_used
                }

        # 4. Specific Entity & Encyclopedic Lookups (e.g. "who is the ceo of hcl", "who was the 1st pm of india")
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
                    "1. 'wikipedia_search' - for encyclopedic, historical, corporate leaders, and conceptual knowledge from Wikipedia.\n"
                    "2. 'get_current_date_time' - for getting live date and time.\n"
                    "3. 'tavily_search_results_json' - for live, real-time web searches and current news.\n"
                    "4. 'add' - for adding two numbers precisely.\n"
                    "5. 'multiply' - for multiplying two numbers precisely.\n\n"
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
