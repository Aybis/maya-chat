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
          <h1 className="text-2xl font-bold">Skills</h1>
          <p className="text-gray-400">Custom prompt templates for recurring tasks.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={16} /> New Skill
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-900 rounded-lg p-6 mb-6 space-y-4">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Skill name"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
          />
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
          />
          <textarea
            value={form.prompt_template}
            onChange={(e) => setForm({ ...form, prompt_template: e.target.value })}
            placeholder="Use {{message}} where the user's input should go..."
            rows={4}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
          />
          <button onClick={handleCreate} className="bg-purple-600 px-4 py-2 rounded-lg">
            Create Skill
          </button>
        </div>
      )}

      <div className="space-y-3">
        {skills?.map((skill: Skill) => (
          <div key={skill.id} className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{skill.name}</h3>
                <p className="text-sm text-gray-400">{skill.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded ${skill.is_active ? 'bg-green-900 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                  {skill.is_active ? 'Active' : 'Inactive'}
                </span>
                <button onClick={() => handleDelete(skill.id)} className="text-gray-500 hover:text-red-400">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
