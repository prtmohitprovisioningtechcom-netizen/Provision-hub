'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Send, User, Mail, Phone, FileText, CheckCircle, IndianRupee } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

interface RequirementForm {
  customerName: string;
  email: string;
  phone: string;
  title: string;
  description: string;
  budget?: string;
}

export default function PostRequirementPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RequirementForm>();

  const onSubmit = async (data: RequirementForm) => {
    setSubmitting(true);
    try {
      const res = await axios.post('/api/requirements', data);
      if (res.data.success) {
        setSubmitted(true);
        reset();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to submit requirement');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 dark:bg-gray-950">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-900 rounded-3xl p-10 text-center max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800"
        >
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">Requirement Submitted!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Thank you for posting your requirement. Our team will review the details and get back to you shortly.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="w-full py-4 rounded-xl font-bold bg-gray-100 hover:bg-gray-200 text-gray-900 transition-colors"
          >
            Post Another Requirement
          </button>
          <Link
            href="/"
            className="mt-3 block w-full rounded-xl py-3 font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950"
          >
            Back to website
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-white dark:bg-gray-950 flex items-center justify-center py-20 px-4">
      <header className="absolute inset-x-0 top-0 z-20 border-b border-gray-200/70 bg-white/80 px-4 py-3 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <BrandLogo imageClassName="h-8" iconClassName="h-8 w-8" />
          <Link href="/search" className="text-sm font-medium text-indigo-600 hover:underline">
            Company Directory
          </Link>
        </div>
      </header>
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="text-center mb-10 space-y-4">
          <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            What are you looking for?
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Tell us what you need and we will connect you with the best verified businesses.
          </p>
        </div>

        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200 dark:border-gray-800 p-8 md:p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Your Name *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('customerName', { required: 'Name is required' })}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    placeholder="John Doe"
                  />
                  {errors.customerName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.customerName.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Email Address *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    {...register('email', { required: 'Email is required' })}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email.message}</p>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Phone Number *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    {...register('phone', { required: 'Phone is required' })}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    placeholder="+91 9876543210"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1 ml-1">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Estimated Budget (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <IndianRupee className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('budget')}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    placeholder="e.g. 50,000 - 1,00,000"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Requirement Title *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('title', { required: 'Title is required' })}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  placeholder="E.g. Need a Web Developer for E-commerce site"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1 ml-1">{errors.title.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Detailed Description *</label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={5}
                className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none"
                placeholder="Please describe your requirements in detail. What specific features or services do you need?"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1 ml-1">{errors.description.message}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-indigo-600 px-8 py-4 font-bold text-white transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70"
            >
              <span className="relative z-10">{submitting ? 'Submitting...' : 'Post Requirement'}</span>
              {!submitting && <Send className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />}
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
