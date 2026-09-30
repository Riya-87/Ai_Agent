import React from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  Sparkles,
  Camera,
  Volume2,
  VolumeX,
  Maximize2,
  Loader2,
  Cpu,
  Boxes,
  CircleDot,
  Key
} from 'lucide-react';

export function Navbar({
  isThinking = false,
  cameraPreset = 'studio',
  setCameraPreset,
  soundEnabled = true,
  setSoundEnabled,
  selectedModel = 'neural',
  setSelectedModel,
  onOpenConfig,
}) {
  const cameraOptions = [
    { id: 'studio', label: 'Overview' },
    { id: 'coins', label: 'Agent Tokens' },
    { id: 'portal', label: 'Portal Pad' },
    { id: 'cinematic', label: 'Cinematic' },
  ];

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4 pointer-events-auto"
    >
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-3.5">
        <motion.div
          whileHover={{ scale: 1.08, rotate: 6 }}
          className="relative w-11 h-11 rounded-xl bg-gradient-to-tr from-neon-magenta via-neon-purple to-neon-violet p-[1px] shadow-glow-neon"
        >
          <div className="w-full h-full bg-[#05050a]/95 rounded-[11px] flex items-center justify-center backdrop-blur-md">
            <Bot className="w-6 h-6 text-neon-magenta" />
          </div>
        </motion.div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Nexus DeFi AI
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-neon-magenta/20 text-neon-fuchsia border border-neon-magenta/40">
              Agent 3.0
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
            <Cpu className="w-3 h-3 text-neon-purple" />
            Groq LLaMA-3 • Tavily • Wikipedia • Math Core
          </p>
        </div>
      </div>

      {/* Camera Angle Selector */}
      <div className="hidden md:flex items-center gap-1 p-1 rounded-2xl obsidian-glass">
        <div className="flex items-center gap-1.5 px-3 py-1 text-xs text-slate-400 font-medium border-r border-white/10 mr-1">
          <Camera className="w-3.5 h-3.5 text-neon-magenta" />
          <span>Camera</span>
        </div>
        {cameraOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setCameraPreset(opt.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              cameraPreset === opt.id
                ? 'bg-gradient-to-r from-neon-magenta to-neon-purple text-white shadow-glow-neon'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Status & Utility Controls */}
      <div className="flex items-center gap-3">
        {/* Agent Thinking / Ready Status */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full obsidian-glass">
          {isThinking ? (
            <>
              <Loader2 className="w-3.5 h-3.5 text-neon-magenta animate-spin" />
              <span className="text-xs font-semibold text-neon-magenta">Agent Reasoning...</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400">Ready</span>
            </>
          )}
        </div>

        {/* Configure API Keys */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onOpenConfig}
          className="p-2.5 rounded-xl obsidian-glass text-slate-300 hover:text-white hover:border-neon-magenta/40 transition-colors"
          title="Configure API Keys"
        >
          <Key className="w-4 h-4 text-neon-magenta" />
        </motion.button>

        {/* Audio Toggle */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2.5 rounded-xl obsidian-glass text-slate-300 hover:text-white hover:border-neon-magenta/40 transition-colors"
          title={soundEnabled ? 'Mute audio' : 'Enable audio'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-neon-magenta" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-500" />
          )}
        </motion.button>

        {/* Fullscreen */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={toggleFullScreen}
          className="p-2.5 rounded-xl obsidian-glass text-slate-300 hover:text-white hover:border-neon-magenta/40 transition-colors"
          title="Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.header>
  );
}
