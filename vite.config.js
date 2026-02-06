import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

// Konfigurasi agar __dirname bisa jalan di mode ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Ini kuncinya: memberitahu Vite bahwa "@" merujuk ke folder "./src"
      "@": path.resolve(__dirname, "./src"),
    },
  },
})