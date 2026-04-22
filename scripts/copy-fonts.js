/**
 * Copies only the WOFF2 files referenced in assets/css/fonts.css from node_modules.
 * Run after npm install: node scripts/copy-fonts.js
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const files = [
  ["@fontsource/inter/files/inter-latin-400-normal.woff2", "assets/fonts/inter/files/inter-latin-400-normal.woff2"],
  ["@fontsource/inter/files/inter-latin-500-normal.woff2", "assets/fonts/inter/files/inter-latin-500-normal.woff2"],
  ["@fontsource/inter/files/inter-latin-600-normal.woff2", "assets/fonts/inter/files/inter-latin-600-normal.woff2"],
  ["@fontsource/inter/files/inter-latin-700-normal.woff2", "assets/fonts/inter/files/inter-latin-700-normal.woff2"],
  [
    "@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-500-normal.woff2",
    "assets/fonts/plus-jakarta-sans/files/plus-jakarta-sans-latin-500-normal.woff2",
  ],
  [
    "@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-600-normal.woff2",
    "assets/fonts/plus-jakarta-sans/files/plus-jakarta-sans-latin-600-normal.woff2",
  ],
  [
    "@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff2",
    "assets/fonts/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff2",
  ],
  [
    "@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-800-normal.woff2",
    "assets/fonts/plus-jakarta-sans/files/plus-jakarta-sans-latin-800-normal.woff2",
  ],
];

for (const [fromRel, toRel] of files) {
  const from = path.join(root, "node_modules", fromRel);
  const to = path.join(root, toRel);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  if (!fs.existsSync(from)) {
    console.error("Missing:", from);
    process.exit(1);
  }
  fs.copyFileSync(from, to);
  console.log("Copied", toRel);
}
