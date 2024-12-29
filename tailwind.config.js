/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        // Next.js specific content paths
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',

        // Ensure all your component locations are included
        './src/**/*.{js,ts,jsx,tsx,mdx}'
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}