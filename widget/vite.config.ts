import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/main.ts",
      name: "MicrotecChatbot",
      fileName: "microtec-chatbot",
      formats: ["iife"]
    }
  }
});