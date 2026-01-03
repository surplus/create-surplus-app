import esbuild from "esbuild";
import surplus from "@surplus/esbuild";
import fsp from "node:fs/promises";

const isProduction = process.env.NODE_ENV === "production";

// Build JSX application
await esbuild.build({
	entryPoints: ["src/app.jsx"],
	bundle: true,
	minify: isProduction,
	sourcemap: !isProduction,
	outfile: "pkg/app.js",
	plugins: [surplus()],
});

// Copy static files
await fsp.copyFile("src/index.html", "pkg/index.html");
await fsp.copyFile("src/styles.css", "pkg/styles.css");
