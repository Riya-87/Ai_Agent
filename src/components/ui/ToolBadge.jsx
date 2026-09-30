import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Search,
  Plus,
  X as MultiplyIcon,
  ChevronDown,
  ChevronUp,
  Terminal,
  ExternalLink,
  Globe,
  Clock
} from 'lucide-react';

export function ToolBadge({ tool, onInspect }) {
  const [expanded, setExpanded] = useState(false);

  const getToolMeta = (toolName) => {
    const t = (toolName || '').toLowerCase();
    if (t.includes('live_web') || t.includes('web search') || t.includes('ddgs')) {
      return {
        label: 'Live Web Search',
        icon: Globe,
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10 border-cyan-500/30',
        glow: 'shadow-[0_0_12px_rgba(6,182,212,0.25)]',
      };
    }
    if (t.includes('date') || t.includes('time')) {
      return {
        label: 'Live DateTime Engine',
        icon: Clock,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/30',
        glow: 'shadow-[0_0_12px_rgba(16,185,129,0.25)]',
      };
    }
    if (t.includes('wiki')) {
      return {
        label: 'Wikipedia Knowledge',
        icon: BookOpen,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10 border-purple-500/30',
        glow: 'shadow-[0_0_12px_rgba(168,85,247,0.25)]',
      };
    }
    if (t.includes('tavily')) {
      return {
        label: 'Tavily Web Search',
        icon: Search,
        color: 'text-sky-400',
        bg: 'bg-sky-500/10 border-sky-500/30',
        glow: 'shadow-[0_0_12px_rgba(56,189,248,0.25)]',
      };
    }
    if (t.includes('multiply')) {
      return {
        label: 'Math: Multiply',
        icon: MultiplyIcon,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/30',
        glow: 'shadow-[0_0_12px_rgba(245,158,11,0.25)]',
      };
    }
    if (t.includes('add')) {
      return {
        label: 'Math: Addition',
        icon: Plus,
        color: 'text-pink-400',
        bg: 'bg-pink-500/10 border-pink-500/30',
        glow: 'shadow-[0_0_12px_rgba(236,72,153,0.25)]',
      };
    }
    return {
      label: tool.name || tool.tool || 'Custom Tool',
      icon: Terminal,
      color: 'text-neon-magenta',
      bg: 'bg-neon-magenta/10 border-neon-magenta/30',
      glow: 'shadow-glow-neon',
    };
  };

  const meta = getToolMeta(tool.tool || tool.name);
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl border ${meta.bg} ${meta.glow} p-2.5 my-1.5 overflow-hidden transition-all`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-black/50 ${meta.color}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold ${meta.color}`}>
                {meta.label}
              </span>
              <span className="text-[10px] text-slate-400 font-mono px-1.5 py-0.5 rounded bg-black/50">
                Executed
              </span>
            </div>
            {tool.input && (
              <p className="text-[11px] text-slate-300 font-mono truncate max-w-xs mt-0.5">
                <span className="text-slate-500">query:</span> {typeof tool.input === 'object' ? JSON.stringify(tool.input) : tool.input}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onInspect && (
            <button
              onClick={() => onInspect(tool)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 text-[10px] font-mono"
              title="Inspect Full Output"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-2 pt-2 border-t border-white/10"
          >
            <div className="text-[11px] font-mono text-slate-300 bg-black/60 p-2.5 rounded-lg max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {tool.output || 'No output recorded'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
