/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#ffffff',
          secondary: '#f7f8f9',
          tertiary: '#f1f3f5',
        },
        text: {
          primary: '#1a1d1f',
          secondary: '#6f767e',
          tertiary: '#9a9fa5',
        },
        border: {
          light: '#eeeeee',
          medium: '#e4e4e4',
        },
        brand: {
          primary: {
            DEFAULT: '#0066ff',
            hover: '#0052cc',
          },
          secondary: '#6c5dd3',
        },
        success: '#3abf5b',
        warning: '#ff9f1c',
        danger: '#ff4d4d',
        info: '#0066ff',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      spacing: {
        sidebar: '260px',
        header: '56px',
      }
    },
  },
  plugins: [],
}
