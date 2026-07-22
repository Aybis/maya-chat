import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { Project } from '../types'
import { Plus, Trash2 } from 'lucide-react'

export default function ProjectsPage() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', system_prompt: '' })

  const { data: projects, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.getProjects(),
  })

  const handleCreate = async () => {
    if (!form.name) return
    await api.createProject(form)
    setForm({ name: '', description: '', system_prompt: '' })
    setShowForm(false)
    refetch()
  }

  const handleDelete = async (id: string) => {
    await api.deleteProject(id)
    refetch()
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-warm-800">Projects</h1>
          <p className="text-warm-500">Organize conversations with custom prompts</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-400 hover:bg-amber-500 text-warm-900 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-warm-200 p-6 mb-6 space-y-4">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Project name"
            className="w-full bg-warm-50 border border-warm-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
            rows={2}
            className="w-full bg-warm-50 border border-warm-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
          />
          <textarea
            value={form.system_prompt}
            onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
            placeholder="System prompt..."
            rows={4}
            className="w-full bg-warm-50 border border-warm-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
          />
          <button onClick={handleCreate} className="bg-amber-400 hover:bg-amber-500 px-4 py-2 rounded-xl text-sm font-medium">
            Create Project
          </button>
        </div>
      )}

      <div className="space-y-2">
        {projects?.map((project: Project) => (
          <div key={project.id} className="flex items-center justify-between bg-white rounded-xl border border-warm-200 p-4">
            <div>
              <h3 className="font-medium text-warm-800">{project.name}</h3>
              <p className="text-sm text-warm-500">{project.description}</p>
            </div>
            <button onClick={() => handleDelete(project.id)} className="text-warm-400 hover:text-red-500">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
