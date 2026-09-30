"""
Test script to verify all AI Agent features, tools used display, and normal format output.
"""

from agent import create_ai_agent, ask_agent

def run_tests():
    print("🚀 Initializing Agent for Verification...")
    agent_executor = create_ai_agent(verbose=False)
    
    test_queries = [
        "Calculate (452 * 78) + 982 using your math tools.",
        "According to Wikipedia, who was Alan Turing and what was his major contribution?",
        "Search the web and give me a brief update on NASA Artemis moon mission.",
    ]
    
    for query in test_queries:
        ask_agent(agent_executor, query)

if __name__ == "__main__":
    run_tests()
