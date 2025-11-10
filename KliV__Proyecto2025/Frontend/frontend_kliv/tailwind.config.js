/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./scr/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class', // activa modo oscuro con la clase 'dark'
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',   // morado
        success: '#10b981',   // verde
        danger: '#ef4444',    // rojo
        alt: '#10b981',       // alternativo (por si usas varios botones)
        light: '#f3f4f6',     // fondo claro
        dark: '#1f2937',      // fondo oscuro
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        lg: '1rem',
        xl: '1.5rem',
      },
      boxShadow: {
        card: '0 8px 20px rgba(0, 0, 0, 0.1)',
        cardHover: '0 12px 25px rgba(0, 0, 0, 0.15)',
      },
      transitionProperty: {
        height: 'height',
        spacing: 'margin, padding',
      },
      transitionDuration: {
        250: '250ms',
        400: '400ms',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // para estilizar inputs y selects
    require('@tailwindcss/typography'), // para contenido tipográfico
  ],
}