import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      fs: fileURLToPath(new URL("./src/shims/fs.js", import.meta.url)),
      path: fileURLToPath(new URL("./src/shims/path.js", import.meta.url)),
      vm: fileURLToPath(new URL("./src/shims/vm.js", import.meta.url)),
      "node:fs/promises": fileURLToPath(new URL("./src/shims/fs-promises.js", import.meta.url)),
    },
  },
  plugins: [
    nodePolyfills({
      include: ["crypto", "buffer", "stream", "util", "events"],
    }),
  ],
});
