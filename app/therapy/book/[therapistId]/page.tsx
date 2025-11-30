'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Calendar, Clock, MessageCircle, Video, Loader2 } from 'lucide-react'
import { Avatar } from '@/components/avatar-selector'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { toast } from 'sonner'

interface TherapistProfile {
  id: string
  userId: string
  bio: string
  specialties: string[]
  languages: string[]
  qualifications: string
  verified: boolean
  hourlyRate: number
  availability: any
  user: {
    alias: string
    avatar: string
  }
}

export default function BookTherapyPage() {
  const router = useRouter()
  const params = useParams()
  const therapistId = params.therapistId as string
  const { data: session } = useSession() || {}
  
  const [therapist, setTherapist] = useState<TherapistProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [sessionType, setSessionType] = useState('chat')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [clientNotes, setClientNotes] = useState('')

  useEffect(() => {
    fetch('/api/therapy/therapists')
      .then(res => res.json())
      .then(data => {
        const therapist = data.therapists?.find((t: any) => t.userId === therapistId)
        setTherapist(therapist || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [therapistId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time')
      return
    }

    setSubmitting(true)

    try {
      const scheduledAt = new Date(`${selectedDate}T${selectedTime}`)
      
      const res = await fetch('/api/therapy/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          therapistId,
          sessionType,
          scheduledAt: scheduledAt.toISOString(),
          duration: 50,
          clientNotes,
        }),
      })

      if (res.ok) {
        toast.success('Session booked successfully!')
        router.push('/therapy')
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to book session')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    )
  }

  if (!therapist) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">Therapist not found.</p>
          <Link href="/therapy">
            <Button>Back to Therapy</Button>
          </Link>
        </Card>
      </div>
    )
  }

  // Generate available time slots (simplified)
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 8; hour <= 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      if (hour < 17) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`)
      }
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/therapy" className="inline-flex items-center gap-2 text-teal hover:text-darkTeal transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Therapy
      </Link>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Therapist Info */}
        <Card className="p-6 md:col-span-1 h-fit">
          <div className="text-center mb-4">
            <div className="flex justify-center mb-3">
              <Avatar avatarId={therapist.user.avatar} size="lg" />
            </div>
            <h2 className="text-xl font-bold text-darkTeal">{therapist.user.alias}</h2>
            <p className="text-lg text-teal font-semibold mt-1">₦{therapist.hourlyRate}/session</p>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-gray-700">Specialties</p>
              <p className="text-gray-600">{therapist.specialties.join(', ')}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Languages</p>
              <p className="text-gray-600">{therapist.languages.join(', ')}</p>
            </div>
          </div>
        </Card>

        {/* Booking Form */}
        <Card className="p-6 md:col-span-2">
          <h2 className="text-2xl font-bold text-darkTeal mb-6">Book a Session</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="text-base mb-3 block">Session Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSessionType('chat')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    sessionType === 'chat'
                      ? 'border-teal bg-teal/10'
                      : 'border-gray-200 hover:border-teal/50'
                  }`}
                >
                  <MessageCircle className="h-6 w-6 mx-auto mb-2 text-teal" />
                  <p className="font-medium">Text Chat</p>
                  <p className="text-xs text-gray-500 mt-1">Message-based session</p>
                </button>
                <button
                  type="button"
                  onClick={() => setSessionType('video')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    sessionType === 'video'
                      ? 'border-teal bg-teal/10'
                      : 'border-gray-200 hover:border-teal/50'
                  }`}
                >
                  <Video className="h-6 w-6 mx-auto mb-2 text-teal" />
                  <p className="font-medium">Video Call</p>
                  <p className="text-xs text-gray-500 mt-1">Face-to-face session</p>
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Select Date
                </Label>
                <input
                  type="date"
                  id="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal"
                  required
                />
              </div>

              <div>
                <Label htmlFor="time" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Select Time
                </Label>
                <select
                  id="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal"
                  required
                >
                  <option value="">Choose a time</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">What would you like to discuss? (Optional)</Label>
              <Textarea
                id="notes"
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                placeholder="Share what's on your mind or what you'd like to work on..."
                rows={4}
                className="mt-2"
              />
            </div>

            <div className="bg-lightTeal/20 p-4 rounded-lg">
              <h3 className="font-medium text-darkTeal mb-2">Session Details</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Duration: 50 minutes</li>
                <li>• Cost: ₦{therapist.hourlyRate} per session</li>
                <li>• You can cancel up to 24 hours before the session</li>
              </ul>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-teal hover:bg-darkTeal"
              size="lg"
            >
              {submitting ? (
                <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Booking...</>
              ) : (
                <>Confirm Booking</>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
