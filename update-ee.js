const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'components', 'themes', 'enterprise-elite', 'index.tsx');
let content = fs.readFileSync(indexPath, 'utf8');

// 1. Add eeMarquee keyframes to <style>
content = content.replace(
  /\.ee-gradient-text \{/,
  `.ee-marquee { display: flex; gap: 3rem; width: max-content; animation: eeMarquee 28s linear infinite; }
          @keyframes eeMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
          .ee-gradient-text {`
);

// 2. Change Nav from fixed to sticky
content = content.replace(
  /<nav className="fixed left-0 top-0 z-50 w-full border-b border-slate-200\/60 bg-white\/80 backdrop-blur-xl">/,
  `<nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">`
);

// 3. Replace Hero Section
const heroRegex = /\{\/\* HERO SECTION \*\/\}\s*<section className="relative overflow-hidden bg-slate-900 pb-20 pt-32 lg:pb-32 lg:pt-48">[\s\S]*?(?=\{\/\* ABOUT SECTION \*\/)/;
const newHero = `{/* HERO SECTION */}
        <section id="hero" className="grid min-h-[80svh] lg:grid-cols-2 bg-slate-900">
          <div className="flex flex-col justify-center px-8 py-24 text-white md:px-14">
            {page.hero?.eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-500">{page.hero.eyebrow}</p>
            )}
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] md:text-6xl break-words">
              {page.hero?.title || page.brandName}
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-white/75 md:text-lg break-words">
              {page.hero?.subtitle}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a href="#contact" className="rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors">
                {page.hero?.buttonText}
              </a>
              <a href="#expertise" className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                Our Services <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
          <div className="relative min-h-[42vh] overflow-hidden lg:min-h-full">
            {page.hero?.image && (
              <img src={page.hero.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent lg:bg-gradient-to-l" />
          </div>
        </section>

        `;
content = content.replace(heroRegex, newHero);

// 4. Replace Why Choose Us section
const whyRegex = /\{\/\* WHY CHOOSE US SECTION \*\/\}\s*\{page\.why\?\.show && \([\s\S]*?(?=\{\/\* FOOTER \*\/)/;
const newWhy = `{/* WHY CHOOSE US SECTION */}
        {page.why?.show && page.why?.items?.length > 0 && (
          <div className="overflow-hidden border-y border-slate-200/10 bg-blue-600 py-3 text-sm font-semibold text-white">
            <div className="ee-marquee">
              {[...Array(2)].flatMap((_, copy) =>
                page.why.items.map((w: any, idx: number) => (
                  <span key={\`\${copy}-\${idx}\`} className="inline-flex items-center gap-2 whitespace-nowrap">
                    <CheckCircle2 className="h-4 w-4" /> {w.title}
                  </span>
                )),
              )}
            </div>
          </div>
        )}

      </main>

      `;
content = content.replace(whyRegex, newWhy);

fs.writeFileSync(indexPath, content, 'utf8');
console.log('Successfully updated enterprise elite theme.');
