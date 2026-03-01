import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const proxyTarget = process.env.VITE_API_PROXY_TARGET || "http://localhost:8000";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Forward all /api requests to the FastAPI backend.
      "/api": {
        target: proxyTarget,
        changeOrigin: true,
      },
    },
  },
});
