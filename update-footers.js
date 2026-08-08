const fs = require('fs');
const path = require('path');

const themesDir = path.join(__dirname, 'components/themes');
const textToAppend = ' - Promoted By Multi-Tenant Platform Provisioning Tech';

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let lines = content.split('\n');
      let changed = false;

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.includes('{new Date().getFullYear()}') && !line.includes('Promoted By Multi-Tenant Platform Provisioning Tech')) {
          // If the line already has closing tags like </p>, we need to insert before them
          if (line.includes('</p>')) {
            lines[i] = line.replace('</p>', `${textToAppend}</p>`);
          } else if (line.includes('</span>')) {
            lines[i] = line.replace('</span>', `${textToAppend}</span>`);
          } else {
            // Neon dark has `// ALL_SYSTEMS_NOMINAL`
            if (line.includes('// ALL_SYSTEMS_NOMINAL')) {
              lines[i] = line.replace('// ALL_SYSTEMS_NOMINAL', `${textToAppend} // ALL_SYSTEMS_NOMINAL`);
            } else {
              // Just append before closing brace or tag if possible, this is tricky.
              // Let's just find the last text part and append it.
              // A safer regex replacement:
              lines[i] = line.replace(/(All rights reserved\.|All rights reserved|{page\.brandName}\.?|All rights reserved\.)/i, `$1${textToAppend}`);
            }
          }
          changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, lines.join('\n'));
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(themesDir);
