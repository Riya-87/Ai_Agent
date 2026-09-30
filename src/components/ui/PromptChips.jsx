import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Globe, Calculator, BookOpen, Atom, TrendingUp } from 'lucide-react';

export function PromptChips({ onSelectPrompt }) {
  const prompts = [
    {
      title: 'DeFi Intelligence',
      query: 'What are the top DeFi protocol mechanisms, liquidity pools, and automated market maker trends in 2024?',
      toolHint: 'Tavily Search',
      icon: TrendingUp,
      color: 'text-neon-magenta',
    },
    {
      title: 'Quantum Cryptography',
      query: 'Explain zero-knowledge proofs (ZKP) and elliptic curve cryptography on Wikipedia.',
      toolHint: 'Wikipedia',
      icon: BookOpen,
      color: 'text-purple-400',
    },
    {
      title: 'Precision Computation',
      query: 'What is 1420 multiplied by 68, plus 5340? Use deterministic math tools.',
      toolHint: 'Math Core',
      icon: Calculator,
      color: 'text-amber-400',
    },
    {
      title: 'Autonomous Multi-Hop',
      query: 'Who was Satoshi Nakamoto and what are the core principles of Bitcoin as documented in Wikipedia?',
      toolHint: 'Multi-Tool',
      icon: Atom,
      color: 'text-sky-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 w-full">
      {prompts.map((p, idx) => {
        const Icon = p.icon;
        return (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectPrompt(p.query)}
            className="flex flex-col text-left p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-neon-magenta/40 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-bold text-slate-200 group-hover:text-neon-magenta flex items-center gap-1.5 transition-colors">
                <Icon className={`w-3.5 h-3.5 ${p.color}`} />
                {p.title}
              </span>
              <span className="text-[10px] text-slate-500 font-mono px-1.5 py-0.5 rounded bg-black/50">
                {p.toolHint}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
              {p.query}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}
