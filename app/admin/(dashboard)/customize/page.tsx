'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import api from '@/services/api';
import { setPlatformBranding } from '@/hooks/usePlatformBranding';

export default function CustomizePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');
  const [settings, setSettings] = useState<any>({
    heroConfig: { title: '', subtitle: '', primaryCtaText: '', primaryCtaLink: '', secondaryCtaText: '', secondaryCtaLink: '' },
    themeConfig: { logoText: '', logoImage: '', primaryColor: '', secondaryColor: '' },
    featureToggles: { showFeatures: true, showHowItWorks: true, showTemplates: true, showPricing: true, showTestimonials: true, showFAQ: true },
    seoConfig: { title: '', description: '' },
    featuresConfig: { title: '', subtitle: '', items: [] },
    howItWorksConfig: { title: '', subtitle: '', items: [] },
    pricingConfig: { title: '', subtitle: '', items: [] },
    faqConfig: { title: '', subtitle: '', items: [] },
    testimonialsConfig: { title: '', items: [] },
    contactConfig: { email: '', phone: '', address: '' },
    footerConfig: { copyrightText: '', facebookLink: '', twitterLink: '', instagramLink: '', linkedinLink: '' }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/api/admin/settings');
      if (data.success && data.data) {
        const d = data.data;
        setSettings({
          ...settings,
          ...d,
          themeConfig: d.themeConfig || { logoText: 'TenantHub', logoImage: '', primaryColor: '#4f46e5', secondaryColor: '#ec4899' },
          contactConfig: d.contactConfig || { email: 'hello@tenanthub.com', phone: '+1 (555) 123-4567', address: '123 SaaS Street, San Francisco, CA' },
          featuresConfig: {
            title: d.featuresConfig?.title || 'Everything You Need to Grow',
            subtitle: d.featuresConfig?.subtitle || 'Powerful features designed to help businesses create, manage, and scale their online presence.',
            items: d.featuresConfig?.items?.length > 0 ? d.featuresConfig.items : [
              { icon: 'Globe', title: 'Dynamic Website Builder', description: 'Create stunning landing pages with drag-and-drop sections. No coding required.' },
              { icon: 'BarChart3', title: 'Advanced Analytics', description: 'Track visitors, leads, and conversions with real-time analytics dashboards.' },
              { icon: 'Shield', title: 'Enterprise Security', description: 'JWT authentication, rate limiting, and XSS protection built-in.' },
              { icon: 'Zap', title: 'Lightning Fast', description: 'Optimized with Next.js server components, caching, and image optimization.' },
              { icon: 'Users', title: 'Lead Management', description: 'Capture, manage, and export leads with automated email notifications.' },
              { icon: 'Palette', title: 'Custom Themes', description: 'Customize colors, fonts, and branding to match your business identity.' },
              { icon: 'Search', title: 'Company Directory', description: 'Get discovered by customers searching by category, location, and ratings.' },
              { icon: 'MessageSquare', title: 'Review System', description: 'Collect and manage customer reviews with approval workflows.' },
            ]
          },
          howItWorksConfig: {
            title: d.howItWorksConfig?.title || 'How It Works',
            subtitle: d.howItWorksConfig?.subtitle || 'Get your business online in three simple steps',
            items: d.howItWorksConfig?.items?.length > 0 ? d.howItWorksConfig.items : [
              { step: '01', title: 'Register Your Company', description: 'Sign up with your business details, logo, and category in under 2 minutes.' },
              { step: '02', title: 'Customize Your Page', description: 'Use our website builder to edit sections, add products, services, and gallery.' },
              { step: '03', title: 'Go Live & Grow', description: 'Publish your landing page, get discovered, and start receiving leads.' },
            ]
          },
          pricingConfig: {
            title: d.pricingConfig?.title || 'Simple, Transparent Pricing',
            subtitle: d.pricingConfig?.subtitle || 'Start free and scale as you grow',
            items: d.pricingConfig?.items?.length > 0 ? d.pricingConfig.items : [
              { name: 'Free', price: '0', description: 'Perfect for getting started', popular: false, ctaText: 'Get Started', features: ['Basic landing page', 'Subdomain included', '1 Product / Service', 'Community support'] },
              { name: 'Starter', price: '19', description: 'Great for small businesses', popular: false, ctaText: 'Get Started', features: ['Custom domain', '5 Products / Services', 'Basic analytics', 'Email support'] },
              { name: 'Professional', price: '49', description: 'For growing companies', popular: true, ctaText: 'Get Started', features: ['Unlimited products', 'Advanced analytics', 'Custom branding', 'Priority support', 'API access'] },
              { name: 'Enterprise', price: '99', description: 'For large scale operations', popular: false, ctaText: 'Contact Sales', features: ['Multiple users', 'White-labeling', 'Dedicated account manager', '24/7 phone support', 'Custom integrations'] },
            ]
          },
          faqConfig: {
            title: d.faqConfig?.title || 'Frequently Asked Questions',
            subtitle: d.faqConfig?.subtitle || '',
            items: d.faqConfig?.items?.length > 0 ? d.faqConfig.items : [
              { question: 'How quickly can I set up my landing page?', answer: 'You can have a professional landing page live in under 10 minutes. Register your company, customize sections, and publish.' },
              { question: 'Can I use my own domain?', answer: 'Yes! Starter plans and above include custom domain support. Connect your domain in the settings dashboard.' },
              { question: 'Is there a free plan available?', answer: 'Absolutely. Our free plan includes a basic landing page, up to 5 products, 3 services, and basic analytics.' },
              { question: 'How does lead management work?', answer: 'When customers submit enquiries through your landing page, leads are saved to your dashboard with email notifications.' },
              { question: 'Can customers leave reviews?', answer: 'Yes. Registered customers can leave reviews with ratings and images. You approve reviews before they appear publicly.' },
            ]
          },
          testimonialsConfig: {
            title: d.testimonialsConfig?.title || 'Loved by Businesses Worldwide',
            items: d.testimonialsConfig?.items?.length > 0 ? d.testimonialsConfig.items : [
              { name: 'Sarah Johnson', role: 'CEO, TechStart Inc.', content: 'TenantHub transformed our online presence. We went from zero to a professional landing page in under an hour.', rating: 5, initials: 'SJ' },
              { name: 'Michael Chen', role: 'Founder, GreenLeaf Services', content: 'The lead management system alone has increased our conversions by 40%. Highly recommended for any business.', rating: 5, initials: 'MC' },
              { name: 'Emily Rodriguez', role: 'Marketing Director, Bloom Studio', content: 'Beautiful templates, easy customization, and the analytics dashboard gives us insights we never had before.', rating: 5, initials: 'ER' },
            ]
          },
          footerConfig: d.footerConfig || { copyrightText: '© 2026 TenantHub Inc. All rights reserved.', facebookLink: '#', twitterLink: '#', instagramLink: '#', linkedinLink: '#' },
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) return;
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put('/api/admin/settings', settings);
      setPlatformBranding(settings.themeConfig);
      toast.success('Website settings updated successfully');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) return;
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSection = (section: string, key: string, value: any) => {
    setSettings((s: any) => ({ ...s, [section]: { ...s[section], [key]: value } }));
  };

  const updateItem = (section: string, index: number, key: string, value: any) => {
    setSettings((s: any) => {
      const newItems = [...(s[section].items || [])];
      newItems[index] = { ...newItems[index], [key]: value };
      return { ...s, [section]: { ...s[section], items: newItems } };
    });
  };

  const addItem = (section: string, defaultItem: any) => {
    setSettings((s: any) => ({
      ...s,
      [section]: { ...s[section], items: [...(s[section].items || []), defaultItem] }
    }));
  };

  const removeItem = (section: string, index: number) => {
    setSettings((s: any) => {
      const newItems = [...(s[section].items || [])];
      newItems.splice(index, 1);
      return { ...s, [section]: { ...s[section], items: newItems } };
    });
  };

  if (isLoading) return <div className="p-8 flex items-center justify-center">Loading settings...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Website Customization</h1>
          <p className="text-muted-foreground">Manage all global content, sections, and features.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div>
        <div className="flex space-x-1 border-b mb-6 overflow-x-auto pb-1">
          {['hero', 'theme', 'toggles', 'features', 'howItWorks', 'pricing', 'faq', 'testimonials', 'contact', 'footer', 'seo'].map(tab => (
            <button 
              key={tab}
              className={`px-4 py-2 font-medium whitespace-nowrap capitalize ${activeTab === tab ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.replace(/([A-Z])/g, ' $1').trim()}
            </button>
          ))}
        </div>

        {activeTab === 'hero' && (
          <Card>
            <CardHeader>
              <CardTitle>Hero Configuration</CardTitle>
              <CardDescription>Update the main headline and calls to action.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Main Title</Label>
                <Input value={settings.heroConfig.title} onChange={e => updateSection('heroConfig', 'title', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Textarea value={settings.heroConfig.subtitle} onChange={e => updateSection('heroConfig', 'subtitle', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary CTA Text</Label>
                  <Input value={settings.heroConfig.primaryCtaText} onChange={e => updateSection('heroConfig', 'primaryCtaText', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Primary CTA Link</Label>
                  <Input value={settings.heroConfig.primaryCtaLink} onChange={e => updateSection('heroConfig', 'primaryCtaLink', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Secondary CTA Text</Label>
                  <Input value={settings.heroConfig.secondaryCtaText} onChange={e => updateSection('heroConfig', 'secondaryCtaText', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Secondary CTA Link</Label>
                  <Input value={settings.heroConfig.secondaryCtaLink} onChange={e => updateSection('heroConfig', 'secondaryCtaLink', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'theme' && (
          <Card>
            <CardHeader>
              <CardTitle>Theme & Branding</CardTitle>
              <CardDescription>Customize the global colors and logo text.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 max-w-md">
                <Label>Website Name (Logo Text)</Label>
                <Input value={settings.themeConfig.logoText} onChange={e => updateSection('themeConfig', 'logoText', e.target.value)} placeholder="Leave empty to hide text" />
                <p className="text-xs text-muted-foreground">Clear this if your logo image already contains your brand name.</p>
              </div>
              <div className="space-y-2 max-w-md">
                <Label>Upload Logo Image</Label>
                <div className="flex items-center gap-4">
                  {settings.themeConfig.logoImage && (
                    <div className="h-12 w-12 rounded-lg border bg-gray-50 flex items-center justify-center overflow-hidden">
                      <img src={settings.themeConfig.logoImage} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                    </div>
                  )}
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          updateSection('themeConfig', 'logoImage', reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                  {settings.themeConfig.logoImage && (
                    <Button variant="outline" size="sm" onClick={() => updateSection('themeConfig', 'logoImage', '')}>
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Upload your brand logo (PNG, JPG, SVG). It will be saved securely.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Color (Hex)</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={settings.themeConfig.primaryColor} onChange={e => updateSection('themeConfig', 'primaryColor', e.target.value)} className="w-16 p-1" />
                    <Input value={settings.themeConfig.primaryColor} onChange={e => updateSection('themeConfig', 'primaryColor', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color (Hex)</Label>
                  <div className="flex gap-2">
                    <Input type="color" value={settings.themeConfig.secondaryColor} onChange={e => updateSection('themeConfig', 'secondaryColor', e.target.value)} className="w-16 p-1" />
                    <Input value={settings.themeConfig.secondaryColor} onChange={e => updateSection('themeConfig', 'secondaryColor', e.target.value)} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'contact' && (
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Update the public contact details shown on the website.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Support Email</Label>
                <Input value={settings.contactConfig.email} onChange={e => updateSection('contactConfig', 'email', e.target.value)} type="email" placeholder="hello@tenanthub.com" />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input value={settings.contactConfig.phone} onChange={e => updateSection('contactConfig', 'phone', e.target.value)} placeholder="+1 (555) 123-4567" />
              </div>
              <div className="space-y-2">
                <Label>Physical Address</Label>
                <Input value={settings.contactConfig.address} onChange={e => updateSection('contactConfig', 'address', e.target.value)} placeholder="123 SaaS Street, San Francisco, CA" />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'toggles' && (
          <Card>
            <CardHeader>
              <CardTitle>Section Toggles</CardTitle>
              <CardDescription>Show or hide specific sections on the landing page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(settings.featureToggles).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base cursor-pointer" htmlFor={key}>{key.replace('show', '')}</Label>
                    <p className="text-sm text-muted-foreground">Toggle visibility on the main landing page.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    id={key}
                    checked={value as boolean} 
                    onChange={(e) => updateSection('featureToggles', key, e.target.checked)} 
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeTab === 'features' && (
          <Card>
            <CardHeader>
              <CardTitle>Features Content</CardTitle>
              <CardDescription>Customize the features section title and items.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Section Title</Label>
                  <Input value={settings.featuresConfig.title} onChange={e => updateSection('featuresConfig', 'title', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Section Subtitle</Label>
                  <Input value={settings.featuresConfig.subtitle} onChange={e => updateSection('featuresConfig', 'subtitle', e.target.value)} />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Feature Items</h3>
                  <Button size="sm" variant="outline" onClick={() => addItem('featuresConfig', { title: 'New Feature', description: 'Description', icon: 'Star' })}>
                    <Plus className="h-4 w-4 mr-2" /> Add Feature
                  </Button>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {settings.featuresConfig.items.map((item: any, idx: number) => (
                    <div key={idx} className="border p-4 rounded-lg relative bg-gray-50 dark:bg-gray-900">
                      <Button size="icon" variant="destructive" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeItem('featuresConfig', idx)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="space-y-3 mt-2">
                        <div>
                          <Label className="text-xs">Title</Label>
                          <Input value={item.title} onChange={e => updateItem('featuresConfig', idx, 'title', e.target.value)} className="h-8" />
                        </div>
                        <div>
                          <Label className="text-xs">Icon (Lucide Name)</Label>
                          <Input value={item.icon} onChange={e => updateItem('featuresConfig', idx, 'icon', e.target.value)} className="h-8" />
                        </div>
                        <div>
                          <Label className="text-xs">Description</Label>
                          <Textarea value={item.description} onChange={e => updateItem('featuresConfig', idx, 'description', e.target.value)} className="h-16 text-sm" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'howItWorks' && (
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>Customize the 3 steps of How It Works.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Section Title</Label>
                  <Input value={settings.howItWorksConfig.title} onChange={e => updateSection('howItWorksConfig', 'title', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Section Subtitle</Label>
                  <Input value={settings.howItWorksConfig.subtitle} onChange={e => updateSection('howItWorksConfig', 'subtitle', e.target.value)} />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Steps</h3>
                  <Button size="sm" variant="outline" onClick={() => addItem('howItWorksConfig', { step: '0' + (settings.howItWorksConfig.items.length + 1), title: 'New Step', description: 'Description' })}>
                    <Plus className="h-4 w-4 mr-2" /> Add Step
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {settings.howItWorksConfig.items.map((item: any, idx: number) => (
                    <div key={idx} className="border p-4 rounded-lg relative bg-gray-50 dark:bg-gray-900">
                      <Button size="icon" variant="destructive" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeItem('howItWorksConfig', idx)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="space-y-3 mt-2">
                        <div>
                          <Label className="text-xs">Step #</Label>
                          <Input value={item.step} onChange={e => updateItem('howItWorksConfig', idx, 'step', e.target.value)} className="h-8" />
                        </div>
                        <div>
                          <Label className="text-xs">Title</Label>
                          <Input value={item.title} onChange={e => updateItem('howItWorksConfig', idx, 'title', e.target.value)} className="h-8" />
                        </div>
                        <div>
                          <Label className="text-xs">Description</Label>
                          <Textarea value={item.description} onChange={e => updateItem('howItWorksConfig', idx, 'description', e.target.value)} className="h-16 text-sm" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'pricing' && (
          <Card>
            <CardHeader>
              <CardTitle>Pricing Plans</CardTitle>
              <CardDescription>Manage your subscription plans.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Section Title</Label>
                  <Input value={settings.pricingConfig.title} onChange={e => updateSection('pricingConfig', 'title', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Section Subtitle</Label>
                  <Input value={settings.pricingConfig.subtitle} onChange={e => updateSection('pricingConfig', 'subtitle', e.target.value)} />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Plans</h3>
                  <Button size="sm" variant="outline" onClick={() => addItem('pricingConfig', { name: 'New Plan', price: '99', description: '', ctaText: 'Get Started', features: [], popular: false })}>
                    <Plus className="h-4 w-4 mr-2" /> Add Plan
                  </Button>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {settings.pricingConfig.items.map((plan: any, idx: number) => (
                    <div key={idx} className="border p-4 rounded-lg relative bg-gray-50 dark:bg-gray-900">
                      <Button size="icon" variant="destructive" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeItem('pricingConfig', idx)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="space-y-3 mt-2">
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <Label className="text-xs">Plan Name</Label>
                            <Input value={plan.name} onChange={e => updateItem('pricingConfig', idx, 'name', e.target.value)} className="h-8" />
                          </div>
                          <div className="w-24">
                            <Label className="text-xs">Price ($)</Label>
                            <Input value={plan.price} onChange={e => updateItem('pricingConfig', idx, 'price', e.target.value)} className="h-8" />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Description</Label>
                          <Input value={plan.description} onChange={e => updateItem('pricingConfig', idx, 'description', e.target.value)} className="h-8" />
                        </div>
                        <div>
                          <Label className="text-xs">Features (comma separated)</Label>
                          <Textarea 
                            value={plan.features ? plan.features.join(', ') : ''} 
                            onChange={e => updateItem('pricingConfig', idx, 'features', e.target.value.split(',').map((s: string) => s.trim()))} 
                            className="h-16 text-sm" 
                            placeholder="Feature 1, Feature 2"
                          />
                        </div>
                        <div className="flex gap-4 items-center">
                          <div className="flex-1">
                            <Label className="text-xs">Button Text</Label>
                            <Input value={plan.ctaText} onChange={e => updateItem('pricingConfig', idx, 'ctaText', e.target.value)} className="h-8" />
                          </div>
                          <div className="flex items-center gap-2 mt-4">
                            <input 
                              type="checkbox" 
                              checked={plan.popular} 
                              onChange={e => updateItem('pricingConfig', idx, 'popular', e.target.checked)}
                              className="w-4 h-4"
                            />
                            <Label className="text-xs mb-0">Popular?</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'faq' && (
          <Card>
            <CardHeader>
              <CardTitle>FAQs</CardTitle>
              <CardDescription>Manage frequently asked questions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Section Title</Label>
                  <Input value={settings.faqConfig.title} onChange={e => updateSection('faqConfig', 'title', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Section Subtitle</Label>
                  <Input value={settings.faqConfig.subtitle} onChange={e => updateSection('faqConfig', 'subtitle', e.target.value)} />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Questions & Answers</h3>
                  <Button size="sm" variant="outline" onClick={() => addItem('faqConfig', { question: 'New Question?', answer: 'Answer here.' })}>
                    <Plus className="h-4 w-4 mr-2" /> Add FAQ
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {settings.faqConfig.items.map((item: any, idx: number) => (
                    <div key={idx} className="border p-4 rounded-lg relative bg-gray-50 dark:bg-gray-900">
                      <Button size="icon" variant="destructive" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeItem('faqConfig', idx)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="space-y-3 mt-2 mr-8">
                        <div>
                          <Label className="text-xs">Question</Label>
                          <Input value={item.question} onChange={e => updateItem('faqConfig', idx, 'question', e.target.value)} className="h-8 font-medium" />
                        </div>
                        <div>
                          <Label className="text-xs">Answer</Label>
                          <Textarea value={item.answer} onChange={e => updateItem('faqConfig', idx, 'answer', e.target.value)} className="h-16 text-sm" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'testimonials' && (
          <Card>
            <CardHeader>
              <CardTitle>Testimonials</CardTitle>
              <CardDescription>Manage customer reviews and testimonials.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2 max-w-md">
                <Label>Section Title</Label>
                <Input value={settings.testimonialsConfig.title} onChange={e => updateSection('testimonialsConfig', 'title', e.target.value)} />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Reviews</h3>
                  <Button size="sm" variant="outline" onClick={() => addItem('testimonialsConfig', { name: 'John Doe', role: 'Customer', content: 'Great service!', rating: 5, initials: 'JD' })}>
                    <Plus className="h-4 w-4 mr-2" /> Add Testimonial
                  </Button>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {settings.testimonialsConfig.items.map((item: any, idx: number) => (
                    <div key={idx} className="border p-4 rounded-lg relative bg-gray-50 dark:bg-gray-900">
                      <Button size="icon" variant="destructive" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeItem('testimonialsConfig', idx)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="space-y-3 mt-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs">Name</Label>
                            <Input value={item.name} onChange={e => updateItem('testimonialsConfig', idx, 'name', e.target.value)} className="h-8" />
                          </div>
                          <div>
                            <Label className="text-xs">Role / Company</Label>
                            <Input value={item.role} onChange={e => updateItem('testimonialsConfig', idx, 'role', e.target.value)} className="h-8" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs">Initials</Label>
                            <Input value={item.initials} onChange={e => updateItem('testimonialsConfig', idx, 'initials', e.target.value)} className="h-8" />
                          </div>
                          <div>
                            <Label className="text-xs">Rating (1-5)</Label>
                            <Input type="number" min="1" max="5" value={item.rating} onChange={e => updateItem('testimonialsConfig', idx, 'rating', parseInt(e.target.value) || 5)} className="h-8" />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Review Content</Label>
                          <Textarea value={item.content} onChange={e => updateItem('testimonialsConfig', idx, 'content', e.target.value)} className="h-16 text-sm" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'footer' && (
          <Card>
            <CardHeader>
              <CardTitle>Footer & Social Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Copyright Text</Label>
                <Input value={settings.footerConfig.copyrightText} onChange={e => updateSection('footerConfig', 'copyrightText', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Facebook URL (use # to hide)</Label>
                  <Input value={settings.footerConfig.facebookLink} onChange={e => updateSection('footerConfig', 'facebookLink', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Twitter URL (use # to hide)</Label>
                  <Input value={settings.footerConfig.twitterLink} onChange={e => updateSection('footerConfig', 'twitterLink', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Instagram URL (use # to hide)</Label>
                  <Input value={settings.footerConfig.instagramLink} onChange={e => updateSection('footerConfig', 'instagramLink', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>LinkedIn URL (use # to hide)</Label>
                  <Input value={settings.footerConfig.linkedinLink} onChange={e => updateSection('footerConfig', 'linkedinLink', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'seo' && (
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>Global meta tags for search engines.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Meta Title</Label>
                <Input value={settings.seoConfig.title} onChange={e => updateSection('seoConfig', 'title', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea value={settings.seoConfig.description} onChange={e => updateSection('seoConfig', 'description', e.target.value)} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
