import fs from 'fs'
import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const sslDir = fs.existsSync(path.resolve(process.cwd(), 'ssl'))
  ? path.resolve(process.cwd(), 'ssl')
  : path.resolve(process.cwd(), '../ssl')
const keyPath = path.resolve(sslDir, 'key.pem')
const certPath = path.resolve(sslDir, 'cert.pem')
const hasSsl = fs.existsSync(keyPath) && fs.existsSync(certPath)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    https: hasSsl ? {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    } : undefined,
    proxy: {
      '/api': {
        target: hasSsl ? 'https://127.0.0.1:8000' : 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
