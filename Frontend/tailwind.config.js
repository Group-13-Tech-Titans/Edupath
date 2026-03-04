/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#20c6a5",
        secondary: "#13b49a",
        muted: "#64748b",
        "text-dark": "#0f172a",
        "bg-mint": "#bff3ea",
        "bg-mint-light": "#f6fffd"
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.5rem"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

