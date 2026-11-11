// @ts-nocheck
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '@/lib/db';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

let seoTablesInitialized = false;

// List of all platform themes available in components/themes
export const PLATFORM_THEMES = [
  { slug: 'bold-launch', name: 'Bold Launch Theme', category: 'Business & Startups', desc: 'High-impact, modern visual design for fast-moving startups and enterprise brands.' },
  { slug: 'carpenter-works', name: 'Carpenter & Furniture Theme', category: 'Carpenter & Woodwork', desc: 'Artisan woodwork, custom furniture manufacturers, and interior carpentry specialists.' },
  { slug: 'clean-presence', name: 'Clean Presence Theme', category: 'Corporate & Legal', desc: 'Minimalist, crisp, and trustworthy layout for professional services and corporate agencies.' },
  { slug: 'creative-studio', name: 'Creative Studio Theme', category: 'Design & Media', desc: 'Vibrant, portfolio-driven theme for design studios, photographers, and creative agencies.' },
  { slug: 'elegant-serif', name: 'Elegant Serif Theme', category: 'Luxury & Boutiques', desc: 'Luxury, heritage, boutique hotels, jewelry, and high-end fashion establishments.' },
  { slug: 'herbal-cosmetics', name: 'Herbal & Organic Theme', category: 'Beauty & Wellness', desc: 'Natural wellness, ayurvedic, skincare, and organic beauty brands.' },
  { slug: 'neon-dark', name: 'Neon Dark Theme', category: 'Tech & Gaming', desc: 'Ultra-modern cyberpunk dark mode aesthetic for gaming, tech, nightlife, and digital innovators.' },
  { slug: 'premium-showcase', name: 'Premium Showcase Theme', category: 'E-commerce & Showrooms', desc: 'Multi-product catalog and enterprise showroom with interactive product galleries.' },
  { slug: 'royal-glow', name: 'Royal Glow Theme', category: 'Bridal & Salon', desc: 'Regal aesthetics, bridal, wedding planners, fine jewelry, and salon & spa luxury services.' },
  { slug: 'sleek-glass', name: 'Sleek Glass Theme', category: 'SaaS & IT', desc: 'Glassmorphism UI with frosted blur panels for modern SaaS, tech firms, and IT solutions.' },
  { slug: 'warm-showcase', name: 'Warm Showcase Theme', category: 'Restaurants & Food', desc: 'Inviting, warm palette for restaurants, bakeries, cafes, and hospitality businesses.' },
];

export const TOP_INDIAN_LOCATIONS = [
  { state: 'Delhi NCR', city: 'New Delhi', district: 'Central Delhi', slug: 'new-delhi' },
  { state: 'Delhi NCR', city: 'Noida', district: 'Gautam Buddha Nagar', slug: 'noida' },
  { state: 'Delhi NCR', city: 'Greater Noida', district: 'Gautam Buddha Nagar', slug: 'greater-noida' },
  { state: 'Delhi NCR', city: 'Gurugram', district: 'Gurugram', slug: 'gurugram' },
  { state: 'Delhi NCR', city: 'Faridabad', district: 'Faridabad', slug: 'faridabad' },
  { state: 'Delhi NCR', city: 'Ghaziabad', district: 'Ghaziabad', slug: 'ghaziabad' },
  { state: 'Uttar Pradesh', city: 'Lucknow', district: 'Lucknow', slug: 'lucknow' },
  { state: 'Uttar Pradesh', city: 'Agra', district: 'Agra', slug: 'agra' },
  { state: 'Uttar Pradesh', city: 'Etawah', district: 'Etawah', slug: 'etawah' },
  { state: 'Uttar Pradesh', city: 'Kanpur', district: 'Kanpur Nagar', slug: 'kanpur' },
  { state: 'Uttar Pradesh', city: 'Varanasi', district: 'Varanasi', slug: 'varanasi' },
  { state: 'Uttar Pradesh', city: 'Prayagraj', district: 'Prayagraj', slug: 'prayagraj' },
  { state: 'Maharashtra', city: 'Mumbai', district: 'Mumbai City', slug: 'mumbai' },
  { state: 'Maharashtra', city: 'Pune', district: 'Pune', slug: 'pune' },
  { state: 'Maharashtra', city: 'Nagpur', district: 'Nagpur', slug: 'nagpur' },
  { state: 'Karnataka', city: 'Bangalore', district: 'Bengaluru Urban', slug: 'bangalore' },
  { state: 'Rajasthan', city: 'Jaipur', district: 'Jaipur', slug: 'jaipur' },
  { state: 'Gujarat', city: 'Ahmedabad', district: 'Ahmedabad', slug: 'ahmedabad' },
  { state: 'West Bengal', city: 'Kolkata', district: 'Kolkata', slug: 'kolkata' },
  { state: 'Madhya Pradesh', city: 'Indore', district: 'Indore', slug: 'indore' },
];

