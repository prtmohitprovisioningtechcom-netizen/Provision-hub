import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function processDir(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;

      // Remove connectDB import
      content = content.replace(/import\s*\{\s*connectDB\s*\}\s*from\s*['"]@\/lib\/mongodb['"];?\n?/g, '');
      // Remove await connectDB();
      content = content.replace(/await\s*connectDB\(\);?\n?/g, '');
      // Remove empty try/catch if it causes issues, but it should be fine.

      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

const apiDir = path.join(__dirname, 'app', 'api');
processDir(apiDir);
console.log('Done!');
