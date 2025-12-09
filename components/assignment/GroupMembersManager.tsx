'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, X, Users, UserCircle } from 'lucide-react'

interface GroupMember {
  name: string
  registration_no: string
}

interface GroupRepresentative {
  name: string
  role: string
  registration_no: string
}

interface GroupMembersManagerProps {
  members: GroupMember[]
  representatives: GroupRepresentative[]
  onChange: (members: GroupMember[], representatives: GroupRepresentative[]) => void
}

export function GroupMembersManager({ 
  members, 
  representatives, 
  onChange 
}: GroupMembersManagerProps) {
  const [newMember, setNewMember] = useState({ name: '', registration_no: '' })
  const [newRepresentative, setNewRepresentative] = useState({ name: '', role: '', registration_no: '' })

  const addMember = () => {
    if (!newMember.name || !newMember.registration_no) return
    const updated = [...members, { ...newMember }]
    onChange(updated, representatives)
    setNewMember({ name: '', registration_no: '' })
  }

  const removeMember = (index: number) => {
    const updated = members.filter((_, i) => i !== index)
    onChange(updated, representatives)
  }

  const addRepresentative = () => {
    if (!newRepresentative.name || !newRepresentative.registration_no) return
    const updated = [...representatives, { ...newRepresentative }]
    onChange(members, updated)
    setNewRepresentative({ name: '', role: '', registration_no: '' })
  }

  const removeRepresentative = (index: number) => {
    const updated = representatives.filter((_, i) => i !== index)
    onChange(members, updated)
  }

  return (
    <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-8 space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <UserCircle className="w-5 h-5 text-indigo-400" />
          Group Representatives
        </h3>
        <div className="space-y-3">
          {representatives.map((rep, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
            >
              <div className="flex-1">
                <p className="text-white font-medium">{rep.name}</p>
                <p className="text-sm text-slate-400">{rep.role} • {rep.registration_no}</p>
              </div>
              <button
                onClick={() => removeRepresentative(index)}
                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-red-400" />
              </button>
            </motion.div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <input
            type="text"
            placeholder="Name"
            value={newRepresentative.name}
            onChange={(e) => setNewRepresentative({ ...newRepresentative, name: e.target.value })}
            className="flex-1 px-4 py-2 bg-white/5 border border-dashboard-border rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <input
            type="text"
            placeholder="Role"
            value={newRepresentative.role}
            onChange={(e) => setNewRepresentative({ ...newRepresentative, role: e.target.value })}
            className="flex-1 px-4 py-2 bg-white/5 border border-dashboard-border rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <input
            type="text"
            placeholder="Registration No"
            value={newRepresentative.registration_no}
            onChange={(e) => setNewRepresentative({ ...newRepresentative, registration_no: e.target.value })}
            className="flex-1 px-4 py-2 bg-white/5 border border-dashboard-border rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <button
            onClick={addRepresentative}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          Group Members
        </h3>
        <div className="space-y-3">
          {members.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
            >
              <div className="flex-1">
                <p className="text-white font-medium">{member.name}</p>
                <p className="text-sm text-slate-400">{member.registration_no}</p>
              </div>
              <button
                onClick={() => removeMember(index)}
                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-red-400" />
              </button>
            </motion.div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <input
            type="text"
            placeholder="Name"
            value={newMember.name}
            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
            className="flex-1 px-4 py-2 bg-white/5 border border-dashboard-border rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <input
            type="text"
            placeholder="Registration No"
            value={newMember.registration_no}
            onChange={(e) => setNewMember({ ...newMember, registration_no: e.target.value })}
            className="flex-1 px-4 py-2 bg-white/5 border border-dashboard-border rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <button
            onClick={addMember}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

