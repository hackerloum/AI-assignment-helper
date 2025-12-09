'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Users, 
  User, 
  Plus,
  Upload,
  BookTemplate,
  Clock,
  Filter
} from 'lucide-react'
import Link from 'next/link'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Assignment {
  id: string
  title: string
  assignment_type: 'individual' | 'group'
  course_name: string
  created_at: string
  status: 'draft' | 'completed'
}

export default function AssignmentPage() {
  const [filter, setFilter] = useState<'all' | 'individual' | 'group'>('all')
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAssignments()
  }, [filter])

  const loadAssignments = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      let query = supabase
        .from('assignments_new')
        .select('id, title, assignment_type, course_name, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('assignment_type', filter)
      }

      const { data, error } = await query

      if (error) throw error

      setAssignments((data || []).map(a => ({
        ...a,
        status: 'completed' as const
      })))
    } catch (error: any) {
      console.error('Error loading assignments:', error)
      toast.error('Failed to load assignments')
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { label: 'Total Assignments', value: assignments.length.toString(), icon: FileText, color: 'blue' },
    { label: 'Group Projects', value: assignments.filter(a => a.assignment_type === 'group').length.toString(), icon: Users, color: 'purple' },
    { label: 'Individual Work', value: assignments.filter(a => a.assignment_type === 'individual').length.toString(), icon: User, color: 'emerald' },
  ]

  const filteredAssignments = filter === 'all' 
    ? assignments 
    : assignments.filter(a => a.assignment_type === filter)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 rounded-xl">
              <FileText className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Assignment Writer</h1>
              <p className="text-slate-400">Create properly formatted academic assignments</p>
            </div>
          </div>
          <Link href="/assignment/new">
            <motion.button
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
              New Assignment
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`p-3 bg-${stat.color}-500/10 rounded-xl`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-400`} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/assignment/new?type=individual">
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 cursor-pointer"
          >
            <User className="w-8 h-8 text-white mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Individual Assignment</h3>
            <p className="text-sm text-white/80">Single student submission with your details</p>
          </motion.div>
        </Link>
        <Link href="/assignment/new?type=group">
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 cursor-pointer"
          >
            <Users className="w-8 h-8 text-white mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Group Assignment</h3>
            <p className="text-sm text-white/80">Multiple students with representatives</p>
          </motion.div>
        </Link>
        <Link href="/assignment/templates">
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 cursor-pointer"
          >
            <BookTemplate className="w-8 h-8 text-white mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Manage Templates</h3>
            <p className="text-sm text-white/80">Create custom templates from samples</p>
          </motion.div>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="w-5 h-5 text-slate-400" />
        <div className="flex gap-2">
          {(['all', 'individual', 'group'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === filterType
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Assignments List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No assignments yet"
          description="Create your first assignment using one of the quick actions above"
          actionLabel="Create Assignment"
          actionHref="/assignment/new"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssignments.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))}
        </div>
      )}
    </div>
  )
}

function AssignmentCard({ assignment }: { assignment: Assignment }) {
  return (
    <Link href={`/assignment/${assignment.id}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6 cursor-pointer hover:border-indigo-500/30 transition-all"
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2 ${
            assignment.assignment_type === 'group' ? 'bg-purple-500/10' : 'bg-blue-500/10'
          } rounded-lg`}>
            {assignment.assignment_type === 'group' ? (
              <Users className={`w-5 h-5 ${
                assignment.assignment_type === 'group' ? 'text-purple-400' : 'text-blue-400'
              }`} />
            ) : (
              <User className="w-5 h-5 text-blue-400" />
            )}
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            assignment.status === 'completed'
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-amber-500/10 text-amber-400'
          }`}>
            {assignment.status}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
          {assignment.title}
        </h3>
        <p className="text-sm text-slate-400 mb-4">{assignment.course_name || 'No course'}</p>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock className="w-4 h-4" />
          <span>{new Date(assignment.created_at).toLocaleDateString()}</span>
        </div>
      </motion.div>
    </Link>
  )
}

