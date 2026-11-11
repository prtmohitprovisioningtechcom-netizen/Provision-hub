'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Sparkles,
  Search,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  MapPin,
  Tag,
  Key,
  Code,
  FileCode,
  Settings,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileText,
  X,
  HelpCircle,
  Smartphone,
  Eye,
  Check,
  Send,
  Sliders,
  Filter,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { PLATFORM_THEMES, TOP_INDIAN_LOCATIONS } from '@/server/services/seo.service';

interface SeoRecord {
  id: string;
  type: 'category' | 'theme' | 'location' | 'service' | 'page' | 'custom';
  targetId: string;
  targetName: string;
  slug: string;
  urlPath: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  canonicalUrl?: string;
  h1?: string;
  h2?: string;
  h3?: string;
  contentBody?: string;
  faqs?: Array<{ question: string; answer: string }>;
  schemaType?: string;
  customSchema?: any;
  indexDirective?: string;
  inSitemap?: boolean;
  sitemapPriority?: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'published' | 'rejected';
  seoScore: number;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface SeoDashboardData {
  stats: {
    total: number;
    categories: number;
    themes: number;
    locations: number;
    keywords: number;
    published: number;
    pending: number;
    healthScore: number;
  };
  recentActivities: any[];
  auditIssues: any[];
}

export default function SuperAdminSeoPage() {
  const [activeTab, setActiveTab] = useState<
    'all' | 'category' | 'theme' | 'location' | 'pending' | 'keywords' | 'technical' | 'settings'
  >('all');

  const [dashboardData, setDashboardData] = useState<SeoDashboardData | null>(null);
  const [records, setRecords] = useState<SeoRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Editor Modal State
  const [editorRecord, setEditorRecord] = useState<Partial<SeoRecord> | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Bulk Location Generator Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkCategory, setBulkCategory] = useState('Website Development');
  const [selectedCities, setSelectedCities] = useState<string[]>([
    'new-delhi',
    'noida',
    'greater-noida',
    'gurugram',
    'lucknow',
    'agra',
    'etawah',
    'mumbai',
  ]);
  const [isGeneratingBulk, setIsGeneratingBulk] = useState(false);

  // Keywords State
  const [keywordsList, setKeywordsList] = useState<any[]>([]);
  const [cannibalizationAlerts, setCannibalizationAlerts] = useState<any[]>([]);
  const [newKeyword, setNewKeyword] = useState('');

  // Global Settings State
  const [globalSettings, setGlobalSettings] = useState<any>(null);

  // Fetch Dashboard Stats & Records
  const fetchSeoData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Dashboard summary
      const { data: dashRes } = await api.get('/api/admin/seo?action=dashboard');
      if (dashRes?.success) {
        setDashboardData(dashRes.data);
      }

      // 2. Records according to active tab
      const typeFilter = activeTab === 'all' || activeTab === 'pending' || activeTab === 'keywords' || activeTab === 'technical' || activeTab === 'settings' ? 'all' : activeTab;
      const statusFilter = activeTab === 'pending' ? 'pending_approval' : 'all';

      const { data: recRes } = await api.get(
        `/api/admin/seo?action=records&type=${typeFilter}&status=${statusFilter}&search=${encodeURIComponent(
          search,
        )}&page=${page}&limit=20`,
      );
      if (recRes?.success) {
        setRecords(recRes.data.records || []);
        setTotalPages(recRes.data.pagination?.totalPages || 1);
      }

      // 3. If on keywords tab, fetch keywords
      if (activeTab === 'keywords') {
        const { data: kwRes } = await api.get('/api/admin/seo?action=keywords');
        if (kwRes?.success) {
          setKeywordsList(kwRes.data.keywords || []);
          setCannibalizationAlerts(kwRes.data.cannibalization || []);
        }
      }

