const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Files to copy to dist
const filesToCopy = [
  'index.html',
  'styles.css',
  'github-sync.js',
  'i18n.js'
];

// Copy individual files
filesToCopy.forEach(file => {
  const src = path.join(rootDir, file);
  const dest = path.join(distDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file} to dist/`);
  } else {
    console.warn(`Warning: ${file} not found`);
  }
});

// Copy entire directories
const dirsTocopy = ['modules'];

dirsTocopy.forEach(dir => {
  const srcDir = path.join(rootDir, dir);
  const destDir = path.join(distDir, dir);

  if (fs.existsSync(srcDir)) {
    // Remove existing directory
    if (fs.existsSync(destDir)) {
      fs.rmSync(destDir, { recursive: true });
    }
    // Copy entire directory
    fs.cpSync(srcDir, destDir, { recursive: true });
    console.log(`Copied ${dir}/ to dist/`);
  } else {
    console.warn(`Warning: ${dir}/ directory not found`);
  }
});

// List contents of dist for verification
console.log('\nContents of dist/:');
const distContents = fs.readdirSync(distDir);
distContents.forEach(item => {
  const itemPath = path.join(distDir, item);
  const stat = fs.statSync(itemPath);
  const type = stat.isDirectory() ? '[DIR]' : '[FILE]';
  console.log(`  ${type} ${item}`);
});

console.log('\nFrontend build complete. Ready for Tauri build.');
