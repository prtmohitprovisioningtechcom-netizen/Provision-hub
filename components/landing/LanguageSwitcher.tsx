'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage, LANGUAGE_OPTIONS, type Language } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentOption = LANGUAGE_OPTIONS.find((opt) => opt.code === language) || LANGUAGE_OPTIONS[0];

  return (
    <div ref={dropdownRef} className={cn('relative inline-block text-left', className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-2xl border border-slate-300/80 dark:border-slate-700 bg-white/95 dark:bg-gray-900/95 font-bold text-gray-800 dark:text-gray-100 shadow-2xs hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-150 active:scale-95 whitespace-nowrap cursor-pointer',
          compact
            ? 'h-10 px-2.5 text-xs'
            : 'px-3.5 py-1.5 text-xs xl:text-[13px]'
        )}
        aria-label="Select language"
        title="Change language"
      >
        <span className="text-sm select-none">{currentOption.flag}</span>
        <span className="font-extrabold">{currentOption.code.toUpperCase()}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 text-gray-500 transition-transform duration-200', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 max-h-64 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Select Language
          </div>
          {LANGUAGE_OPTIONS.map((opt) => {
            const isSelected = opt.code === language;
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => {
                  setLanguage(opt.code);
                  setIsOpen(false);
                }}
                className={cn(
                  'flex w-full items-center justify-between px-3 py-2 text-xs font-semibold transition-colors cursor-pointer text-left',
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-800/80'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm select-none">{opt.flag}</span>
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