      // 4. If on settings tab, fetch global settings
      if (activeTab === 'settings' || activeTab === 'technical') {
        const { data: setRes } = await api.get('/api/admin/seo?action=global_settings');
        if (setRes?.success) {
          setGlobalSettings(setRes.data);
        }
      }
    } catch {
      toast.error('Failed to load SEO management data');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, search, page]);

  useEffect(() => {
    fetchSeoData();
  }, [fetchSeoData]);

  // Open Edit Modal
  const handleOpenEdit = (rec: SeoRecord) => {
    setEditorRecord({
      ...rec,
      secondaryKeywords: Array.isArray(rec.secondaryKeywords) ? rec.secondaryKeywords : [],
      faqs: Array.isArray(rec.faqs) ? rec.faqs : [],
    });
    setIsEditorOpen(true);
  };

  // Open New Record Modal
  const handleOpenCreate = (defaultType: SeoRecord['type'] = 'category') => {
    setEditorRecord({
      type: defaultType,
      targetName: '',
      slug: '',
      metaTitle: '',
      metaDescription: '',
      focusKeyword: '',
      secondaryKeywords: [],
      h1: '',
      h2: '',
      h3: '',
      contentBody: '',
      faqs: [
        { question: 'What services are included?', answer: 'Complete verified services with direct customer support.' },
      ],
      schemaType: defaultType === 'theme' ? 'Product' : defaultType === 'location' ? 'LocalBusiness' : 'CollectionPage',
      inSitemap: true,
      sitemapPriority: 0.8,
      status: 'published',
      seoScore: 85,
    });
    setIsEditorOpen(true);
  };

  // 1-Click AI Generation for Current Editor Record
  const handleAiGenerate = async () => {
    if (!editorRecord?.targetName) {
      toast.error('Please enter Target Name first (e.g. Real Estate or Neon Dark Theme)');
      return;
    }
    setIsAiGenerating(true);
    try {
      const { data } = await api.post('/api/admin/seo', {
        action: 'ai_generate',
        type: editorRecord.type,
        name: editorRecord.targetName,
        focusKeyword: editorRecord.focusKeyword,
      });

      if (data?.success && data.data) {
        const gen = data.data;
        setEditorRecord((prev) => ({
          ...prev,
          metaTitle: gen.metaTitle,
          metaDescription: gen.metaDescription,
          focusKeyword: gen.focusKeyword,
          secondaryKeywords: gen.secondaryKeywords,
          h1: gen.h1,
          h2: gen.h2,
          h3: gen.h3,
          contentBody: gen.contentBody,
          faqs: gen.faqs,
          customSchema: gen.schema,
          seoScore: gen.seoScore,
        }));
        toast.success('AI SEO Content generated with high-CTR title & rich FAQs!');
      }
    } catch {
      toast.error('AI generation failed');
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Save SEO Record
  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorRecord?.targetName || !editorRecord.slug || !editorRecord.metaTitle || !editorRecord.metaDescription) {
      toast.error('Please fill Target Name, Slug, Meta Title & Meta Description');
      return;
    }

    setIsSaving(true);
    try {
      const { data } = await api.post('/api/admin/seo', {
        action: 'save_record',
        ...editorRecord,
      });

      if (data?.success) {
        toast.success('SEO Record saved and applied successfully!');
        setIsEditorOpen(false);
        setEditorRecord(null);
        await fetchSeoData();
      }
    } catch {
      toast.error('Failed to save SEO record');
    } finally {
      setIsSaving(false);
    }
  };

  // Approve Record
  const handleApproveRecord = async (id: string) => {
    try {
      const { data } = await api.post('/api/admin/seo', { action: 'approve_record', id });
      if (data?.success) {
        toast.success('Approved & Published! Added to sitemap.');
        await fetchSeoData();
      }
    } catch {
      toast.error('Failed to approve');
    }
  };

  // Reject Record
  const handleRejectRecord = async (id: string) => {
    const reason = prompt('Enter rejection feedback for admin (optional):');
    try {
      const { data } = await api.post('/api/admin/seo', { action: 'reject_record', id, reason });
      if (data?.success) {
        toast.success('SEO Record rejected with feedback.');
        await fetchSeoData();
      }
    } catch {
      toast.error('Failed to reject');
    }
  };

  // Delete Record
  const handleDeleteRecord = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete SEO record for "${name}"?`)) return;
    try {
      const { data } = await api.post('/api/admin/seo', { action: 'delete_record', id });
      if (data?.success) {
        toast.success('SEO Record deleted');
        await fetchSeoData();
      }
    } catch {
      toast.error('Failed to delete');
    }
  };

  // Bulk Generate Location Pages
  const handleRunBulkLocationGenerator = async () => {
    if (!bulkCategory.trim() || selectedCities.length === 0) {
      toast.error('Select category and at least 1 city');
      return;
    }

    setIsGeneratingBulk(true);
    try {
      const { data } = await api.post('/api/admin/seo', {
        action: 'bulk_generate_locations',
        categoryName: bulkCategory.trim(),
        citySlugs: selectedCities,
      });
      if (data?.success) {
        toast.success(data.message || 'Bulk location pages created successfully!');
        setIsBulkModalOpen(false);
        setActiveTab('location');
        await fetchSeoData();
      }
    } catch {
      toast.error('Bulk generation failed');
    } finally {
      setIsGeneratingBulk(false);
    }
  };

  // Save Keyword
  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    try {
      const { data } = await api.post('/api/admin/seo', {
        action: 'save_keyword',
        keyword: newKeyword.trim(),
      });
      if (data?.success) {
        toast.success('Keyword added to bank');
        setNewKeyword('');
        await fetchSeoData();
      }
    } catch {
      toast.error('Failed to add keyword');
    }
  };

  // Save Global Settings
  const handleSaveGlobalSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSettings) return;
    try {
      const { data } = await api.post('/api/admin/seo', {
        action: 'update_global_settings',
        ...globalSettings,
      });
      if (data?.success) {
        toast.success('Global SEO settings and Robots.txt updated!');
      }
    } catch {
      toast.error('Failed to save settings');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-linear-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-900/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3.5 py-1 text-xs font-bold text-indigo-300 border border-indigo-400/30 mb-2">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
              <span>Enterprise VIP &bull; Dynamic SEO Master Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              SEO Master Control &amp; Dynamic Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Centralized SEO management for Categories, Platform Themes, Locations, Keywords, and AI Page Generation. Every published page is automatically included in dynamic XML sitemaps.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              onClick={() => setIsBulkModalOpen(true)}
              className="rounded-xl bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs h-10 shadow-md gap-1.5"
            >
              <Zap className="h-4 w-4" />
              ⚡ Bulk Location SEO Generator
            </Button>

            <Button
              type="button"
              onClick={() => handleOpenCreate('category')}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs h-10 shadow-md gap-1.5"
            >
              <Plus className="h-4 w-4" />
              New SEO Record
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={fetchSeoData}
              className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 font-bold text-xs h-10"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
            </Button>
          </div>
        </div>
      </div>

      {/* 8 KPI Metrics Cards */}
      {dashboardData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3.5 shadow-xs text-center">
            <div className="text-[10px] font-bold uppercase text-gray-500">Total SEO Pages</div>
            <div className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
              {dashboardData.stats.total}
            </div>
          </div>

          <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20 p-3.5 shadow-xs text-center">
            <div className="text-[10px] font-bold uppercase text-indigo-700 dark:text-indigo-300">
              Categories
            </div>
            <div className="text-xl font-black text-indigo-700 dark:text-indigo-300 mt-0.5">
              {dashboardData.stats.categories}
            </div>
          </div>

          <div className="rounded-2xl border border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/20 p-3.5 shadow-xs text-center">
            <div className="text-[10px] font-bold uppercase text-purple-700 dark:text-purple-300">
              Themes
            </div>
            <div className="text-xl font-black text-purple-700 dark:text-purple-300 mt-0.5">
              {dashboardData.stats.themes}
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-200 dark:border-cyan-900 bg-cyan-50/50 dark:bg-cyan-950/20 p-3.5 shadow-xs text-center">
            <div className="text-[10px] font-bold uppercase text-cyan-700 dark:text-cyan-300">
              Locations
            </div>
            <div className="text-xl font-black text-cyan-700 dark:text-cyan-300 mt-0.5">
              {dashboardData.stats.locations}
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 shadow-xs text-center">
            <div className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300">
              Published
            </div>
            <div className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
              {dashboardData.stats.published}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 p-3.5 shadow-xs text-center">
            <div className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-300">
              Pending Approval
            </div>
            <div className="text-xl font-black text-amber-700 dark:text-amber-300 mt-0.5">
              {dashboardData.stats.pending}
            </div>
          </div>

          <div className="rounded-2xl border border-pink-200 dark:border-pink-900 bg-pink-50/50 dark:bg-pink-950/20 p-3.5 shadow-xs text-center">
            <div className="text-[10px] font-bold uppercase text-pink-700 dark:text-pink-300">
              Keywords
            </div>
            <div className="text-xl font-black text-pink-700 dark:text-pink-300 mt-0.5">
              {dashboardData.stats.keywords}
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-3.5 shadow-xs text-center">
            <div className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300">
              SEO Health
            </div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {dashboardData.stats.healthScore}%
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-800 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold p-1 rounded-2xl bg-gray-100 dark:bg-gray-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={cn(
              'px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap',
              activeTab === 'all'
                ? 'bg-white dark:bg-gray-900 text-indigo-600 shadow-xs'
                : 'text-gray-600 dark:text-gray-400',
            )}
          >
            All Records
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('category')}
            className={cn(
              'px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1',
              activeTab === 'category'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400',
            )}
          >
            <Tag className="h-3 w-3" /> Category SEO
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('theme')}
            className={cn(
              'px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1',
              activeTab === 'theme'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400',
            )}
          >
            <Layers className="h-3 w-3" /> Theme SEO (11 Themes)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('location')}
            className={cn(
              'px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1',
              activeTab === 'location'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400',
            )}
          >
            <MapPin className="h-3 w-3" /> Location SEO
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={cn(
              'px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1',
              activeTab === 'pending'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400',
            )}
          >
            <Clock className="h-3 w-3" /> Approvals ({dashboardData?.stats.pending || 0})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('keywords')}
            className={cn(
              'px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1',
              activeTab === 'keywords'
                ? 'bg-pink-600 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400',
            )}
          >
            <Key className="h-3 w-3" /> Keywords &amp; Cannibalization
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={cn(
              'px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1',
              activeTab === 'settings'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400',
            )}
          >
            <Settings className="h-3 w-3" /> Global &amp; Robots.txt
          </button>
        </div>

        {activeTab !== 'keywords' && activeTab !== 'settings' && (
          <div className="relative w-full sm:w-64">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search target, slug, keyword..."
              className="pl-9 h-9 rounded-xl text-xs bg-white dark:bg-gray-900"
            />
          </div>
        )}
      </div>

      {/* Main Content Area Based on Active Tab */}
      {activeTab === 'keywords' ? (
        /* ==================== KEYWORD MANAGEMENT & CANNIBALIZATION ==================== */
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          <div className="lg:col-span-4 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm space-y-4">
            <h2 className="text-base font-black flex items-center gap-2">
              <Plus className="h-4 w-4 text-indigo-600" /> Add New Keyword
            </h2>
            <form onSubmit={handleAddKeyword} className="space-y-3">
              <div>
                <Label className="text-xs font-bold">Keyword *</Label>
                <Input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="e.g. best carpenter in noida"
                  className="mt-1 h-9 text-xs"
                />
              </div>
              <Button type="submit" className="w-full h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">
                Save Keyword
              </Button>
            </form>

            {cannibalizationAlerts.length > 0 && (
              <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>Keyword Cannibalization Detected!</span>
                </div>
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  Multiple pages are competing for the exact same focus keyword:
                </p>
                <ul className="text-[11px] text-amber-900 dark:text-amber-200 space-y-1 list-disc pl-4">
                  {cannibalizationAlerts.map((c, i) => (
                    <li key={i}>
                      <strong>&ldquo;{c.focusKeyword}&rdquo;</strong> used in {c.count} pages ({c.pages})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="lg:col-span-8 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm space-y-4">
            <h2 className="text-base font-black flex items-center gap-2">
              <Key className="h-4 w-4 text-pink-600" /> Tracked Focus Keywords ({keywordsList.length})
            </h2>
            {keywordsList.length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center">No keywords added yet.</p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {keywordsList.map((kw) => (
                  <div key={kw.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">{kw.keyword}</div>
                      <div className="text-[10px] text-gray-400 uppercase">
                        Intent: {kw.intent} &bull; Vol: ~{kw.searchVolume}/mo
                      </div>
                    </div>
                    <span className="rounded-full bg-indigo-100 text-indigo-700 px-2 py-0.5 text-[10px] font-bold">
                      {kw.difficulty}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'settings' ? (
        /* ==================== GLOBAL SETTINGS & ROBOTS.TXT ==================== */
        <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSaveGlobalSettings} className="space-y-5">
            <h2 className="text-lg font-black flex items-center gap-2">
              <Settings className="h-5 w-5 text-indigo-600" /> Platform Global SEO &amp; Crawling Settings
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold">Website Name</Label>
                <Input
                  value={globalSettings?.siteName || ''}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, siteName: e.target.value })}
                  className="mt-1 h-9 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-bold">Canonical Base URL</Label>
                <Input
                  value={globalSettings?.canonicalBaseUrl || ''}
                  onChange={(e) => setGlobalSettings({ ...globalSettings, canonicalBaseUrl: e.target.value })}
                  className="mt-1 h-9 text-xs"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold">Default Global Title Template</Label>
              <Input
                value={globalSettings?.defaultTitle || ''}
                onChange={(e) => setGlobalSettings({ ...globalSettings, defaultTitle: e.target.value })}
                className="mt-1 h-9 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-bold">Default Global Meta Description</Label>
              <textarea
                rows={3}
                value={globalSettings?.defaultDescription || ''}
                onChange={(e) => setGlobalSettings({ ...globalSettings, defaultDescription: e.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-bold">Robots.txt Content</Label>
              <textarea
                rows={5}
                value={globalSettings?.robotsTxtContent || ''}
                onChange={(e) => setGlobalSettings({ ...globalSettings, robotsTxtContent: e.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 text-xs font-mono"
              />
            </div>

            <Button type="submit" className="h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-6">
              Save Global SEO Settings
            </Button>
          </form>
        </div>
      ) : (
        /* ==================== SEO RECORDS TABLE ==================== */
        <Card className="rounded-3xl border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center text-sm text-gray-500">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-600" />
                Loading SEO records...
              </div>
            ) : records.length === 0 ? (
              <div className="p-12 text-center text-gray-500 space-y-2">
                <Globe className="h-10 w-10 mx-auto text-gray-300" />
                <p className="font-bold">No SEO records found</p>
                <p className="text-xs">Create a new record or use the AI generator.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/60 text-left uppercase text-[11px] font-bold text-gray-500 border-b border-gray-200 dark:border-gray-800">
                      <th className="py-3 px-4">Target &amp; Type</th>
                      <th className="py-3 px-4">Public URL Path</th>
                      <th className="py-3 px-4">Focus Keyword</th>
                      <th className="py-3 px-4">SEO Health</th>
                      <th className="py-3 px-4">Status &amp; Sitemap</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {records.map((r) => {
                      const isLowScore = r.seoScore < 70;
                      return (
                        <tr key={r.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-900/40 transition-colors">
                          {/* Target */}
                          <td className="py-3.5 px-4">
                            <div className="font-black text-gray-900 dark:text-white text-sm">
                              {r.targetName}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className={cn(
                                  'rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider',
                                  r.type === 'category'
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : r.type === 'theme'
                                      ? 'bg-purple-100 text-purple-800'
                                      : r.type === 'location'
                                        ? 'bg-cyan-100 text-cyan-800'
                                        : 'bg-gray-100 text-gray-800',
                                )}
                              >
                                {r.type}
                              </span>
                              {r.faqs && r.faqs.length > 0 && (
                                <span className="text-[10px] text-gray-400">
                                  {r.faqs.length} FAQs
                                </span>
                              )}
                            </div>
                          </td>

                          {/* URL Path */}
                          <td className="py-3.5 px-4 font-mono text-xs">
                            <a
                              href={r.urlPath}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:underline flex items-center gap-1"
                            >
                              {r.urlPath}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </td>

                          {/* Keyword */}
                          <td className="py-3.5 px-4 font-bold text-gray-700 dark:text-gray-300">
                            {r.focusKeyword || '—'}
                          </td>

                          {/* SEO Health Score */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  'h-7 w-7 rounded-full flex items-center justify-center font-black text-xs',
                                  r.seoScore >= 85
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : r.seoScore >= 70
                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
                                )}
                              >
                                {r.seoScore}
                              </div>
                              {isLowScore && (
                                <span className="text-[10px] text-rose-600 font-bold">Needs Fix</span>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <span
                                className={cn(
                                  'inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase',
                                  r.status === 'published'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : r.status === 'pending_approval'
                                      ? 'bg-amber-100 text-amber-800 animate-pulse'
                                      : r.status === 'rejected'
                                        ? 'bg-rose-100 text-rose-800'
                                        : 'bg-gray-100 text-gray-800',
                                )}
                              >
                                {r.status.replace('_', ' ')}
                              </span>
                              {r.inSitemap && (
                                <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                                  <Check className="h-3 w-3" /> In Sitemap
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center justify-end gap-1.5 flex-wrap">
                              {r.status === 'pending_approval' ? (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApproveRecord(r.id)}
                                    className="h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRejectRecord(r.id)}
                                    className="h-7 rounded-lg text-rose-600 text-xs font-bold"
                                  >
                                    Reject
                                  </Button>
                                </>
                              ) : null}

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenEdit(r)}
                                className="h-7 rounded-lg text-xs font-bold"
                              >
                                <Edit3 className="h-3 w-3 mr-1" /> Edit
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteRecord(r.id, r.targetName)}
                                className="h-7 rounded-lg text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ==================== BULK LOCATION GENERATOR MODAL ==================== */}
      <AnimatePresence>
        {isBulkModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-gray-900 border-2 border-indigo-600 p-6 sm:p-7 shadow-2xl text-left"
            >
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="absolute top-4 right-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-1">
                <span className="inline-block rounded-full bg-amber-100 text-amber-800 px-3 py-0.5 text-xs font-black uppercase">
                  Bulk SEO Engine
                </span>
                <h3 className="text-xl font-black">Generate Location-Wise SEO Pages</h3>
                <p className="text-xs text-gray-500">
                  Select a category and target Indian cities. AI will automatically generate unique meta tags, localized content, and local business schemas.
                </p>
              </div>

              <div className="mt-5 space-y-4 text-xs">
                <div>
                  <Label className="font-bold">Category / Service Name *</Label>
                  <Input
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    placeholder="e.g. Carpenter & Furniture or Website Development"
                    className="mt-1 h-9 text-xs"
                  />
                </div>

                <div>
                  <Label className="font-bold">Target Indian Cities (Multi-Select)</Label>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 rounded-2xl border border-gray-200 dark:border-gray-800">
                    {TOP_INDIAN_LOCATIONS.map((loc) => {
                      const isSelected = selectedCities.includes(loc.slug);
                      return (
                        <button
                          key={loc.slug}
                          type="button"
                          onClick={() => {
                            setSelectedCities((prev) =>
                              isSelected ? prev.filter((s) => s !== loc.slug) : [...prev, loc.slug],
                            );
                          }}
                          className={cn(
                            'p-2 rounded-xl text-left border text-[11px] font-bold transition-all cursor-pointer',
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                              : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400',
                          )}
                        >
                          <div>{loc.city}</div>
                          <div className="text-[9px] font-normal text-gray-400">{loc.state}</div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-1 text-[10px] text-gray-400">
                    {selectedCities.length} cities selected
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="rounded-xl text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleRunBulkLocationGenerator}
                  disabled={isGeneratingBulk}
                  className="rounded-xl bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-white font-extrabold text-xs h-10 px-5 shadow-md"
                >
                  {isGeneratingBulk ? 'Generating...' : `⚡ Generate ${selectedCities.length} Location Pages`}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== COMPREHENSIVE SEO EDITOR MODAL ==================== */}
      <AnimatePresence>
        {isEditorOpen && editorRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-gray-900 border-2 border-indigo-600 p-6 sm:p-7 shadow-2xl text-left my-8 max-h-[90vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="absolute top-4 right-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div>
                  <span className="inline-block rounded-full bg-indigo-100 text-indigo-800 px-3 py-0.5 text-xs font-black uppercase mb-1">
                    {editorRecord.type} SEO Editor
                  </span>
                  <h3 className="text-xl font-black">
                    {editorRecord.id ? `Edit SEO: ${editorRecord.targetName}` : 'Create New SEO Record'}
                  </h3>
                </div>

                <Button
                  type="button"
                  onClick={handleAiGenerate}
                  disabled={isAiGenerating}
                  className="rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 text-white font-extrabold text-xs h-9 shadow-md gap-1.5 self-start sm:self-auto"
                >
                  <Sparkles className={cn('h-3.5 w-3.5', isAiGenerating && 'animate-spin')} />
                  {isAiGenerating ? 'AI Generating...' : '⚡ AI Auto-Fill / Optimize'}
                </Button>
              </div>

              <form onSubmit={handleSaveRecord} className="mt-5 space-y-4 text-xs">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="font-bold">Target Name *</Label>
                    <Input
                      value={editorRecord.targetName || ''}
                      onChange={(e) => setEditorRecord({ ...editorRecord, targetName: e.target.value })}
                      placeholder="e.g. Travel & Tourism"
                      className="mt-1 h-9 text-xs"
                    />
                  </div>

                  <div>
                    <Label className="font-bold">URL Slug *</Label>
                    <Input
                      value={editorRecord.slug || ''}
                      onChange={(e) => setEditorRecord({ ...editorRecord, slug: e.target.value })}
                      placeholder="e.g. category/travel-tourism"
                      className="mt-1 h-9 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Focus Keyword */}
                <div>
                  <Label className="font-bold">Focus Keyword *</Label>
                  <Input
                    value={editorRecord.focusKeyword || ''}
                    onChange={(e) => setEditorRecord({ ...editorRecord, focusKeyword: e.target.value })}
                    placeholder="e.g. travel and tourism services in india"
                    className="mt-1 h-9 text-xs"
                  />
                </div>

                {/* Meta Title with counter */}
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="font-bold">Meta Title *</Label>
                    <span
                      className={cn(
                        'text-[10px] font-bold',
                        (editorRecord.metaTitle || '').length > 60 ? 'text-amber-600' : 'text-gray-400',
                      )}
                    >
                      {(editorRecord.metaTitle || '').length} / 60 chars
                    </span>
                  </div>
                  <Input
                    value={editorRecord.metaTitle || ''}
                    onChange={(e) => setEditorRecord({ ...editorRecord, metaTitle: e.target.value })}
                    placeholder="High CTR Title with Keyword"
                    className="mt-1 h-9 text-xs"
                  />
                </div>

                {/* Meta Description with counter */}
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="font-bold">Meta Description *</Label>
                    <span
                      className={cn(
                        'text-[10px] font-bold',
                        (editorRecord.metaDescription || '').length > 160 ? 'text-amber-600' : 'text-gray-400',
                      )}
                    >
                      {(editorRecord.metaDescription || '').length} / 160 chars
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={editorRecord.metaDescription || ''}
                    onChange={(e) => setEditorRecord({ ...editorRecord, metaDescription: e.target.value })}
                    placeholder="Compelling description for Google search snippet"
                    className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2.5 text-xs"
                  />
                </div>

                {/* Headings */}
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="font-bold">H1 Main Heading</Label>
                    <Input
                      value={editorRecord.h1 || ''}
                      onChange={(e) => setEditorRecord({ ...editorRecord, h1: e.target.value })}
                      placeholder="Page main title"
                      className="mt-1 h-9 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="font-bold">H2 Sub-Heading</Label>
                    <Input
                      value={editorRecord.h2 || ''}
                      onChange={(e) => setEditorRecord({ ...editorRecord, h2: e.target.value })}
                      placeholder="Section heading"
                      className="mt-1 h-9 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="font-bold">H3 Sub-Heading</Label>
                    <Input
                      value={editorRecord.h3 || ''}
                      onChange={(e) => setEditorRecord({ ...editorRecord, h3: e.target.value })}
                      placeholder="Topic heading"
                      className="mt-1 h-9 text-xs"
                    />
                  </div>
                </div>

                {/* Rich SEO Content */}
                <div>
                  <Label className="font-bold">SEO Content Body (HTML/Markdown)</Label>
                  <textarea
                    rows={4}
                    value={editorRecord.contentBody || ''}
                    onChange={(e) => setEditorRecord({ ...editorRecord, contentBody: e.target.value })}
                    placeholder="<p>Detailed keyword-rich description for visitors and search engines...</p>"
                    className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2.5 text-xs font-mono"
                  />
                </div>

                {/* Schema & Indexation Settings */}
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="font-bold">Schema Type</Label>
                    <select
                      value={editorRecord.schemaType || 'WebPage'}
                      onChange={(e) => setEditorRecord({ ...editorRecord, schemaType: e.target.value })}
                      className="mt-1 w-full h-9 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-2 text-xs"
                    >
                      <option value="CollectionPage">CollectionPage (Category)</option>
                      <option value="Product">Product / CreativeWork (Theme)</option>
                      <option value="LocalBusiness">LocalBusiness (City/Service)</option>
                      <option value="WebPage">WebPage (General)</option>
                    </select>
                  </div>

                  <div>
                    <Label className="font-bold">Index Directive</Label>
                    <select
                      value={editorRecord.indexDirective || 'index, follow'}
                      onChange={(e) => setEditorRecord({ ...editorRecord, indexDirective: e.target.value })}
                      className="mt-1 w-full h-9 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-2 text-xs"
                    >
                      <option value="index, follow">index, follow (Recommended)</option>
                      <option value="noindex, follow">noindex, follow</option>
                      <option value="noindex, nofollow">noindex, nofollow</option>
                    </select>
                  </div>

                  <div>
                    <Label className="font-bold">Sitemap Inclusion</Label>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editorRecord.inSitemap !== false}
                        onChange={(e) => setEditorRecord({ ...editorRecord, inSitemap: e.target.checked })}
                        className="rounded"
                      />
                      <span className="font-semibold text-xs">Include in XML Sitemap</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-gray-100 dark:border-gray-800 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditorOpen(false)}
                    className="rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs h-10 px-6 shadow-md"
                  >
                    {isSaving ? 'Saving...' : 'Save & Publish SEO Record'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
