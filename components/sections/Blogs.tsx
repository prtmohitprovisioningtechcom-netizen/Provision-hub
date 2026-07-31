'use client';

import Image from 'next/image';
import { ILandingPageSection, IBlog } from '@/types';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SectionShell, SectionHead } from '@/components/company/SectionShell';
import { Calendar, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface BlogsSectionProps {
  section: ILandingPageSection;
  primaryColor: string;
  blogs: IBlog[];
}

const cardReveal: any = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const staggerGrid: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export function BlogsSection({ section, primaryColor, blogs }: BlogsSectionProps) {
  const variant = section.designVariant || 'variant-1';
  
  if (!blogs || blogs.length === 0) {
    return null;
  }

  // ---------------------------------------------------------------------------
  // Variant 1: Clean 3-Column Grid (Classic)
  // ---------------------------------------------------------------------------
  if (variant === 'variant-1') {
    return (
      <SectionShell id={section.type} tone="white" navy={primaryColor}>
        <SectionHead
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
          accent="#f5b301" // gold
        />
        <motion.div
          variants={staggerGrid}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {blogs.slice(0, 3).map((blog, i) => (
            <motion.article
              key={blog._id}
              variants={cardReveal}
              whileHover={{ y: -8 }}
              className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)] ring-1 ring-gray-100 transition-all duration-300 hover:shadow-xl"
            >
              <Link href={`/blog/${blog.slug}`} className="relative aspect-video w-full overflow-hidden bg-gray-100">
                {blog.featuredImage ? (
                  <Image
                    src={blog.featuredImage}
                    alt={blog.title}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-100" />
                )}
                {blog.category && (
                  <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gray-900 shadow-sm backdrop-blur">
                    {String(blog.category)}
                  </div>
                )}
              </Link>
              <div className="flex flex-1 flex-col p-6 sm:p-8">
                <div className="mb-4 flex items-center gap-4 text-xs font-medium text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={new Date(blog.createdAt).toISOString()}>
                      {format(new Date(blog.createdAt), 'MMM d, yyyy')}
                    </time>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  <Link href={`/blog/${blog.slug}`}>
                    <span className="absolute inset-0" />
                    {blog.title}
                  </Link>
                </h3>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-600">
                  {blog.excerpt}
                </p>
                <div className="mt-auto pt-6 flex items-center text-sm font-bold uppercase tracking-wide" style={{ color: primaryColor }}>
                  Read More <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
        
        {section.buttonLink && section.buttonText && (
          <div className="mt-12 text-center">
            <Link
              href={section.buttonLink}
              className="inline-flex rounded-full px-8 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:brightness-110"
              style={{ backgroundColor: primaryColor }}
            >
              {section.buttonText}
            </Link>
          </div>
        )}
      </SectionShell>
    );
  }

  // ---------------------------------------------------------------------------
  // Variant 2: Magazine Layout (1 Large, 2 Small)
  // ---------------------------------------------------------------------------
  if (variant === 'variant-2') {
    const featuredBlog = blogs[0];
    const sideBlogs = blogs.slice(1, 3);

    return (
      <SectionShell id={section.type} tone="soft" navy={primaryColor}>
        <SectionHead
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
          accent={primaryColor}
        />
        
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {featuredBlog && (
            <motion.article
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="group relative flex flex-col overflow-hidden rounded-3xl bg-gray-900 shadow-2xl"
            >
              <div className="absolute inset-0">
                {featuredBlog.featuredImage ? (
                   <Image
                     src={featuredBlog.featuredImage}
                     alt={featuredBlog.title}
                     fill
                     className="object-cover transition duration-1000 group-hover:scale-105 opacity-80"
                   />
                ) : (
                  <div className="absolute inset-0 bg-gray-800" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-gray-900 via-gray-900/40 to-transparent" />
              </div>
              
              <div className="relative mt-auto p-8 sm:p-12">
                {featuredBlog.category && (
                  <span className="mb-4 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white" style={{ backgroundColor: primaryColor }}>
                    {String(featuredBlog.category)}
                  </span>
                )}
                <h3 className="text-3xl font-black text-white sm:text-4xl mb-4 leading-tight">
                  <Link href={`/blog/${featuredBlog.slug}`}>
                    <span className="absolute inset-0" />
                    {featuredBlog.title}
                  </Link>
                </h3>
                <p className="mb-6 line-clamp-2 text-lg text-gray-300">
                  {featuredBlog.excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={new Date(featuredBlog.createdAt).toISOString()}>
                      {format(new Date(featuredBlog.createdAt), 'MMM d, yyyy')}
                    </time>
                  </div>
                </div>
              </div>
            </motion.article>
          )}

          <div className="flex flex-col gap-8">
            {sideBlogs.map((blog, i) => (
              <motion.article
                key={blog._id}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group flex flex-col sm:flex-row gap-6 overflow-hidden rounded-2xl bg-white p-4 shadow-xl ring-1 ring-black/5 transition hover:shadow-2xl h-full"
              >
                <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl sm:w-48 sm:aspect-square">
                  {blog.featuredImage ? (
                    <Image
                      src={blog.featuredImage}
                      alt={blog.title}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-100" />
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-center py-2 pr-4">
                  {blog.category && (
                    <span className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: primaryColor }}>
                      {typeof blog.category === 'string' ? blog.category : String(blog.category)}
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    <Link href={`/blog/${blog.slug}`}>
                      <span className="absolute inset-0" />
                      {blog.title}
                    </Link>
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                    {blog.excerpt}
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={new Date(blog.createdAt).toISOString()}>
                      {format(new Date(blog.createdAt), 'MMM d, yyyy')}
                    </time>
                  </div>
                </div>
              </motion.article>
            ))}
            
            {section.buttonLink && section.buttonText && sideBlogs.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                className="mt-auto flex items-center justify-end"
              >
                <Link
                  href={section.buttonLink}
                  className="group flex items-center gap-2 text-sm font-bold uppercase tracking-wide transition-colors hover:opacity-80"
                  style={{ color: primaryColor }}
                >
                  {section.buttonText}
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 transition-transform group-hover:translate-x-1" style={{ backgroundColor: `${primaryColor}15` }}>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </SectionShell>
    );
  }

  // ---------------------------------------------------------------------------
  // Variant 3: Minimalist Text-Heavy List
  // ---------------------------------------------------------------------------
  return (
    <SectionShell id={section.type} tone="white" navy={primaryColor} withTopWave>
      <SectionHead
        eyebrow={section.eyebrow}
        title={section.title}
        subtitle={section.subtitle}
        accent="#f5b301" // gold
      />
      
      <div className="mx-auto max-w-4xl mt-12 divide-y divide-gray-100 border-t border-b border-gray-100">
        {blogs.slice(0, 4).map((blog, i) => (
          <motion.article
            key={blog._id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="group relative flex flex-col items-start justify-between py-10 sm:flex-row sm:items-center gap-8"
          >
            <div className="flex-1">
              <div className="flex items-center gap-4 text-sm mb-3">
                <time dateTime={new Date(blog.createdAt).toISOString()} className="text-gray-500 font-medium">
                  {format(new Date(blog.createdAt), 'MMMM d, yyyy')}
                </time>
                {blog.category && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-gray-300" />
                    <span className="font-bold uppercase tracking-wider" style={{ color: primaryColor }}>
                      {typeof blog.category === 'string' ? blog.category : String(blog.category)}
                    </span>
                  </>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 sm:text-3xl transition-colors group-hover:text-blue-600">
                <Link href={`/blog/${blog.slug}`}>
                  <span className="absolute inset-0" />
                  {blog.title}
                </Link>
              </h3>
              <p className="mt-4 line-clamp-2 text-base text-gray-600 max-w-2xl">
                {blog.excerpt}
              </p>
            </div>
            
            {blog.featuredImage && (
              <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl sm:w-64 sm:aspect-[4/3] shadow-md group-hover:shadow-lg transition-shadow">
                <Image
                  src={blog.featuredImage}
                  alt={blog.title}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
            )}
          </motion.article>
        ))}
      </div>
      
      {section.buttonLink && section.buttonText && (
        <div className="mt-12 text-center">
          <Link
            href={section.buttonLink}
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors hover:opacity-70"
            style={{ color: primaryColor }}
          >
            {section.buttonText} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </SectionShell>
  );
}
