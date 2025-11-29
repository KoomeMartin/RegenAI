'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Calendar, Clock, Video, MessageCircle, Star, CheckCircle, X, Loader2 } from 'lucide-react'
import { Avatar } from '@/components/avatar-selector'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

interface TherapistProfile {
  id: string
  userId: string
  bio: string
  specialties: string[]
  languages: string[]
  qualifications: string
  verified: boolean
  hourlyRate: number
  user: {
    alias: string
    avatar: string
  }
}

interface Booking {
  id: string
  sessionType: string
  scheduledAt: string
  duration: number
  status: string
  clientNotes?: string
  rating?: number
  feedback?: string
  therapist: {
    alias: string
    avatar: string
  }
}

export default function TherapyPage() {
  const { data: session } = useSession() || {}
  const [therapists, setTherapists] = useState<TherapistProfile[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/therapy/therapists').then(res => res.json()),
      fetch('/api/therapy/bookings').then(res => res.json()),
    ]).then(([therapistsData, bookingsData]) => {
      setTherapists(therapistsData.therapists || [])
      setBookings(bookingsData.bookings || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this session?')) return

    setCancellingId(bookingId)
    try {
      const res = await fetch(`/api/therapy/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })

      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b))
      }
    } finally {
      setCancellingId(null)
    }
  }

  const upcomingBookings = bookings.filter(b => b.status === 'scheduled' && new Date(b.scheduledAt) > new Date())
  const pastBookings = bookings.filter(b => b.status === 'completed' || (b.status === 'scheduled' && new Date(b.scheduledAt) <= new Date()))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-darkTeal mb-2">One-on-One Therapy</h1>
        <p className="text-gray-600">Connect with verified therapists for private sessions</p>
      </div>

      <Tabs defaultValue="therapists" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="therapists">Find a Therapist</TabsTrigger>
          <TabsTrigger value="bookings">
            My Sessions
            {upcomingBookings.length > 0 && (
              <Badge variant="secondary" className="ml-2">{upcomingBookings.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="therapists" className="space-y-4 mt-6">
          {therapists.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No therapists available at the moment.</p>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {therapists.map((therapist) => (
                <Card key={therapist.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar avatarId={therapist.user.avatar} size="md" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-darkTeal">{therapist.user.alias}</h3>
                      {therapist.verified && (
                        <Badge variant="secondary" className="mt-1">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{therapist.bio}</p>

                  <div className="space-y-2 mb-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Specialties</p>
                      <div className="flex flex-wrap gap-1">
                        {therapist.specialties.slice(0, 3).map((spec) => (
                          <Badge key={spec} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Languages</p>
                      <p className="text-sm">{therapist.languages.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Rate</p>
                      <p className="text-lg font-bold text-teal">${therapist.hourlyRate}/session</p>
                    </div>
                  </div>

                  <Link href={`/therapy/book/${therapist.userId}`}>
                    <Button className="w-full bg-teal hover:bg-darkTeal">
                      Book Session
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6 mt-6">
          {/* Upcoming Sessions */}
          <div>
            <h2 className="text-xl font-semibold text-darkTeal mb-4">Upcoming Sessions</h2>
            {upcomingBookings.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-500 mb-4">No upcoming sessions.</p>
                <Link href="#therapists">
                  <Button>Book a Session</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <Card key={booking.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar avatarId={booking.therapist.avatar} size="md" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-darkTeal">{booking.therapist.alias}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(booking.scheduledAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(booking.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="flex items-center gap-1">
                              {booking.sessionType === 'video' ? (
                                <><Video className="h-4 w-4" /> Video</>
                              ) : (
                                <><MessageCircle className="h-4 w-4" /> Chat</>
                              )}
                            </div>
                          </div>
                          {booking.clientNotes && (
                            <p className="text-sm text-gray-600 mt-2">
                              <strong>Notes:</strong> {booking.clientNotes}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={cancellingId === booking.id}
                      >
                        {cancellingId === booking.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <><X className="h-4 w-4 mr-1" /> Cancel</>
                        )}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Past Sessions */}
          {pastBookings.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-darkTeal mb-4">Past Sessions</h2>
              <div className="space-y-4">
                {pastBookings.map((booking) => (
                  <Card key={booking.id} className="p-6 opacity-75">
                    <div className="flex items-start gap-4">
                      <Avatar avatarId={booking.therapist.avatar} size="md" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-darkTeal">{booking.therapist.alias}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(booking.scheduledAt).toLocaleDateString()}
                          </div>
                          <Badge variant={booking.status === 'completed' ? 'default' : 'secondary'}>
                            {booking.status}
                          </Badge>
                        </div>
                        {booking.rating && (
                          <div className="flex items-center gap-1 mt-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < booking.rating! ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                        {booking.feedback && (
                          <p className="text-sm text-gray-600 mt-2 italic">"{booking.feedback}"</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
