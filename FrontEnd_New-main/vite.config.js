import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from "@vitejs/plugin-basic-ssl"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
		https: true, // same as "--https" flag
		host: true, // same as "--host" flag
	},
})

