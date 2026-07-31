const fs = require('fs');
const path = require('path');

const themesDir = path.join(__dirname, 'components', 'themes');
const themes = fs.readdirSync(themesDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

themes.forEach(theme => {
  const indexPath = path.join(themesDir, theme, 'index.tsx');
  if (!fs.existsSync(indexPath)) return;

  let content = fs.readFileSync(indexPath, 'utf8');

  // Add hover scale to any card that has translate-y-2
  content = content.replace(/hover:-translate-y-2/g, 'hover:-translate-y-2 hover:scale-105');

  // Fix why grids to be 4 columns
  // We look for the Why Choose section manually using regex tricks
  // Most grids are like: grid grid-cols-1 md:grid-cols-3 or lg:grid-cols-3
  // We'll replace md:grid-cols-3 or lg:grid-cols-3 with md:grid-cols-2 lg:grid-cols-4
  // BUT only if they are near page.why.items.map
  
  const whyIndex = content.indexOf('page.why.items.map');
  if (whyIndex !== -1) {
    // Look backwards up to 300 characters to find the grid
    const beforeWhy = content.substring(Math.max(0, whyIndex - 300), whyIndex);
    const newBeforeWhy = beforeWhy
      .replace(/md:grid-cols-3/g, 'md:grid-cols-2 lg:grid-cols-4')
      .replace(/lg:grid-cols-3/g, 'md:grid-cols-2 lg:grid-cols-4')
      .replace(/sm:grid-cols-3/g, 'sm:grid-cols-2 lg:grid-cols-4');
    
    content = content.substring(0, Math.max(0, whyIndex - 300)) + newBeforeWhy + content.substring(whyIndex);
  }

  // Ensure why.items mapping block itself has transition scale if it didn't get caught
  content = content.replace(/page\.why\.items\.map\((.*?)=>\s*(?:\{\s*const.*?return\s*)?\(\s*<div.*?className="(.*?)"/g, (match, args, classes) => {
    if (!classes.includes('hover:scale')) {
      return match.replace(classes, `${classes} transition-all duration-300 hover:scale-105`);
    }
    return match;
  });

  fs.writeFileSync(indexPath, content, 'utf8');
  console.log(`Updated why-choose-us in ${theme}`);
});
