/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14151F",
        surface: "#F3F3F6",
        panel: "#FFFFFF",
        border: "#E4E4EC",
        muted: "#8A8B9B",
        accent: {
          DEFAULT: "#5B4FE9",
          light: "#EFEDFD",
          dark: "#463CC4",
        },
        success: {
          DEFAULT: "#12A594",
          light: "#E3F7F4",
        },
        warning: {
          DEFAULT: "#F5A623",
          light: "#FEF3E0",
        },
        danger: {
          DEFAULT: "#E8555A",
          light: "#FCEAEA",
        },
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20, 21, 31, 0.06), 0 1px 1px rgba(20, 21, 31, 0.04)",
        panel: "0 8px 24px rgba(20, 21, 31, 0.10)",
      },
      borderRadius: {
        xl: "14px",
      },
    },
  },
  plugins: [],
};
