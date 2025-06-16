import { defineConfig } from 'vite'
import restart from 'vite-plugin-restart'
import glsl from 'vite-plugin-glsl'

export default defineConfig({
  root: 'src/',
  publicDir: '../static/',
  server: {
    host: true,
    open: !('SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env)
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true
  },
  plugins: [
    restart({ restart: ['../static/**'] }),
    glsl() // 👈 this line is what enables shader imports
  ]
})
