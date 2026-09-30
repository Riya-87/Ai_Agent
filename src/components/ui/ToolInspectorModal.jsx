import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Terminal, Copy, Check } from 'lucide-react';

export function ToolInspectorModal({ tool, onClose }) {
  const [copied, setCopied] = React.useState(false);

  if (!tool) return null;

  const handleCopy = () => {
    const text = typeof tool.output === 'object' ? JSON.stringify(tool.output, null, 2) : tool.output;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full max-w-2xl glass-panel rounded-2xl border border-white/20 p-6 overflow-hidden flex flex-col max-h-[85vh] shadow-glow-cyan"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-studio-glow/20 border border-studio-cyan/40 text-studio-cyan">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Tool Execution Inspector: {tool.name || tool.tool}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Autonomous Multi-Tool LangChain Agent Trace
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {/* Input */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Input Query / Parameters
              </span>
              <div className="mt-1.5 p-3 rounded-xl bg-black/50 border border-white/10 font-mono text-xs text-studio-cyan whitespace-pre-wrap">
                {typeof tool.input === 'object' ? JSON.stringify(tool.input, null, 2) : tool.input}
              </div>
            </div>

            {/* Output */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Observation / Raw Output
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-white/5 border border-white/10"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                {typeof tool.output === 'object' ? JSON.stringify(tool.output, null, 2) : tool.output}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-white/10 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-studio-glow hover:bg-studio-accent text-white shadow-glow-blue transition-all"
            >
              Close Inspector
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
