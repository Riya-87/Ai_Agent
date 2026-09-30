/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: {
          void: '#000000',
          base: '#050508',
          card: 'rgba(10, 10, 16, 0.78)',
          cardHover: 'rgba(18, 18, 28, 0.88)',
          border: 'rgba(255, 255, 255, 0.08)',
          borderNeon: 'rgba(217, 70, 239, 0.45)',
        },
        neon: {
          magenta: '#d946ef',
          purple: '#a855f7',
          violet: '#8b5cf6',
          pink: '#ec4899',
          fuchsia: '#c026d3',
          cyan: '#06b6d4',
          glow: '#e879f9',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-neon': '0 0 30px rgba(217, 70, 239, 0.4)',
        'glow-purple': '0 0 35px rgba(168, 85, 247, 0.35)',
        'glow-cyan': '0 0 25px rgba(6, 182, 212, 0.35)',
        'obsidian-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.65)',
        'portal-glow': '0 0 50px rgba(217, 70, 239, 0.6), inset 0 0 30px rgba(236, 72, 153, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
