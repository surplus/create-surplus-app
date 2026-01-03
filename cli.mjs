#!/usr/bin/env node
import { chalkTemplateStderr as chalk } from "chalk-template";
import arg from "arg";
import packageJson from "./package.json" with { type: "json" };
import child_process from "node:child_process";
import path from "node:path";
import fsp from "node:fs/promises";
import { URL } from "node:url";

function showHelp() {
	console.error(chalk`
  {bold.ansi256(92) create-surplus-app} - Create a new Surplus application.

  {bold USAGE}
    {bold.ansi256(92) pnpx create-surplus-app} [--use-npm] [{underline PROJECT_DIR}]
    {bold.ansi256(92) pnpx create-surplus-app} [--help] [--version]

  {bold OPTIONS}
    --use-npm          Use npm as the package manager
                       (default is pnpm or yarn, if available, in that order)
	--allow-dirty      Allow creating the app in a non-empty directory
    --help             Show this help message
    --version          Show the version number
`);

	process.exit(2);
}

function showVersion() {
	console.error(`create-surplus-app version ${packageJson.version}`);
	process.exit(2);
}

const args = arg({
	"--help": Boolean,
	"--version": Boolean,
	"--use-npm": Boolean,
	"--allow-dirty": Boolean,
});

if (args["--help"]) showHelp();
if (args["--version"]) showVersion();

const packageManager = args["--use-npm"]
	? "npm"
	: determineBestPackageManager();

function determineBestPackageManager() {
	try {
		const pnpmVersion = child_process
			.execSync("pnpm --version", { stdio: "pipe" })
			.toString()
			.trim();
		if (pnpmVersion) return "pnpm";
	} catch {}

	try {
		const yarnVersion = child_process
			.execSync("yarn --version", { stdio: "pipe" })
			.toString()
			.trim();
		if (yarnVersion) return "yarn";
	} catch {}

	return "npm";
}

const projectDir = args._[0] || ".";
const projectPath = path.resolve(process.cwd(), projectDir);
const projectParent = path.dirname(projectPath);
const projectName = path.basename(projectPath);

console.error(chalk`
  Creating a new {bold.ansi256(92) Surplus} app in {bold ${projectPath}} using {bold ${packageManager}}...
`);

// Make sure the parent directory exists
if (
	!(await fsp
		.stat(projectParent)
		.then((s) => s.isDirectory())
		.catch(() => false))
) {
	console.error(
		chalk`  {bold.ansi256(196) Error:} The parent directory {bold ${projectParent}} does not exist or is not a directory.`,
	);
	process.exit(1);
}

// Make sure the project directory doesn't exist as a non-directory
if (
	await fsp
		.stat(projectPath)
		.then((s) => !s.isDirectory())
		.catch(() => false)
) {
	console.error(
		chalk`  {bold.ansi256(196) Error:} The path {bold ${projectPath}} exists and is not a directory.`,
	);
	process.exit(1);
}

// Create it if it doesn't exist
// Recursive is safe here because we verified the parent exists.
await fsp.mkdir(projectPath, { recursive: true });

// Make sure the directory is empty
if (
	!(await fsp.readdir(projectPath).then((f) => f.length === 0)) &&
	!args["--allow-dirty"]
) {
	console.error(chalk`  {bold.ansi256(196) Error:} The directory {bold ${projectPath}} is not empty.
         If you'd like to create a new Surplus app here, please empty the directory first,
         or specify {bold --allow-dirty} to proceed anyway.`);
	process.exit(1);
}

// Discover all files in the template directory
const templateDir = path.resolve(
	path.dirname(new URL(import.meta.url).pathname),
	"template",
);
async function* getFiles(dir) {
	const entries = await fsp.readdir(dir, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			yield* getFiles(fullPath);
		} else if (entry.isFile()) {
			yield fullPath;
		}
	}
}

// Set up the template replacement values.
const templateValues = {
	PKG_NAME: projectName,
};

const replaceTemplateValues = (content) =>
	content.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
		if (key in templateValues) {
			return templateValues[key];
		}
		throw new Error(`Unknown template key: ${key}`);
	});

// Copy all files from the template directory to the project directory
for await (const filePath of getFiles(templateDir)) {
	const relativePath = path.relative(templateDir, filePath);
	const destPath = path.join(projectPath, relativePath);

	// Ensure the destination directory exists
	await fsp.mkdir(path.dirname(destPath), { recursive: true });

	// Read the file content
	let content = await fsp.readFile(filePath, "utf8");

	// Replace template values
	content = replaceTemplateValues(content);

	// Write the file to the destination
	await fsp.writeFile(destPath, content, "utf8");
}

console.error(chalk`  {bold.ansi256(92) Success:} Created a new Surplus app in {bold ${projectPath}}!

  If you have any questions or problems:
    - {bold Ask a question:} https://github.com/surplus/create-surplus-app/discussions
    - {bold Report a bug:}   https://github.com/surplus/create-surplus-app/issues

  You can now run:
    {bold cd ${projectDir}}
    {bold ${packageManager} install}
    {bold ${packageManager} run dev}
`);
