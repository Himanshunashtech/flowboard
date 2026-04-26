/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#FAF9F6', // Translated OKLCH values roughly for React Native
        foreground: '#111827',
        card: '#FFFFFF',
        'card-foreground': '#111827',
        primary: '#4F46E5',
        'primary-foreground': '#FFFFFF',
        secondary: '#F3F4F6',
        'secondary-foreground': '#374151',
        muted: '#F9FAFB',
        'muted-foreground': '#6B7280',
        accent: '#F3F4F6',
        'accent-foreground': '#374151',
        border: '#E5E7EB',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}