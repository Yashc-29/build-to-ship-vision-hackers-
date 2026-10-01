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
        nebula: {
          bg: '#030712',
          surface: '#0b0f19',
          card: '#0f172a',
          border: '#1e293b',
          glow: '#6366f1',
          cyan: '#06b6d4',
          violet: '#8b5cf6',
          indigo: '#4f46e5',
          rose: '#f43f5e',
          amber: '#f59e0b',
          emerald: '#10b981'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'orb-pulse': 'orbPulse 4s ease-in-out infinite',
        'orb-glow': 'orbGlow 3s ease-in-out infinite alternate',
        'ripple-wave': 'rippleWave 2s cubic-bezier(0, 0.2, 0.8, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        orbPulse: {
          '0%, 100%': { transform: 'scale(0.96)', opacity: '0.85' },
          '50%': { transform: 'scale(1.04)', opacity: '1.0' },
        },
        orbGlow: {
          '0%': { filter: 'drop-shadow(0 0 25px rgba(99, 102, 241, 0.6)) drop-shadow(0 0 50px rgba(6, 182, 212, 0.3))' },
          '100%': { filter: 'drop-shadow(0 0 45px rgba(139, 92, 246, 0.8)) drop-shadow(0 0 75px rgba(6, 182, 212, 0.5))' },
        },
        rippleWave: {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