export class SeoService {
  /**
   * Initializes all SEO tables, ensures schemas, and seeds baseline default SEO records.
   */
  static async ensureSeoTables() {
    if (seoTablesInitialized) return;

    // 1. Global SEO Settings
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS seo_global_settings (
        id VARCHAR(36) PRIMARY KEY,
        siteName VARCHAR(255) DEFAULT 'Bhartiyebazar',
        defaultTitle VARCHAR(255) DEFAULT 'Bhartiyebazar | India\\'s Leading Local Business Directory & Vyapari Platform',
        defaultDescription TEXT,
        defaultKeywords TEXT,
        defaultOgImage VARCHAR(500) DEFAULT '',
        canonicalBaseUrl VARCHAR(255) DEFAULT 'https://bhartiyebazar.com',
        twitterHandle VARCHAR(100) DEFAULT '@bhartiyebazar',
        googleSiteVerification VARCHAR(255) DEFAULT '',
        bingSiteVerification VARCHAR(255) DEFAULT '',
        googleAnalyticsId VARCHAR(100) DEFAULT '',
        googleSearchConsoleKey TEXT,
        robotsTxtContent TEXT,
        defaultIndexation ENUM('index, follow', 'noindex, follow', 'noindex, nofollow') DEFAULT 'index, follow',
        organizationSchema JSON,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 2. Polymorphic SEO Records (Category, Theme, Location, Service, Page, Custom)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS seo_records (
        id VARCHAR(36) PRIMARY KEY,
        type ENUM('category', 'theme', 'location', 'service', 'page', 'custom') NOT NULL,
        targetId VARCHAR(255) NOT NULL,
        targetName VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        urlPath VARCHAR(500) NOT NULL,
        metaTitle VARCHAR(255) NOT NULL,
        metaDescription TEXT NOT NULL,
        focusKeyword VARCHAR(255) NOT NULL,
        secondaryKeywords JSON,
        canonicalUrl VARCHAR(500),
        h1 VARCHAR(255),
        h2 VARCHAR(255),
        h3 VARCHAR(255),
        contentBody LONGTEXT,
        faqs JSON,
        schemaType VARCHAR(100) DEFAULT 'WebPage',
        customSchema JSON,
        imageAltTags JSON,
        internalLinks JSON,
        indexDirective ENUM('index, follow', 'noindex, follow', 'noindex, nofollow') DEFAULT 'index, follow',
        inSitemap BOOLEAN DEFAULT TRUE,
        sitemapPriority DECIMAL(3,2) DEFAULT 0.80,
        sitemapChangeFreq ENUM('always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never') DEFAULT 'weekly',
        status ENUM('draft', 'pending_approval', 'approved', 'published', 'rejected') DEFAULT 'published',
        seoScore INT DEFAULT 85,
        rejectionReason TEXT,
        createdByRole ENUM('super_admin', 'company_admin') DEFAULT 'super_admin',
        createdByUserId VARCHAR(36),
        approvedByUserId VARCHAR(36),
        publishedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_seo_type_slug (type, slug),
        INDEX idx_seo_type_target (type, targetId),
        INDEX idx_seo_status (status, inSitemap)
      )
    `);

    // 3. Indian Locations Master Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS seo_locations (
        id VARCHAR(36) PRIMARY KEY,
        country VARCHAR(100) DEFAULT 'India',
        state VARCHAR(100) NOT NULL,
        city VARCHAR(100) NOT NULL,
        district VARCHAR(100),
        area VARCHAR(100) DEFAULT '',
        pincode VARCHAR(20) DEFAULT '',
        slug VARCHAR(255) NOT NULL UNIQUE,
        latitude DECIMAL(10,8) DEFAULT NULL,
        longitude DECIMAL(11,8) DEFAULT NULL,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Keyword Master Bank
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS seo_keywords (
        id VARCHAR(36) PRIMARY KEY,
        keyword VARCHAR(255) NOT NULL UNIQUE,
        keywordType ENUM('primary', 'secondary', 'long_tail', 'location_based', 'service_based') DEFAULT 'primary',
        intent ENUM('informational', 'commercial', 'transactional', 'navigational') DEFAULT 'commercial',
        mappedType ENUM('category', 'theme', 'location', 'service', 'none') DEFAULT 'none',
        mappedTargetId VARCHAR(255) DEFAULT '',
        searchVolume INT DEFAULT 1200,
        difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
        notes VARCHAR(500) DEFAULT '',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 5. Reusable SEO Templates
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS seo_templates (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type ENUM('category', 'theme', 'location', 'service', 'general') NOT NULL,
        titleTemplate VARCHAR(255) NOT NULL,
        descriptionTemplate TEXT NOT NULL,
        keywordsTemplate TEXT,
        h1Template VARCHAR(255),
        contentTemplate LONGTEXT,
        faqTemplate JSON,
        isDefault BOOLEAN DEFAULT FALSE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 6. 301 / 302 Technical Redirects
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS seo_redirects (
        id VARCHAR(36) PRIMARY KEY,
        sourcePath VARCHAR(500) NOT NULL UNIQUE,
        targetPath VARCHAR(500) NOT NULL,
        statusCode INT DEFAULT 301,
        isActive BOOLEAN DEFAULT TRUE,
        hitCount INT DEFAULT 0,
        lastHitAt DATETIME DEFAULT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 7. SEO Activity & Audit Log
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS seo_activity_logs (
        id VARCHAR(36) PRIMARY KEY,
        seoRecordId VARCHAR(36),
        action VARCHAR(100) NOT NULL,
        performedByRole VARCHAR(50) DEFAULT 'super_admin',
        performedByUserId VARCHAR(36),
        details JSON,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Initialize Default Global Settings if not present
    const [globalRows] = await pool.execute<RowDataPacket[]>('SELECT id FROM seo_global_settings LIMIT 1');
    if (globalRows.length === 0) {
      const defaultRobots = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /dashboard/\nSitemap: https://bhartiyebazar.com/sitemap.xml`;
      const defaultOrgSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Bhartiyebazar',
        url: 'https://bhartiyebazar.com',
        logo: 'https://bhartiyebazar.com/logo.png',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+91-6397650818',
          contactType: 'Customer Support',
          areaServed: 'IN',
          availableLanguage: ['en', 'hi'],
        },
      };

