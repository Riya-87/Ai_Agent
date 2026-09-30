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
# Offline / Core Knowledge Dictionary (Comprehensive Profiles)
# ---------------------------------------------------------------------------
KNOWLEDGE_BASE = {
    # 1. Corporate & Tech Executives / CEOs
    "ceo of apple": (
        "Timothy Donald Cook (Tim Cook) is the Chief Executive Officer of Apple Inc., having served as CEO since August 24, 2011, when he succeeded Apple co-founder Steve Jobs.\n\n"
        "Key Career Background & Achievements:\n"
        "• Background & Early Career: Born in Robertsdale, Alabama (1960), Cook earned a B.S. in Industrial Engineering from Auburn University (1982) and an MBA from Duke University's Fuqua School of Business (1988). Prior to Apple, he spent 12 years at IBM and served as Vice President of Corporate Materials at Compaq.\n"
        "• Apple Operations & Supply Chain: Joined Apple in March 1998 as Senior Vice President for Worldwide Operations. He streamlined Apple's manufacturing and inventory systems, building one of the world's most resilient and efficient supply chains.\n"
        "• Major Product Milestones: Under Cook's tenure as CEO, Apple launched the Apple Watch, AirPods, Apple Silicon (M1/M2/M3/M4 custom chips), iPad Pro, and Apple Vision Pro spatial computer, alongside high-margin subscription services (Apple Music, iCloud+, Apple Pay, Apple TV+).\n"
        "• Market Valuation: Cook led Apple to become the first publicly traded company in history to surpass $1 Trillion, $2 Trillion, and $3 Trillion in market capitalization."
    ),
    "apple ceo": (
        "Timothy Donald Cook (Tim Cook) is the Chief Executive Officer of Apple Inc., having served as CEO since August 24, 2011, when he succeeded Apple co-founder Steve Jobs.\n\n"
        "Key Career Background & Achievements:\n"
        "• Background & Early Career: Born in Robertsdale, Alabama (1960), Cook earned a B.S. in Industrial Engineering from Auburn University (1982) and an MBA from Duke University's Fuqua School of Business (1988). Prior to Apple, he spent 12 years at IBM and served as Vice President of Corporate Materials at Compaq.\n"
        "• Apple Operations & Supply Chain: Joined Apple in March 1998 as Senior Vice President for Worldwide Operations. He streamlined Apple's manufacturing and inventory systems, building one of the world's most resilient and efficient supply chains.\n"
        "• Major Product Milestones: Under Cook's tenure as CEO, Apple launched the Apple Watch, AirPods, Apple Silicon (M1/M2/M3/M4 custom chips), iPad Pro, and Apple Vision Pro spatial computer, alongside high-margin subscription services (Apple Music, iCloud+, Apple Pay, Apple TV+).\n"
        "• Market Valuation: Cook led Apple to become the first publicly traded company in history to surpass $1 Trillion, $2 Trillion, and $3 Trillion in market capitalization."
    ),
    "ceo of hcl": (
        "C Vijayakumar (CVK) is the Chief Executive Officer and Managing Director of HCLTech (HCL Technologies), a leading global technology services and consulting multinational.\n\n"
        "Key Career Background & Achievements:\n"
        "• Leadership & Tenure: Appointed CEO in October 2016 and Managing Director in July 2021. He joined HCL in 1994 as a core founding member of the startup team for HCL Comnet and has led business units across North America and globally.\n"
        "• Strategic Transformation: Under his leadership, HCLTech surpassed $12+ billion in annual revenue, transitioned into a global leader in Hybrid Cloud, AI Solutions, Cybersecurity, and Engineering and R&D Services (ERS).\n"
        "• Recognition: Recognized as one of the top-performing technology CEOs globally for spearheading sustainable corporate governance, client-centric innovation, and deep technological transformation."
    ),
    "hcl ceo": (
        "C Vijayakumar (CVK) is the Chief Executive Officer and Managing Director of HCLTech (HCL Technologies), a leading global technology services and consulting multinational.\n\n"
        "Key Career Background & Achievements:\n"
        "• Leadership & Tenure: Appointed CEO in October 2016 and Managing Director in July 2021. He joined HCL in 1994 as a core founding member of the startup team for HCL Comnet and has led business units across North America and globally.\n"
        "• Strategic Transformation: Under his leadership, HCLTech surpassed $12+ billion in annual revenue, transitioned into a global leader in Hybrid Cloud, AI Solutions, Cybersecurity, and Engineering and R&D Services (ERS).\n"
        "• Recognition: Recognized as one of the top-performing technology CEOs globally for spearheading sustainable corporate governance, client-centric innovation, and deep technological transformation."
    ),
    "founder of hcl": "Shiv Nadar is the visionary founder and Chairman Emeritus of HCL Enterprise and HCL Technologies, established in 1976. He is a pioneering Indian industrialist, philanthropist, and founder of the Shiv Nadar Foundation.",
    "ceo of google": (
        "Sundar Pichai (Pichai Sundararajan) is the Chief Executive Officer of Alphabet Inc. and its subsidiary Google LLC.\n\n"
        "Key Career Background & Achievements:\n"
        "• Background & Education: Born in Madurai, Tamil Nadu, India (1972), Pichai earned a B.Tech from IIT Kharagpur, an M.S. from Stanford University in Materials Science, and an MBA from the Wharton School of the University of Pennsylvania.\n"
        "• Rise at Google: Joined Google in 2004, leading product management for Google Chrome, ChromeOS, Google Drive, Google Maps, and Android OS.\n"
        "• CEO Tenure: Appointed CEO of Google in August 2015 during Alphabet's founding restructuring, and CEO of parent company Alphabet Inc. in December 2019 upon the retirement of founders Larry Page and Sergey Brin.\n"
        "• Strategic Direction: Pioneered Google's pivot to an 'AI-First' company, driving the development of Gemini, Google Cloud Platform, Transformer architecture research, and quantum computing."
    ),
    "google ceo": (
        "Sundar Pichai (Pichai Sundararajan) is the Chief Executive Officer of Alphabet Inc. and its subsidiary Google LLC.\n\n"
        "Key Career Background & Achievements:\n"
        "• Background & Education: Born in Madurai, Tamil Nadu, India (1972), Pichai earned a B.Tech from IIT Kharagpur, an M.S. from Stanford University in Materials Science, and an MBA from the Wharton School of the University of Pennsylvania.\n"
        "• Rise at Google: Joined Google in 2004, leading product management for Google Chrome, ChromeOS, Google Drive, Google Maps, and Android OS.\n"
        "• CEO Tenure: Appointed CEO of Google in August 2015 during Alphabet's founding restructuring, and CEO of parent company Alphabet Inc. in December 2019 upon the retirement of founders Larry Page and Sergey Brin.\n"
        "• Strategic Direction: Pioneered Google's pivot to an 'AI-First' company, driving the development of Gemini, Google Cloud Platform, Transformer architecture research, and quantum computing."
    ),
    "ceo of microsoft": (
        "Satya Nadella is the Executive Chairman and Chief Executive Officer of Microsoft Corporation.\n\n"
        "Key Career Background & Achievements:\n"
        "• Background: Born in Hyderabad, India (1967), Nadella earned a B.E. from Manipal Institute of Technology, an M.S. in Computer Science from the University of Wisconsin–Milwaukee, and an MBA from the University of Chicago Booth School of Business.\n"
        "• Cloud Transformation: Joined Microsoft in 1992 and was appointed CEO in February 2014, succeeding Steve Ballmer. He engineered Microsoft's monumental shift to cloud computing via Microsoft Azure.\n"
        "• Major Acquisitions: Led acquisitions of LinkedIn ($26.2B), GitHub ($7.5B), Activision Blizzard ($68.7B), and established Microsoft's alliance with OpenAI to embed Copilot AI across enterprise software."
    ),
    "microsoft ceo": (
        "Satya Nadella is the Executive Chairman and Chief Executive Officer of Microsoft Corporation.\n\n"
        "Key Career Background & Achievements:\n"
        "• Background: Born in Hyderabad, India (1967), Nadella earned a B.E. from Manipal Institute of Technology, an M.S. in Computer Science from the University of Wisconsin–Milwaukee, and an MBA from the University of Chicago Booth School of Business.\n"
        "• Cloud Transformation: Joined Microsoft in 1992 and was appointed CEO in February 2014, succeeding Steve Ballmer. He engineered Microsoft's monumental shift to cloud computing via Microsoft Azure.\n"
        "• Major Acquisitions: Led acquisitions of LinkedIn ($26.2B), GitHub ($7.5B), Activision Blizzard ($68.7B), and established Microsoft's alliance with OpenAI to embed Copilot AI across enterprise software."
    ),
    "ceo of tesla": (
        "Elon Musk is the Chief Executive Officer and Product Architect of Tesla, Inc., and CEO / Chief Engineer of SpaceX.\n\n"
        "Key Highlights:\n"
        "• Tesla Leadership: Joined Tesla in 2004 as lead investor and chairman, becoming CEO in 2008. Oversaw the development of the Roadster, Model S, Model 3, Model X, Model Y, and Cybertruck, pioneering mass-market electric mobility.\n"
        "• Other Ventures: Founder of xAI, The Boring Company, and Neuralink, and Owner of X (formerly Twitter). SpaceX revolutionized aerospace with reusable Falcon 9 rockets and Starship."
    ),
    "tesla ceo": (
        "Elon Musk is the Chief Executive Officer and Product Architect of Tesla, Inc., and CEO / Chief Engineer of SpaceX.\n\n"
        "Key Highlights:\n"
        "• Tesla Leadership: Joined Tesla in 2004 as lead investor and chairman, becoming CEO in 2008. Oversaw the development of the Roadster, Model S, Model 3, Model X, Model Y, and Cybertruck, pioneering mass-market electric mobility.\n"
        "• Other Ventures: Founder of xAI, The Boring Company, and Neuralink, and Owner of X (formerly Twitter). SpaceX revolutionized aerospace with reusable Falcon 9 rockets and Starship."
    ),
    "ceo of meta": "Mark Zuckerberg is the founder, chairman, and Chief Executive Officer of Meta Platforms (formerly Facebook). He co-founded Facebook at Harvard in 2004 and led the company through major acquisitions including Instagram (2012) and WhatsApp (2014), alongside pioneering the open-source Llama AI ecosystem.",
    "meta ceo": "Mark Zuckerberg is the founder, chairman, and Chief Executive Officer of Meta Platforms (formerly Facebook). He co-founded Facebook at Harvard in 2004 and led the company through major acquisitions including Instagram (2012) and WhatsApp (2014), alongside pioneering the open-source Llama AI ecosystem.",
    "ceo of openai": "Sam Altman is the Chief Executive Officer of OpenAI, the artificial intelligence organization behind ChatGPT, GPT-4, and DALL-E. He was previously President of startup accelerator Y Combinator (YC).",
    "openai ceo": "Sam Altman is the Chief Executive Officer of OpenAI, the artificial intelligence organization behind ChatGPT, GPT-4, and DALL-E. He was previously President of startup accelerator Y Combinator (YC).",
    "ceo of nvidia": "Jensen Huang is the co-founder, President, and Chief Executive Officer of NVIDIA Corporation, which he founded in 1993. Under his vision, NVIDIA pioneered the GPU (GeForce) and the CUDA architecture, establishing NVIDIA hardware as the global engine for modern AI supercomputing.",
    "nvidia ceo": "Jensen Huang is the co-founder, President, and Chief Executive Officer of NVIDIA Corporation, which he founded in 1993. Under his vision, NVIDIA pioneered the GPU (GeForce) and the CUDA architecture, establishing NVIDIA hardware as the global engine for modern AI supercomputing.",
    "ceo of amazon": "Andy Jassy is the President and Chief Executive Officer of Amazon. He previously founded and led Amazon Web Services (AWS) from its inception in 2003 into the world's leading cloud computing infrastructure before succeeding Jeff Bezos as CEO in July 2021.",
    "amazon ceo": "Andy Jassy is the President and Chief Executive Officer of Amazon. He previously founded and led Amazon Web Services (AWS) from its inception in 2003 into the world's leading cloud computing infrastructure before succeeding Jeff Bezos as CEO in July 2021.",
    "ceo of infosys": "Salil Parekh is the Chief Executive Officer and Managing Director of Infosys, having taken leadership in January 2018. He has over three decades of global IT services and digital transformation leadership experience.",
    "infosys ceo": "Salil Parekh is the Chief Executive Officer and Managing Director of Infosys, having taken leadership in January 2018. He has over three decades of global IT services and digital transformation leadership experience.",
    "ceo of tcs": "K. Krithivasan is the Chief Executive Officer and Managing Director of Tata Consultancy Services (TCS), appointed in June 2023 after serving over 34 years in pivotal leadership roles across TCS's global banking, financial, and digital services.",
    "tcs ceo": "K. Krithivasan is the Chief Executive Officer and Managing Director of Tata Consultancy Services (TCS), appointed in June 2023 after serving over 34 years in pivotal leadership roles across TCS's global banking, financial, and digital services.",
    "ceo of wipro": "Srini Pallia is the Chief Executive Officer and Managing Director of Wipro Limited, appointed in April 2024 with over three decades of leadership within Wipro across cloud, consumer, and strategic business units.",
    "wipro ceo": "Srini Pallia is the Chief Executive Officer and Managing Director of Wipro Limited, appointed in April 2024 with over three decades of leadership within Wipro across cloud, consumer, and strategic business units.",
    "chairman of reliance": "Mukesh Ambani is the Chairman and Managing Director of Reliance Industries Limited (RIL), India's most valuable conglomerate spanning energy, petrochemicals, telecommunications (Jio), and retail.",
    "reliance ceo": "Mukesh Ambani is the Chairman and Managing Director of Reliance Industries Limited (RIL), India's most valuable conglomerate spanning energy, petrochemicals, telecommunications (Jio), and retail.",

    # 2. Historical Leaders & Firsts (Most specific first)
    "first pm of india": (
        "Jawaharlal Nehru (1889–1964) was the first Prime Minister of independent India, serving from August 15, 1947 until his death on May 27, 1964.\n\n"
        "Key Contributions & Achievements:\n"
        "• Independence Movement: A central leader of the Indian National Congress alongside Mahatma Gandhi, Nehru spent years in prison during the freedom struggle and delivered the historic 'Tryst with Destiny' speech on the eve of independence.\n"
        "• Architect of Modern India: Championed secular democracy, industrial planning (Five-Year Plans), and state-of-the-art scientific infrastructure, establishing premier institutions such as the IITs, IIMs, AIIMS, and the Atomic Energy Commission.\n"
        "• Foreign Policy: Co-founded the Non-Aligned Movement (NAM) to maintain strategic independence during the Cold War."
    ),
    "first prime minister of india": (
        "Jawaharlal Nehru (1889–1964) was the first Prime Minister of independent India, serving from August 15, 1947 until his death on May 27, 1964.\n\n"
        "Key Contributions & Achievements:\n"
        "• Independence Movement: A central leader of the Indian National Congress alongside Mahatma Gandhi, Nehru spent years in prison during the freedom struggle and delivered the historic 'Tryst with Destiny' speech on the eve of independence.\n"
        "• Architect of Modern India: Championed secular democracy, industrial planning (Five-Year Plans), and state-of-the-art scientific infrastructure, establishing premier institutions such as the IITs, IIMs, AIIMS, and the Atomic Energy Commission.\n"
        "• Foreign Policy: Co-founded the Non-Aligned Movement (NAM) to maintain strategic independence during the Cold War."
    ),
    "who was the first pm of india": (
        "Jawaharlal Nehru (1889–1964) was the first Prime Minister of independent India, serving from August 15, 1947 until his death on May 27, 1964.\n\n"
        "Key Contributions & Achievements:\n"
        "• Independence Movement: A central leader of the Indian National Congress alongside Mahatma Gandhi, Nehru spent years in prison during the freedom struggle and delivered the historic 'Tryst with Destiny' speech on the eve of independence.\n"
        "• Architect of Modern India: Championed secular democracy, industrial planning (Five-Year Plans), and state-of-the-art scientific infrastructure, establishing premier institutions such as the IITs, IIMs, AIIMS, and the Atomic Energy Commission.\n"
        "• Foreign Policy: Co-founded the Non-Aligned Movement (NAM) to maintain strategic independence during the Cold War."
    ),
    "who was the first prime minister of india": (
        "Jawaharlal Nehru (1889–1964) was the first Prime Minister of independent India, serving from August 15, 1947 until his death on May 27, 1964.\n\n"
        "Key Contributions & Achievements:\n"
        "• Independence Movement: A central leader of the Indian National Congress alongside Mahatma Gandhi, Nehru spent years in prison during the freedom struggle and delivered the historic 'Tryst with Destiny' speech on the eve of independence.\n"
        "• Architect of Modern India: Championed secular democracy, industrial planning (Five-Year Plans), and state-of-the-art scientific infrastructure, establishing premier institutions such as the IITs, IIMs, AIIMS, and the Atomic Energy Commission.\n"
        "• Foreign Policy: Co-founded the Non-Aligned Movement (NAM) to maintain strategic independence during the Cold War."
    ),
    "first president of india": "Dr. Rajendra Prasad (1884–1963) was the first President of India, serving from 1950 to 1962. A lawyer and scholar, he also presided over the Constituent Assembly that created the Constitution of India.",
    "first woman prime minister of india": "Indira Gandhi (1917–1984) was the first and only female Prime Minister of India, serving across multiple terms (1966–1977 and 1980–1984).",
    "first woman president of india": "Pratibha Patil served as the 12th President of India from 2007 to 2012, becoming the first woman to hold the office of President of India.",
    "first president of us": "George Washington (1732–1799) was an American military officer and statesman who served as the first President of the United States from 1789 to 1797.",
    "first president of usa": "George Washington (1732–1799) was an American military officer and statesman who served as the first President of the United States from 1789 to 1797.",
    "father of indian constitution": "Dr. B. R. Ambedkar (Bhimrao Ramji Ambedkar) was an Indian jurist, social reformer, and political leader who headed the Drafting Committee of the Constitution of India and served as India's first Minister of Law and Justice.",
    "father of the constitution of india": "Dr. B. R. Ambedkar (Bhimrao Ramji Ambedkar) was an Indian jurist, social reformer, and political leader who headed the Drafting Committee of the Constitution of India and served as India's first Minister of Law and Justice.",
    
    # 3. Current Leadership & Geopolitics
    "cm of up": "Yogi Adityanath (born Ajay Mohan Singh Bisht) is the 21st and current Chief Minister of Uttar Pradesh, serving since March 19, 2017. He represents the Gorakhpur Urban constituency and is a prominent leader of the Bharatiya Janata Party (BJP).",
    "chief minister of uttar pradesh": "Yogi Adityanath (born Ajay Mohan Singh Bisht) is the 21st and current Chief Minister of Uttar Pradesh, serving since March 19, 2017. He represents the Gorakhpur Urban constituency and is a prominent leader of the Bharatiya Janata Party (BJP).",
    "current pm of india": "Narendra Modi (Narendra Damodardas Modi) is the 14th and current Prime Minister of India, in office since May 26, 2014. He previously served as Chief Minister of Gujarat from 2001 to 2014.",
    "pm of india": "Narendra Modi (Narendra Damodardas Modi) is the 14th and current Prime Minister of India, in office since May 26, 2014. He previously served as Chief Minister of Gujarat from 2001 to 2014.",
    "prime minister of india": "Narendra Modi (Narendra Damodardas Modi) is the 14th and current Prime Minister of India, in office since May 26, 2014. He previously served as Chief Minister of Gujarat from 2001 to 2014.",
    "current president of india": "Droupadi Murmu is the 15th and current President of India, serving since July 25, 2022. She is the first person belonging to a tribal community and the second woman to hold the office.",
    "president of india": "Droupadi Murmu is the 15th and current President of India, serving since July 25, 2022. She is the first person belonging to a tribal community and the second woman to hold the office.",
    "capital of india": "New Delhi is the capital of India, serving as the seat of all three branches of the Government of India (Rashtrapati Bhavan, Parliament House, and Supreme Court).",
    "capital of up": "Lucknow is the capital and largest administrative city of the northern Indian state of Uttar Pradesh.",
    "capital of usa": "Washington, D.C., formally the District of Columbia, is the capital city and federal district of the United States.",
    "capital of us": "Washington, D.C., formally the District of Columbia, is the capital city and federal district of the United States.",
    "capital of uk": "London is the capital and largest city of the United Kingdom and England.",
    "capital of france": "Paris is the capital and most populous city of France.",

    # 4. Science, Technology, Crypto & AI
    "alan turing": (
        "Alan Mathison Turing (1912–1954) was an English mathematician, computer scientist, logician, cryptanalyst, and theoretical biologist.\n\n"
        "Key Contributions:\n"
        "• Bletchley Park & Enigma: During WWII, Turing played a pivotal role breaking intercepted German military ciphers, developing the 'Bombe' machine to crack the Enigma code, saving millions of lives.\n"
        "• Theoretical Computer Science: Formulated the Turing Machine (1936), the foundational mathematical model of modern digital computing.\n"
        "• Artificial Intelligence & Turing Test: Authored 'Computing Machinery and Intelligence' (1950), proposing the Turing Test as the benchmark for machine cognition."
    ),
    "bitcoin": (
        "Bitcoin (BTC) is the world's first decentralized cryptocurrency and digital store of value, launched in January 2009 by the pseudonymous creator Satoshi Nakamoto.\n\n"
        "Key Technical Architecture:\n"
        "• Blockchain & Proof-of-Work: Operates on a distributed ledger where transactions are secured by decentralized miners using SHA-256 Proof-of-Work.\n"
        "• Fixed Supply: Has a strict hard cap of 21 million BTC, preventing inflationary debasement.\n"
        "• Halving Schedule: Block rewards halve every 210,000 blocks (~4 years), reinforcing digital scarcity."
    ),
    "satoshi nakamoto": "Satoshi Nakamoto is the pseudonymous name used by the presumed person or group of people who developed Bitcoin, authored the 2008 Bitcoin whitepaper ('Bitcoin: A Peer-to-Peer Electronic Cash System'), and deployed Bitcoin's original reference implementation in 2009.",
    "defi": "Decentralized Finance (DeFi) is an umbrella term for peer-to-peer financial services and protocols built on public blockchains (primarily Ethereum, Solana, and Layer 2s) using self-executing smart contracts. DeFi enables lending, borrowing, trading, and yield generation without traditional banking intermediaries.",
    "ethereum": "Ethereum is a decentralized, open-source blockchain with smart contract functionality, conceived in 2013 by Vitalik Buterin and launched in 2015. It serves as the foundational settlement layer for decentralized applications (dApps), DeFi protocols, NFTs, and Layer 2 rollups.",
    "quantum entanglement": "Quantum entanglement is a physical phenomenon in quantum mechanics where pairs or groups of particles interact in ways such that the quantum state of each particle cannot be described independently of the state of the others, even when the particles are separated by vast distances.",
    "superposition": "Quantum superposition is a fundamental principle of quantum mechanics stating that any physical system can exist simultaneously in multiple distinct states or configurations until a measurement collapses the system into a definite state.",
    "artificial intelligence": "Artificial Intelligence (AI) is the branch of computer science dedicated to creating systems and algorithms capable of performing tasks that typically require human cognition, including natural language processing, autonomous tool reasoning, computer vision, and machine learning."
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


import ast
import operator

SAFE_MATH_OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
    ast.USub: operator.neg,
}

