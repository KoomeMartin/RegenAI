'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Users, AlertCircle } from 'lucide-react'
import { Avatar } from './avatar-selector'

type Message = {
  id: string
  content: string
  userId: string
  userAlias: string
  userAvatar: string
  createdAt: Date
  isFlagged?: boolean
}

export function GroupChatInterface({
  sessionId,
  session,
  userId,
  userAlias,
  userAvatar,
}: {
  sessionId: string
  session: any
  userId: string
  userAlias: string
  userAvatar: string
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch messages on mount and poll every 3 seconds
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/group-sessions/${sessionId}/messages`)
        if (response.ok) {
          const data = await response.json()
          setMessages(data.messages ?? [])
        }
      } catch (error) {
        console.error('Error fetching messages:', error)
      }
    }

    fetchMessages()
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [sessionId])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || loading) return

    const messageContent = input.trim()
    setInput('')
    setLoading(true)

    try {
      const response = await fetch(`/api/group-sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageContent }),
      })

      if (response.ok) {
        // Message will appear via polling
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-white/80 backdrop-blur-sm">
      {/* Header */}
      <div className="bg-teal text-white px-6 py-4 shadow-md">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{session.title}</h1>
              <p className="text-sm opacity-90">{session.topic}</p>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span className="text-sm">{session.participants?.length ?? 0} participants</span>
            </div>
          </div>
        </div>
      </div>

      {/* Guidelines Banner */}
      {session.guidelines && (
        <div className="bg-lightTeal/20 px-6 py-3 border-b">
          <div className="max-w-6xl mx-auto flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-teal mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">{session.guidelines}</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 hide-scrollbar">
        <div className="max-w-6xl mx-auto space-y-4">
          {messages?.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No messages yet. Be the first to share!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="flex gap-3">
                <Avatar avatarId={msg.userAvatar ?? 'avatar1'} size="sm" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-darkTeal">
                      {msg.userId === userId ? 'You' : msg.userAlias}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-gray-800 bg-white rounded-lg px-4 py-2 shadow-sm">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-white px-6 py-4">
        <form onSubmit={handleSendMessage} className="max-w-6xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-teal text-white rounded-lg hover:bg-darkTeal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
