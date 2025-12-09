'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

export function SocialProof() {
  const testimonials = [
    {
      name: 'Amina Hassan',
      role: 'Business Administration, UDSM',
      content: 'This tool saved my semester! I was struggling with APA citations until I found AI Assignment Helper. Now my references are perfect every time.',
      rating: 5,
      avatar: 'AH'
    },
    {
      name: 'John Mushi',
      role: 'Computer Science, MUST',
      content: 'The research assistant is incredible. What used to take me 3 hours now takes 10 minutes. The quality is amazing and it\'s always accurate.',
      rating: 5,
      avatar: 'JM'
    },
    {
      name: 'Grace Mollel',
      role: 'Education, OUT',
      content: 'I use the grammar checker before submitting every assignment. It catches mistakes I never would have noticed. My grades have improved significantly!',
      rating: 5,
      avatar: 'GM'
    },
    {
      name: 'David Kijazi',
      role: 'Engineering, UDOM',
      content: 'Best investment for my studies. The daily pass is perfect for exam season, and the monthly pass pays for itself. Highly recommend!',
      rating: 5,
      avatar: 'DK'
    },
    {
      name: 'Fatma Ali',
      role: 'Law, UDSM',
      content: 'The plagiarism checker gives me peace of mind. I always know my work is original before I submit it. Essential tool for every student.',
      rating: 5,
      avatar: 'FA'
    },
    {
      name: 'Emmanuel Peter',
      role: 'Economics, SUA',
      content: 'The PowerPoint generator is a game changer. I created a professional presentation for my thesis defense in 15 minutes. Outstanding!',
      rating: 5,
      avatar: 'EP'
    }
  ]

  const universities = [
    'UDSM',
    'MUST',
    'OUT',
    'UDOM',
    'SUA',
    'MU',
    'ARU',
    'KU'
  ]

  return (
    <section className="py-24 lg:py-32 bg-slate-50">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full mb-4">
            <span className="text-sm font-semibold text-emerald-700">Testimonials</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy-950 mb-6 leading-tight">
            Loved by students{' '}
            <span className="text-emerald-600">across Tanzania</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
            Join thousands of students who are already excelling with AI Assignment Helper.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-shadow duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              {/* Quote icon */}
              <div className="mb-4">
                <Quote className="w-8 h-8 text-blue-500 opacity-50" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-slate-700 mb-6 leading-relaxed">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-navy-950">{testimonial.name}</div>
                  <div className="text-sm text-slate-500">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Universities Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-center text-slate-600 mb-6 font-medium">
            Trusted by students from leading Tanzanian universities:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {universities.map((uni, index) => (
              <motion.div
                key={index}
                className="px-6 py-3 bg-white rounded-lg shadow-sm border border-slate-200"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
              >
                <span className="font-bold text-navy-950 text-lg">{uni}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

