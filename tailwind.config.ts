import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        instrument: ['Instrument Sans', 'sans-serif'],
        serif: ['Instrument Serif', 'serif'],
      },
      colors: {
        ink: '#0d0d0d',
        paper: '#f7f5f0',
        accent: '#1a6b4a',
        warm: '#c8a96e',
      },
    },
  },
  plugins: [],
}
export default config
