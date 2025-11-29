'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Bookmark, CheckCircle, Clock, Share2, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'

interface ArticleData {
  content: {
    id: string
    title: string
    slug: string
    category: string
    description: string
    content: string
    contentType: string
    difficulty: string
    duration: number
    tags: string[]
    author: string
    createdAt: string
  }
  progress: {
    progress: number
    completed: boolean
  } | null
  isBookmarked: boolean
}

export default function ArticlePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [data, setData] = useState<ArticleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookmarking, setBookmarking] = useState(false)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    if (slug) {
      fetch(`/api/learn/${slug}`)
        .then(res => {
          if (!res.ok) throw new Error('Not found')
          return res.json()
        })
        .then(data => {
          setData(data)
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
          router.push('/learn')
        })
    }
  }, [slug, router])

  const handleBookmark = async () => {
    if (!data) return
    
    setBookmarking(true)
    try {
      const res = await fetch('/api/learn/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId: data.content.id }),
      })

      if (res.ok) {
        const result = await res.json()
        setData({
          ...data,
          isBookmarked: result.bookmarked,
        })
        toast.success(result.bookmarked ? 'Bookmarked!' : 'Bookmark removed')
      }
    } catch (error) {
      toast.error('Failed to bookmark')
    } finally {
      setBookmarking(false)
    }
  }

  const handleMarkComplete = async () => {
    if (!data) return
    
    setCompleting(true)
    try {
      const res = await fetch('/api/learn/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: data.content.id,
          progress: 100,
          completed: true,
        }),
      })

      if (res.ok) {
        setData({
          ...data,
          progress: {
            progress: 100,
            completed: true,
          },
        })
        toast.success('Marked as complete!')
      }
    } catch (error) {
      toast.error('Failed to update progress')
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    )
  }

  if (!data) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">Article not found</p>
        <Link href="/learn">
          <Button className="mt-4">Back to Learn</Button>
        </Link>
      </Card>
    )
  }

  const { content, progress, isBookmarked } = data

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      anxiety: 'bg-yellow-100 text-yellow-700',
      depression: 'bg-blue-100 text-blue-700',
      stress: 'bg-red-100 text-red-700',
      'coping-skills': 'bg-green-100 text-green-700',
      sleep: 'bg-purple-100 text-purple-700',
      relationships: 'bg-pink-100 text-pink-700',
      'self-care': 'bg-teal-100 text-teal-700',
    }
    return colors[category] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link href="/learn" className="inline-flex items-center gap-2 text-teal hover:text-darkTeal transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Articles
      </Link>

      {/* Header */}
      <Card className="p-8">
        <div className="flex items-start justify-between mb-4">
          <Badge className={getCategoryColor(content.category)}>
            {content.category}
          </Badge>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBookmark}
              disabled={bookmarking}
              className={isBookmarked ? 'bg-teal text-white hover:bg-darkTeal' : ''}
            >
              {bookmarking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <><Bookmark className="h-4 w-4 mr-1" /> {isBookmarked ? 'Bookmarked' : 'Bookmark'}</>
              )}
            </Button>
            {!progress?.completed && (
              <Button
                size="sm"
                onClick={handleMarkComplete}
                disabled={completing}
                className="bg-green-600 hover:bg-green-700"
              >
                {completing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <><CheckCircle className="h-4 w-4 mr-1" /> Mark Complete</>
                )}
              </Button>
            )}
            {progress?.completed && (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" /> Completed
              </Badge>
            )}
          </div>
        </div>

        <h1 className="text-3xl font-bold text-darkTeal mb-4">{content.title}</h1>
        
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {content.duration} min read
          </div>
          <Badge variant="outline">{content.difficulty}</Badge>
          <span>By {content.author}</span>
        </div>

        {content.description && (
          <p className="text-gray-600 text-lg">{content.description}</p>
        )}
      </Card>

      {/* Content */}
      <Card className="p-8">
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ ...props }) => <h1 className="text-3xl font-bold text-darkTeal mb-4 mt-6" {...props} />,
              h2: ({ ...props }) => <h2 className="text-2xl font-semibold text-darkTeal mb-3 mt-6" {...props} />,
              h3: ({ ...props }) => <h3 className="text-xl font-semibold text-darkTeal mb-2 mt-4" {...props} />,
              p: ({ ...props }) => <p className="text-gray-700 mb-4 leading-relaxed" {...props} />,
              ul: ({ ...props }) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
              ol: ({ ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
              li: ({ ...props }) => <li className="text-gray-700" {...props} />,
              strong: ({ ...props }) => <strong className="font-semibold text-darkTeal" {...props} />,
              em: ({ ...props }) => <em className="italic text-gray-600" {...props} />,
              blockquote: ({ ...props }) => (
                <blockquote className="border-l-4 border-teal pl-4 py-2 my-4 bg-lightTeal/10 italic text-gray-700" {...props} />
              ),
            }}
          >
            {content.content}
          </ReactMarkdown>
        </div>
      </Card>

      {/* Tags */}
      {content.tags && content.tags.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-darkTeal mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {content.tags.map((tag, index) => (
              <Badge key={index} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Call to Action */}
      <Card className="p-6 bg-gradient-to-r from-teal/10 to-softBlue/10">
        <h3 className="text-lg font-semibold text-darkTeal mb-2">Found this helpful?</h3>
        <p className="text-gray-600 mb-4">
          Continue your mental health journey by exploring more resources or connecting with our support community.
        </p>
        <div className="flex gap-3">
          <Link href="/learn">
            <Button variant="outline">More Articles</Button>
          </Link>
          <Link href="/group-sessions">
            <Button className="bg-teal hover:bg-darkTeal">Join Group Sessions</Button>
          </Link>
          <Link href="/therapy">
            <Button className="bg-purple-600 hover:bg-purple-700">Find a Therapist</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
