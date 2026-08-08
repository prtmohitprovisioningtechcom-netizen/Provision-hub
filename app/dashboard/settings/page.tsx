'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Bell,
  Building2,
  Clock,
  ExternalLink,
  Globe,
  ImagePlus,
  Loader2,
  MapPin,
  Palette,
  Receipt,
  Search,
  Share2,
  UploadCloud,
} from 'lucide-react';
import api from '@/services/api';
import { BusinessHours } from '@/types';
import { useCompany } from '@/hooks/useCompany';
import { compressImageFile } from '@/lib/compress-image';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';

interface CompanyForm {
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  category: string;
  description: string;
  website: string;
  gst: string;
  pan: string;
  country: string;
  state: string;
  city: string;
  street: string;
  zipCode: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
}

interface SocialForm {
  facebook: string;
  instagram: string;
  youtube: string;
  twitter: string;
  linkedin: string;
  whatsapp: string;
}

interface PrefsForm {
  emailNotifications: boolean;
  leadNotifications: boolean;
  reviewNotifications: boolean;
  loginAlerts: boolean;
  subscriptionAlerts: boolean;
  customDomain: string;
  googleAnalyticsId: string;
}

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

function defaultHours(): BusinessHours[] {
  return DAYS.map((day) => ({
    day,
    open: '09:00',
    close: '18:00',
    isClosed: day === 'Sunday',
  }));
}

function normalizeHours(raw: unknown): BusinessHours[] {
  const list = Array.isArray(raw) ? raw : [];
  return DAYS.map((day) => {
    const found = list.find(
      (item) => String((item as BusinessHours)?.day || '').toLowerCase() === day.toLowerCase(),
    ) as BusinessHours | undefined;
    return {
      day,
      open: found?.open || '09:00',
      close: found?.close || '18:00',
      isClosed: Boolean(found?.isClosed),
    };
  });
}

