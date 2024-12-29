/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'team-red': '#ef4444',
                'team-white': '#f3f4f6',
            },
            boxShadow: {
                'card': '0 2px 4px rgba(0, 0, 0, 0.05)',
            }
        },
    },
    plugins: [],
}