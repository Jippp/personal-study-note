import fs from 'fs';
import path from 'path';

const distDir = path.join('./dist');
const serverStaticDir = path.join('../version_back/static');

function copyRecursiveSync(src, dest) {
  if (fs.existsSync(src)) {
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest);
      }
      const items = fs.readdirSync(src);
      items.forEach(item => {
        copyRecursiveSync(path.join(src, item), path.join(dest, item));
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  }
}

if (fs.existsSync(distDir)) {
  copyRecursiveSync(distDir, serverStaticDir);
  console.log('Files copied successfully.');
} else {
  console.log('Source directory does not exist.');
}
