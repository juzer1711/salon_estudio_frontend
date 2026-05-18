/** @type {import('tailwindcss').Config} */

export default {

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {

      colors: {

        background: "var(--background)",
        sidebar: "var(--sidebar)",
        panel: "var(--panel)",
        card: "var(--card)",

        primary: "var(--primary)",
        "primary-hover": "var(--primary-hover)",

        text: "var(--text)",
        "text-secondary": "var(--text-secondary)",

        border: "var(--border)",

      },

    },
  },

  plugins: [],
}