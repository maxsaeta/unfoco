const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const assetsDir = path.join(__dirname, '..', 'assets');

async function generateAssets() {
  console.log('Generating PNG assets from SVG...\n');

  // 1. App icon (1024x1024)
  console.log('1. Creating app icon (1024x1024)...');
  await sharp(path.join(assetsDir, 'logo.svg'))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'icon.png'));
  console.log('   ✓ icon.png');

  // 2. Android adaptive icon foreground (432x432)
  console.log('2. Creating Android adaptive icon foreground...');
  await sharp(path.join(assetsDir, 'logo.svg'))
    .resize(432, 432)
    .png()
    .toFile(path.join(assetsDir, 'android-icon-foreground.png'));
  console.log('   ✓ android-icon-foreground.png');

  // 3. Android adaptive icon background (432x432)
  console.log('3. Creating Android adaptive icon background...');
  // Create a solid dark background
  await sharp({
    create: {
      width: 432,
      height: 432,
      channels: 4,
      background: { r: 26, g: 26, b: 46, alpha: 1 }
    }
  })
    .png()
    .toFile(path.join(assetsDir, 'android-icon-background.png'));
  console.log('   ✓ android-icon-background.png');

  // 4. Android monochrome icon (432x432)
  console.log('4. Creating Android monochrome icon...');
  await sharp(path.join(assetsDir, 'logo.svg'))
    .resize(432, 432)
    .greyscale()
    .png()
    .toFile(path.join(assetsDir, 'android-icon-monochrome.png'));
  console.log('   ✓ android-icon-monochrome.png');

  // 5. Splash screen with text (1024x1024)
  console.log('5. Creating splash screen with text...');
  await sharp(path.join(assetsDir, 'logo-splash.svg'))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'splash-icon.png'));
  console.log('   ✓ splash-icon.png');

  // 6. Favicon (48x48)
  console.log('6. Creating favicon...');
  await sharp(path.join(assetsDir, 'logo.svg'))
    .resize(48, 48)
    .png()
    .toFile(path.join(assetsDir, 'favicon.png'));
  console.log('   ✓ favicon.png');

  console.log('\n✅ All assets generated successfully!');
}

generateAssets().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
