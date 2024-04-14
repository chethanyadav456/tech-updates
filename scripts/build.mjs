import esbuild from "esbuild";
import { rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

if (existsSync(join(__dirname, "..", "dist"))) {
  rmSync(join(__dirname, "..", "dist"), { recursive: true });
}

const dev = process.argv.includes("--dev");

const buildOptions = {
  bundle: true,
  logLevel: "info",
  format: "esm",
  mainFields: ["browser", "module", "main"],
  platform: "neutral",
  target: "es2020",
  entryPoints: ["./src/index.ts"],
  outfile: "./dist/worker.mjs",
  sourcemap: dev,
  charset: "utf8",
  minify: !dev,
  external: ["node:events"],
};

// Function to build
async function build() {
  try {
    await esbuild.build(buildOptions);
    console.log("Build completed successfully");
  } catch (err) {
    console.error("Build failed");
    console.error(err.message);
  }
}

// Build initially
build();

// Watch for changes if --watch flag is provided
if (process.argv.includes("--watch")) {
  esbuild
    .build({
      ...buildOptions,
      watch: true,
    })
    .then(() => {
      console.log("Watching for changes...");
    })
    .catch(() => {
      console.error("Watch failed");
    });
}
