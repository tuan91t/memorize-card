/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: "#00ffff",
          pink: "#ff00ff",
          purple: "#8b5cf6",
          green: "#00ff88",
        },
      },
      animation: {
        shake: "shake 0.3s ease-in-out",
        pulse: "pulse 1s ease-in-out infinite",
        glow: "glow 1.5s ease-in-out infinite",
        "fade-out": "fadeOut 0.3s ease-out forwards",
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "75%": { transform: "translateX(5px)" },
        },
        pulse: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.05)", opacity: "0.8" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 5px #00ffff, 0 0 10px #00ffff" },
          "50%": { boxShadow: "0 0 20px #00ffff, 0 0 30px #00ffff" },
        },
        fadeOut: {
          "0%": { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(0.8)" },
        },
      },
    },
  },
  plugins: [],
};
