import { useState, useRef } from 'react'
import { Send } from 'lucide-react'

interface Props {
  onSend: (message: string, files?: File[]) => void
  disabled?: boolean
}

export default function ChatInput({ onSend, disabled }: Props) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (!input.trim()) return
    onSend(input)
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    // Auto-resize
    const target = e.target
    target.style.height = 'auto'
    target.style.height = Math.min(target.scrollHeight, 200) + 'px'
  }

  return (
    <div className="relative">
      <div className="bg-white rounded-2xl border border-warm-200 shadow-sm focus-within:border-amber-300 focus-within:ring-2 focus-within:ring-amber-100 transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Message Maya..."
          rows={1}
          className="w-full bg-transparent px-4 py-3.5 resize-none focus:outline-none text-warm-800 placeholder:text-warm-400 max-h-[200px]"
        />
        <div className="flex items-center justify-between px-3 pb-3">
          <div className="flex items-center gap-2">
            {/* File upload, other tools could go here */}
          </div>
          <button
            onClick={handleSend}
            disabled={disabled || !input.trim()}
            className="p-2 bg-amber-400 hover:bg-amber-500 disabled:bg-warm-200 disabled:cursor-not-allowed rounded-xl transition-colors"
          >
            <Send size={16} className={input.trim() ? 'text-warm-800' : 'text-warm-400'} />
          </button>
        </div>
      </div>
    </div>
  )
}
