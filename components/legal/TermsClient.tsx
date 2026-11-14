'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Scale,
  Cookie,
  FileText,
  AlertTriangle,
  Link2,
  Layers,
  ShieldAlert,
  Lock,
  BookmarkCheck,
  Flag,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ChevronRight,
  Building2,
  Sparkles,
} from 'lucide-react';

interface SectionDef {
  id: string;
  title: string;
  shortTitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SECTIONS: SectionDef[] = [
  { id: 'terminology', title: '1. Terminology & Definitions', shortTitle: 'Terminology', icon: Scale },
  { id: 'cookies', title: '2. Cookies & Tracking Technologies', shortTitle: 'Cookies', icon: Cookie },
  { id: 'license', title: '3. Intellectual Property License', shortTitle: 'License & IP', icon: FileText },
  { id: 'user-comments', title: '4. User Comments & Merchant Content', shortTitle: 'User Content', icon: BookmarkCheck },
  { id: 'hyperlinking', title: '5. Hyperlinking to our Content', shortTitle: 'Hyperlinking', icon: Link2 },
  { id: 'iframes', title: '6. iFrames & Frame Embedding', shortTitle: 'iFrames Policy', icon: Layers },
  { id: 'content-liability', title: '7. Content Liability', shortTitle: 'Content Liability', icon: ShieldAlert },
  { id: 'privacy', title: '8. Your Privacy', shortTitle: 'Privacy', icon: Lock },
  { id: 'reservation', title: '9. Reservation of Rights', shortTitle: 'Rights Reserved', icon: ShieldCheck },
  { id: 'removal', title: '10. Removal of Links from our Website', shortTitle: 'Link Removal', icon: Flag },
  { id: 'disclaimer', title: '11. Disclaimer & Limitation of Liability', shortTitle: 'Disclaimer', icon: AlertTriangle },
  { id: 'contact', title: '12. Official Contact Information', shortTitle: 'Contact Info', icon: Mail },
];

export function TermsClient() {
  const [activeSection, setActiveSection] = useState<string>('terminology');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -75; // offset for sticky navbar
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-8 sm:pb-12">
      {/* Top Breadcrumb & Badge */}
      <div className="mb-3 sm:mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-gray-900 dark:text-white">Terms &amp; Conditions</span>
        </nav>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/80 bg-indigo-50/80 dark:border-indigo-900/60 dark:bg-indigo-950/40 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
          <ShieldCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Official Legal Document</span>
        </div>
      </div>

      {/* Main Title Hero */}
      <div className="mb-4 sm:mb-5 text-left">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
          Terms &amp; Conditions for{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
            BHARTIYEBAZAR
          </span>
        </h1>
        <p className="mt-2 text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">
          Welcome to <strong>BHARTIYEBAZAR</strong> (accessible at{' '}
          <Link href="https://bhartiyebazar.com/" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
            https://bhartiyebazar.com/
          </Link>
          ), an Indian digital local commerce &amp; business enablement platform developed, maintained and powered by{' '}
          <Link href="https://provisioningtech.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold inline-flex items-center gap-0.5">
            PROVISIONING TECH <ExternalLink className="h-3 w-3" />
          </Link>
          .
        </p>

        {/* Metadata info pill strip */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-gray-800/80 px-2 py-0.5 font-medium">
            <span>📅</span> Effective Date: November 2026
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-gray-800/80 px-2 py-0.5 font-medium">
            <span>🌐</span> Platform: https://bhartiyebazar.com/
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-gray-800/80 px-2 py-0.5 font-medium">
            <span>🏢</span> Tech Partner: Provisioning Tech
          </span>
        </div>
      </div>

      {/* Acceptance Alert Box */}
      <div className="mb-4 sm:mb-6 rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-amber-50/90 dark:border-amber-900/60 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-amber-950/30 p-3.5 sm:p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 mt-0.5">
            <AlertTriangle className="h-4.5 w-4.5" />
          </div>
          <div className="space-y-1 text-xs sm:text-sm text-gray-800 dark:text-gray-200">
            <h3 className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white">
              Binding Agreement &amp; Acceptance of Terms
            </h3>
            <p className="leading-relaxed">
              These terms and conditions outline the rules and regulations for the use of <strong>BHARTIYEBAZAR&apos;s Website</strong>, located at{' '}
              <strong className="text-indigo-600 dark:text-indigo-400">https://bhartiyebazar.com/</strong>.
            </p>
            <p className="leading-relaxed font-semibold text-amber-900 dark:text-amber-300">
              By accessing this website, we assume you accept these terms and conditions in full. Do not continue to use BHARTIYEBAZAR if you do not agree to take all of the terms and conditions stated on this page.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Quick Jump Horizontal Navigation */}
      <div className="lg:hidden mb-4 -mx-3 sm:-mx-6 px-3 sm:px-6">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {SECTIONS.map((sec) => {
            const isCurrent = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => scrollToSection(sec.id)}
                className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100'
                }`}
              >
                {sec.shortTitle}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Layout: Left Sticky Navigation & Right Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
        {/* Left Sticky Table of Contents */}
        <aside className="lg:col-span-4 xl:col-span-3 sticky top-20 hidden lg:block">
          <div className="rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 p-3.5 shadow-xs backdrop-blur-md">
            <div className="flex items-center gap-2 pb-2.5 mb-2 border-b border-gray-100 dark:border-gray-800">
              <Scale className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Table of Contents
              </h2>
            </div>
            <nav className="space-y-1 max-h-[calc(100vh-140px)] overflow-y-auto pr-1 text-xs">
              {SECTIONS.map((sec) => {
                const Icon = sec.icon;
                const isCurrent = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-left font-semibold transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-indigo-600 text-white shadow-xs font-bold'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Icon className={`h-3.5 w-3.5 shrink-0 ${isCurrent ? 'text-white' : 'text-gray-400'}`} />
                      <span className="truncate">{sec.shortTitle}</span>
                    </span>
                    <ChevronRight className={`h-3 w-3 shrink-0 ${isCurrent ? 'opacity-100' : 'opacity-40'}`} />
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Right Content Stream */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4 sm:space-y-6 text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">
          {/* Section 1: Terminology */}
          <section id="terminology" className="scroll-mt-20 rounded-2xl sm:rounded-3xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6 lg:p-7 shadow-xs space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Scale className="h-5 w-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                1. Terminology
              </h2>
            </div>
            <p>
              The following terminology applies to these Terms and Conditions, Privacy Statement and Disclaimer Notice and all Agreements:
            </p>
            <ul className="space-y-2.5 pt-1">
              <li className="flex items-start gap-2.5">
                <span className="font-bold text-gray-900 dark:text-white shrink-0">&bull; &quot;Client&quot;, &quot;You&quot; and &quot;Your&quot;:</span>
                <span>Refers to you, the individual or business entity accessing this website, registering a company, purchasing vyapari software/subscriptions, or utilizing our directory, and compliant with the Company&apos;s terms and conditions.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-bold text-gray-900 dark:text-white shrink-0">&bull; &quot;The Company&quot;, &quot;Ourselves&quot;, &quot;We&quot;, &quot;Our&quot; and &quot;Us&quot;:</span>
                <span>Refers to <strong>BHARTIYEBAZAR</strong> (developed, maintained, and powered by <strong>PROVISIONING TECH</strong>).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-bold text-gray-900 dark:text-white shrink-0">&bull; &quot;Party&quot;, &quot;Parties&quot;, or &quot;Us&quot;:</span>
                <span>Refers to both the Client and ourselves, or either the Client or ourselves.</span>
              </li>
            </ul>
            <p className="pt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3.5 rounded-xl border border-gray-200/60 dark:border-gray-700/60">
              All terms refer to the offer, acceptance and consideration of payment necessary to undertake the process of our assistance to the Client in the most appropriate manner for the express purpose of meeting the Client&apos;s needs in respect of provision of the Company&apos;s stated services, in accordance with and subject to prevailing laws of India.
            </p>
          </section>

          {/* Section 2: Cookies */}
          <section id="cookies" className="scroll-mt-20 rounded-2xl sm:rounded-3xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6 lg:p-7 shadow-xs space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Cookie className="h-5 w-5" />
              </span>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                2. Cookies
              </h2>
            </div>
            <p>
              We employ the use of cookies. By accessing <strong>BHARTIYEBAZAR</strong>, you agreed to use cookies in agreement with our Privacy Policy.
            </p>
            <p>
              Most interactive websites use cookies to let us retrieve the user&apos;s details for each visit. Cookies are used by our website to enable the functionality of certain areas, authentication sessions, language preferences, and shopping/cart tools to make it easier for people visiting our website. Some of our affiliate/advertising partners may also use cookies.
            </p>
          </section>

          {/* Section 3: License */}
          <section id="license" className="scroll-mt-20 rounded-2xl sm:rounded-3xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6 lg:p-7 shadow-xs space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <FileText className="h-5 w-5" />
              </span>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                3. License
              </h2>
            </div>
            <p>
              Unless otherwise stated, <strong>BHARTIYEBAZAR</strong> and/or its licensors (including technology architect <strong>PROVISIONING TECH</strong>) own the intellectual property rights for all material on this website. All intellectual property rights are reserved. You may access this website for your own personal and commercial storefront use subjected to restrictions set in these terms and conditions.
            </p>
            <div className="rounded-xl sm:rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/20 p-3.5 sm:p-4 space-y-2">
              <h4 className="font-extrabold text-xs sm:text-sm text-rose-900 dark:text-rose-300">
                You must not:
              </h4>
              <ul className="space-y-1.5 text-xs sm:text-sm text-rose-800 dark:text-rose-200">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                  <span>Republish material from this website without explicit written consent.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                  <span>Sell, rent or sub-license material or software source codes from this website.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                  <span>Reproduce, duplicate or copy platform assets, UI designs, or themes without permission.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                  <span>Redistribute content from this website without authorization.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 4: User Comments & Merchant Content */}
          <section id="user-comments" className="scroll-mt-20 rounded-2xl sm:rounded-3xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6 lg:p-7 shadow-xs space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <BookmarkCheck className="h-5 w-5" />
              </span>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                4. User Comments &amp; Merchant Storefront Content
              </h2>
            </div>
            <p>
              Certain parts of this website may offer users and registered merchants an opportunity to post and exchange opinions, business details, reviews, ratings, product catalogs, and contact information.
            </p>
            <p>
              <strong>BHARTIYEBAZAR</strong> does not filter, edit, publish or review comments or listings prior to their appearance on the website. Comments and store listings do not reflect the views and opinions of BHARTIYEBAZAR, its agents or affiliates. Comments reflect the views and opinions of the person who posts their views and opinions.
            </p>
            <p>
              To the extent permitted by applicable laws, BHARTIYEBAZAR shall not be liable for the Comments or for any liability, damages or expenses caused and/or suffered as a result of any use of and/or posting of and/or appearance of the Comments on this website.
            </p>
            <p>
              We reserve the right to monitor all comments, customer ratings, and merchant listings and remove any submissions which can be considered inappropriate, offensive, fraudulent, or cause a breach of these Terms and Conditions.
            </p>

            <div className="rounded-xl sm:rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 p-3.5 sm:p-4 space-y-2">
              <h4 className="font-extrabold text-xs sm:text-sm text-indigo-900 dark:text-indigo-300">
                You warrant and represent that:
              </h4>
              <ul className="space-y-1.5 text-xs sm:text-sm text-indigo-800 dark:text-indigo-200">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 shrink-0" />
                  <span>You are entitled to post comments and storefront catalog information on our website and have all necessary licenses and consents to do so.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 shrink-0" />
                  <span>The comments and products do not invade any intellectual property rights, including without limitation copyright, patent or trademark of any third party.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 shrink-0" />
                  <span>The comments do not contain any defamatory, libelous, offensive, indecent or otherwise unlawful material which is an invasion of privacy.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 shrink-0" />
                  <span>The comments will not be used to solicit or promote business or custom or present commercial activities or unlawful activity.</span>
                </li>
              </ul>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              You hereby grant <strong>BHARTIYEBAZAR</strong> a non-exclusive license to use, reproduce, edit and authorize others to use, reproduce and edit any of your comments in any and all forms, formats or media.
            </p>
          </section>

          {/* Section 5: Hyperlinking to our Content */}
          <section id="hyperlinking" className="scroll-mt-20 rounded-2xl sm:rounded-3xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6 lg:p-7 shadow-xs space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Link2 className="h-5 w-5" />
              </span>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                5. Hyperlinking to our Content
              </h2>
            </div>
            <p>
              The following organizations may link to our Website without prior written approval:
            </p>
            <div className="grid sm:grid-cols-2 gap-2 sm:gap-2.5">
              {[
                'Government agencies and civic authorities',
                'Search engines (Google, Bing, Yahoo, etc.)',
                'News organizations and regional press',
                'Online directory distributors and verified indexes',
                'System-wide Accredited Businesses',
              ].map((org, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/50 p-2.5 sm:p-3 text-xs sm:text-sm font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>{org}</span>
                </div>
              ))}
            </div>

            <p className="pt-1 sm:pt-2">
              These organizations may link to our home page, to publications or to other Website information so long as the link:
            </p>
            <ul className="space-y-1.5 text-xs sm:text-sm list-disc pl-5">
              <li>Is not in any way deceptive;</li>
              <li>Does not falsely imply sponsorship, endorsement or approval of the linking party and its products and/or services; and</li>
              <li>Fits within the context of the linking party&apos;s site.</li>
            </ul>
          </section>

          {/* Section 6: iFrames */}
          <section id="iframes" className="scroll-mt-20 rounded-2xl sm:rounded-3xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6 lg:p-7 shadow-xs space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Layers className="h-5 w-5" />
              </span>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                6. iFrames
              </h2>
            </div>
            <p>
              Without prior approval and written permission, you may not create frames around our webpages or storefront landing pages that alter in any way the visual presentation, branding, or appearance of our website.
            </p>
          </section>

          {/* Section 7: Content Liability */}
          <section id="content-liability" className="scroll-mt-20 rounded-2xl sm:rounded-3xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6 lg:p-7 shadow-xs space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <ShieldAlert className="h-5 w-5" />
              </span>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                7. Content Liability
              </h2>
            </div>
            <p>
              We shall not be held responsible for any content that appears on your website or external merchant-managed portals. You agree to protect and defend us against all claims arising on your website.
            </p>
            <p>
              No link(s) should appear on any website that may be interpreted as libelous, obscene or criminal, or which infringes, otherwise violates, or advocates the infringement or other violation of, any third party rights.
            </p>
          </section>

          {/* Section 8: Your Privacy */}
          <section id="privacy" className="scroll-mt-20 rounded-2xl sm:rounded-3xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6 lg:p-7 shadow-xs space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Lock className="h-5 w-5" />
              </span>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                8. Your Privacy
              </h2>
            </div>
            <p>
              Please read our Privacy Policy and security protocols to understand how we collect, store, process, and safeguard your personal information, merchant credentials, payment logs, and customer inquiries.
            </p>
          </section>

          {/* Section 9: Reservation of Rights */}
          <section id="reservation" className="scroll-mt-20 rounded-2xl sm:rounded-3xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6 lg:p-7 shadow-xs space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                9. Reservation of Rights
              </h2>
            </div>
            <p>
              We reserve the right to request that you remove all links or any particular link to our website. You approve to immediately remove all links to our website upon request.
            </p>
            <p>
              We also reserve the right to amend these terms and conditions and its linking policy at any time. By continuously linking to our Website, you agree to be bound to and follow these linking terms and conditions.
            </p>
          </section>

          {/* Section 10: Removal of Links from our Website */}
          <section id="removal" className="scroll-mt-20 rounded-2xl sm:rounded-3xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6 lg:p-7 shadow-xs space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Flag className="h-5 w-5" />
              </span>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                10. Removal of Links from our Website
              </h2>
            </div>
            <p>
              If you find any link on our Website that is offensive for any reason, you are free to contact and inform us at any moment. We will consider requests to remove links but we are not obligated to or so or to respond to you directly.
            </p>
            <p>
              We do not ensure that the information on this website is correct, we do not warrant its completeness or accuracy; nor do we promise to ensure that the website remains available or that the material on the website is kept up to date.
            </p>
          </section>

          {/* Section 11: Disclaimer */}
          <section id="disclaimer" className="scroll-mt-20 rounded-2xl sm:rounded-3xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6 lg:p-7 shadow-xs space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                11. Disclaimer
              </h2>
            </div>
            <p>
              To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and the use of this website. Nothing in this disclaimer will:
            </p>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm list-disc pl-5">
              <li>Limit or exclude our or your liability for death or personal injury;</li>
              <li>Limit or exclude our or your liability for fraud or fraudulent misrepresentation;</li>
              <li>Limit any of our or your liabilities in any way that is not permitted under applicable law; or</li>
              <li>Exclude any of our or your liabilities that may not be excluded under applicable law.</li>
            </ul>
            <p className="pt-1 sm:pt-2">
              The limitations and prohibitions of liability set in this Section and elsewhere in this disclaimer: (a) are subject to the preceding paragraph; and (b) govern all liabilities arising under the disclaimer, including liabilities arising in contract, in tort and for breach of statutory duty.
            </p>
            <p className="font-semibold text-gray-900 dark:text-white bg-slate-100 dark:bg-gray-800/80 p-3 sm:p-3.5 rounded-xl text-xs sm:text-sm">
              As long as the website and the information and services on the website are provided free of charge, we will not be liable for any loss or damage of any nature.
            </p>
          </section>

          {/* Section 12: Contact Information */}
          <section id="contact" className="scroll-mt-20 rounded-2xl sm:rounded-3xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20 dark:from-gray-900 dark:via-indigo-950/20 dark:to-gray-900 p-4 sm:p-6 lg:p-7 shadow-xs space-y-4 sm:space-y-5">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-indigo-600 text-white shadow-xs">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  12. Contact Information
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Reach out to our official compliance &amp; legal grievance team
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm">
              If you have any questions, clarifications or grievances regarding these <strong>Terms &amp; Conditions</strong>, you can contact us directly through our official channels:
            </p>

            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              {/* Platform Card */}
              <div className="rounded-xl sm:rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white/90 dark:bg-gray-800/80 p-4 sm:p-5 space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Official Platform
                  </span>
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                </div>
                <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white">
                  BHARTIYEBAZAR
                </h3>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <Link href="https://bhartiyebazar.com/" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold break-all">
                      https://bhartiyebazar.com/
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <a href="mailto:support@bhartiyebazar.com" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 font-medium break-all">
                      support@bhartiyebazar.com
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <a href="tel:+916397650818" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 font-medium">
                      +91 6397650818
                    </a>
                  </div>
                </div>
              </div>

              {/* Technology Partner Card */}
              <div className="rounded-xl sm:rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white/90 dark:bg-gray-800/80 p-4 sm:p-5 space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Developed &amp; Powered By
                  </span>
                  <Building2 className="h-4 w-4 text-purple-500" />
                </div>
                <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white">
                  PROVISIONING TECH
                </h3>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <Link href="https://provisioningtech.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold inline-flex items-center gap-1 break-all">
                      https://provisioningtech.com/
                    </Link>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 leading-tight">
                      11121, 11th Floor, Gaur City Mall, Sector-4, Greater Noida, UP - 201009, India
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 text-center text-xs text-gray-500 dark:text-gray-400">
              Copyright &copy; {new Date().getFullYear()} Bhartiyebazar &bull; Developed &amp; Powered by Provisioning Tech. All rights reserved.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
