const fs = require('fs');
const path = require('path');

const themesDir = path.join(__dirname, 'components', 'themes');
const themes = fs.readdirSync(themesDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

let totalModifications = 0;

themes.forEach(theme => {
  const indexPath = path.join(themesDir, theme, 'index.tsx');
  if (!fs.existsSync(indexPath)) return;

  let content = fs.readFileSync(indexPath, 'utf8');

  // 1. Enhance Buttons (find elements with px-something py-something and rounded)
  content = content.replace(/className="(.*?px-\d+.*?py-\d+.*?rounded.*?)"/g, (match, classes) => {
    // Only enhance if it looks like a button and doesn't already have transition/scale
    if (!classes.includes('transition-all') && !classes.includes('hover:scale') && !classes.includes('opacity-')) {
      return `className="${classes} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-95"`;
    }
    return match;
  });

  // 2. Enhance Cards (find divs with bg-white or bg-slate-something and rounded-xl or rounded-2xl or shadow)
  content = content.replace(/className="(.*?bg-(?:white|slate-\d+|gray-\d+|zinc-\d+).*?rounded-(?:md|lg|xl|2xl|3xl).*?(?:shadow|border).*?)"/g, (match, classes) => {
    if (!classes.includes('transition-all') && !classes.includes('hover:-translate-y') && !classes.includes('fixed') && !classes.includes('absolute')) {
      return `className="${classes} transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group overflow-hidden"`;
    }
    return match;
  });

  // 3. Enhance Images inside Cards (find aspect-video or aspect-square or aspect-[something] object-cover)
  content = content.replace(/className="(.*?aspect-.*?object-cover.*?)"/g, (match, classes) => {
    if (!classes.includes('group-hover:scale') && !classes.includes('transition-transform')) {
      return `className="${classes} transition-transform duration-700 group-hover:scale-110"`;
    }
    return match;
  });
  
  // 4. Update section paddings for a more modern airy feel (if they have py-12, make it py-20, etc.)
  // Don't replace if it's already py-24.
  content = content.replace(/py-12/g, 'py-20');
  content = content.replace(/py-16/g, 'py-24');

  fs.writeFileSync(indexPath, content, 'utf8');
  totalModifications++;
  console.log(`Enhanced ${theme}`);
});

console.log(`Successfully enhanced ${totalModifications} themes!`);
