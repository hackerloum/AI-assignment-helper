'use client'

import { motion } from 'framer-motion'
import { Star, Users, Award, Check } from 'lucide-react'

interface AuthBrandPanelProps {
  title: string
  description: string
  testimonial?: {
    text: string
    author: string
    role: string
    avatar?: string
  }
  features?: string[]
  stats?: {
    students: string
    assignments: string
    rating: string
  }
}

export function AuthBrandPanel({ 
  title, 
  description, 
  testimonial,
  features,
  stats 
}: AuthBrandPanelProps) {
  return (
    <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Floating shapes */}
      <motion.div
        className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-white mb-2">
            AI Assignment Helper
          </h2>
          <div className="w-16 h-1 bg-white/30 rounded-full" />
        </motion.div>

        {/* Main Content */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            {title}
          </h1>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            {description}
          </p>

          {/* Features List */}
          {features && (
            <div className="space-y-3 mb-12">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                >
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/90">{feature}</span>
                </motion.div>
              ))}
            </div>
          )}

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-3 gap-6 mb-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-white/80" />
                  <span className="text-2xl font-bold text-white">{stats.students}</span>
                </div>
                <p className="text-sm text-white/70">Students</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-white/80" />
                  <span className="text-2xl font-bold text-white">{stats.assignments}</span>
                </div>
                <p className="text-sm text-white/70">Completed</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.7 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-white/80" />
                  <span className="text-2xl font-bold text-white">{stats.rating}</span>
                </div>
                <p className="text-sm text-white/70">Rating</p>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Testimonial */}
      {testimonial && (
        <motion.div
          className="relative z-10 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          
          <p className="text-white/95 mb-4 leading-relaxed">
            &ldquo;{testimonial.text}&rdquo;
          </p>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {testimonial.author.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-white font-semibold">{testimonial.author}</p>
              <p className="text-sm text-white/70">{testimonial.role}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

