'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, BookOpen, Clock, TrendingUp, Star, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EducationContent {
  id: string
  title: string
  slug: string
  category: string
  description: string
  contentType: string
  difficulty: string
  duration: number
  tags: string[]
  featured: boolean
  viewCount: number
  author: string
}

export default function LearnPage() {
  const [content, setContent] = useState<EducationContent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetch(`/api/learn?category=${selectedCategory}&difficulty=${selectedDifficulty}`)
      .then(res => res.json())
      .then(data => {
        setContent(data.content || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [selectedCategory, selectedDifficulty])

  const categories = [
    { value: 'all', label: 'All Topics' },
    { value: 'anxiety', label: 'Anxiety' },
    { value: 'depression', label: 'Depression' },
    { value: 'stress', label: 'Stress Management' },
    { value: 'coping-skills', label: 'Coping Skills' },
    { value: 'sleep', label: 'Sleep' },
    { value: 'relationships', label: 'Relationships' },
    { value: 'self-care', label: 'Self-Care' },
  ]

  const difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ]

  const filteredContent = content.filter(item =>
    searchTerm === '' ||
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const featuredContent = filteredContent.filter(item => item.featured)
  const regularContent = filteredContent.filter(item => !item.featured)

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-darkTeal mb-2">Learn About Mental Health</h1>
        <p className="text-gray-600">
          Evidence-based resources to help you understand and improve your mental well-being
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent outline-none"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent outline-none"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent outline-none"
          >
            {difficulties.map(diff => (
              <option key={diff.value} value={diff.value}>{diff.label}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Featured Content */}
      {featuredContent.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-darkTeal mb-4 flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500" />
            Featured Articles
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {featuredContent.map((item) => (
              <Card key={item.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <Badge className={getCategoryColor(item.category)}>
                    {item.category}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <TrendingUp className="h-4 w-4" />
                    {item.viewCount} views
                  </div>
                </div>
                <h3 className="text-xl font-bold text-darkTeal mb-2">{item.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {item.duration} min read
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {item.difficulty}
                    </Badge>
                  </div>
                  <Link href={`/learn/${item.slug}`}>
                    <Button>Read Article</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Content */}
      {regularContent.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-darkTeal mb-4">All Articles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {regularContent.map((item) => (
              <Card key={item.id} className="p-5 hover:shadow-lg transition-shadow">
                <Badge className={getCategoryColor(item.category) + ' mb-3'}>
                  {item.category}
                </Badge>
                <h3 className="text-lg font-semibold text-darkTeal mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{item.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.duration} min
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item.difficulty}
                  </Badge>
                </div>
                <Link href={`/learn/${item.slug}`}>
                  <Button size="sm" className="w-full">Read More</Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {filteredContent.length === 0 && (
        <Card className="p-12 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No articles found</h3>
          <p className="text-gray-500">Try adjusting your filters or search term</p>
        </Card>
      )}
    </div>
  )
}
