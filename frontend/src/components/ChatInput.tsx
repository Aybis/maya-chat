import { useState, useRef } from 'react'
import { Send, Paperclip } from 'lucide-react'

interface Props {
  onSend: (message: string, files?: File[]) => void
  disabled?: boolean
}

export default function ChatInput({ onSend, disabled }: Props) {
  const [input, setInput] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if (!input.trim() && files.length === 0) return
    onSend(input, files)
    setInput('')
    setFiles([])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-gray-800 bg-gray-900 p-4">
      {files.length > 0 && (
        <div className="flex gap-2 mb-2 flex-wrap">
          {files.map((f, i) => (
            <span key={i} className="text-xs bg-gray-800 px-2 py-1 rounded">
              {f.name}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2 max-w-3xl mx-auto">
        <button
          onClick={() => fileRef.current?.click()}
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
        >
          <Paperclip size={20} />
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
        />
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message..."
          rows={1}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-purple-500"
        />
        <button
          onClick={handleSend}
          disabled={disabled || (!input.trim() && files.length === 0)}
          className="p-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:hover:bg-purple-600 rounded-xl transition-colors"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  )
}
