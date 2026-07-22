import { useState, useRef, useEffect } from 'react'
import ChatMessage from '../components/ChatMessage'
import ChatInput from '../components/ChatInput'
import { useWebSocket } from '../hooks/useWebSocket'
import { Message } from '../types'
import { api } from '../api/client'

const WS_URL = `ws://${window.location.host}/ws/chat`

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [conversationId, setConversationId] = useState<string>('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Create a new conversation on mount
    api.createConversation({ title: 'New Chat', model: 'gpt-4o' }).then(conv => {
      setConversationId(conv.id)
    })
  }, [])

  const { send } = useWebSocket({
    url: WS_URL,
    onMessage: (data) => {
      if (data.type === 'token') {
        setIsTyping(true)
        setMessages(prev => {
          const last = prev[prev.length - 1]
          if (last?.role === 'assistant') {
            return [...prev.slice(0, -1), { ...last, content: last.content + data.content }]
          }
          return [...prev, {
            id: Date.now().toString(),
            conversation_id: conversationId,
            role: 'assistant',
            content: data.content,
            artifacts: [],
            attachments: [],
            created_at: new Date().toISOString(),
          }]
        })
      } else if (data.type === 'done') {
        setIsTyping(false)
      } else if (data.type === 'error') {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          conversation_id: conversationId,
          role: 'assistant',
          content: `Error: ${data.content}`,
          artifacts: [],
          attachments: [],
          created_at: new Date().toISOString(),
        }])
        setIsTyping(false)
      }
    },
  })

  const handleSend = (content: string, files: File[] = []) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      conversation_id: conversationId,
      role: 'user',
      content,
      artifacts: [],
      attachments: files.map(f => ({ id: '', filename: f.name, mime_type: f.type, size: f.size })),
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    
    send({
      conversation_id: conversationId,
      message: content,
      model: 'gpt-4o',
      attachments: userMsg.attachments,
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Maya Chat</h2>
              <p>How can I help you today?</p>
            </div>
          </div>
        ) : (
          messages.map(msg => <ChatMessage key={msg.id} message={msg} />)
        )}
        {isTyping && (
          <div className="flex gap-4 p-6 bg-gray-950">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
            <div className="text-gray-400">Claude is thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSend={handleSend} />
    </div>
  )
}
