'use client'

import { motion } from 'framer-motion'
import { UserPlus, Zap, Download, TrendingUp } from 'lucide-react'

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: UserPlus,
      title: "Sign Up & Pay Registration Fee",
      description: "Create your account and pay a one-time 3,000 TZS registration fee to access the dashboard. No recurring charges—just one-time access fee.",
      color: "blue"
    },
    {
      number: "02",
      icon: Zap,
      title: "Choose Your Tool",
      description: "Select from research, rewriting, plagiarism check, referencing, or presentation generation.",
      color: "purple"
    },
    {
      number: "03",
      icon: Download,
      title: "Get Instant Results",
      description: "Receive high-quality, academic-grade output in seconds. Download, copy, or export to your preferred format.",
      color: "emerald"
    },
    {
      number: "04",
      icon: TrendingUp,
      title: "Subscribe for Unlimited Access",
      description: "Need unlimited access? Subscribe for 500 TZS/day or 5,000 TZS/month via mobile money. Or use pay-per-use without an account.",
      color: "amber"
    }
  ]

  const colorClasses = {
    blue: {
      bg: "bg-blue-500",
      text: "text-blue-600",
      lightBg: "bg-blue-100",
      gradient: "from-blue-500 to-cyan-500"
    },
    purple: {
      bg: "bg-purple-500",
      text: "text-purple-600",
      lightBg: "bg-purple-100",
      gradient: "from-purple-500 to-pink-500"
    },
    emerald: {
      bg: "bg-emerald-500",
      text: "text-emerald-600",
      lightBg: "bg-emerald-100",
      gradient: "from-emerald-500 to-teal-500"
    },
    amber: {
      bg: "bg-amber-500",
      text: "text-amber-600",
      lightBg: "bg-amber-100",
      gradient: "from-amber-500 to-orange-500"
    }
  }

  return (
    <section className="py-24 lg:py-32 bg-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />
      
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full mb-4">
            <span className="text-sm font-semibold text-slate-700">How It Works</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy-950 mb-6 leading-tight">
            Get started in{' '}
            <span className="text-blue-600">4 simple steps</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
            From signup to success—here&apos;s how AI Assignment Helper makes your academic life easier.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-16 lg:space-y-24">
          {steps.map((step, index) => {
            const colors = colorClasses[step.color as keyof typeof colorClasses]
            const isEven = index % 2 === 0
            const Icon = step.icon

            return (
              <motion.div
                key={index}
                className="grid lg:grid-cols-2 gap-12 items-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {/* Content */}
                <div className={`${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${colors.lightBg} rounded-2xl mb-6`}>
                    <Icon className={`w-8 h-8 ${colors.text}`} />
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <span className={`text-5xl md:text-6xl font-bold bg-gradient-to-br ${colors.gradient} bg-clip-text text-transparent`}>
                      {step.number}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold text-navy-950">{step.title}</h3>
                  </div>
                  
                  <p className="text-lg text-slate-600 leading-relaxed mb-6">
                    {step.description}
                  </p>
                  
                  {/* Progress indicator */}
                  {index < steps.length - 1 && (
                    <div className="flex items-center gap-3 mt-8">
                      <div className={`w-12 h-1 ${colors.bg} rounded-full`} />
                      <span className="text-sm text-slate-400 font-medium">Next Step</span>
                    </div>
                  )}
                </div>

                {/* Visual */}
                <div className={`${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                  <motion.div
                    className={`relative aspect-square bg-gradient-to-br ${colors.gradient} rounded-3xl p-8 overflow-hidden shadow-2xl`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Mockup content */}
                    <div className="relative z-10 h-full flex items-center justify-center">
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 border border-white/30 w-full">
                        <Icon className="w-16 md:w-20 h-16 md:h-20 text-white mx-auto mb-6" />
                        <div className="space-y-3">
                          <div className="h-4 bg-white/40 rounded w-3/4 mx-auto" />
                          <div className="h-4 bg-white/30 rounded w-full mx-auto" />
                          <div className="h-4 bg-white/30 rounded w-5/6 mx-auto" />
                        </div>
                        
                        {/* Additional visual elements based on step */}
                        {index === 0 && (
                          <div className="mt-6 space-y-2">
                            <div className="h-10 bg-white/30 rounded-lg" />
                            <div className="h-10 bg-white/30 rounded-lg" />
                          </div>
                        )}
                        
                        {index === 1 && (
                          <div className="mt-6 grid grid-cols-2 gap-2">
                            {[...Array(4)].map((_, i) => (
                              <div key={i} className="h-16 bg-white/30 rounded-lg" />
                            ))}
                          </div>
                        )}
                        
                        {index === 2 && (
                          <div className="mt-6">
                            <div className="h-12 bg-white/40 rounded-lg flex items-center justify-center">
                              <div className="w-6 h-6 border-2 border-white rounded-full" />
                            </div>
                          </div>
                        )}
                        
                        {index === 3 && (
                          <div className="mt-6 flex gap-2">
                            <div className="h-10 bg-white/40 rounded-lg flex-1" />
                            <div className="h-10 bg-white/40 rounded-lg flex-1" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Decorative circles */}
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                  </motion.div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Call to Action */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-lg text-slate-600 mb-4">Ready to get started?</p>
          <motion.a
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create Free Account
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