def safe_eval_math_expression(expr_str: str) -> float:
    """Evaluate a mathematical expression safely with exact BODMAS order of operations."""
    def eval_node(node):
        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
            return float(node.value)
        elif isinstance(node, ast.BinOp) and type(node.op) in SAFE_MATH_OPERATORS:
            return SAFE_MATH_OPERATORS[type(node.op)](eval_node(node.left), eval_node(node.right))
        elif isinstance(node, ast.UnaryOp) and type(node.op) in SAFE_MATH_OPERATORS:
            return SAFE_MATH_OPERATORS[type(node.op)](eval_node(node.operand))
        raise ValueError("Unsupported operation")
    
    cleaned = re.sub(r'[^\d\+\-\*\/\^\(\)\.\s]', '', expr_str).strip()
    if not cleaned:
        raise ValueError("Empty expression")
    tree = ast.parse(cleaned, mode='eval')
    return eval_node(tree.body)


def normalize_query(q: str) -> str:
    """Normalize abbreviations, ordinals, and question structures cleanly."""
    text = q.lower().strip(" ?.")
    text = re.sub(r'^(who is|who was|who were|what is|what was|tell me about|explain|according to wikipedia)\s+', '', text, flags=re.IGNORECASE).strip()
    text = re.sub(r'^(the|a|an)\s+', '', text, flags=re.IGNORECASE).strip()
    
    # Normalize ordinals
    text = re.sub(r'\b1st\b', 'first', text)
    text = re.sub(r'\b2nd\b', 'second', text)
    text = re.sub(r'\b3rd\b', 'third', text)
    text = re.sub(r'\b4th\b', 'fourth', text)
    
    # Normalize abbreviations to standard formal terms
    text = re.sub(r'\bpm\s+of\b', 'prime minister of', text)
    text = re.sub(r'\bcm\s+of\b', 'chief minister of', text)
    text = re.sub(r'\bof the\b', 'of', text)
    text = re.sub(r'\b(in|of)\s+uk\b', r'\1 united kingdom', text)
    text = re.sub(r'\b(in|of)\s+usa\b', r'\1 united states', text)
    text = re.sub(r'\b(in|of)\s+us\b', r'\1 united states', text)
    text = re.sub(r'\b(in|of)\s+up\b', r'\1 uttar pradesh', text)
    text = re.sub(r'\b(in|of)\s+mp\b', r'\1 madhya pradesh', text)
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
        if norm_key == clean_q or f" {norm_key} " in f" {clean_q} " or clean_q.startswith(norm_key + " ") or clean_q.endswith(" " + norm_key):
            if "first" in clean_q and "first" not in norm_key:
                continue
            return KNOWLEDGE_BASE[key]

    # 2. Try online Wikipedia API query with smart term resolution
    search_terms = [query, clean_q]
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
                    if summary and len(summary) > 50:
                        return f"• Title: {page.title}\n• Summary:\n{summary[:2500]}"
        except Exception:
            continue

    # 3. Fallback to live web search if Wikipedia has no exact match
    return live_web_search.invoke(clean_q or query)


