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
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-gray-400">Organize your conversations with custom system prompts.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-900 rounded-lg p-6 mb-6 space-y-4">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Project name"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
            rows={2}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
          />
          <textarea
            value={form.system_prompt}
            onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
            placeholder="System prompt for this project..."
            rows={4}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
          />
          <button onClick={handleCreate} className="bg-purple-600 px-4 py-2 rounded-lg">
            Create Project
          </button>
        </div>
      )}

      <div className="space-y-3">
        {projects?.map((project: Project) => (
          <div key={project.id} className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{project.name}</h3>
                <p className="text-sm text-gray-400">{project.description}</p>
              </div>
              <button onClick={() => handleDelete(project.id)} className="text-gray-500 hover:text-red-400">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
