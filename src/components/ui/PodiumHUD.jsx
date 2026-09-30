import React from 'react';
import { motion } from 'framer-motion';
import {
  Boxes,
  Globe,
  Binary,
  Cpu,
  BookOpen,
  Search,
  Calculator,
  Layers,
  Sparkles
} from 'lucide-react';

export function PodiumHUD({
  selectedModel = 'neural',
  setSelectedModel,
  activeTool = null,
  isThinking = false,
}) {
  const models = [
    {
      id: 'neural',
      name: 'Nexus AI Core',
      desc: 'Autonomous DeFi Brain',
      icon: Cpu,
      color: 'from-fuchsia-500 to-purple-600',
    },
    {
      id: 'intelligence',
      name: 'Tavily Web Agent',
      desc: 'Real-time News & Feeds',
      icon: Globe,
      color: 'from-sky-500 to-blue-600',
    },
    {
      id: 'wiki',
      name: 'Wikipedia Node',
      desc: 'Deep Knowledge Graph',
      icon: BookOpen,
      color: 'from-purple-500 to-indigo-600',
    },
    {
      id: 'matrix',
      name: 'Math & Precision',
      desc: 'Deterministic Calculator',
      icon: Calculator,
      color: 'from-amber-500 to-orange-600',
    },
  ];

  const tools = [
    { name: 'Wikipedia', icon: BookOpen, active: activeTool === 'Wikipedia' },
    { name: 'Tavily Search', icon: Search, active: activeTool === 'Tavily Search' },
    { name: 'Math Core', icon: Calculator, active: activeTool === 'Add' || activeTool === 'Multiply' },
  ];

  return (
    <div className="absolute right-6 top-20 z-20 flex flex-col gap-2.5 pointer-events-auto max-w-[280px] hidden lg:flex">
      {/* 3D Agent Tokens Inspector */}
      <motion.div
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="obsidian-glass rounded-2xl p-3.5"
      >
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-neon-magenta" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
              Agent Tokens on Track
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">3D Coins</span>
        </div>

        <div className="space-y-1.5">
          {models.map((m) => {
            const Icon = m.icon;
            const isSel = selectedModel === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedModel(m.id)}
                className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all ${
                  isSel
                    ? 'bg-gradient-to-r from-neon-magenta/20 to-neon-purple/25 border-neon-magenta/60 text-white shadow-glow-neon'
                    : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${isSel ? 'bg-neon-magenta/30 text-neon-magenta' : 'bg-white/5 text-slate-400'}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block">{m.name}</span>
                    <span className="text-[10px] text-slate-500 block">{m.desc}</span>
                  </div>
                </div>

                {isSel && (
                  <div className="w-2 h-2 rounded-full bg-neon-magenta shadow-[0_0_8px_#d946ef]" />
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Active Tool Executions Pill */}
      <motion.div
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="obsidian-glass rounded-2xl p-2.5 flex items-center justify-between"
      >
        <div className="flex items-center gap-1.5 w-full justify-around">
          {tools.map((t, idx) => {
            const Icon = t.icon;
            return (
              <div
                key={idx}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  t.active
                    ? 'bg-neon-magenta/20 border border-neon-magenta text-neon-magenta shadow-glow-neon animate-pulse'
                    : 'bg-white/[0.02] border border-white/5 text-slate-400'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{t.name}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