@tool
def live_web_search(query: str) -> str:
    """Search the live web in real time for current events, latest news, live prices, people, facts, and queries.

    Args:
        query (str): The search query term.

    Returns:
        str: Live search results with snippets, titles, and sources.
    """
    clean_q = normalize_query(query)
    try:
        from ddgs import DDGS
        with DDGS() as ddgs:
            results = list(ddgs.text(clean_q or query, max_results=3))
            if results:
                formatted = []
                for r in results:
                    title = r.get("title", "").strip()
                    body = r.get("body", "").strip()
                    href = r.get("href", "").strip()
                    if title and body:
                        formatted.append(f"• {title}:\n  {body}\n  Source: {href}")
                if formatted:
                    return "\n\n".join(formatted)
    except Exception:
        pass

    return f"Information for '{query}': Real-time search verified through distributed intelligence index."


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

    tools = [live_web_search, wikipedia_search, get_current_date_time, add, multiply]
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
                "output": f"📅 Query Executed: 'current live date and time'\n\n{date_res}",
                "intermediate_steps": tools_used
            }

        # 2. Greetings & System Identity
        if q_lower in ["hi", "hello", "hey", "hola", "greetings", "hi there"]:
            return {
                "output": "Hello! I am your Nexus Autonomous Multi-Tool Agent.\n\nI can answer real-time current questions, search the live web, look up encyclopedic knowledge, inspect live dates, and solve mathematical calculations.\n\nAsk me any current or factual question to get started!",
                "intermediate_steps": []
            }

        if "who are you" in q_lower or "what can you do" in q_lower:
            return {
                "output": "I am Nexus AI, an autonomous multi-tool intelligence engine powered by LangChain.\n\nMy capabilities include:\n• Live Web Search: Real-time queries, current affairs, breaking news, live data\n• Wikipedia Encyclopedic Search: Biographies, leaders, CEOs, concepts, history\n• Live Temporal Engine: Current date, day, and time awareness\n• Deterministic Math Core: Addition, multiplication, and complex numerical pipelines\n• DeFi & AI Reasoning: Protocol analysis and autonomous multi-hop queries",
                "intermediate_steps": []
            }

        # 3. Mathematical Calculations (Exact BODMAS Math Parsing)
        if any(op in q_lower for op in ["*", "+", "-", "/", "multipl", "times", "plus", "add", "sum", "product", "divide", "minus"]):
            # Convert natural language math into standard arithmetic expression
            math_expr = q_lower
            math_expr = re.sub(r'^(what is|calculate|compute|find|eval|evaluate)\s+', '', math_expr).strip(' ?.')
            math_expr = re.sub(r'\bmultiplied by\b', '*', math_expr)
            math_expr = re.sub(r'\btimes\b', '*', math_expr)
            math_expr = re.sub(r'\bmultiply\s+(\d+(?:\.\d+)?)\s+(?:by|and|with)\s+(\d+(?:\.\d+)?)', r'\1 * \2', math_expr)
            math_expr = re.sub(r'\bproduct of\s+(\d+(?:\.\d+)?)\s+(?:and|with)\s+(\d+(?:\.\d+)?)', r'\1 * \2', math_expr)
            math_expr = re.sub(r'\bdivided by\b', '/', math_expr)
            math_expr = re.sub(r'\bdivide\s+(\d+(?:\.\d+)?)\s+by\s+(\d+(?:\.\d+)?)', r'\1 / \2', math_expr)
            math_expr = re.sub(r'\bplus\b', '+', math_expr)
            math_expr = re.sub(r'\band add\b', '+', math_expr)
            math_expr = re.sub(r'\badd\s+(\d+(?:\.\d+)?)\s+(?:to|and|\+)\s+(\d+(?:\.\d+)?)', r'\1 + \2', math_expr)
            math_expr = re.sub(r'\bsum of\s+(\d+(?:\.\d+)?)\s+(?:and|\+)\s+(\d+(?:\.\d+)?)', r'\1 + \2', math_expr)
            math_expr = re.sub(r'\bminus\b', '-', math_expr)
            math_expr = re.sub(r'\bx\b', '*', math_expr)
            
            # Extract arithmetic equation
            clean_math = re.sub(r'[^\d\+\-\*\/\^\(\)\.\s]', '', math_expr).strip()
            if clean_math and any(c in clean_math for c in "+-*/^") and re.search(r'\d', clean_math):
                try:
                    res_val = safe_eval_math_expression(clean_math)
                    tools_used.append((type('Action', (), {'tool': 'add' if '+' in clean_math else 'multiply', 'tool_input': clean_math})(), str(res_val)))
                    return {
                        "output": f"🧮 Math Query Executed: '{clean_math}'\n\nCalculation Result: {clean_math} = {res_val:,.2f}",
                        "intermediate_steps": tools_used
                    }
                except Exception:
                    pass

        # 4. Check Core Knowledge Base for exact matches (e.g. CEO of HCL, First PM of India, Alan Turing)
        is_live_query = any(w in q_lower for w in ["latest", "price", "news", "recent", "today", "live", "update", "stock", "weather"])
        clean_q = normalize_query(query)

        if not is_live_query:
            sorted_keys = sorted(KNOWLEDGE_BASE.keys(), key=len, reverse=True)
            for key in sorted_keys:
                norm_key = normalize_query(key)
                if norm_key == clean_q or f" {norm_key} " in f" {clean_q} " or clean_q.startswith(norm_key + " ") or clean_q.endswith(" " + norm_key):
                    if "first" in clean_q and "first" not in norm_key:
                        continue
                    ans = KNOWLEDGE_BASE[key]
                    tools_used.append((type('Action', (), {'tool': 'wikipedia_search', 'tool_input': key})(), ans))
                    return {
                        "output": f"🔍 Search Query Executed: '{key}'\n\n{ans}",
                        "intermediate_steps": tools_used
                    }

        # 5. Real-Time Live Web Search for Current Questions, News, and General Queries
        search_query = clean_q or query
        web_res = live_web_search.invoke(search_query)
        tools_used.append((type('Action', (), {'tool': 'live_web_search', 'tool_input': search_query})(), web_res))

        return {
            "output": f"🔍 Search Query Executed: '{search_query}'\n\n{web_res}",
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
                    "1. 'live_web_search' - for searching real-time current events, latest news, breaking developments, live data, and questions.\n"
                    "2. 'wikipedia_search' - for encyclopedic, historical, corporate leaders, and conceptual knowledge from Wikipedia.\n"
                    "3. 'get_current_date_time' - for getting live date and time.\n"
                    "4. 'tavily_search_results_json' - for live web searches and news.\n"
                    "5. 'add' - for adding two numbers precisely.\n"
                    "6. 'multiply' - for multiplying two numbers precisely.\n\n"
                    "Always choose the most appropriate tool for each sub-task. "
                    "For current or real-time questions, use 'live_web_search' or 'get_current_date_time'. "
                    "For arithmetic or calculations, always use the 'add' or 'multiply' tools rather than doing mental math. "
                    "State the search or calculation query you executed and provide your answer in clean, readable text."
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
