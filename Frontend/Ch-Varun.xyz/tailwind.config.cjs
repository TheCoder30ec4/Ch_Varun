module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    extend: {},
  },
  // dev-only safelist to validate Tailwind is generating utilities
  safelist: ['text-red-500'],
  plugins: [],
};
