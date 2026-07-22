import { useState } from 'react'
import { Code, FileText, Image, Braces } from 'lucide-react'
import CodeBlock from './CodeBlock'

interface Artifact {
  type: 'code' | 'svg' | 'html' | 'json'
  content: string
  language?: string
  title?: string
}

interface Props {
  artifact: Artifact
}

export default function ArtifactRenderer({ artifact }: Props) {
  const { type, content, language, title } = artifact

  if (type === 'code') {
    return (
      <div className="rounded-lg overflow-hidden border border-gray-700 my-2">
        <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Code size={14} />
            <span>{title || language || 'code'}</span>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(content)}
            className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-700"
          >
            Copy
          </button>
        </div>
        <pre className="bg-gray-900 p-4 overflow-x-auto">
          <code className={`language-${language || 'text'}`}>{content}</code>
        </pre>
      </div>
    )
  }

  if (type === 'html') {
    return (
      <div className="rounded-lg overflow-hidden border border-gray-700 my-2">
        <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 text-sm text-gray-400">
          <FileText size={14} />
          <span>{title || 'HTML'}</span>
        </div>
        <div className="bg-white p-4">
          <iframe
            srcDoc={content}
            className="w-full h-64 border-0"
            sandbox="allow-scripts"
            title="HTML Artifact"
          />
        </div>
      </div>
    )
  }

  if (type === 'svg') {
    return (
      <div className="rounded-lg overflow-hidden border border-gray-700 my-2">
        <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 text-sm text-gray-400">
          <Image size={14} />
          <span>{title || 'SVG'}</span>
        </div>
        <div
          className="bg-white p-4 flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    )
  }

  if (type === 'json') {
    return (
      <div className="rounded-lg overflow-hidden border border-gray-700 my-2">
        <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 text-sm text-gray-400">
          <Braces size={14} />
          <span>{title || 'JSON'}</span>
        </div>
        <pre className="bg-gray-900 p-4 overflow-x-auto text-sm">
          {JSON.stringify(JSON.parse(content), null, 2)}
        </pre>
      </div>
    )
  }

  return null
}
