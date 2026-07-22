import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { Memory } from '../types'
import { Plus, Trash2 } from 'lucide-react'

export default function MemoryPage() {
  const [newMemory, setNewMemory] = useState('')
  const [category, setCategory] = useState('general')

  const { data: memories, refetch } = useQuery({
    queryKey: ['memories'],
    queryFn: () => api.getMemories(),
  })

  const handleAdd = async () => {
    if (!newMemory.trim()) return
    await api.createMemory({ content: newMemory, category })
    setNewMemory('')
    refetch()
  }

  const handleDelete = async (id: string) => {
    await api.deleteMemory(id)
    refetch()
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-serif font-semibold text-warm-800 mb-2">Memory</h1>
      <p className="text-warm-500 mb-6">Maya will remember these details across conversations.</p>
      
      <div className="flex gap-2 mb-8">
        <input
          value={newMemory}
          onChange={(e) => setNewMemory(e.target.value)}
          placeholder="Remember that I..."
          className="flex-1 bg-white border border-warm-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-white border border-warm-200 rounded-xl px-4 py-2.5"
        >
          <option value="general">General</option>
          <option value="preferences">Preferences</option>
          <option value="personal">Personal</option>
          <option value="work">Work</option>
        </select>
        <button
          onClick={handleAdd}
          className="bg-amber-400 hover:bg-amber-500 text-warm-900 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      <div className="space-y-2">
        {memories?.map((mem: Memory) => (
          <div key={mem.id} className="flex items-center justify-between bg-white rounded-xl border border-warm-200 p-4">
            <div>
              <span className="text-xs bg-warm-100 px-2 py-0.5 rounded text-warm-600 mr-2">{mem.category}</span>
              <span className="text-warm-800">{mem.content}</span>
            </div>
            <button onClick={() => handleDelete(mem.id)} className="text-warm-400 hover:text-red-500">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
