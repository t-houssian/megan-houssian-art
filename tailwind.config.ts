import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: 'var(--bg-ivory)',
        paper: 'var(--bg-paper)',
        brown: 'var(--text-brown)',
        'btn-brown': 'var(--btn-brown)',
        'btn-brown-hover': 'var(--btn-brown-hover)',
        olive: 'var(--link-olive)',
        tan: 'var(--border-tan)',
        'accent-cream': 'var(--accent-cream)',
        'warm-gray': 'var(--text-warm-gray)',
        'hero-overlay': 'var(--hero-overlay)',
        'surface-alt': 'var(--surface-alt)'
      },
      fontFamily: {
        heading: ['Cormorant Garamond', 'serif'],
        body: ['Lora', 'serif']
      },
      boxShadow: {
        'vintage': '0 4px 6px var(--shadow-color-soft)',
        'vintage-lg': '0 10px 15px var(--shadow-color-soft)',
      }
    },
  },
  plugins: [],
} satisfies Config;
