'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Globe,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Save,
  Tag,
  Layers,
  ArrowRight,
  ShieldCheck,
  Send,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function MerchantSeoPage() {
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [categorySeo, setCategorySeo] = useState<any>(null);
  const [themeSeo, setThemeSeo] = useState<any>(null);
  const [customSeo, setCustomSeo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [h1, setH1] = useState('');
  const [h2, setH2] = useState('');
  const [contentBody, setContentBody] = useState('');
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([
    { question: 'What are your working hours and services?', answer: 'We are open Monday to Saturday with on-time delivery.' },
  ]);

  const fetchCompanySeo = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/dashboard/seo');
      if (res.data?.success && res.data.data) {
        const data = res.data.data;
        setCompanyInfo(data.company);
        setCategorySeo(data.categorySeo);
        setThemeSeo(data.themeSeo);
        setCustomSeo(data.customSeo);

        if (data.customSeo) {
          setMetaTitle(data.customSeo.metaTitle || '');
          setMetaDescription(data.customSeo.metaDescription || '');
          setFocusKeyword(data.customSeo.focusKeyword || '');
          setH1(data.customSeo.h1 || '');
          setH2(data.customSeo.h2 || '');
          setContentBody(data.customSeo.contentBody || '');
          if (data.customSeo.faqs && data.customSeo.faqs.length > 0) {
            setFaqs(data.customSeo.faqs);
          }
        } else if (data.company) {
          // Initialize defaults
          setMetaTitle(`${data.company.name} - Best ${data.company.category} in ${data.company.city || 'India'}`);
          setMetaDescription(`Looking for verified ${data.company.category} services? Visit ${data.company.name}. Contact us on WhatsApp for best quotes.`);
          setFocusKeyword(`${data.company.category.toLowerCase()} in ${data.company.city.toLowerCase() || 'india'}`);
          setH1(data.company.name);
        }
      }
    } catch {
      toast.error('Failed to load company SEO data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanySeo();
  }, [fetchCompanySeo]);

  // AI Generator for Merchant
  const handleAiOptimize = async () => {
    if (!companyInfo?.name) return;
    setIsAiGenerating(true);
    try {
      const res = await api.post('/api/admin/seo', {
        action: 'ai_generate',
        type: 'service',
        name: companyInfo.name,
        location: companyInfo.city || 'India',
        focusKeyword: `${companyInfo.category.toLowerCase()} services`,
      });
      if (res.data?.success && res.data.data) {
        const gen = res.data.data;
        setMetaTitle(gen.metaTitle);
        setMetaDescription(gen.metaDescription);
        setFocusKeyword(gen.focusKeyword);
        setH1(gen.h1);
        setH2(gen.h2);
        setContentBody(gen.contentBody);
        if (gen.faqs && gen.faqs.length > 0) setFaqs(gen.faqs);
        toast.success('AI SEO suggestions applied! Review and submit for Super Admin approval.');
      }
    } catch {
      toast.error('AI generation failed');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSaveAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metaTitle.trim() || !metaDescription.trim()) {
      toast.error('Meta Title and Description are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/api/dashboard/seo', {
        companyId: companyInfo?.id,
        metaTitle: metaTitle.trim(),
        metaDescription: metaDescription.trim(),
        focusKeyword: focusKeyword.trim(),
        h1: h1.trim(),
        h2: h2.trim(),
        contentBody: contentBody.trim(),
        faqs,
      });

      if (res.data?.success) {
        toast.success('SEO profile submitted to Super Admin for approval!');
        await fetchCompanySeo();
      }
    } catch {
      toast.error('Failed to submit SEO');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-6 sm:p-8 shadow-xl border border-indigo-900/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-0.5 text-xs font-bold text-indigo-300 border border-indigo-400/30 mb-2">
              <Globe className="h-3.5 w-3.5" />
              <span>Merchant SEO Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              Website &amp; Storefront SEO Optimizer
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Optimize your store&rsquo;s Google search rankings, meta descriptions, localized keywords, and FAQs. Changes are reviewed by Super Admin and added to Google sitemaps.
            </p>
          </div>

          <Button
            type="button"
            onClick={handleAiOptimize}
            disabled={isAiGenerating}
            className="rounded-xl bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-white font-extrabold text-xs h-10 shadow-md gap-1.5 self-start sm:self-auto"
          >
            <Sparkles className="h-4 w-4" />
            {isAiGenerating ? 'Generating...' : '⚡ AI SEO Auto-Optimizer'}
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      {customSeo && (
        <div
          className={cn(
            'rounded-2xl p-4 border flex items-center justify-between gap-3 text-xs',
            customSeo.status === 'published'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
              : customSeo.status === 'pending_approval'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-300',
          )}
        >
          <div className="flex items-center gap-2">
            {customSeo.status === 'published' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <Clock className="h-4 w-4 text-amber-600" />
            )}
            <span className="font-extrabold uppercase">
              SEO Status: {customSeo.status.replace('_', ' ')}
            </span>
          </div>

          <div className="font-bold">
            Health Score: <span className="font-black text-sm">{customSeo.seoScore}%</span>
          </div>
        </div>
      )}

      {/* Linked Resources Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {categorySeo && (
          <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 shadow-xs">
            <div className="text-[10px] font-bold uppercase text-indigo-600 flex items-center gap-1">
              <Tag className="h-3 w-3" /> Assigned Category SEO
            </div>
            <div className="font-black text-sm text-gray-900 dark:text-white mt-1">
              {categorySeo.targetName}
            </div>
            <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
              {categorySeo.metaTitle}
            </p>
            <Link
              href={`/category/${categorySeo.slug}`}
              target="_blank"
              className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1 mt-2"
            >
              View Public Category Directory <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}

        {themeSeo && (
          <div className="rounded-2xl border border-purple-200 dark:border-purple-900 bg-purple-50/40 dark:bg-purple-950/20 p-4 shadow-xs">
            <div className="text-[10px] font-bold uppercase text-purple-600 flex items-center gap-1">
              <Layers className="h-3 w-3" /> Active Theme Template SEO
            </div>
            <div className="font-black text-sm text-gray-900 dark:text-white mt-1">
              {themeSeo.targetName}
            </div>
            <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
              {themeSeo.metaTitle}
            </p>
            <Link
              href={`/themes/${themeSeo.slug}`}
              target="_blank"
              className="text-[11px] font-bold text-purple-600 hover:underline flex items-center gap-1 mt-2"
            >
              View Public Theme Page <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>

      {/* SEO Edit Form */}
      <Card className="rounded-3xl border-gray-200 dark:border-gray-800 shadow-md">
        <CardHeader>
          <CardTitle className="text-base font-black flex items-center gap-2">
            <Globe className="h-4 w-4 text-indigo-600" />
            Storefront Meta Tags &amp; On-Page SEO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveAndSubmit} className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between">
                <Label className="font-bold">Google Meta Title *</Label>
                <span className="text-[10px] text-gray-400">{metaTitle.length} / 60 chars</span>
              </div>
              <Input
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Business Name - Services & Location"
                className="mt-1 h-10 text-xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label className="font-bold">Google Meta Description *</Label>
                <span className="text-[10px] text-gray-400">{metaDescription.length} / 160 chars</span>
              </div>
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Enticing description that shows in Google search results"
                className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 text-xs"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label className="font-bold">Primary Focus Keyword</Label>
                <Input
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  placeholder="e.g. carpenter in noida"
                  className="mt-1 h-9 text-xs"
                />
              </div>

              <div>
                <Label className="font-bold">H1 Main Page Heading</Label>
                <Input
                  value={h1}
                  onChange={(e) => setH1(e.target.value)}
                  placeholder="e.g. Noida Carpenter & Interior Specialists"
                  className="mt-1 h-9 text-xs"
                />
              </div>
            </div>

            <div>
              <Label className="font-bold">H2 Sub-Heading</Label>
              <Input
                value={h2}
                onChange={(e) => setH2(e.target.value)}
                placeholder="e.g. Certified Woodwork & Custom Furniture Services"
                className="mt-1 h-9 text-xs"
              />
            </div>

            <div>
              <Label className="font-bold">About Business / SEO Content</Label>
              <textarea
                rows={4}
                value={contentBody}
                onChange={(e) => setContentBody(e.target.value)}
                placeholder="Describe your specialties, warranty, and experience for local search engines"
                className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 text-xs"
              />
            </div>

            {/* FAQs Builder */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <Label className="font-bold flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5 text-indigo-600" />
                  Frequently Asked Questions (Rich Google FAQs)
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFaqs([...faqs, { question: '', answer: '' }])}
                  className="h-7 text-xs font-bold"
                >
                  + Add Question
                </Button>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 space-y-2">
                    <Input
                      value={faq.question}
                      onChange={(e) => {
                        const copy = [...faqs];
                        copy[idx].question = e.target.value;
                        setFaqs(copy);
                      }}
                      placeholder={`Question ${idx + 1}`}
                      className="h-8 text-xs bg-white dark:bg-gray-900 font-bold"
                    />
                    <textarea
                      rows={2}
                      value={faq.answer}
                      onChange={(e) => {
                        const copy = [...faqs];
                        copy[idx].answer = e.target.value;
                        setFaqs(copy);
                      }}
                      placeholder={`Answer ${idx + 1}`}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md gap-2"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Submitting to Super Admin...' : 'Submit SEO for Super Admin Review'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

