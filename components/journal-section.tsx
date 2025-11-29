'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Save, X, Edit, Trash2, Loader2 } from 'lucide-react'

type Journal = {
  id: string
  title: string | null
  content: string
  mood: string | null
  createdAt: Date
}

export function JournalSection({
  userId,
  initialJournals,
}: {
  userId: string
  initialJournals: Journal[]
}) {
  const router = useRouter()
  const [journals, setJournals] = useState<Journal[]>(initialJournals)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('okay')
  const [loading, setLoading] = useState(false)

  const moodOptions = [
    { value: 'great', label: '😄 Great', color: 'bg-green-100 text-green-700' },
    { value: 'good', label: '😊 Good', color: 'bg-blue-100 text-blue-700' },
    { value: 'okay', label: '😐 Okay', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'low', label: '😟 Low', color: 'bg-orange-100 text-orange-700' },
    { value: 'struggling', label: '😢 Struggling', color: 'bg-red-100 text-red-700' },
  ]

  const handleSave = async () => {
    if (!content.trim()) return

    setLoading(true)

    try {
      const response = await fetch('/api/journal', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          userId,
          title: title || null,
          content,
          mood,
        }),
      })

      if (response.ok) {
        setShowForm(false)
        setEditingId(null)
        setTitle('')
        setContent('')
        setMood('okay')
        router.refresh()
      }
    } catch (error) {
      console.error('Error saving journal:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (journal: Journal) => {
    setEditingId(journal.id)
    setTitle(journal.title ?? '')
    setContent(journal.content)
    setMood(journal.mood ?? 'okay')
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this journal entry?')) return

    try {
      const response = await fetch(`/api/journal?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error deleting journal:', error)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setTitle('')
    setContent('')
    setMood('okay')
  }

  return (
    <div>
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-teal text-white rounded-lg hover:bg-darkTeal transition-colors"
        >
          <Plus className="h-5 w-5" />
          New Journal Entry
        </button>
      )}

      {showForm && (
        <div className="mb-6 p-6 bg-gradient-to-r from-warmBeige/30 to-lightTeal/20 rounded-lg">
          <h3 className="font-bold text-darkTeal mb-4">
            {editingId ? 'Edit Entry' : 'New Journal Entry'}
          </h3>
          
          <input
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-teal focus:border-transparent outline-none"
          />

          <textarea
            placeholder="Write about your thoughts, feelings, or experiences..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-teal focus:border-transparent outline-none resize-none"
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How are you feeling?
            </label>
            <div className="flex flex-wrap gap-2">
              {moodOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMood(option.value)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    mood === option.value
                      ? option.color + ' ring-2 ring-teal'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading || !content.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-teal text-white rounded-lg hover:bg-darkTeal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Journal Entries */}
      <div className="space-y-4">
        {journals && journals.length > 0 ? (
          journals.map((journal) => {
            const moodOption = moodOptions.find((m) => m.value === journal.mood)
            return (
              <div key={journal.id} className="p-4 bg-white rounded-lg shadow-md">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    {journal.title && (
                      <h4 className="font-semibold text-darkTeal mb-1">{journal.title}</h4>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                      <span>
                        {new Date(journal.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                      {moodOption && (
                        <span className={`px-2 py-0.5 rounded ${moodOption.color} text-xs`}>
                          {moodOption.label}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(journal)}
                      className="p-1 text-gray-600 hover:text-teal transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(journal.id)}
                      className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{journal.content}</p>
              </div>
            )
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No journal entries yet</p>
            <p className="text-sm mt-2">Start writing to track your thoughts and feelings</p>
          </div>
        )}
      </div>
    </div>
  )
}
