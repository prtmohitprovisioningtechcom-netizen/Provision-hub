'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, MapPin, Send, User, MessageSquare, Clock, MessageCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { z } from 'zod';

type ContactForm = z.infer<typeof contactSchema>;

export function Contact({ config }: { config?: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

  const emailValue = config?.email || 'provisioningtech@gmail.com';
  const phoneValue = config?.phone || '+91 6397650818';
  const addressValue =
    config?.address ||
    '11121, 11th floor, Gaur City Mall, Sector-4, Greater Noida, Uttar Pradesh - 201009';

  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to send message');
      }
      toast.success('Message sent successfully! We will get back to you soon.');
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-12 sm:py-16 bg-slate-50/50 dark:bg-gray-950/50 border-t border-gray-200/70 dark:border-gray-800/80 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-10"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/80 px-3.5 py-1 text-xs font-bold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 mb-2.5 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>24x7 Vyapari Support</span>
          </div>
          <h2 className="text-3xl font-black sm:text-4xl text-gray-900 dark:text-white tracking-tight">
            Get in Touch
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Koi bhi sawaal ya query ho? Humari support team har vyapari ki madad ke liye hamesha taiyyar hai.
          </p>
        </motion.div>

        {/* 2-Column Balanced Height Grid */}
        <div className="grid gap-6 lg:grid-cols-12 items-stretch">
          {/* Left Column: Office & Contact Info Card (Equal Height) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 h-full"
          >
            <div className="h-full flex flex-col justify-between rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-linear-to-br from-indigo-900 via-indigo-950 to-purple-950 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <span className="inline-block text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2">
                  Contact Information
                </span>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
                  Bhartiyebazar Support
                </h3>
                <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed mb-6">
                  Chhota ho ya bada kaam — humare experts se seedhe sampark karein aur apni dukan ko aaj hi online banayein.
                </p>

                {/* Contact List */}
                <div className="space-y-4">
                  <a
                    href={`mailto:${emailValue}`}
                    className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all duration-200 group"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-md group-hover:scale-105 transition-transform">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">Email Us</div>
                      <div className="text-xs sm:text-sm font-semibold text-white break-all">{emailValue}</div>
                    </div>
                  </a>

                  <a
                    href={`tel:${phoneValue.replace(/\s+/g, '')}`}
                    className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all duration-200 group"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md group-hover:scale-105 transition-transform">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Call / WhatsApp</div>
                      <div className="text-xs sm:text-sm font-semibold text-white">{phoneValue}</div>
                    </div>
                  </a>

                  <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/10 border border-white/10">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Head Office</div>
                      <div className="text-xs sm:text-sm font-medium text-white/95 leading-relaxed">{addressValue}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action Box */}
              <div className="mt-6 pt-4 border-t border-white/10 relative z-10">
                <div className="flex items-center justify-between text-xs text-indigo-200 font-semibold mb-3">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Mon - Sat: 9 AM - 7 PM</span>
                  </div>
                  <span className="text-emerald-400 font-bold">● Active Now</span>
                </div>
                <a
                  href={`https://wa.me/${phoneValue.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs sm:text-sm py-2.5 shadow-md shadow-emerald-500/25 active:scale-95 transition-all"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Contact Message Form (Equal Height) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 h-full"
          >
            <Card className="h-full border border-slate-200/90 dark:border-slate-800/90 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-xl rounded-3xl flex flex-col justify-between">
              <CardContent className="p-6 sm:p-8 flex flex-col justify-between h-full">
                <div>
                  <div className="mb-5">
                    <h4 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                      Send us a Message
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Fill out the form below, and we will get back to you within 2 business hours.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Row 1: Name & Email side-by-side on sm+ screens */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          Your Name
                        </Label>
                        <div className="relative mt-1.5">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <User className="h-4 w-4 text-gray-400" />
                          </div>
                          <Input
                            id="name"
                            {...register('name')}
                            className="pl-9 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus-visible:ring-indigo-500 h-10 sm:h-11 rounded-xl text-xs sm:text-sm"
                            placeholder="John Doe"
                          />
                        </div>
                        {errors.name && (
                          <p className="text-xs text-red-500 mt-1 font-medium">{errors.name.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          Email Address
                        </Label>
                        <div className="relative mt-1.5">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Mail className="h-4 w-4 text-gray-400" />
                          </div>
                          <Input
                            id="email"
                            type="email"
                            {...register('email')}
                            className="pl-9 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus-visible:ring-indigo-500 h-10 sm:h-11 rounded-xl text-xs sm:text-sm"
                            placeholder="john@example.com"
                          />
                        </div>
                        {errors.email && (
                          <p className="text-xs text-red-500 mt-1 font-medium">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Subject */}
                    <div>
                      <Label htmlFor="subject" className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Subject
                      </Label>
                      <div className="relative mt-1.5">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <MessageSquare className="h-4 w-4 text-gray-400" />
                        </div>
                        <Input
                          id="subject"
                          {...register('subject')}
                          className="pl-9 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus-visible:ring-indigo-500 h-10 sm:h-11 rounded-xl text-xs sm:text-sm"
                          placeholder="How can we help?"
                        />
                      </div>
                      {errors.subject && (
                        <p className="text-xs text-red-500 mt-1 font-medium">{errors.subject.message}</p>
                      )}
                    </div>

                    {/* Row 3: Message */}
                    <div>
                      <Label htmlFor="message" className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Message
                      </Label>
                      <Textarea
                        id="message"
                        rows={3}
                        {...register('message')}
                        className="mt-1.5 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus-visible:ring-indigo-500 rounded-xl resize-none text-xs sm:text-sm"
                        placeholder="Your message here..."
                      />
                      {errors.message && (
                        <p className="text-xs text-red-500 mt-1 font-medium">{errors.message.message}</p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      variant="gradient"
                      className="w-full h-11 sm:h-12 text-sm font-extrabold gap-2 rounded-2xl shadow-md shadow-indigo-500/25 active:scale-95 transition-all mt-2"
                      disabled={isSubmitting}
                    >
                      <Send className="h-4 w-4" />
                      <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
