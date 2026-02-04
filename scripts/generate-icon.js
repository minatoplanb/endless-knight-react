const sharp = require('sharp');
const path = require('path');

const BACKGROUND_COLOR = { r: 15, g: 15, b: 35, alpha: 1 }; // #0f0f23
const ICON_SIZE = 1024;
const ADAPTIVE_SIZE = 1024;
const FAVICON_SIZE = 48;
const SPLASH_SIZE = 1024;

async function generateIcons() {
  const inputPath = path.join(__dirname, '../assets/images/player/warrior.png');
  const outputDir = path.join(__dirname, '../assets');

  console.log('Reading warrior image...');

  // Get input image metadata
  const metadata = await sharp(inputPath).metadata();
  console.log(`Input image: ${metadata.width}x${metadata.height}`);

  // Scale factor to make the warrior prominent (about 70% of icon size)
  const targetSize = Math.floor(ICON_SIZE * 0.7);
  const scaleFactor = Math.floor(targetSize / Math.max(metadata.width, metadata.height));
  const scaledWidth = metadata.width * scaleFactor;
  const scaledHeight = metadata.height * scaleFactor;

  // Calculate offset to center vertically (warrior sprite has empty space at bottom)
  const verticalOffset = Math.floor(ICON_SIZE * 0.05); // Move up slightly

  console.log(`Scaling to ${scaledWidth}x${scaledHeight} (${scaleFactor}x)`);

  // Create scaled warrior image with nearest neighbor (keeps pixel art sharp)
  const scaledWarrior = await sharp(inputPath)
    .resize(scaledWidth, scaledHeight, {
      kernel: sharp.kernel.nearest, // Keep pixels sharp
    })
    .toBuffer();

  // Calculate position to center the warrior
  const left = Math.floor((ICON_SIZE - scaledWidth) / 2);
  const top = Math.floor((ICON_SIZE - scaledHeight) / 2) - verticalOffset;

  // Create main icon (1024x1024)
  console.log('Generating icon.png...');
  await sharp({
    create: {
      width: ICON_SIZE,
      height: ICON_SIZE,
      channels: 4,
      background: BACKGROUND_COLOR,
    },
  })
    .composite([
      {
        input: scaledWarrior,
        left: left,
        top: top,
      },
    ])
    .png()
    .toFile(path.join(outputDir, 'icon.png'));

  // Create adaptive icon (same as main icon for foreground)
  console.log('Generating adaptive-icon.png...');
  await sharp({
    create: {
      width: ADAPTIVE_SIZE,
      height: ADAPTIVE_SIZE,
      channels: 4,
      background: BACKGROUND_COLOR,
    },
  })
    .composite([
      {
        input: scaledWarrior,
        left: left,
        top: top,
      },
    ])
    .png()
    .toFile(path.join(outputDir, 'adaptive-icon.png'));

  // Create splash icon
  console.log('Generating splash-icon.png...');
  await sharp({
    create: {
      width: SPLASH_SIZE,
      height: SPLASH_SIZE,
      channels: 4,
      background: BACKGROUND_COLOR,
    },
  })
    .composite([
      {
        input: scaledWarrior,
        left: left,
        top: top,
      },
    ])
    .png()
    .toFile(path.join(outputDir, 'splash-icon.png'));

  // Create favicon (smaller)
  console.log('Generating favicon.png...');
  const faviconWarrior = await sharp(inputPath)
    .resize(32, 32, {
      kernel: sharp.kernel.nearest,
      fit: 'contain',
      background: BACKGROUND_COLOR,
    })
    .toBuffer();

  await sharp({
    create: {
      width: FAVICON_SIZE,
      height: FAVICON_SIZE,
      channels: 4,
      background: BACKGROUND_COLOR,
    },
  })
    .composite([
      {
        input: faviconWarrior,
        gravity: 'center',
      },
    ])
    .png()
    .toFile(path.join(outputDir, 'favicon.png'));

  console.log('Done! All icons generated.');
}

generateIcons().catch(console.error);
