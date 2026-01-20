
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                ptdf: {
                    primary: '#006A4E',
                    secondary: '#C5B358',
                    accent: '#E31837',
                }
            }
        },
    },
    plugins: [],
}
