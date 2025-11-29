'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Calendar, Clock, Video, MessageCircle, User, CheckCircle, X, Loader2 } from 'lucide-react'
import { Avatar } from '@/components/avatar-selector'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Booking {
  id: string
  sessionType: string
  scheduledAt: string
  duration: number
  status: string
  clientNotes?: string
  notes?: string
  rating?: number
  client: {
    alias: string
    avatar: string
  }
}

export default function TherapistDashboardPage() {
  const { data: session } = useSession() || {}
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/therapist/bookings')
      .then(res => res.json())
      .then(data => {
        setBookings(data.bookings || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    setUpdatingId(bookingId)
    try {
      const res = await fetch(`/api/therapy/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b))
      }
    } finally {
      setUpdatingId(null)
    }
  }

  const upcomingBookings = bookings.filter(
    b => b.status === 'scheduled' && new Date(b.scheduledAt) > new Date()
  )
  const todayBookings = upcomingBookings.filter(
    b => new Date(b.scheduledAt).toDateString() === new Date().toDateString()
  )
  const pastBookings = bookings.filter(
    b => b.status === 'completed' || (b.status === 'scheduled' && new Date(b.scheduledAt) <= new Date())
  )

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
        <h1 className="text-3xl font-bold text-darkTeal mb-2">Therapist Dashboard</h1>
        <p className="text-gray-600">Welcome back, {(session as any)?.user?.alias}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Today's Sessions</p>
              <p className="text-3xl font-bold text-darkTeal">{todayBookings.length}</p>
            </div>
            <Calendar className="h-10 w-10 text-teal opacity-50" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Upcoming Sessions</p>
              <p className="text-3xl font-bold text-darkTeal">{upcomingBookings.length}</p>
            </div>
            <Clock className="h-10 w-10 text-teal opacity-50" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed Sessions</p>
              <p className="text-3xl font-bold text-darkTeal">{pastBookings.length}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-teal opacity-50" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming
            {upcomingBookings.length > 0 && (
              <Badge variant="secondary" className="ml-2">{upcomingBookings.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="today">
            Today
            {todayBookings.length > 0 && (
              <Badge variant="secondary" className="ml-2">{todayBookings.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="past">Past Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4 mt-6">
          {upcomingBookings.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No upcoming sessions scheduled.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <Card key={booking.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar avatarId={booking.client.avatar} size="md" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-darkTeal">{booking.client.alias}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(booking.scheduledAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(booking.scheduledAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          <div className="flex items-center gap-1">
                            {booking.sessionType === 'video' ? (
                              <><Video className="h-4 w-4" /> Video</>
                            ) : (
                              <><MessageCircle className="h-4 w-4" /> Chat</>
                            )}
                          </div>
                          <Badge>{booking.duration} min</Badge>
                        </div>
                        {booking.clientNotes && (
                          <div className="mt-3 p-3 bg-lightTeal/10 rounded-lg">
                            <p className="text-xs font-medium text-gray-600 mb-1">Client Notes:</p>
                            <p className="text-sm text-gray-700">{booking.clientNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(booking.id, 'completed')}
                        disabled={updatingId === booking.id}
                      >
                        {updatingId === booking.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <><CheckCircle className="h-4 w-4 mr-1" /> Complete</>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="today" className="space-y-4 mt-6">
          {todayBookings.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No sessions scheduled for today.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {todayBookings.map((booking) => (
                <Card key={booking.id} className="p-6 border-l-4 border-l-teal">
                  <div className="flex items-start gap-4">
                    <Avatar avatarId={booking.client.avatar} size="md" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-darkTeal">{booking.client.alias}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(booking.scheduledAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          {booking.sessionType === 'video' ? (
                            <><Video className="h-4 w-4" /> Video</>
                          ) : (
                            <><MessageCircle className="h-4 w-4" /> Chat</>
                          )}
                        </div>
                        <Badge>{booking.duration} min</Badge>
                      </div>
                      {booking.clientNotes && (
                        <div className="mt-3 p-3 bg-lightTeal/10 rounded-lg">
                          <p className="text-xs font-medium text-gray-600 mb-1">Client Notes:</p>
                          <p className="text-sm text-gray-700">{booking.clientNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4 mt-6">
          {pastBookings.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No past sessions yet.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {pastBookings.map((booking) => (
                <Card key={booking.id} className="p-6 opacity-75">
                  <div className="flex items-start gap-4">
                    <Avatar avatarId={booking.client.avatar} size="md" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-darkTeal">{booking.client.alias}</h3>
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
                        <p className="text-sm text-gray-600 mt-2">
                          Rating: {'⭐'.repeat(booking.rating)}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
