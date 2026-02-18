import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts", "src/docx.ts"],
    format: ["esm", "cjs"],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    publicDir: false
  },
  {
    entry: ["src/cli.ts"],
    format: ["esm"],
    dts: false,
    splitting: false,
    sourcemap: false,
    clean: false,
    banner: {
      js: "#!/usr/bin/env node"
    },
    publicDir: false
  }
]);
