/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'], // Premium font hissiyatı
      },
      colors: {
        background: '#09090b', // Çok derin Linear siyahı
        surface: '#18181b',    // Kartlar ve sidebar için hafif açık ton
        border: '#27272a',     // Çok ince, zarif sınır çizgileri
        muted: '#a1a1aa',      // İkincil metinler için soluk gri
        primary: {
          DEFAULT: '#1db954',  // Spotify / Noyon yeşili
          hover: '#1ed760',
        },
        danger: {
          DEFAULT: '#ef4444',
          hover: '#f87171',
        }
      },
      boxShadow: {
        'glow': '0 0 20px -5px rgba(29, 185, 84, 0.15)', // Yeşile özel hafif parlama
      }
    },
  },
  plugins: [],
}