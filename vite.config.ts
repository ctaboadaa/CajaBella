import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// base: cambia '/CajaBella/' por '/nombre-de-tu-repo/' si le pones otro nombre al repo de GitHub
export default defineConfig({
  base: '/CajaBella/',
  plugins: [react(), tailwindcss()],
})
