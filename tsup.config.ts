import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  external: ["react"],
  // Copy the CSS file into dist alongside the JS
  onSuccess: "cp src/starfield.css dist/starfield.css",
});
