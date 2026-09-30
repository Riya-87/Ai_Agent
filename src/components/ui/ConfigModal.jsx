import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, X, Check, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';

export function ConfigModal({ isOpen, onClose }) {
  const [groqKey, setGroqKey] = useState('');
  const [tavilyKey, setTavilyKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groq_api_key: groqKey || undefined,
          tavily_api_key: tavilyKey || undefined,
        }),
      });

      const data = await res.json();
      setMessage({ type: 'success', text: data.message || 'API Keys updated!' });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update keys.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md pointer-events-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full max-w-md obsidian-glass rounded-3xl border border-white/15 p-6 shadow-glow-neon"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-neon-magenta/20 text-neon-magenta border border-neon-magenta/40">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Configure API Keys</h3>
                <p className="text-xs text-slate-400 font-mono">Groq LLaMA-3 & Tavily Web Search</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="py-4 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Groq API Key (Optional / Preconfigured)
              </label>
              <input
                type="password"
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full bg-white/[0.03] border border-white/10 focus:border-neon-magenta/70 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all focus:bg-white/[0.06]"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Get free key from <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="text-neon-magenta hover:underline">console.groq.com</a>
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Tavily Search API Key (Optional)
              </label>
              <input
                type="password"
                value={tavilyKey}
                onChange={(e) => setTavilyKey(e.target.value)}
                placeholder="tvly-..."
                className="w-full bg-white/[0.03] border border-white/10 focus:border-neon-magenta/70 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all focus:bg-white/[0.06]"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Get free key from <a href="https://tavily.com" target="_blank" rel="noreferrer" className="text-neon-magenta hover:underline">tavily.com</a>
              </span>
            </div>

            {message && (
              <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                message.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                <Check className="w-3.5 h-3.5" />
                <span>{message.text}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-neon-magenta to-neon-purple text-white shadow-glow-neon hover:scale-105 transition-all"
              >
                {saving ? 'Saving...' : 'Save & Connect'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
