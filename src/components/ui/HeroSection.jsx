import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Layers, ChevronRight } from 'lucide-react';

/**
 * Hero Typography Section
 * Recreating the bold title style from the reference image:
 * "Simplifying DeFi's Most Complex..."
 */
export function HeroSection({ onOpenChat, onSelectPrompt }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="absolute left-8 md:left-12 bottom-12 z-20 max-w-xl pointer-events-auto"
    >
      {/* Category / Status Pill */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neon-magenta/10 border border-neon-magenta/30 text-neon-fuchsia text-xs font-bold tracking-wide uppercase mb-4 shadow-glow-neon">
        <span className="w-2 h-2 rounded-full bg-neon-magenta animate-ping" />
        <span>Autonomous Multi-Tool Agent</span>
      </div>

      {/* Hero Headline from Reference Image */}
      <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
        Simplifying DeFi’s <br />
        <span className="bg-gradient-to-r from-white via-neon-magenta to-neon-purple bg-clip-text text-transparent">
          Most Complex
        </span> <br />
        Intelligence.
      </h1>

      <p className="mt-4 text-xs md:text-sm text-slate-400 font-medium max-w-md leading-relaxed">
        Autonomous multi-tool intelligence powered by LangChain, Groq high-speed LLaMA-3, Tavily real-time web search, and deterministic mathematics.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 mt-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenChat}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-neon-magenta via-neon-purple to-neon-violet text-white font-bold text-xs shadow-glow-neon hover:shadow-glow-purple transition-all"
        >
          <span>Launch Agent Command</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelectPrompt && onSelectPrompt("What are the latest DeFi and AI crypto protocol breakthroughs in 2024?")}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl obsidian-glass hover:border-neon-magenta/40 text-slate-300 hover:text-white font-semibold text-xs transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-neon-magenta" />
          <span>Explore DeFi News</span>
        </motion.button>
      </div>

      {/* Live Telemetry Highlights */}
      <div className="flex items-center gap-6 mt-8 pt-4 border-t border-white/10 text-slate-400 text-xs font-mono">
        <div>
          <span className="text-white font-bold block text-sm">140ms</span>
          <span className="text-[10px] text-slate-500">Groq Inference</span>
        </div>
        <div className="h-6 w-[1px] bg-white/10" />
        <div>
          <span className="text-white font-bold block text-sm">4 Tools</span>
          <span className="text-[10px] text-slate-500">Autonomous Core</span>
        </div>
        <div className="h-6 w-[1px] bg-white/10" />
        <div>
          <span className="text-emerald-400 font-bold block text-sm">99.8%</span>
          <span className="text-[10px] text-slate-500">Execution Rate</span>
        </div>
      </div>
    </motion.div>
  );
}
