import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { Skill } from '../types'
import { Plus, Trash2 } from 'lucide-react'

export default function SkillsPage() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', prompt_template: '' })

  const { data: skills, refetch } = useQuery({
    queryKey: ['skills'],
    queryFn: () => api.getSkills(),
  })

  const handleCreate = async () => {
    if (!form.name || !form.prompt_template) return
    await api.createSkill(form)
    setForm({ name: '', description: '', prompt_template: '' })
    setShowForm(false)
    refetch()
  }

  const handleDelete = async (id: string) => {
    await api.deleteSkill(id)
    refetch()
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-warm-800">Skills</h1>
          <p className="text-warm-500">Custom prompt templates for recurring tasks</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-400 hover:bg-amber-500 text-warm-900 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium"
        >
          <Plus size={16} /> New Skill
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-warm-200 p-6 mb-6 space-y-4">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Skill name"
            className="w-full bg-warm-50 border border-warm-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
          />
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
            className="w-full bg-warm-50 border border-warm-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
          />
          <textarea
            value={form.prompt_template}
            onChange={(e) => setForm({ ...form, prompt_template: e.target.value })}
            placeholder="Use {{message}} where the user's input should go..."
            rows={4}
            className="w-full bg-warm-50 border border-warm-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
          />
          <button onClick={handleCreate} className="bg-amber-400 hover:bg-amber-500 px-4 py-2 rounded-xl text-sm font-medium">
            Create Skill
          </button>
        </div>
      )}

      <div className="space-y-2">
        {skills?.map((skill: Skill) => (
          <div key={skill.id} className="flex items-center justify-between bg-white rounded-xl border border-warm-200 p-4">
            <div>
              <h3 className="font-medium text-warm-800">{skill.name}</h3>
              <p className="text-sm text-warm-500">{skill.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded ${skill.is_active ? 'bg-green-100 text-green-700' : 'bg-warm-100 text-warm-500'}`}>
                {skill.is_active ? 'Active' : 'Inactive'}
              </span>
              <button onClick={() => handleDelete(skill.id)} className="text-warm-400 hover:text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
