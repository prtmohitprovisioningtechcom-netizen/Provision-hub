const fs = require('fs');
let code = fs.readFileSync('components/themes/royal-glow/index.tsx', 'utf8');
code = code.replace(/ data-aos="[^"]*"/g, '');
code = code.replace(/ data-aos-delay="[^"]*"/g, '');
fs.writeFileSync('components/themes/royal-glow/index.tsx', code);
console.log('done');
