import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Tarmoqqa (public) chiqarish uchun (huddi --host kabi)
    open: true, // Brauzerda avtomatik ochilishi uchun
  },
});
