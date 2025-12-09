'use client'

import { motion } from 'framer-motion'
import { FileText, RefreshCw, Shield, FileCode, Presentation, BookOpen } from 'lucide-react'

export function FeaturesShowcase() {
  return (
    <section id="features" className="py-24 lg:py-32 bg-slate-50">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <motion.div 
          className="max-w-3xl mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-4">
            <span className="text-sm font-semibold text-blue-700">Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy-950 mb-6 leading-tight">
            Everything you need to{' '}
            <span className="text-blue-600">excel academically</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
            Five powerful AI tools designed specifically for college students. 
            No more late nights struggling with assignments.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 auto-rows-[minmax(280px,auto)]">
          {/* Large Feature Card (spans 2x2) - AI Research Assistant */}
          <motion.div
            className="lg:col-span-2 lg:row-span-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl p-8 text-white relative overflow-hidden group cursor-pointer"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative z-10 h-full flex flex-col">
              <FileText className="w-14 h-14 mb-6 opacity-90" />
              <h3 className="text-3xl lg:text-4xl font-bold mb-4">AI Research Assistant</h3>
              <p className="text-lg text-white/90 mb-8 max-w-md leading-relaxed">
                Get comprehensive, academic-grade answers to any research question. 
                Our AI understands context and provides well-structured responses with examples.
              </p>
              
              {/* Mock interface */}
              <div className="mt-auto bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="space-y-3">
                  <div className="h-3 bg-white/30 rounded w-3/4" />
                  <div className="h-3 bg-white/20 rounded w-full" />
                  <div className="h-3 bg-white/20 rounded w-5/6" />
                  <div className="flex gap-2 mt-4">
                    <div className="h-8 bg-white/30 rounded-lg flex-1" />
                    <div className="h-8 bg-white/40 rounded-lg w-24" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
          </motion.div>

          {/* Medium Feature Cards - Top Right */}
          <motion.div
            className="lg:col-span-1 lg:row-span-1 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-6 text-white relative overflow-hidden group cursor-pointer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="relative z-10">
              <RefreshCw className="w-10 h-10 mb-4" />
              <h3 className="text-xl lg:text-2xl font-bold mb-2">Grammar & Rewriting</h3>
              <p className="text-sm text-white/90 leading-relaxed">
                Transform rough drafts into polished academic writing instantly
              </p>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          </motion.div>

          <motion.div
            className="lg:col-span-1 lg:row-span-1 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl p-6 text-white relative overflow-hidden group cursor-pointer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative z-10">
              <Shield className="w-10 h-10 mb-4" />
              <h3 className="text-xl lg:text-2xl font-bold mb-2">Plagiarism Checker</h3>
              <p className="text-sm text-white/90 leading-relaxed">
                Ensure originality with advanced similarity detection
              </p>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          </motion.div>

          {/* Small Feature Cards - Bottom Right */}
          <motion.div
            className="bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-6 text-white relative overflow-hidden group cursor-pointer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="relative z-10">
              <FileCode className="w-10 h-10 mb-4" />
              <h3 className="text-xl lg:text-2xl font-bold mb-2">APA Referencing</h3>
              <p className="text-sm text-white/90 leading-relaxed">
                Perfect citations instantly
              </p>
            </div>
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-2xl" />
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-amber-500 to-yellow-500 rounded-3xl p-6 text-white relative overflow-hidden group cursor-pointer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="relative z-10">
              <Presentation className="w-10 h-10 mb-4" />
              <h3 className="text-xl lg:text-2xl font-bold mb-2">PPT Generator</h3>
              <p className="text-sm text-white/90 leading-relaxed">
                Create presentations in seconds
              </p>
            </div>
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-2xl" />
          </motion.div>
        </div>

        {/* Additional Benefits */}
        <motion.div 
          className="mt-16 grid md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          {[
            {
              title: 'Lightning Fast',
              description: 'Get results in seconds, not hours',
            },
            {
              title: 'Always Accurate',
              description: 'AI trained on academic standards',
            },
            {
              title: 'Easy to Use',
              description: 'No learning curve required',
            },
          ].map((benefit, index) => (
            <div key={index} className="text-center">
              <h4 className="text-xl font-bold text-navy-950 mb-2">{benefit.title}</h4>
              <p className="text-slate-600">{benefit.description}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

