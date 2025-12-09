'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Star, User } from 'lucide-react'

interface Representative {
  name: string
  role: string
  registration_no: string
}

interface Member {
  name: string
  registration_no: string
  phone_number?: string
}

interface GroupMembersManagerProps {
  representatives: Representative[]
  members: Member[]
  onRepresentativesChange: (reps: Representative[]) => void
  onMembersChange: (members: Member[]) => void
  showPhoneNumber?: boolean
}

export function GroupMembersManager({ 
  representatives, 
  members, 
  onRepresentativesChange,
  onMembersChange,
  showPhoneNumber = false
}: GroupMembersManagerProps) {
  const [showRepForm, setShowRepForm] = useState(false)
  const [showMemberForm, setShowMemberForm] = useState(false)

  const addRepresentative = (rep: Representative) => {
    onRepresentativesChange([...representatives, rep])
    setShowRepForm(false)
  }

  const removeRepresentative = (index: number) => {
    onRepresentativesChange(representatives.filter((_, i) => i !== index))
  }

  const addMember = (member: Member) => {
    onMembersChange([...members, member])
    setShowMemberForm(false)
  }

  const removeMember = (index: number) => {
    onMembersChange(members.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Representatives Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400" />
            Group Representatives
          </h3>
          <button
            onClick={() => setShowRepForm(true)}
            className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 text-sm font-medium rounded-lg transition-all flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Representative
          </button>
        </div>
        {representatives.length === 0 ? (
          <div className="text-center py-8 bg-white/5 rounded-lg border border-dashed border-white/10">
            <User className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No representatives added yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {representatives.map((rep, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 p-4 bg-white/5 rounded-lg"
              >
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Star className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{rep.name}</p>
                  <p className="text-sm text-slate-400">
                    {rep.role} • {rep.registration_no}
                  </p>
                </div>
                <button
                  onClick={() => removeRepresentative(index)}
                  className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add Representative Form */}
        <AnimatePresence>
          {showRepForm && (
            <RepresentativeForm
              onSubmit={addRepresentative}
              onCancel={() => setShowRepForm(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Members Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            All Group Members
          </h3>
          <button
            onClick={() => setShowMemberForm(true)}
            className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 text-sm font-medium rounded-lg transition-all flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Member
          </button>
        </div>
        {members.length === 0 ? (
          <div className="text-center py-8 bg-white/5 rounded-lg border border-dashed border-white/10">
            <User className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No members added yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {members.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
              >
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <User className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{member.name}</p>
                  <p className="text-xs text-slate-400 truncate">{member.registration_no}</p>
                  {showPhoneNumber && member.phone_number && (
                    <p className="text-xs text-slate-500 truncate">{member.phone_number}</p>
                  )}
                </div>
                <button
                  onClick={() => removeMember(index)}
                  className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add Member Form */}
        <AnimatePresence>
          {showMemberForm && (
            <MemberForm
              onSubmit={addMember}
              onCancel={() => setShowMemberForm(false)}
              showPhoneNumber={showPhoneNumber}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Representative Form
function RepresentativeForm({ 
  onSubmit, 
  onCancel 
}: { 
  onSubmit: (rep: Representative) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    registration_no: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.role && formData.registration_no) {
      onSubmit(formData)
      setFormData({ name: '', role: '', registration_no: '' })
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="mt-4 p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl space-y-3"
    >
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Full Name"
        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-purple-500"
        required
      />
      <input
        type="text"
        value={formData.role}
        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        placeholder="Role (e.g., Chairperson, Secretary)"
        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-purple-500"
        required
      />
      <input
        type="text"
        value={formData.registration_no}
        onChange={(e) => setFormData({ ...formData, registration_no: e.target.value })}
        placeholder="Registration Number"
        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-purple-500"
        required
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Add Representative
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </motion.form>
  )
}

// Member Form
function MemberForm({ 
  onSubmit, 
  onCancel,
  showPhoneNumber = false
}: { 
  onSubmit: (member: Member) => void
  onCancel: () => void
  showPhoneNumber?: boolean
}) {
  const [formData, setFormData] = useState({
    name: '',
    registration_no: '',
    phone_number: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.registration_no) {
      onSubmit(formData)
      setFormData({ name: '', registration_no: '', phone_number: '' })
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="mt-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-3"
    >
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Full Name"
        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-blue-500"
        required
      />
      <input
        type="text"
        value={formData.registration_no}
        onChange={(e) => setFormData({ ...formData, registration_no: e.target.value })}
        placeholder="Registration Number"
        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-blue-500"
        required
      />
      {showPhoneNumber && (
        <input
          type="tel"
          value={formData.phone_number}
          onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
          placeholder="Phone Number (e.g., 0712308504)"
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-blue-500"
        />
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Add Member
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </motion.form>
  )
}
