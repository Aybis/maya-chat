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
      <h1 className="text-2xl font-bold mb-6">Memory</h1>
      <p className="text-gray-400 mb-6">Claude will remember these details across conversations.</p>
      
      <div className="flex gap-2 mb-8">
        <input
          value={newMemory}
          onChange={(e) => setNewMemory(e.target.value)}
          placeholder="Remember that I..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
        >
          <option value="general">General</option>
          <option value="preferences">Preferences</option>
          <option value="personal">Personal</option>
          <option value="work">Work</option>
        </select>
        <button
          onClick={handleAdd}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      <div className="space-y-2">
        {memories?.map((mem: Memory) => (
          <div key={mem.id} className="flex items-center justify-between bg-gray-900 rounded-lg p-4">
            <div>
              <span className="text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-400 mr-2">{mem.category}</span>
              <span>{mem.content}</span>
            </div>
            <button onClick={() => handleDelete(mem.id)} className="text-gray-500 hover:text-red-400">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