      await pool.execute(
        `INSERT INTO seo_global_settings 
          (id, siteName, defaultTitle, defaultDescription, defaultKeywords, robotsTxtContent, organizationSchema) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          crypto.randomUUID(),
          'Bhartiyebazar',
          'Bhartiyebazar | India\'s Leading Local Business Directory & Vyapari Platform',
          'Search verified businesses, top-rated service providers, manufacturers, local vyaparis, and modern business websites across India on Bhartiyebazar.',
          'Bhartiyebazar, Indian businesses, local services, verified suppliers, B2B directory, business websites, vyapari portal, GST billing',
          defaultRobots,
          JSON.stringify(defaultOrgSchema),
        ],
      );
    }

    // Auto-sync Categories and Themes
    await this.syncCategoriesToSeo();
    await this.syncThemesToSeo();
    await this.seedLocations();
    await this.seedDefaultTemplates();

    seoTablesInitialized = true;
  }

  /**
   * Synchronizes all categories from `categories` table into `seo_records`.
   * If a category doesn't have an SEO record yet, it auto-generates one!
   */
  static async syncCategoriesToSeo() {
    try {
      const [categories] = await pool.execute<RowDataPacket[]>(
        'SELECT id, name, slug, description FROM categories WHERE isActive = 1 OR isActive IS NULL',
      );

      for (const cat of categories) {
        const catSlug = cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const [existing] = await pool.execute<RowDataPacket[]>(
          'SELECT id FROM seo_records WHERE type = "category" AND targetId = ? LIMIT 1',
          [cat.id],
        );

        if (existing.length === 0) {
          const id = crypto.randomUUID();
          const metaTitle = `Best ${cat.name} Services & Verified Companies in India | Bhartiyebazar`;
          const metaDescription = `Find top-rated, certified ${cat.name} businesses, suppliers, and service providers across India on Bhartiyebazar. Compare reviews, get instant quotes, and connect directly.`;
          const focusKeyword = `${cat.name.toLowerCase()} services`;
          const faqs = [
            {
              question: `How to find the best ${cat.name} services near me?`,
              answer: `On Bhartiyebazar, you can browse verified ${cat.name} businesses, compare customer ratings, view portfolio photos, and request instant callbacks directly on WhatsApp.`,
            },
            {
              question: `Are all ${cat.name} businesses verified on Bhartiyebazar?`,
              answer: `Yes, Bhartiyebazar conducts phone and credential verification for listed merchants to ensure genuine and trustworthy service delivery.`,
            },
          ];
          const schema = {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `${cat.name} Directory`,
            description: metaDescription,
            url: `https://bhartiyebazar.com/category/${catSlug}`,
          };

