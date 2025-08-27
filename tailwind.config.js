/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    './src/**/*.{ts,tsx,js,jsx}', // Adjust based on your project files
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        'primary-foreground': '#ffffff',
        secondary: '#facc15',
        destructive: '#ef4444',
        background: '#ffffff',
        foreground: '#111827',
        accent: '#f3f4f6',
        muted: '#e5e7eb',
        ring: '#60a5fa',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        md: '0.375rem',
        lg: '0.5rem',
      },
    },
  },
  plugins: [],
}