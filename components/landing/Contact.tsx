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
import { Mail, Phone, MapPin, Send, User, MessageSquare } from 'lucide-react';
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
    <section id="contact" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold sm:text-4xl text-gray-900 dark:text-white">
            Get in Touch
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Have questions? We would love to hear from you.
          </p>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            {[
              { icon: Mail, label: 'Email', value: config?.email || 'hello@tenanthub.com' },
              { icon: Phone, label: 'Phone', value: config?.phone || '+1 (555) 123-4567' },
              { icon: MapPin, label: 'Address', value: config?.address || '123 SaaS Street, San Francisco, CA' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900">
                  <item.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{item.label}</div>
                  <div className="text-gray-600 dark:text-gray-400">{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          <Card className="border-0 shadow-2xl bg-white/50 backdrop-blur-sm dark:bg-gray-900/50">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</Label>
                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input id="name" {...register('name')} className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus-visible:ring-indigo-500 h-12" placeholder="John Doe" />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1.5 font-medium">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input id="email" type="email" {...register('email')} className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus-visible:ring-indigo-500 h-12" placeholder="john@example.com" />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1.5 font-medium">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="subject" className="text-sm font-medium text-gray-700 dark:text-gray-300">Subject</Label>
                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <MessageSquare className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input id="subject" {...register('subject')} className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus-visible:ring-indigo-500 h-12" placeholder="How can we help?" />
                  </div>
                  {errors.subject && (
                    <p className="text-sm text-red-500 mt-1.5 font-medium">{errors.subject.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300">Message</Label>
                  <Textarea id="message" rows={4} {...register('message')} className="mt-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus-visible:ring-indigo-500 resize-none" placeholder="Your message here..." />
                  {errors.message && (
                    <p className="text-sm text-red-500 mt-1.5 font-medium">{errors.message.message}</p>
                  )}
                </div>
                <Button type="submit" variant="gradient" className="w-full h-12 text-base font-medium gap-2 mt-4" disabled={isSubmitting}>
                  <Send className="h-5 w-5" />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