          await pool.execute(
            `INSERT INTO seo_records 
              (id, type, targetId, targetName, slug, urlPath, metaTitle, metaDescription, focusKeyword, 
               secondaryKeywords, canonicalUrl, h1, h2, h3, contentBody, faqs, customSchema, inSitemap, sitemapPriority, status, seoScore)
             VALUES (?, 'category', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0.90, 'published', 92)`,
            [
              id,
              cat.id,
              cat.name,
              catSlug,
              `/category/${catSlug}`,
              metaTitle,
              metaDescription,
              focusKeyword,
              JSON.stringify([`${cat.name.toLowerCase()} near me`, `top ${cat.name.toLowerCase()}`, `verified ${cat.name.toLowerCase()}`]),
              `https://bhartiyebazar.com/category/${catSlug}`,
              `Top-Rated ${cat.name} Services in India`,
              `Verified ${cat.name} Providers with Customer Reviews`,
              `Book Genuine ${cat.name} Professionals Online`,
              `<p>Looking for reliable, professional <strong>${cat.name}</strong> services? Bhartiyebazar connects you with certified merchants, top-rated local experts, and leading companies across all Indian cities.</p>`,
              JSON.stringify(faqs),
              JSON.stringify(schema),
            ],
          );
        }
      }
    } catch (e) {
      console.error('syncCategoriesToSeo error:', e);
    }
  }

  /**
   * Synchronizes all Platform Themes into `seo_records`.
   * Automatically assigns SEO metadata and ensures theme URLs are sitemap ready!
   */
  static async syncThemesToSeo() {
    try {
      for (const theme of PLATFORM_THEMES) {
        const [existing] = await pool.execute<RowDataPacket[]>(
          'SELECT id FROM seo_records WHERE type = "theme" AND targetId = ? LIMIT 1',
          [theme.slug],
        );

        if (existing.length === 0) {
          const id = crypto.randomUUID();
          const metaTitle = `${theme.name} - Modern ${theme.category} Website Template | Bhartiyebazar`;
          const metaDescription = `Explore ${theme.name} for ${theme.category}. 100% mobile-responsive, lightning fast, SEO-optimized theme with built-in WhatsApp inquiry, booking engine, and catalog.`;
          const focusKeyword = `${theme.slug.replace(/-/g, ' ')} template`;
          const faqs = [
            {
              question: `Is the ${theme.name} mobile friendly?`,
              answer: `Yes, ${theme.name} is built on a responsive mobile-first grid, ensuring ultra-fast loading and smooth user experience across smartphones, tablets, and desktops.`,
            },
            {
              question: `Does ${theme.name} include WhatsApp order & inquiry buttons?`,
              answer: `Yes, all Bhartiyebazar themes come pre-configured with 1-click WhatsApp customer contact, instant lead alerts, and inquiry forms.`,
            },
          ];
          const schema = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: theme.name,
            description: theme.desc,
            brand: { '@type': 'Brand', name: 'Bhartiyebazar' },
            category: theme.category,
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'INR',
              availability: 'https://schema.org/InStock',
            },
          };

          await pool.execute(
            `INSERT INTO seo_records 
              (id, type, targetId, targetName, slug, urlPath, metaTitle, metaDescription, focusKeyword, 
               secondaryKeywords, canonicalUrl, h1, h2, h3, contentBody, faqs, customSchema, inSitemap, sitemapPriority, status, seoScore)
             VALUES (?, 'theme', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0.85, 'published', 95)`,
            [
              id,
              theme.slug,
              theme.name,
              theme.slug,
              `/themes/${theme.slug}`,
              metaTitle,
              metaDescription,
              focusKeyword,
              JSON.stringify([`${theme.category} website theme`, `${theme.slug} design`, 'responsive business website theme']),
              `https://bhartiyebazar.com/themes/${theme.slug}`,
              `${theme.name} - Premium ${theme.category} Theme`,
              `Designed for High Conversions & Local Search Visibility`,
              `Ready-to-Deploy Architecture with Lead Generation`,
              `<p>${theme.desc} Launch your company with this high-converting, Google-optimized theme that includes fast loading, verified trust badges, and interactive customer inquiry tools.</p>`,
              JSON.stringify(faqs),
              JSON.stringify(schema),
            ],
          );
        }
      }
    } catch (e) {
      console.error('syncThemesToSeo error:', e);
    }
  }

  /**
   * Seeds major Indian cities & states if `seo_locations` is empty.
   */
  static async seedLocations() {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>('SELECT id FROM seo_locations LIMIT 1');
      if (rows.length === 0) {
        for (const loc of TOP_INDIAN_LOCATIONS) {
          await pool.execute(
            `INSERT INTO seo_locations (id, country, state, city, district, slug) VALUES (?, 'India', ?, ?, ?, ?)`,
            [crypto.randomUUID(), loc.state, loc.city, loc.district, loc.slug],
          );
        }
      }
    } catch (e) {
      console.error('seedLocations error:', e);
    }
  }

  /**
   * Seeds default SEO templates for Category, Theme, and Location bulk generation.
   */
  static async seedDefaultTemplates() {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>('SELECT id FROM seo_templates LIMIT 1');
      if (rows.length === 0) {
        // Location Template
        await pool.execute(
          `INSERT INTO seo_templates 
            (id, name, type, titleTemplate, descriptionTemplate, keywordsTemplate, h1Template, contentTemplate, faqTemplate, isDefault)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [
            crypto.randomUUID(),
            'Standard Location & City SEO Template',
            'location',
            'Best {category} Services in {city}, {state} | Top Rated & Verified - Bhartiyebazar',
            'Looking for trusted {category} in {city}, {state}? Connect with verified professionals, read real customer reviews, compare rates, and get instant quotes on WhatsApp.',
            '{category} in {city}, best {category} {city}, {category} service {city} {state}, top {category} near me',
            'Verified {category} Services in {city}, {state}',
            '<p>Find genuine, top-rated <strong>{category}</strong> specialists in <strong>{city}</strong>. Verified by Bhartiyebazar for reliable on-time service and transparent pricing.</p>',
            JSON.stringify([
              { question: 'How quickly can I hire {category} in {city}?', answer: 'You can connect instantly with verified {category} merchants in {city} on WhatsApp and book same-day consultation.' },
              { question: 'What are the charges for {category} in {city}?', answer: 'Pricing depends on your specific scope. Request direct quotes from listed merchants to get competitive rates.' },
            ]),
          ],
        );
      }
    } catch (e) {
      console.error('seedDefaultTemplates error:', e);
    }
  }

  /**
   * Calculates comprehensive SEO Health Score (0 - 100).
   */
  static calculateSeoScore(record: {
    metaTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
    h1?: string;
    contentBody?: string;
    faqs?: any[];
    customSchema?: any;
    canonicalUrl?: string;
  }): number {
    let score = 0;
    const title = (record.metaTitle || '').trim();
    const desc = (record.metaDescription || '').trim();
    const kw = (record.focusKeyword || '').toLowerCase().trim();
    const h1 = (record.h1 || '').trim();
    const content = (record.contentBody || '').toLowerCase();

    // 1. Title Length & Focus Keyword (25 pts)
    if (title.length >= 35 && title.length <= 65) score += 15;
    else if (title.length > 20) score += 8;
    if (kw && title.toLowerCase().includes(kw)) score += 10;

    // 2. Meta Description Length & Keyword (25 pts)
    if (desc.length >= 110 && desc.length <= 165) score += 15;
    else if (desc.length >= 60) score += 8;
    if (kw && desc.toLowerCase().includes(kw)) score += 10;

    // 3. Heading H1 Presence & Keyword (15 pts)
    if (h1.length > 5) score += 8;
    if (kw && h1.toLowerCase().includes(kw)) score += 7;

    // 4. Content Body & Keyword Depth (15 pts)
    if (content.length > 200) score += 10;
    else if (content.length > 50) score += 5;
    if (kw && content.includes(kw)) score += 5;

    // 5. Schema Markup (10 pts)
    if (record.customSchema && Object.keys(record.customSchema).length > 0) score += 10;

    // 6. FAQs for Google Rich Snippets (10 pts)
    const faqs = Array.isArray(record.faqs) ? record.faqs : [];
    if (faqs.length >= 2) score += 10;
    else if (faqs.length === 1) score += 5;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * AI-Powered SEO Generator:
   * Generates highly optimized Meta Title, Description, Keywords, H1-H3, Rich Content, and FAQs.
   */
  static generateAiSeoContent(params: {
    type: string;
    name: string;
    focusKeyword?: string;
    location?: string;
    targetAudience?: string;
  }) {
    const name = params.name || 'Business Services';
    const loc = params.location ? params.location.trim() : 'India';
    const kw = params.focusKeyword?.trim() || `${name.toLowerCase()} in ${loc}`;

    const metaTitle = `Best ${name} in ${loc} | Verified & Top-Rated Experts - Bhartiyebazar`;
    const metaDescription = `Looking for top ${name} in ${loc}? Connect with verified specialists on Bhartiyebazar. Check reviews, compare prices, and chat directly on WhatsApp.`;
    const secondaryKeywords = [
      `${name.toLowerCase()} near me`,
      `best ${name.toLowerCase()} ${loc}`,
      `verified ${name.toLowerCase()} services`,
      `affordable ${name.toLowerCase()} in ${loc}`,
      `top rated ${name.toLowerCase()} agency`,
    ];

    const h1 = `Verified & Top-Rated ${name} in ${loc}`;
    const h2 = `Why Choose Certified ${name} Providers on Bhartiyebazar?`;
    const h3 = `Get Free Quotes & Direct WhatsApp Consultation`;

    const contentBody = `
      <p>Looking for trusted, certified <strong>${name}</strong> in <strong>${loc}</strong>? Bhartiyebazar brings you a verified directory of local service providers, established enterprises, and skilled professionals ready to serve you.</p>
      <h3>Key Advantages of Booking via Bhartiyebazar:</h3>
      <ul>
        <li><strong>100% Phone &amp; Credential Verified:</strong> Every merchant is vetted to safeguard quality and peace of mind.</li>
        <li><strong>Direct WhatsApp Communication:</strong> No middlemen. Inquire, share requirements, and negotiate directly with owners.</li>
        <li><strong>Transparent Customer Ratings:</strong> Real client testimonials and photo portfolios.</li>
        <li><strong>Best Competitive Rates:</strong> Compare multiple quotes to select the optimal solution for your budget.</li>
      </ul>
      <p>Contact a certified ${name} merchant in ${loc} today and experience hassle-free service delivery.</p>
    `.trim();

    const faqs = [
      {
        question: `How can I find reliable ${name} in ${loc}?`,
        answer: `Browse verified ${name} listings on Bhartiyebazar, check client ratings and completed project portfolios, and tap 'Chat on WhatsApp' for instant response.`,
      },
      {
        question: `What is the estimated cost of ${name} services in ${loc}?`,
        answer: `Prices vary according to your requirements. Verified merchants on Bhartiyebazar offer transparent estimates with no hidden fees.`,
      },
      {
        question: `Can I get same-day service for ${name} in ${loc}?`,
        answer: `Many merchants listed on Bhartiyebazar provide express same-day consultations across ${loc}. Inquire directly for immediate availability.`,
      },
    ];

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: `${name} Services ${loc}`,
      description: metaDescription,
      address: {
        '@type': 'PostalAddress',
        addressLocality: loc,
        addressCountry: 'IN',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '128',
      },
    };

    return {
      metaTitle,
      metaDescription,
      focusKeyword: kw,
      secondaryKeywords,
      h1,
      h2,
      h3,
      contentBody,
      faqs,
      schema,
      seoScore: 94,
    };
  }

  /**
   * Generates dynamic XML Sitemaps data querying database.
   */
  static async getSitemapData(section: 'index' | 'categories' | 'themes' | 'locations' | 'services' | 'companies' | 'pages') {
    await this.ensureSeoTables();
    const baseUrl = 'https://bhartiyebazar.com';

    if (section === 'categories') {
      // Auto-sync newly added categories if any
      await this.syncCategoriesToSeo().catch(console.error);

      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT urlPath, updatedAt, sitemapPriority, sitemapChangeFreq 
         FROM seo_records 
         WHERE type = 'category' AND status = 'published' AND inSitemap = 1 AND indexDirective LIKE '%index%' 
         ORDER BY updatedAt DESC`,
      );
      return rows.map((r) => ({
        url: `${baseUrl}${r.urlPath}`,
        lastModified: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
        priority: Number(r.sitemapPriority || 0.8),
        changeFreq: r.sitemapChangeFreq || 'weekly',
      }));
    }

    if (section === 'themes') {
      // Auto-sync platform themes if any new theme was added
      await this.syncThemesToSeo().catch(console.error);

      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT urlPath, updatedAt, sitemapPriority, sitemapChangeFreq 
         FROM seo_records 
         WHERE type = 'theme' AND status = 'published' AND inSitemap = 1 AND indexDirective LIKE '%index%' 
         ORDER BY updatedAt DESC`,
      );
      return rows.map((r) => ({
        url: `${baseUrl}${r.urlPath}`,
        lastModified: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
        priority: Number(r.sitemapPriority || 0.85),
        changeFreq: r.sitemapChangeFreq || 'weekly',
      }));
    }

    if (section === 'locations') {
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT urlPath, updatedAt, sitemapPriority, sitemapChangeFreq 
         FROM seo_records 
         WHERE type = 'location' AND status = 'published' AND inSitemap = 1 AND indexDirective LIKE '%index%' 
         ORDER BY updatedAt DESC`,
      );
      return rows.map((r) => ({
        url: `${baseUrl}${r.urlPath}`,
        lastModified: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
        priority: Number(r.sitemapPriority || 0.75),
        changeFreq: r.sitemapChangeFreq || 'monthly',
      }));
    }

    if (section === 'companies') {
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT slug, updatedAt FROM companies WHERE status = 'approved' ORDER BY updatedAt DESC LIMIT 5000`,
      );
      return rows.map((r) => ({
        url: `${baseUrl}/${r.slug}`,
        lastModified: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
        priority: 0.7,
        changeFreq: 'weekly',
      }));
    }

    // Default static core pages
    return [
      { url: `${baseUrl}`, lastModified: new Date().toISOString(), priority: 1.0, changeFreq: 'daily' },
      { url: `${baseUrl}/search`, lastModified: new Date().toISOString(), priority: 0.9, changeFreq: 'daily' },
      { url: `${baseUrl}/post-requirement`, lastModified: new Date().toISOString(), priority: 0.8, changeFreq: 'monthly' },
      { url: `${baseUrl}/vyapari-software`, lastModified: new Date().toISOString(), priority: 0.85, changeFreq: 'weekly' },
      { url: `${baseUrl}/sitemap`, lastModified: new Date().toISOString(), priority: 0.6, changeFreq: 'weekly' },
    ];
  }
}

