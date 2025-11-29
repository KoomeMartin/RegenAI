'use client'

import { useEffect, useState } from 'react'
import { ReferralsDirectory } from '@/components/referrals-directory'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, Clock, XCircle } from 'lucide-react'

interface Referral {
  id: string
  name: string
  type: string
  country: string
  city: string
  phone?: string
  email?: string
  website?: string
  specialties: string[]
  costRange: string
  languages: string[]
  description?: string
}

interface ReferralTracking {
  id: string
  referralId: string
  status: string
  notes?: string
  contactedAt?: string
  scheduledAt?: string
  completedAt?: string
  createdAt: string
  referral: Referral
}

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [tracking, setTracking] = useState<ReferralTracking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/referrals').then(res => res.json()),
      fetch('/api/referrals/tracking').then(res => res.json()),
    ]).then(([referralsData, trackingData]) => {
      setReferrals(referralsData.referrals || [])
      setTracking(trackingData.tracking || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'contacted':
      case 'scheduled':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'not-helpful':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-blue-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-darkTeal mb-2">Mental Health Referrals</h1>
        <p className="text-gray-600">
          Find affordable and accessible mental health professionals across Africa
        </p>
      </div>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList>
          <TabsTrigger value="browse">Browse Referrals</TabsTrigger>
          <TabsTrigger value="my-referrals">
            My Referrals
            {tracking.length > 0 && (
              <Badge variant="secondary" className="ml-2">{tracking.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-6">
          <ReferralsDirectory referrals={referrals} onTrackingUpdate={(newTracking) => setTracking([...tracking, newTracking])} />
        </TabsContent>

        <TabsContent value="my-referrals" className="mt-6">
          {tracking.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">You haven&apos;t tracked any referrals yet.</p>
              <p className="text-sm text-gray-400 mt-2">Mark referrals as interested to track your progress.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {tracking.map((item) => (
                <Card key={item.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(item.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-darkTeal">{item.referral.name}</h3>
                          <p className="text-sm text-gray-600">{item.referral.city}, {item.referral.country}</p>
                        </div>
                        <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
                          {item.status}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        {item.contactedAt && (
                          <p className="text-gray-600">
                            Contacted: {new Date(item.contactedAt).toLocaleDateString()}
                          </p>
                        )}
                        {item.scheduledAt && (
                          <p className="text-gray-600">
                            Scheduled: {new Date(item.scheduledAt).toLocaleDateString()}
                          </p>
                        )}
                        {item.completedAt && (
                          <p className="text-gray-600">
                            Completed: {new Date(item.completedAt).toLocaleDateString()}
                          </p>
                        )}
                        {item.notes && (
                          <p className="text-gray-700 mt-2 p-2 bg-gray-50 rounded">
                            <strong>Notes:</strong> {item.notes}
                          </p>
                        )}
                      </div>
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
