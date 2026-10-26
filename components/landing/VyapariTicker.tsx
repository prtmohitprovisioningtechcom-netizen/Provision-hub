'use client';

const TICKER_ITEMS = [
  { text: 'Chhota ho ya bada kaam, Bhartiyebazar par hoga har vyapari ka naam', emoji: '🇮🇳', highlight: true },
  { text: 'Har dukan ki shaan, har vyapari ka naam', emoji: '🏪', highlight: false },
  { text: 'Kirana Se Lekar Clinic Tak Sabki Digital Dukan', emoji: '🛒', highlight: false },
  { text: 'Electrician, Plumber & Mobile Repair Services', emoji: '⚡', highlight: false },
  { text: 'Direct WhatsApp Se Grahak & Local Orders', emoji: '💬', highlight: true },
  { text: 'Google Pe Local Search Me Pehle No. Par', emoji: '📍', highlight: false },
  { text: '100% Verified Bhartiya Vyapari Network', emoji: '🛡️', highlight: false },
  { text: 'Bina Coding 2 Minute Me Landing Page Live', emoji: '🚀', highlight: true },
];

export function VyapariTicker() {
  const repeatedItems = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="relative w-full overflow-hidden border-y border-amber-300/60 dark:border-amber-800/40 bg-linear-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-indigo-950/40 py-2 sm:py-2.5 backdrop-blur-md select-none shadow-2xs">
      {/* Side gradient fade masks for smooth infinity look */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-20 bg-linear-to-r from-white dark:from-gray-950 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-20 bg-linear-to-l from-white dark:from-gray-950 to-transparent z-10" />

      <div className="flex w-max items-center animate-[marquee_45s_linear_infinite] hover:[animation-play-state:paused]">
        {repeatedItems.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2.5 px-6 text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap"
          >
            <span className="text-base sm:text-lg drop-shadow-xs">{item.emoji}</span>
            <span
              className={
                item.highlight
                  ? 'bg-linear-to-r from-amber-600 via-orange-600 to-indigo-600 bg-clip-text text-transparent font-black dark:from-amber-400 dark:via-orange-400 dark:to-indigo-300'
                  : 'font-bold'
              }
            >
              {item.text}
            </span>
            <span className="ml-4 text-amber-400/80 dark:text-amber-600/80 select-none">✦</span>
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
      `}</style>
    </div>
  );
}
