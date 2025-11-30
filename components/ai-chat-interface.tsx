'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Plus, AlertTriangle, Loader2, MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Message = {
  role: string
  content: string
  hasCrisisFlag?: boolean
}

type Session = {
  id: string
  title: string | null
  updatedAt: Date
}

export function AIChatInterface({
  userId,
  sessions,
  currentSessionId,
  initialMessages,
}: {
  userId: string
  sessions: Session[]
  currentSessionId: string | null
  initialMessages: Message[]
}) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [showCrisisAlert, setShowCrisisAlert] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleNewSession = () => {
    router.push('/ai-support')
    router.refresh()
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)
    setStreaming(true)

    // Add user message to UI
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])

    // Add placeholder for assistant message
    const assistantMessageIndex = messages.length + 1
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionId: currentSessionId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let partialRead = ''

      while (true) {
        const { done, value } = await reader?.read() ?? { done: true, value: undefined }
        if (done) break

        partialRead += decoder.decode(value, { stream: true })
        let lines = partialRead.split('\n')
        partialRead = lines.pop() ?? ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            try {
              const parsed = JSON.parse(data)
              
              if (parsed.done) {
                setStreaming(false)
                setLoading(false)
                if (parsed.hasCrisis) {
                  setShowCrisisAlert(true)
                }
                // Refresh to update session list
                if (parsed.sessionId && !currentSessionId) {
                  router.push(`/ai-support?session=${parsed.sessionId}`)
                }
                router.refresh()
                break
              }
              
              if (parsed.content) {
                buffer += parsed.content
                setMessages((prev) => {
                  const newMessages = [...prev]
                  newMessages[assistantMessageIndex] = {
                    role: 'assistant',
                    content: buffer,
                  }
                  return newMessages
                })
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => {
        const newMessages = [...prev]
        newMessages[assistantMessageIndex] = {
          role: 'assistant',
          content: 'I apologize, but I encountered an error. Please try again.',
        }
        return newMessages
      })
      setStreaming(false)
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full">
      {/* Sidebar - Session History */}
      <div className="w-64 bg-white/80 backdrop-blur-sm border-r border-gray-200 p-4 overflow-y-auto hide-scrollbar">
        <button
          onClick={handleNewSession}
          className="w-full mb-4 px-4 py-2 bg-teal text-white rounded-lg hover:bg-darkTeal transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-5 w-5" />
          New Chat
        </button>
        
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Recent Chats</h3>
          {sessions?.length > 0 ? (
            sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => {
                  router.push(`/ai-support?session=${session.id}`)
                  router.refresh()
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  currentSessionId === session.id
                    ? 'bg-teal/20 text-darkTeal font-medium'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="truncate">{session.title ?? 'New Chat'}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(session.updatedAt).toLocaleDateString()}
                </div>
              </button>
            ))
          ) : (
            <p className="text-sm text-gray-500">No previous chats</p>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Crisis Alert */}
        {showCrisisAlert && (
          <div className="bg-red-50 border-b-2 border-red-400 p-4">
            <div className="max-w-4xl mx-auto flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-800 mb-1">Crisis Resources Available</h3>
                <p className="text-sm text-red-700">
                  If you're in immediate danger or experiencing a crisis, please contact your local emergency services or crisis helpline immediately. You don't have to face this alone.
                </p>
                <button
                  onClick={() => setShowCrisisAlert(false)}
                  className="text-sm text-red-600 hover:text-red-800 underline mt-2"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 hide-scrollbar">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages?.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="h-16 w-16 text-teal mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-darkTeal mb-2">
                  Welcome. This is your safe space 🧘.
                </h2>
                <p className="text-gray-600 mb-4">
                  Share what's on your mind, I’m here to listen and support you 💬.
                </p>
                <div className="bg-lightTeal/30 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-sm text-gray-700">
                    You’re not alone here. Let’s take this one step at a time.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-6 py-4 rounded-2xl shadow-md ${
                      msg.role === 'user'
                        ? 'bg-teal text-white'
                        : 'bg-white text-gray-800'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            {streaming && (
              <div className="flex justify-start">
                <div className="bg-white px-6 py-4 rounded-2xl shadow-md">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-teal rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-teal rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-teal rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm p-4">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-teal text-white rounded-lg hover:bg-darkTeal transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
