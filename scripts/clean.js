const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const toRemove = [
  path.join(root, 'node_modules'),
  path.join(root, 'dist'),
  path.join(root, 'package-lock.json'),
  path.join(root, '.tauri'),
  path.join(root, 'src-tauri', 'target')
];

console.log('Cleaning:');
for (const p of toRemove) {
  try {
    if (fs.existsSync(p)) {
      fs.rmSync(p, { recursive: true, force: true });
      console.log('  Removed', p.replace(root + path.sep, ''));
    }
  } catch (err) {
    console.error('  Failed to remove', p, err.message);
  }
}

console.log('\nDone. Run `npm install` to reinstall dependencies.');
