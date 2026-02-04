/**
 * Resize Feature Graphic to 1024x500 for Google Play.
 * Usage: node scripts/resize-feature-graphic.js [input.png]
 * Default input: store-assets/gemini-feature-raw.png
 */

const path = require('path');
const fs = require('fs');

const TARGET_W = 1024;
const TARGET_H = 500;
const OUT_PATH = path.join(__dirname, '..', 'store-assets', 'feature-graphic-1024x500.png');

const inputPath = process.argv[2] || path.join(__dirname, '..', 'store-assets', 'gemini-feature-raw.png');

if (!fs.existsSync(inputPath)) {
  console.error('Input image not found:', inputPath);
  console.error('Usage: node scripts/resize-feature-graphic.js [path/to/image.png]');
  console.error('Or place your image at store-assets/gemini-feature-raw.png and run without args.');
  process.exit(1);
}

async function run() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    console.error('Missing "sharp". Install with: npm install --save-dev sharp');
    process.exit(1);
  }

  await sharp(inputPath)
    .resize(TARGET_W, TARGET_H, { fit: 'cover' })
    .png()
    .toFile(OUT_PATH);

  console.log('Done:', OUT_PATH, '(' + TARGET_W + 'x' + TARGET_H + ')');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
