'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, CheckCircle, Zap, Shield, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />
      
      {/* Floating orbs with smooth animation */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl"
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <div className="container mx-auto px-6 lg:px-12 pt-24 lg:pt-32 pb-20 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Content - 60% width */}
          <motion.div 
            className="lg:col-span-7"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Announcement Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">
                ✨ Your Late-Night Assignment Savior - Trusted by 10,000+ Students
              </span>
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1]">
              <span className="text-white">Running Late on Your Assignment?</span>
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                We&apos;ve Got Your Back
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl leading-relaxed">
              Create professional assignments in minutes, even at 2 AM. Our AI Assignment Writer delivers perfect formatting, 
              proper citations, and academic structure. Thousands of students use it when deadlines are tight.
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 md:gap-8 mb-10">
              {[
                { icon: Zap, text: 'Ready in 10 Minutes' },
                { icon: CheckCircle, text: 'No Stress, Just Results' },
                { icon: Shield, text: 'Academic Quality Guaranteed' }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <item.icon className="w-5 h-5 text-emerald-400" />
                  <span className="text-slate-300 text-sm md:text-base">{item.text}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/signup">
                <motion.a
                  className="group px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 text-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get My Assignment Done Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.a>
              </Link>
              <motion.a
                href="#quick-tools"
                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 backdrop-blur-sm transition-all duration-300 flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                See How It Works
              </motion.a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-white/10">
              {[
                { number: '10K+', label: 'Students Saved' },
                { number: '50K+', label: 'Last-Minute Wins' },
                { number: '4.9★', label: 'Students Love It' }
              ].map((stat, index) => (
                <div key={index}>
                  <motion.div 
                    className="text-3xl md:text-4xl font-bold text-white mb-1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    {stat.number}
                  </motion.div>
                  <div className="text-xs md:text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Product Mockup (40% width) */}
          <motion.div 
            className="lg:col-span-5 relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            {/* MacBook Frame */}
            <div className="relative">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-2 shadow-2xl border border-white/10">
                <div className="bg-slate-900 rounded-lg overflow-hidden">
                  {/* Browser Chrome */}
                  <div className="bg-slate-800 px-4 py-3 flex items-center gap-2 border-b border-slate-700">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <div className="flex-1 bg-slate-700/50 rounded px-3 py-1 text-xs text-slate-400">
                      aiassignmenthelper.com
                    </div>
                  </div>
                  
                  {/* App Screenshot Simulation */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="h-8 w-32 bg-white/10 rounded-lg" />
                        <div className="h-8 w-8 bg-amber-500/20 rounded-full" />
                      </div>
                      
                      {/* Content cards */}
                      <motion.div 
                        className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <div className="h-3 bg-white/30 rounded w-1/3 mb-3" />
                        <div className="h-2 bg-white/20 rounded w-full mb-2" />
                        <div className="h-2 bg-white/20 rounded w-5/6" />
                      </motion.div>
                      
                      <motion.div 
                        className="bg-amber-500/20 backdrop-blur-sm rounded-lg p-4 border border-amber-500/30"
                        animate={{ opacity: [1, 0.7, 1] }}
                        transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-500/50 rounded-full" />
                          <div className="flex-1">
                            <div className="h-2 bg-amber-500/50 rounded w-2/3 mb-2" />
                            <div className="h-2 bg-amber-500/30 rounded w-1/2" />
                          </div>
                        </div>
                      </motion.div>

                      <div className="flex gap-2">
                        <div className="h-2 bg-white/10 rounded flex-1" />
                        <div className="h-2 bg-white/10 rounded flex-1" />
                        <div className="h-2 bg-white/10 rounded flex-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Feature Cards */}
              <motion.div
                className="absolute -right-4 lg:-right-8 top-12 bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-2xl max-w-[200px]"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Assignment Saved!</div>
                    <div className="text-xs text-slate-400">Just now</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute -left-4 lg:-left-8 bottom-24 bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-2xl max-w-[200px]"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Deadline Met!</div>
                    <div className="text-xs text-slate-400">2 min ago</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute -right-4 bottom-8 bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20 shadow-2xl"
                animate={{ 
                  y: [0, -8, 0],
                  rotate: [0, 2, 0]
                }}
                transition={{ duration: 5, repeat: Infinity, delay: 2, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <span className="text-xs font-semibold text-white">95% Accuracy</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent" />
    </section>
  )
}

