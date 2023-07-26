import vue from '@vitejs/plugin-vue';
import dns from 'dns';
import {defineConfig} from 'vite';
import fs from 'fs';
import path from 'path';

// https://vitejs.dev/config/server-options.html#server-host
dns.setDefaultResultOrder('verbatim');

// make sure vite picks up all html files in root
let allHtmlEntries = fs
    .readdirSync(".")
    .filter((file) => path.extname(file) === ".html")
    .reduce((acc, file) => {
      acc[path.basename(file, ".html")] = path.resolve(__dirname, file);

      return acc;
    }, {});

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: allHtmlEntries,
    },
  },
  plugins: [vue()],
  server: {
    port: 3000,
  },
});