export default function SettingsPage() {
  const { companySlug } = useCompany();
  const logoRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [savingCompany, setSavingCompany] = useState(false);
  const [savingBrand, setSavingBrand] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);
  const [savingHours, setSavingHours] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);
  const [logo, setLogo] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#4f46e5');
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>(defaultHours());
  const [prefs, setPrefs] = useState<PrefsForm>({
    emailNotifications: true,
    leadNotifications: true,
    reviewNotifications: true,
    loginAlerts: true,
    subscriptionAlerts: true,
    subscriptionAlerts: true,
    googleAnalyticsId: '',
  });

  const [customDomain, setCustomDomain] = useState('');
  const [customDomainStatus, setCustomDomainStatus] = useState<'none' | 'pending' | 'active' | 'failed'>('none');
  const [requestingDomain, setRequestingDomain] = useState(false);

  const { register, handleSubmit, reset } = useForm<CompanyForm>();
  const {
    register: registerSocial,
    handleSubmit: handleSocialSubmit,
    reset: resetSocial,
  } = useForm<SocialForm>();

  useEffect(() => {
    if (!companySlug) {
      requestAnimationFrame(() => setLoading(false));
      return;
    }

    Promise.allSettled([
      api.get(`/api/companies/${companySlug}`),
      api.get('/api/dashboard/company-branding'),
      api.get('/api/dashboard/settings'),
      api.get('/api/categories'),
    ])
      .then(([companyRes, brandRes, settingsRes, categoriesRes]) => {
        if (companyRes.status === 'fulfilled' && companyRes.value.data.success) {
          const c = companyRes.value.data.data.company;
          const seo = c.seo || {};
          reset({
            name: c.name || '',
            ownerName: c.ownerName || '',
            email: c.email || '',
            phone: c.phone || '',
            category: c.category || '',
            description: c.description || '',
            website: c.website || '',
            gst: c.gst || '',
            pan: c.pan || '',
            country: c.address?.country || '',
            state: c.address?.state || '',
            city: c.address?.city || '',
            street: c.address?.street || '',
            zipCode: c.address?.zipCode || '',
            seoTitle: seo.title || '',
            seoDescription: seo.description || '',
            seoKeywords: Array.isArray(seo.keywords) ? seo.keywords.join(', ') : '',
          });
          setBusinessHours(normalizeHours(c.businessHours));
          if (c.logo) setLogo(c.logo);
        } else if (companyRes.status === 'rejected') {
          toast.error('Failed to load company details');
        }

        if (brandRes.status === 'fulfilled' && brandRes.value.data.success) {
          const b = brandRes.value.data.data;
          setLogo(b.logo || '');
          setPrimaryColor(b.theme?.primaryColor || '#4f46e5');
          const links = b.socialLinks || {};
          resetSocial({
            facebook: links.facebook || '',
            instagram: links.instagram || '',
            youtube: links.youtube || '',
            twitter: links.twitter || '',
            linkedin: links.linkedin || '',
            whatsapp: links.whatsapp || '',
          });
        }

        if (settingsRes.status === 'fulfilled' && settingsRes.value.data.success) {
          const foundSettings = settingsRes.value.data.data;
          setPrefs({
            emailNotifications: Boolean(foundSettings.emailNotifications ?? true),
            leadNotifications: Boolean(foundSettings.leadNotifications ?? true),
            reviewNotifications: Boolean(foundSettings.reviewNotifications ?? true),
            loginAlerts: Boolean(foundSettings.loginAlerts ?? true),
            subscriptionAlerts: Boolean(foundSettings.subscriptionAlerts ?? true),
            googleAnalyticsId: foundSettings.googleAnalyticsId || '',
          });
        }

        if (categoriesRes.status === 'fulfilled' && categoriesRes.value.data.success) {
          setCategories(categoriesRes.value.data.data || []);
        }
      })
      .finally(() => setLoading(false));
  }, [companySlug, reset, resetSocial]);

  const onCompanySubmit = async (data: CompanyForm) => {
    if (!companySlug) return;
    setSavingCompany(true);
    try {
      const payload = {
        name: data.name,
        ownerName: data.ownerName,
        email: data.email,
        phone: data.phone,
        category: data.category,
        description: data.description,
        website: data.website,
        gst: data.gst,
        pan: data.pan,
        address: {
          country: data.country,
          state: data.state,
          city: data.city,
          street: data.street,
          zipCode: data.zipCode,
        },
        seo: {
          title: data.seoTitle.trim(),
          description: data.seoDescription.trim(),
          keywords: data.seoKeywords
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
        },
      };
      const { data: res } = await api.put(`/api/companies/${companySlug}`, payload);
      if (!res.success) throw new Error(res.message || 'Save failed');
      toast.success('Company details saved');
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Save failed';
      toast.error(message);
    } finally {
      setSavingCompany(false);
    }
  };

  const handleLogoUpload = async (file?: File) => {
    if (!file) return;
    setUploadingLogo(true);
    try {
      const compressed = await compressImageFile(file);
      const formData = new FormData();
      formData.append('file', compressed);
      const { data: upload } = await api.post('/api/dashboard/upload', formData);
      if (!upload.success || !upload.data?.url) throw new Error(upload.message || 'Upload failed');
      const { data: res } = await api.put('/api/dashboard/company-branding', {
        logo: upload.data.url,
      });
      if (!res.success) throw new Error(res.message || 'Failed');
      setLogo(res.data.logo || upload.data.url);
      toast.success('Logo updated');
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not update logo';
      toast.error(message);
    } finally {
      setUploadingLogo(false);
      if (logoRef.current) logoRef.current.value = '';
    }
  };

  const saveBrandColor = async () => {
    setSavingBrand(true);
    try {
      const { data: res } = await api.put('/api/dashboard/company-branding', {
        primaryColor,
      });
      if (!res.success) throw new Error(res.message || 'Failed');
      toast.success('Brand color saved');
    } catch {
      toast.error('Could not save brand color');
    } finally {
      setSavingBrand(false);
    }
  };

  const onSocialSubmit = async (data: SocialForm) => {
    setSavingSocial(true);
    try {
      const { data: res } = await api.put('/api/dashboard/company-branding', {
        socialLinks: {
          facebook: data.facebook.trim(),
          instagram: data.instagram.trim(),
          youtube: data.youtube.trim(),
          twitter: data.twitter.trim(),
          linkedin: data.linkedin.trim(),
          whatsapp: data.whatsapp.trim(),
        },
      });
      if (!res.success) throw new Error(res.message || 'Failed');
      toast.success('Social links saved');
    } catch {
      toast.error('Could not save social links');
    } finally {
      setSavingSocial(false);
    }
  };

  const saveHours = async () => {
    if (!companySlug) return;
    setSavingHours(true);
    try {
      const { data: res } = await api.put(`/api/companies/${companySlug}`, {
        businessHours,
      });
      if (!res.success) throw new Error(res.message || 'Failed');
      toast.success('Business hours saved');
    } catch {
      toast.error('Could not save business hours');
    } finally {
      setSavingHours(false);
    }
  };

  const savePrefs = async () => {
    setSavingPrefs(true);
    try {
      const { data: res } = await api.put('/api/dashboard/settings', prefs);
      if (!res.success) throw new Error(res.message || 'Failed');
      toast.success('Preferences saved');
    } catch {
      toast.error('Could not save preferences');
    } finally {
      setSavingPrefs(false);
    }
  };

  const updateHour = (day: string, patch: Partial<BusinessHours>) => {
    setBusinessHours((current) =>
      current.map((item) => (item.day === day ? { ...item, ...patch } : item)),
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Settings"
        description="Company details, branding, hours aur website preferences"
        action={
          companySlug ? (
            <Button asChild variant="outline">
              <Link href={`/${companySlug}`} target="_blank">
                <ExternalLink className="h-4 w-4" />
                View live site
              </Link>
            </Button>
          ) : null
        }
      />

      <form onSubmit={handleSubmit(onCompanySubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-indigo-600" />
              Company details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Company name</Label>
              <Input id="name" className="mt-1" {...register('name', { required: true })} />
            </div>
            <div>
              <Label htmlFor="ownerName">Owner name</Label>
              <Input id="ownerName" className="mt-1" {...register('ownerName')} />
            </div>
            <div>
              <Label htmlFor="email">Business email</Label>
              <Input id="email" type="email" className="mt-1" {...register('email')} />
            </div>
            <div>
              <Label htmlFor="phone">Business phone</Label>
              <Input id="phone" className="mt-1" {...register('phone')} />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="mt-1 flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                {...register('category')}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="website">External website</Label>
              <Input
                id="website"
                className="mt-1"
                placeholder="https://"
                {...register('website')}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="description">About company</Label>
              <Textarea
                id="description"
                rows={3}
                className="mt-1"
                placeholder="Short intro for your business"
                {...register('description')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-indigo-600" />
              Address
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" className="mt-1" {...register('country')} />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" className="mt-1" {...register('state')} />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" className="mt-1" {...register('city')} />
            </div>
            <div>
              <Label htmlFor="zipCode">Zip / PIN</Label>
              <Input id="zipCode" className="mt-1" {...register('zipCode')} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="street">Street / area</Label>
              <Input id="street" className="mt-1" {...register('street')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Receipt className="h-5 w-5 text-indigo-600" />
              Tax information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="gst">GST number</Label>
              <Input id="gst" className="mt-1" placeholder="22AAAAA0000A1Z5" {...register('gst')} />
            </div>
            <div>
              <Label htmlFor="pan">PAN number</Label>
              <Input id="pan" className="mt-1" placeholder="ABCDE1234F" {...register('pan')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-5 w-5 text-indigo-600" />
              SEO (Google search)
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <Label htmlFor="seoTitle">SEO title</Label>
              <Input
                id="seoTitle"
                className="mt-1"
                placeholder="Company name | City services"
                {...register('seoTitle')}
              />
            </div>
            <div>
              <Label htmlFor="seoDescription">SEO description</Label>
              <Textarea
                id="seoDescription"
                rows={2}
                className="mt-1"
                placeholder="Short description for Google results"
                {...register('seoDescription')}
              />
            </div>
            <div>
              <Label htmlFor="seoKeywords">Keywords</Label>
              <Input
                id="seoKeywords"
                className="mt-1"
                placeholder="salon, haircut, delhi (comma separated)"
                {...register('seoKeywords')}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={savingCompany}>
          {savingCompany ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {savingCompany ? 'Saving...' : 'Save company & SEO'}
        </Button>
      </form>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="h-5 w-5 text-indigo-600" />
            Branding
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div
              className={cn(
                'flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border bg-gray-50 dark:bg-gray-900',
              )}
            >
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt="Company logo" className="h-full w-full object-contain p-2" />
              ) : (
                <ImagePlus className="h-8 w-8 text-gray-300" />
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Logo website navbar aur footer pe dikhega. PNG/JPG, max ~2.5MB.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploadingLogo}
                  onClick={() => logoRef.current?.click()}
                >
                  {uploadingLogo ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UploadCloud className="h-4 w-4" />
                  )}
                  {uploadingLogo ? 'Uploading...' : 'Upload logo'}
                </Button>
                {logo ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={async () => {
                      try {
                        await api.put('/api/dashboard/company-branding', { logo: '' });
                        setLogo('');
                        toast.success('Logo removed');
                      } catch {
                        toast.error('Could not remove logo');
                      }
                    }}
                  >
                    Remove
                  </Button>
                ) : null}
              </div>
              <input
                ref={logoRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => handleLogoUpload(e.target.files?.[0])}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3 border-t pt-5">
            <div>
              <Label htmlFor="primaryColor">Brand color</Label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  id="primaryColor"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded border border-gray-200 bg-white p-1"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-32 font-mono uppercase"
                />
              </div>
            </div>
            <Button type="button" onClick={saveBrandColor} disabled={savingBrand}>
              {savingBrand ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save color
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Share2 className="h-5 w-5 text-indigo-600" />
            Social links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSocialSubmit(onSocialSubmit)}
            className="grid gap-4 sm:grid-cols-2"
          >
            {(
              [
                ['facebook', 'Facebook URL'],
                ['instagram', 'Instagram URL'],
                ['youtube', 'YouTube URL'],
                ['twitter', 'Twitter / X URL'],
                ['linkedin', 'LinkedIn URL'],
                ['whatsapp', 'WhatsApp number or link'],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <Label htmlFor={key}>{label}</Label>
                <Input id={key} className="mt-1" {...registerSocial(key)} />
              </div>
            ))}
            <div className="sm:col-span-2">
              <Button type="submit" disabled={savingSocial}>
                {savingSocial ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save social links
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-indigo-600" />
            Business hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {businessHours.map((item) => (
            <div
              key={item.day}
              className="grid items-center gap-3 rounded-xl border border-gray-100 p-3 sm:grid-cols-[140px_1fr_1fr_auto] dark:border-gray-800"
            >
              <p className="font-medium text-gray-900 dark:text-white">{item.day}</p>
              <Input
                type="time"
                value={item.open}
                disabled={item.isClosed}
                onChange={(e) => updateHour(item.day, { open: e.target.value })}
              />
              <Input
                type="time"
                value={item.close}
                disabled={item.isClosed}
                onChange={(e) => updateHour(item.day, { close: e.target.value })}
              />
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <Switch
                  checked={item.isClosed}
                  onCheckedChange={(checked) => updateHour(item.day, { isClosed: checked })}
                />
                Closed
              </label>
            </div>
          ))}
          <Button type="button" onClick={saveHours} disabled={savingHours}>
            {savingHours ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save hours
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-indigo-600" />
            Notifications & extras
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {(
            [
              ['emailNotifications', 'Email notifications', 'General email alerts'],
              ['leadNotifications', 'New lead alerts', 'Enquiry aane pe notify'],
              ['reviewNotifications', 'Review alerts', 'Nayi review pe notify'],
              ['loginAlerts', 'Login alerts', 'Naye login pe security alert'],
              ['subscriptionAlerts', 'Subscription alerts', 'Plan expiry reminders'],
            ] as const
          ).map(([key, title, hint]) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 px-4 py-3 dark:border-gray-800"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{title}</p>
                <p className="text-sm text-gray-500">{hint}</p>
              </div>
              <Switch
                checked={prefs[key]}
                onCheckedChange={(checked) =>
                  setPrefs((current) => ({ ...current, [key]: checked }))
                }
              />
            </div>
          ))}

          <div className="grid gap-4 border-t pt-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
              <Input
                id="googleAnalyticsId"
                className="mt-1"
                placeholder="G-XXXXXXXXXX"
                value={prefs.googleAnalyticsId}
                onChange={(e) =>
                  setPrefs((current) => ({ ...current, googleAnalyticsId: e.target.value }))
                }
              />
            </div>
          </div>

          <Button type="button" onClick={savePrefs} disabled={savingPrefs}>
            {savingPrefs ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save preferences
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5 text-indigo-600" />
            Custom Domain
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">
            Link your own domain (e.g., www.yourcompany.com) to your page.
          </p>
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1 w-full">
              <Label htmlFor="domainInput">Domain Name</Label>
              <Input
                id="domainInput"
                placeholder="www.yourdomain.com"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                disabled={customDomainStatus === 'pending' || customDomainStatus === 'active'}
                className="mt-1"
              />
            </div>
            {(customDomainStatus === 'none' || customDomainStatus === 'failed') && (
              <Button
                type="button"
                disabled={!customDomain || requestingDomain}
                onClick={async () => {
                  try {
                    setRequestingDomain(true);
                    await api.patch(`/api/companies/me`, {
                      customDomain,
                      customDomainStatus: 'pending'
                    });
                    setCustomDomainStatus('pending');
                    toast.success('Custom domain requested! Admin will review shortly.');
                  } catch {
                    toast.error('Failed to request custom domain.');
                  } finally {
                    setRequestingDomain(false);
                  }
                }}
              >
                {requestingDomain ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Request Domain
              </Button>
            )}
          </div>
          {customDomainStatus === 'pending' && (
            <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm">
              Your custom domain request is <strong>Pending</strong>. Please wait for the admin to configure it or contact support.
            </div>
          )}
          {customDomainStatus === 'active' && (
            <div className="mt-4 p-3 bg-green-50 text-green-800 rounded-md text-sm">
              Your custom domain is <strong>Active</strong>! You can now access your site at <strong>{customDomain}</strong>.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
