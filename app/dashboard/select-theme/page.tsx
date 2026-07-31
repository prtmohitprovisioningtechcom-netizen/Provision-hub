'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, CheckCircle2, ChevronRight } from 'lucide-react';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { THEME_OPTIONS } from '@/components/themes/ThemeRenderer';

export default function SelectThemePage() {
  const router = useRouter();
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectTheme = async () => {
    if (!selectedThemeId) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/dashboard/landing-page/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: selectedThemeId }),
      });

      if (!response.ok) {
        throw new Error('Failed to save theme selection');
      }

      toast.success('Theme selected — customize every section in the Website Builder.');
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
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Select Your Website Theme
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-500 dark:text-gray-400">
          Pick any layout for your company. After this, you can change all text, images, services,
          gallery, and more — then publish and preview the full site.
        </p>
      </div>

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
          disabled={!selectedThemeId || isSubmitting}
          onClick={handleSelectTheme}
          className="rounded-xl px-8 py-6 text-lg shadow-lg transition-all hover:shadow-xl"
        >
          {isSubmitting ? 'Saving...' : 'Continue to Website Builder'}
          {!isSubmitting && <ChevronRight className="ml-2 h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}
