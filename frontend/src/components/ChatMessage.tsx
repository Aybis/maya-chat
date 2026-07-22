import { Message } from '../types'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { User, Bot } from 'lucide-react'

interface Props {
  message: Message
}

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-4 p-6 ${isUser ? 'bg-gray-900' : 'bg-gray-950'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-600' : 'bg-purple-600'}`}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      <div className="flex-1 max-w-3xl">
        <div className="text-sm text-gray-400 mb-1">{isUser ? 'You' : 'Claude'}</div>
        <div className="prose prose-invert max-w-none">
          <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {message.content}
          </Markdown>
        </div>
      </div>
    </div>
  )
}
