
/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            },
            colors: {
                ptdf: {
                    primary: '#059669', // Modern Emerald
                    secondary: '#D97706', // Warm Amber
                    accent: '#E11D48', // Vibrant Rose
                    dark: '#064E3B',
                    light: '#D1FAE5',
                },
                surface: {
                    main: '#F8FAFC', // Slate 50
                    card: '#FFFFFF',
                    dark: '#0F172A', // Slate 900
                    'card-dark': '#1E293B', // Slate 800
                }
            },
            boxShadow: {
                'glow': '0 0 20px rgba(5, 150, 105, 0.15)',
                'glow-sm': '0 0 10px rgba(5, 150, 105, 0.1)',
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            }
        },
    },
    plugins: [],
}
