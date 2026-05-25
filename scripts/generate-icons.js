const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const png2icons = require('png2icons');

// Paths
const iconsDir = path.join(__dirname, '..', 'src-tauri', 'icons');
const svgPath = path.join(iconsDir, 'icon.svg');

if (!fs.existsSync(svgPath)) {
  console.error('SVG source not found:', svgPath);
  process.exit(1);
}

(async () => {
  try {
    const svgBuffer = fs.readFileSync(svgPath);

    // Generate PNGs
    const sizes = [32, 128, 256, 512];
    const pngBuffers = {};
    for (const size of sizes) {
      const out = await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toBuffer();
      const outPath = path.join(iconsDir, `${size}x${size}.png`);
      fs.writeFileSync(outPath, out);
      pngBuffers[size] = out;
      console.log('Wrote', outPath);
    }

    // Create ICO (32 + 256 recommended)
    const ico = png2icons.createICO(pngBuffers[256], pngBuffers[32], png2icons.BICUBIC, false);
    if (ico) {
      fs.writeFileSync(path.join(iconsDir, 'icon.ico'), ico);
      console.log('Wrote', path.join(iconsDir, 'icon.ico'));
    }

    // Create ICNS (use 512)
    const icns = png2icons.createICNS(pngBuffers[512], png2icons.BICUBIC, false);
    if (icns) {
      fs.writeFileSync(path.join(iconsDir, 'icon.icns'), icns);
      console.log('Wrote', path.join(iconsDir, 'icon.icns'));
    }

    console.log('Icon generation complete.');
    console.log('If you need to install deps run: npm install --save-dev sharp png2icons');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
