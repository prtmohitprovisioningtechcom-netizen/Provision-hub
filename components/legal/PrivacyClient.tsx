'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Lock,
  ShieldCheck,
  Database,
  CheckCircle2,
  FileText,
  Globe,
  Baby,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ChevronRight,
  Building2,
  Sparkles,
  Cookie,
  Server,
  KeyRound,
} from 'lucide-react';

interface SectionDef {
  id: string;
  title: string;
  shortTitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SECTIONS: SectionDef[] = [
  { id: 'consent', title: '1. Consent', shortTitle: 'Consent', icon: CheckCircle2 },
  { id: 'info-collected', title: '2. Information We Collect', shortTitle: 'Data Collected', icon: Database },
  { id: 'how-we-use', title: '3. How We Use Your Information', shortTitle: 'Usage of Data', icon: KeyRound },
  { id: 'log-files', title: '4. Log Files & Diagnostics', shortTitle: 'Log Files', icon: Server },
  { id: 'advertising-partners', title: '5. Advertising Partners Privacy Policies', shortTitle: 'Ad Partners', icon: Globe },
  { id: 'third-party-policies', title: '6. Third-Party Privacy Policies & Cookies', shortTitle: 'Third Parties', icon: Cookie },
  { id: 'ccpa', title: '7. CCPA Privacy Rights (Do Not Sell My Info)', shortTitle: 'CCPA Rights', icon: ShieldCheck },
  { id: 'gdpr', title: '8. GDPR Data Protection Rights', shortTitle: 'GDPR Rights', icon: Lock },
  { id: 'children-info', title: '9. Children’s Information Protection', shortTitle: 'Children’s Privacy', icon: Baby },
  { id: 'contact', title: '10. Contact Information & Governance', shortTitle: 'Contact Us', icon: Mail },
];

export function PrivacyClient() {
  const [activeSection, setActiveSection] = useState<string>('consent');

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
          <span className="font-semibold text-gray-900 dark:text-white">Privacy Policy</span>
        </nav>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/80 dark:border-emerald-900/60 dark:bg-emerald-950/40 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>User Privacy &amp; Data Security Protocol</span>
        </div>
      </div>

      {/* Main Title Hero */}
      <div className="mb-4 sm:mb-5 text-left">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
          Privacy Policy for{' '}
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent">
            BHARTIYEBAZAR
          </span>
        </h1>
        <p className="mt-2 text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">
          At <strong>BHARTIYEBAZAR</strong>, accessible from{' '}
          <Link href="https://bhartiyebazar.com/" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
            https://bhartiyebazar.com/
          </Link>
          , one of our main priorities is the privacy of our visitors and merchants. This Privacy Policy document contains types of information that is collected and recorded by BHARTIYEBAZAR and how we use it.
        </p>

        {/* Metadata info pill strip */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-gray-800/80 px-2 py-0.5 font-medium">
            <span>📅</span> Last Updated: November 2026
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-gray-800/80 px-2 py-0.5 font-medium">
            <span>🌐</span> Website: https://bhartiyebazar.com/
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-gray-800/80 px-2 py-0.5 font-medium">
            <span>🛡️</span> Powered by Provisioning Tech
          </span>
        </div>
      </div>

      {/* Overview Card */}
      <div className="mb-4 sm:mb-6 rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/80 via-slate-50/70 to-purple-50/60 dark:border-indigo-950/60 dark:from-indigo-950/30 dark:via-slate-900/40 dark:to-purple-950/20 p-3.5 sm:p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs mt-0.5">
            <Lock className="h-4.5 w-4.5" />
          </div>
          <div className="space-y-1 text-xs sm:text-sm text-gray-800 dark:text-gray-200">
            <h3 className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white">
              Online Activity Scope &amp; Transparency
            </h3>
            <p className="leading-relaxed">
              If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us. This Privacy Policy applies only to our online activities and is valid for visitors to our website with regards to the information that they shared and/or collect in <strong>BHARTIYEBAZAR</strong>. This policy is not applicable to any information collected offline or via channels other than this website.
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
                    ? 'bg-emerald-600 text-white shadow-xs'
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
              <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Privacy Navigation
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
                        ? 'bg-emerald-600 text-white shadow-xs font-bold'
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
          {/* Section 1: Consent */}
          <section id="consent" className="scroll-mt-20 rounded-2xl sm:rounded-3xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6 lg:p-7 shadow-xs space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                1. Consent
              </h2>
            </div>
            <p>
              By using our website, you hereby consent to our Privacy Policy and agree to its terms.
            </p>
          </section>

          {/* Section 2: Information We Collect */}
          <section id="info-collected" className="scroll-mt-20 rounded-2xl sm:rounded-3xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6 lg:p-7 shadow-xs space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Database className="h-5 w-5" />
              </span>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                2. Information We Collect
              </h2>
            </div>
            <p>
              The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.
            </p>
            <p>
              If you contact us directly, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.
            </p>
            <p>
              When you register for an Account (such as a Merchant Storefront, Vyapari software access, or Customer account), we may ask for your contact information, including items such as:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 pt-1">
              {[
                'Full Name / Owner Name',
                'Company / Business Name',
                'Email Address',
                'Phone / WhatsApp Number',
                'Registered Shop Address',
                'City, State & Country',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/50 p-2.5 sm:p-3 text-xs sm:text-sm font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: How We Use Your Information */}
          <section id="how-we-use" className="scroll-mt-20 rounded-2xl sm:rounded-3xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6 lg:p-7 shadow-xs space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <KeyRound className="h-5 w-5" />
              </span>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                3. How We Use Your Information
              </h2>
            </div>
            <p>
              We use the information we collect in various ways, including to:
            </p>
            <ul className="space-y-2 text-xs sm:text-sm">
              {[
                'Provide, operate, and maintain our website, merchant storefronts, and Vyapari billing software',
                'Improve, personalize, and expand our website features and industry-specific themes',
                'Understand and analyze how visitors interact with local verified business listings',
                'Develop new products, services, features, and automated SEO tools',
                'Communicate with you, either directly or through one of our partners, including for customer support, service updates, and transactional alerts',
                'Send you administrative emails, billing invoices, and important security notifications',
                'Find, detect, and prevent fraud, spam listings, or unlawful platform activities',
              ].map((purpose, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{purpose}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 4: Log Files */}
          <section id="log-files" className="scroll-mt-20 rounded-2xl sm:rounded-3xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6 lg:p-7 shadow-xs space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Server className="h-5 w-5" />
              </span>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                4. Log Files
              </h2>
            </div>
            <p>
              <strong>BHARTIYEBAZAR</strong> follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services&apos; analytics.
            </p>
            <p>
              The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users&apos; movement on the website, and gathering demographic information.
            </p>
          </section>

          {/* Section 5: Advertising Partners */}
          <section id="advertising-partners" className="scroll-mt-20 rounded-2xl sm:rounded-3xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6 lg:p-7 shadow-xs space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Globe className="h-5 w-5" />
              </span>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                5. Advertising Partners Privacy Policies
              </h2>
            </div>
            <p>
              You may consult this list to find the Privacy Policy for each of the advertising and analytics partners of <strong>BHARTIYEBAZAR</strong>.
            </p>
            <p>
              Third-party ad servers or ad networks use technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on BHARTIYEBAZAR, which are sent directly to users&apos; browsers. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 sm:p-3.5 rounded-xl border border-gray-200/60 dark:border-gray-700/60">
              <strong>Note:</strong> BHARTIYEBAZAR has no access to or control over these cookies that are used by third-party advertisers.
            </p>
          </section>

          {/* Section 6: Third Party Privacy Policies */}
          <section id="third-party-policies" className="scroll-mt-20 rounded-2xl sm:rounded-3xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6 lg:p-7 shadow-xs space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Cookie className="h-5 w-5" />
              </span>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                6. Third Party Privacy Policies
              </h2>
            </div>
            <p>
              <strong>BHARTIYEBAZAR&apos;s</strong> Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers or external payment gateways for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
            </p>
            <p>
              You can choose to disable cookies through your individual browser options. To know more detailed information about cookie management with specific web browsers, it can be found at the browsers&apos; respective websites.
            </p>
          </section>

          {/* Section 7: CCPA Rights */}
          <section id="ccpa" className="scroll-mt-20 rounded-2xl sm:rounded-3xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6 lg:p-7 shadow-xs space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                7. CCPA Privacy Rights (Do Not Sell My Personal Information)
              </h2>
            </div>
            <p>
              Under the CCPA, among other consumer rights, users have the right to:
            </p>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm list-disc pl-5">
              <li>Request that a business that collects a consumer&apos;s personal data disclose the categories and specific pieces of personal data that a business has collected about consumers.</li>
              <li>Request that a business delete any personal data about the consumer that a business has collected.</li>
              <li>Request that a business that sells a consumer&apos;s personal data, not sell the consumer&apos;s personal data.</li>
            </ul>
            <p className="pt-1 sm:pt-2 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.
            </p>
          </section>

          {/* Section 8: GDPR Data Protection Rights */}
          <section id="gdpr" className="scroll-mt-20 rounded-2xl sm:rounded-3xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6 lg:p-7 shadow-xs space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Lock className="h-5 w-5" />
              </span>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                8. GDPR Data Protection Rights
              </h2>
            </div>
            <p>
              We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:
            </p>
            <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2 pt-1">
              {[
                { title: 'The right to access', desc: 'You have the right to request copies of your personal data. We may charge you a small fee for this service.' },
                { title: 'The right to rectification', desc: 'You have the right to request that we correct any information you believe is inaccurate or incomplete.' },
                { title: 'The right to erasure', desc: 'You have the right to request that we erase your personal data, under certain statutory conditions.' },
                { title: 'The right to restrict processing', desc: 'You have the right to request that we restrict the processing of your personal data, under certain conditions.' },
                { title: 'The right to object to processing', desc: 'You have the right to object to our processing of your personal data, under certain conditions.' },
                { title: 'The right to data portability', desc: 'You have the right to request that we transfer the data collected to another organization, or directly to you.' },
              ].map((right, idx) => (
                <div key={idx} className="rounded-xl sm:rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 p-3 sm:p-4 space-y-1">
                  <h4 className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white">{right.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{right.desc}</p>
                </div>
              ))}
            </div>
            <p className="pt-1 sm:pt-2 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.
            </p>
          </section>

          {/* Section 9: Children's Information */}
          <section id="children-info" className="scroll-mt-20 rounded-2xl sm:rounded-3xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6 lg:p-7 shadow-xs space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Baby className="h-5 w-5" />
              </span>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                9. Children&apos;s Information
              </h2>
            </div>
            <p>
              Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.
            </p>
            <p>
              <strong>BHARTIYEBAZAR</strong> does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.
            </p>
          </section>

          {/* Section 10: Contact Information */}
          <section id="contact" className="scroll-mt-20 rounded-2xl sm:rounded-3xl border border-emerald-200/80 dark:border-emerald-900/60 bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/20 dark:from-gray-900 dark:via-emerald-950/20 dark:to-gray-900 p-4 sm:p-6 lg:p-7 shadow-xs space-y-4 sm:space-y-5">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-600 text-white shadow-xs">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  10. Contact Information
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Reach out to our dedicated privacy grievance officer &amp; support team
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm">
              If you have any questions or require more information about our <strong>Privacy Policy</strong>, do not hesitate to contact us through our official channels:
            </p>

            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              {/* Platform Card */}
              <div className="rounded-xl sm:rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white/90 dark:bg-gray-800/80 p-4 sm:p-5 space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Official Platform
                  </span>
                  <Sparkles className="h-4 w-4 text-emerald-500" />
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
