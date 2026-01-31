/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'neo-black': '#050505',
                'neo-white': '#F0F0F0',
                'neo-yellow': 'var(--accent-color, #FF5F1F)',
                'grid-line': '#1A1A1A',
            },
            fontFamily: {
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            backgroundImage: {
                'retro-grid': 'linear-gradient(transparent 0%, #000 100%), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
            }
        },
    },
    plugins: [],
}
