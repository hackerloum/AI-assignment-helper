'use client'

import { motion } from 'framer-motion'
import { Building2, Users, Target, Award, Globe, Heart } from 'lucide-react'
import Link from 'next/link'

export default function CompanyPage() {
  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To empower Tanzanian college students with AI-powered tools that make academic success accessible and achievable.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Heart,
      title: 'Our Values',
      description: 'We believe in integrity, innovation, and student success. Every feature we build is designed with your academic journey in mind.',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: Globe,
      title: 'Our Vision',
      description: 'To become the leading AI academic assistant platform in East Africa, helping students excel in their studies and achieve their dreams.',
      color: 'from-emerald-500 to-teal-500'
    },
  ]

  const stats = [
    { label: 'Active Students', value: '10,000+', icon: Users },
    { label: 'Assignments Completed', value: '50,000+', icon: Award },
    { label: 'Countries Served', value: '5+', icon: Globe },
  ]

  return (
    <div className="container mx-auto px-6 lg:px-12 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-amber-500/10 rounded-xl">
              <Building2 className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              About Our Company
            </h1>
          </div>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            We're a Tanzanian-based technology company dedicated to helping college students 
            succeed in their academic journey through innovative AI-powered tools.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6 text-center"
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-amber-500/10 rounded-xl">
                    <Icon className="w-6 h-6 text-amber-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-slate-400">{stat.label}</div>
              </motion.div>
            )
          })}
        </div>

        {/* Our Story */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6">Our Story</h2>
            <div className="space-y-4 text-slate-300 leading-relaxed">
              <p>
                AI Assignment Helper was born from a simple observation: Tanzanian college students 
                were struggling with the same academic challenges—research, citations, grammar, and 
                time management. We saw an opportunity to leverage cutting-edge AI technology to 
                provide accessible, affordable solutions.
              </p>
              <p>
                Founded in 2024, we started with a mission to democratize academic success. We 
                understood that not every student has access to expensive tutoring or premium 
                writing services. Our platform was designed to level the playing field, making 
                professional-grade academic assistance available to all students.
              </p>
              <p>
                Today, we serve thousands of students across Tanzania and East Africa, helping 
                them complete assignments faster, improve their writing, and achieve better 
                academic results. We're proud to be part of their success stories.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Values */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {values.map((value, index) => {
            const Icon = value.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-8"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-xl flex items-center justify-center mb-6`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{value.title}</h3>
                <p className="text-slate-300 leading-relaxed">{value.description}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Team */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6">Our Team</h2>
            <p className="text-slate-300 leading-relaxed mb-6">
              We're a diverse team of developers, educators, and AI specialists who are passionate 
              about education and technology. Our team combines deep technical expertise with a 
              genuine understanding of the challenges students face.
            </p>
            <p className="text-slate-300 leading-relaxed">
              We're constantly working to improve our platform, add new features, and ensure that 
              every student who uses AI Assignment Helper has the best possible experience. Your 
              success is our success.
            </p>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-4">
            Join Our Community
          </h3>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Become part of thousands of students who are achieving better academic results with AI Assignment Helper.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth/signup">
              <motion.button
                className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Free
              </motion.button>
            </Link>
            <Link href="/contact">
              <motion.button
                className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact Us
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

