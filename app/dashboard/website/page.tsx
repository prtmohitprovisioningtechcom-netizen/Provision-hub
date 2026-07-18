'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Globe, Eye, EyeOff, GripVertical } from 'lucide-react';
import { LANDING_SECTIONS } from '@/constants';
import { ILandingPageSection } from '@/types';
import { useCompany } from '@/hooks/useCompany';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import axios from 'axios';

import Link from 'next/link';

export default function WebsitePage() {
  const { companyId, companySlug } = useCompany();
  const [sections, setSections] = useState<ILandingPageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    
    const fetchSections = async () => {
      try {
        const { data } = await axios.get('/api/dashboard/landing-page');
        if (data.success && data.data && data.data.sections && data.data.sections.length > 0) {
          setSections(data.data.sections);
        } else {
          setSections(
            LANDING_SECTIONS.map((s, i) => ({
              id: `section-${i}`,
              type: s.type,
              title: s.title,
              subtitle: '',
              content: '',
              isVisible: true,
              order: s.order,
            })),
          );
        }
      } catch (error) {
        toast.error('Failed to load landing page configuration');
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, [companyId]);

  const updateSection = (id: string, field: keyof ILandingPageSection, value: string | boolean) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  };

  const toggleVisibility = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isVisible: !s.isVisible } : s)),
    );
  };

  const handleSave = async () => {
    if (!companyId) return;
    setSaving(true);
    try {
      const { data } = await axios.post('/api/dashboard/landing-page', { sections });
      if (data.success) {
        toast.success('Landing page sections saved');
      } else {
        toast.error(data.message || 'Failed to save');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save landing page');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Website Builder"
        description="Customize your landing page sections"
        action={
          <div className="flex items-center gap-3">
            {companySlug && (
              <Button asChild variant="outline">
                <Link href={`/company/${companySlug}`} target="_blank">
                  <Globe className="mr-2 h-4 w-4" />
                  View Landing Page
                </Link>
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        }
      />

      <div className="space-y-3">
        {sections.map((section) => (
          <Card key={section.id}>
            <CardHeader className="py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  {section.title}
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-normal text-gray-500 dark:bg-gray-800">
                    {section.type}
                  </span>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleVisibility(section.id)}
                    title={section.isVisible ? 'Hide section' : 'Show section'}
                  >
                    {section.isVisible ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedId(expandedId === section.id ? null : section.id)}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </CardHeader>
            {expandedId === section.id && (
              <CardContent className="space-y-4 border-t border-gray-100 pt-4 dark:border-gray-800">
                <div>
                  <Label>Title</Label>
                  <Input
                    className="mt-1"
                    value={section.title}
                    onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Subtitle</Label>
                  <Input
                    className="mt-1"
                    value={section.subtitle || ''}
                    onChange={(e) => updateSection(section.id, 'subtitle', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Content</Label>
                  <Textarea
                    className="mt-1"
                    rows={4}
                    value={section.content || ''}
                    onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                  />
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {!sections.length && (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <Globe className="mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-500">No sections configured yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
