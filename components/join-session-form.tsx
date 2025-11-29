'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckSquare, Loader2 } from 'lucide-react'

export function JoinSessionForm({
  sessionId,
  userId,
}: {
  sessionId: string
  userId: string
}) {
  const router = useRouter()
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleJoin = async () => {
    if (!agreed) {
      setError('Please agree to the guidelines')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/group-sessions/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userId }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to join session')
        setLoading(false)
        return
      }

      router.push(`/group-sessions/${sessionId}`)
      router.refresh()
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <label className="flex items-start gap-3 mb-6 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1 h-5 w-5 text-teal rounded focus:ring-teal"
        />
        <span className="text-sm text-gray-700">
          I agree to follow the session guidelines and respect the confidentiality and privacy of all
          participants
        </span>
      </label>

      <button
        onClick={handleJoin}
        disabled={loading || !agreed}
        className="w-full px-6 py-3 bg-teal text-white rounded-lg hover:bg-darkTeal transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Joining...
          </>
        ) : (
          <>
            <CheckSquare className="h-5 w-5" />
            Join Session
          </>
        )}
      </button>
    </div>
  )
}
