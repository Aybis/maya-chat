import { useState } from 'react'
import { Copy, Check, Download } from 'lucide-react'

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
}

export default function CodeBlock({ code, language = 'text', filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-lg overflow-hidden bg-gray-900 border border-gray-800">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50">
        <span className="text-xs text-gray-400 font-mono">{filename || language}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  )
}
