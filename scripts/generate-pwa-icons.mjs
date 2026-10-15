import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const publicIconsDir = path.join(rootDir, "public", "icons");

if (!fs.existsSync(publicIconsDir)) {
  fs.mkdirSync(publicIconsDir, { recursive: true });
}

// Inner robot mascot shapes from public/logo.svg
const mascotSvgContent = `
  <!-- Antenna -->
  <circle cx="50" cy="12" r="4.5" fill="#FBF7EE" />
  <path d="M50 16.5V23" stroke="#FBF7EE" stroke-width="3.5" stroke-linecap="round" />

  <!-- Head Ears -->
  <rect x="18" y="32" width="5" height="12" rx="2.5" fill="#FBF7EE" />
  <rect x="77" y="32" width="5" height="12" rx="2.5" fill="#FBF7EE" />

  <!-- Robot Head -->
  <rect x="21" y="23" width="58" height="40" rx="12" fill="#FBF7EE" />

  <!-- Screen Bezel -->
  <rect x="26" y="28" width="48" height="30" rx="8" stroke="#0C3729" stroke-width="3.2" fill="none" />

  <!-- Happy Smiling Eyes -->
  <path d="M34 43C36 38.5 40 38.5 42 43" stroke="#0C3729" stroke-width="3.2" stroke-linecap="round" />
  <path d="M58 43C60 38.5 64 38.5 66 43" stroke="#0C3729" stroke-width="3.2" stroke-linecap="round" />

  <!-- Mouth -->
  <path d="M46.5 48.5C48 51.5 52 51.5 53.5 48.5" stroke="#0C3729" stroke-width="2.8" stroke-linecap="round" />

  <!-- Body -->
  <path d="M35 66C32 75 32 94 50 95C68 94 68 75 65 66Z" fill="#FBF7EE" />

  <!-- Left Arm -->
  <path d="M34 68C28.5 73 24.5 81 27 86.5C28.5 89 33 87 34 81C34.5 77 34.5 72 34 68Z" fill="#FBF7EE" />

  <!-- Right Arm (Waving) -->
  <path d="M66 68C72 65 83 58 85 49.5C86.5 46.5 83.5 45.5 81 48C76 53 68 62 65 71Z" fill="#FBF7EE" />

  <!-- Chest Handshake Emblem -->
  <ellipse cx="50" cy="80.5" rx="10.5" ry="7.5" fill="#FFFFFF" />
  <path d="M44 80.5C44 77.5 47 75.5 50 78.5L52.5 81C53.5 82 53.5 83.5 52 84.5C50.5 85.5 48.5 85.5 47 84L44 80.5Z" fill="#F5D061" />
  <path d="M56 80.5C56 83.5 53 85.5 50 82.5L47.5 80C46.5 79 46.5 77.5 48 76.5C49.5 75.5 51.5 75.5 53 77L56 80.5Z" fill="#0C3729" />
  <path d="M47.5 79.5C49 78.2 51 78.2 52.5 79.5L50 82L47.5 79.5Z" fill="#F5D061" />
`;

function buildSvg(size, logoRatio = 0.75, bg = "#0C382E") {
  const scale = (size * logoRatio) / 100;
  const offset = (size - 100 * scale) / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="${bg}" />
    <g transform="translate(${offset}, ${offset}) scale(${scale})">
      ${mascotSvgContent}
    </g>
  </svg>`;
}

const targets = [
  { name: "icon-192.png", size: 192, ratio: 0.72 },
  { name: "icon-512.png", size: 512, ratio: 0.72 },
  { name: "icon-maskable-512.png", size: 512, ratio: 0.60 }, // 60% of canvas inside safe zone
  { name: "apple-touch-icon.png", size: 180, ratio: 0.72 }, // 180x180 solid background
];

async function generate() {
  console.log("Generating PWA icons...");
  for (const t of targets) {
    const svg = Buffer.from(buildSvg(t.size, t.ratio, "#0C382E"));
    const outPath = path.join(publicIconsDir, t.name);
    await sharp(svg)
      .resize(t.size, t.size)
      .png({ compressionLevel: 9 })
      .toFile(outPath);
    console.log(`Generated: ${outPath} (${t.size}x${t.size})`);
  }
  console.log("All PWA icons generated successfully.");
}

generate().catch((err) => {
  console.error("Error generating icons:", err);
  process.exit(1);
});
