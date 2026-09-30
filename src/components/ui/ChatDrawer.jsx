import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  Bot,
  User,
  ChevronRight,
  Maximize2,
  Minimize2,
  Trash2,
  Loader2,
  X
} from 'lucide-react';
import { ToolBadge } from './ToolBadge';
import { PromptChips } from './PromptChips';

export function ChatDrawer({
  isOpen,
  setIsOpen,
  messages = [],
  onSendMessage,
  isThinking = false,
  onClearChat,
  onInspectTool,
}) {
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() || isThinking) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handlePromptSelect = (query) => {
    if (isThinking) return;
    onSendMessage(query);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className={`fixed right-4 md:right-6 top-20 bottom-6 z-40 flex flex-col obsidian-glass rounded-3xl border border-white/10 overflow-hidden shadow-2xl pointer-events-auto transition-all duration-300 ${
              isExpanded ? 'w-[calc(100vw-2rem)] md:w-[720px]' : 'w-[calc(100vw-2rem)] md:w-[460px]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-black/40 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-neon-magenta/20 border border-neon-magenta/40 flex items-center justify-center text-neon-magenta shadow-glow-neon">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    DeFi Agent Command
                    {isThinking && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-magenta opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-magenta"></span>
                      </span>
                    )}
                  </h2>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Autonomous Multi-Tool Reasoning
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {messages.length > 0 && (
                  <button
                    onClick={onClearChat}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
                    title="Clear Chat History"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors hidden md:block"
                  title={isExpanded ? 'Collapse width' : 'Expand width'}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  title="Close Drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4 py-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-neon-magenta/20 to-neon-purple/30 border border-neon-magenta/40 flex items-center justify-center text-neon-magenta mb-3 shadow-glow-neon">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Nexus DeFi Autonomous Agent
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
                    Ask real-world questions, request live crypto/DeFi intelligence, explore Wikipedia encyclopedic topics, or solve calculations.
                  </p>

                  <PromptChips onSelectPrompt={handlePromptSelect} />
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'agent' && (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-neon-magenta to-neon-purple flex items-center justify-center text-slate-950 flex-shrink-0 mt-1 shadow-glow-neon">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div className={`max-w-[85%] flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      {msg.tools_used && msg.tools_used.length > 0 && (
                        <div className="w-full">
                          {msg.tools_used.map((tool, tIdx) => (
                            <ToolBadge
                              key={tIdx}
                              tool={tool}
                              onInspect={onInspectTool}
                            />
                          ))}
                        </div>
                      )}

                      <div
                        className={`rounded-2xl p-3.5 text-xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-neon-magenta via-neon-purple to-neon-violet text-white rounded-br-none shadow-glow-neon font-medium'
                            : 'bg-white/[0.03] border border-white/10 text-slate-200 rounded-bl-none font-normal whitespace-pre-wrap selection:bg-neon-magenta/30'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-white flex-shrink-0 mt-1">
                        <User className="w-4 h-4 text-slate-300" />
                      </div>
                    )}
                  </motion.div>
                ))
              )}

              {/* Thinking State */}
              {isThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-7 h-7 rounded-lg bg-neon-magenta/20 border border-neon-magenta/40 flex items-center justify-center text-neon-magenta">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="px-4 py-2.5 rounded-2xl rounded-bl-none bg-white/[0.03] border border-neon-magenta/40 text-neon-magenta text-xs font-mono flex items-center gap-2 shadow-glow-neon">
                    <span>Autonomous agent evaluating tools...</span>
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-neon-magenta animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-neon-magenta animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-neon-magenta animate-bounce"></span>
                    </span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 border-t border-white/10 bg-black/50 backdrop-blur-md">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <div className="flex-1 relative flex items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isThinking ? 'Agent is reasoning...' : 'Ask DeFi questions or request multi-tool search...'}
                    disabled={isThinking}
                    className="w-full bg-white/[0.03] border border-white/10 focus:border-neon-magenta/70 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition-all duration-200 focus:shadow-glow-neon focus:bg-white/[0.06]"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={!input.trim() || isThinking}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-xl bg-gradient-to-r from-neon-magenta to-neon-purple text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-glow-neon transition-all flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </form>

              <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-500 font-mono">
                <span>Press Enter to send</span>
                <span>Powered by Groq + LangChain</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
