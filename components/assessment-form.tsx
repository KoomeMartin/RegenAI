'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'

type Question = {
  id: number
  text: string
  type?: string
  options?: string[]
  scores?: number[]
  min?: number
  max?: number
  labels?: Record<string, string>
}

export function AssessmentForm({
  assessment,
  userId,
}: {
  assessment: any
  userId: string
}) {
  const router = useRouter()
  const questions = assessment.questions as Question[]
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAnswerChange = (questionId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (Object.keys(answers).length !== questions.length) {
      setError('Please answer all questions')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/assessments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: assessment.id,
          userId,
          answers,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit assessment')
      }

      router.push('/assessments')
      router.refresh()
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {questions.map((question, index) => (
        <div key={question.id} className="p-6 bg-gradient-to-r from-warmBeige/30 to-lightTeal/20 rounded-lg">
          <p className="font-medium text-gray-800 mb-4">
            {index + 1}. {question.text}
          </p>

          {question.type === 'scale' ? (
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-gray-600 mb-2">
                {Object.entries(question.labels ?? {}).map(([key, label]) => (
                  <span key={key}>{label}</span>
                ))}
              </div>
              <input
                type="range"
                min={question.min ?? 1}
                max={question.max ?? 10}
                value={answers[question.id] ?? question.min ?? 1}
                onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal"
              />
              <div className="text-center">
                <span className="inline-block px-4 py-2 bg-teal text-white rounded-lg font-semibold">
                  {answers[question.id] ?? question.min ?? 1}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {question.options?.map((option, optionIndex) => (
                <label
                  key={optionIndex}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-teal/5 transition-colors"
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={question.scores?.[optionIndex] ?? optionIndex}
                    checked={answers[question.id] === (question.scores?.[optionIndex] ?? optionIndex)}
                    onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value))}
                    className="h-4 w-4 text-teal focus:ring-teal"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={loading || Object.keys(answers).length !== questions.length}
        className="w-full px-6 py-4 bg-teal text-white rounded-lg hover:bg-darkTeal transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium text-lg"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <CheckCircle className="h-5 w-5" />
            Submit Assessment
          </>
        )}
      </button>
    </form>
  )
}
