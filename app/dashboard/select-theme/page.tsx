'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { THEME_OPTIONS } from '@/components/themes/ThemeRenderer';
import { LAYOUT_OPTIONS, type LayoutId } from '@/lib/layout-id';

export default function SelectThemePage() {
  const router = useRouter();
  const [step, setStep] = useState<'theme' | 'layout'>('theme');
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [selectedLayoutId, setSelectedLayoutId] = useState<LayoutId>('1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinueFromTheme = () => {
    if (!selectedThemeId) return;
    setStep('layout');
  };

  const handleSelectTheme = async () => {
    if (!selectedThemeId) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/dashboard/landing-page/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedThemeId,
          layoutId: selectedLayoutId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save theme selection');
      }

      toast.success('Theme & layout saved — customize every section in the Website Builder.');
      router.push('/dashboard/website');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl py-10">
      <div className="mb-10 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-600">
          Step {step === 'theme' ? '1' : '2'} of 2
        </p>
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {step === 'theme' ? 'Select Your Website Theme' : 'Choose Your Layout'}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-500 dark:text-gray-400">
          {step === 'theme'
            ? 'Pick a color & style pack for your company brand.'
            : 'Layout 1 = theme ka original design. Layout 2/3 = same colors, different page structure.'}
        </p>
      </div>

      {step === 'theme' ? (
        <>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {THEME_OPTIONS.map((theme) => {
              const isSelected = selectedThemeId === theme.id;
              return (
                <Card
                  key={theme.id}
                  className={`cursor-pointer overflow-hidden border-2 transition-all duration-300 ${
                    isSelected
                      ? 'border-indigo-600 shadow-xl ring-2 ring-indigo-600 ring-offset-2'
                      : 'border-transparent hover:border-indigo-300 hover:shadow-lg'
                  }`}
                  onClick={() => setSelectedThemeId(theme.id)}
                >
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    <img
                      src={theme.previewImg}
                      alt={theme.name}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-indigo-600/20 backdrop-blur-[1px]">
                        <div className="rounded-full bg-white p-2 shadow-lg">
                          <CheckCircle2 className="h-8 w-8 text-indigo-600" />
                        </div>
                      </div>
                    )}
                  </div>

                  <CardHeader>
                    <div className="mb-3 flex flex-wrap gap-2">
                      {theme.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <CardTitle className="text-xl">{theme.name}</CardTitle>
                    <CardDescription className="mt-2 line-clamp-2">{theme.description}</CardDescription>
                  </CardHeader>

                  <CardFooter className="pt-0">
                    <Button
                      variant={isSelected ? 'default' : 'outline'}
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedThemeId(theme.id);
                      }}
                    >
                      {isSelected ? (
                        <>
                          <Check className="mr-2 h-4 w-4" /> Selected
                        </>
                      ) : (
                        'Select Theme'
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          <div className="mt-12 flex justify-center">
            <Button
              size="lg"
              disabled={!selectedThemeId}
              onClick={handleContinueFromTheme}
              className="rounded-xl px-8 py-6 text-lg shadow-lg transition-all hover:shadow-xl"
            >
              Next: Choose layout
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-8 md:grid-cols-3">
            {LAYOUT_OPTIONS.map((layout) => {
              const isSelected = selectedLayoutId === layout.id;
              return (
                <Card
                  key={layout.id}
                  className={`cursor-pointer overflow-hidden border-2 transition-all duration-300 ${
                    isSelected
                      ? 'border-indigo-600 shadow-xl ring-2 ring-indigo-600 ring-offset-2'
                      : 'border-transparent hover:border-indigo-300 hover:shadow-lg'
                  }`}
                  onClick={() => setSelectedLayoutId(layout.id)}
                >
                  <div className="relative flex h-44 w-full items-end bg-gradient-to-br from-slate-100 to-slate-200 p-4 dark:from-slate-800 dark:to-slate-900">
                    {layout.id === '1' && (
                      <div className="flex h-full w-full flex-col gap-1.5">
                        <div className="h-2/5 rounded bg-slate-400/80" />
                        <div className="h-2 rounded bg-slate-300/90" />
                        <div className="grid flex-1 grid-cols-3 gap-1.5">
                          <div className="rounded bg-white/80" />
                          <div className="rounded bg-white/80" />
                          <div className="rounded bg-white/80" />
                        </div>
                      </div>
                    )}
                    {layout.id === '2' && (
                      <div className="grid h-full w-full grid-cols-2 gap-1.5">
                        <div className="flex flex-col justify-end gap-1.5 rounded bg-slate-700/80 p-2">
                          <div className="h-2 w-3/4 rounded bg-white/50" />
                          <div className="h-2 w-1/2 rounded bg-white/30" />
                        </div>
                        <div className="rounded bg-slate-400/70" />
                      </div>
                    )}
                    {layout.id === '3' && (
                      <div className="relative flex h-full w-full flex-col overflow-hidden rounded bg-slate-700">
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-transparent" />
                        <div className="relative z-10 mt-auto space-y-1.5 p-3">
                          <div className="h-2 w-1/3 rounded bg-white/50" />
                          <div className="h-3 w-3/4 rounded bg-white/85" />
                          <div className="h-2 w-1/2 rounded bg-white/40" />
                          <div className="mt-1 flex gap-1">
                            <span className="h-1 w-4 rounded-full bg-white" />
                            <span className="h-1 w-1 rounded-full bg-white/40" />
                            <span className="h-1 w-1 rounded-full bg-white/40" />
                          </div>
                        </div>
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute right-3 top-3 rounded-full bg-white p-1.5 shadow">
                        <CheckCircle2 className="h-6 w-6 text-indigo-600" />
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{layout.name}</CardTitle>
                    <CardDescription className="mt-1">{layout.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-0">
                    <Button
                      variant={isSelected ? 'default' : 'outline'}
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLayoutId(layout.id);
                      }}
                    >
                      {isSelected ? (
                        <>
                          <Check className="mr-2 h-4 w-4" /> Selected
                        </>
                      ) : (
                        'Select layout'
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setStep('theme')}
              className="rounded-xl px-6 py-6 text-lg"
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              Back to themes
            </Button>
            <Button
              size="lg"
              disabled={isSubmitting}
              onClick={handleSelectTheme}
              className="rounded-xl px-8 py-6 text-lg shadow-lg transition-all hover:shadow-xl"
            >
              {isSubmitting ? 'Saving...' : 'Continue to Website Builder'}
              {!isSubmitting && <ChevronRight className="ml-2 h-5 w-5" />}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
