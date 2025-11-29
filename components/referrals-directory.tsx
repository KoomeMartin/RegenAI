'use client'

import { useState, useMemo } from 'react'
import { Search, MapPin, Phone, Mail, Globe, Heart, DollarSign, Languages, Bookmark, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { toast } from 'sonner'

type Referral = {
  id: string
  name: string
  type: string
  country: string
  city: string
  address?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  specialties: any
  costRange: string
  languages: any
  description?: string | null
}

interface ReferralsDirectoryProps {
  referrals: Referral[]
  onTrackingUpdate?: (tracking: any) => void
}

export function ReferralsDirectory({ referrals, onTrackingUpdate }: ReferralsDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedCost, setSelectedCost] = useState('all')
  const [trackingId, setTrackingId] = useState<string | null>(null)

  // Get unique countries and types
  const countries = useMemo(() => {
    return ['all', ...Array.from(new Set(referrals?.map((r) => r.country) ?? []))]
  }, [referrals])

  const types = useMemo(() => {
    return ['all', ...Array.from(new Set(referrals?.map((r) => r.type) ?? []))]
  }, [referrals])

  const handleTrackReferral = async (referralId: string) => {
    setTrackingId(referralId)
    try {
      const res = await fetch('/api/referrals/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referralId, status: 'interested' }),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success('Referral added to your tracking list')
        if (onTrackingUpdate) {
          onTrackingUpdate(data.tracking)
        }
      } else {
        toast.error('Failed to track referral')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setTrackingId(null)
    }
  }

  // Filter referrals
  const filteredReferrals = useMemo(() => {
    return (referrals ?? []).filter((referral) => {
      const matchesSearch =
        searchTerm === '' ||
        referral.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        referral.city?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCountry = selectedCountry === 'all' || referral.country === selectedCountry
      const matchesType = selectedType === 'all' || referral.type === selectedType
      const matchesCost = selectedCost === 'all' || referral.costRange === selectedCost

      return matchesSearch && matchesCountry && matchesType && matchesCost
    })
  }, [referrals, searchTerm, selectedCountry, selectedType, selectedCost])

  return (
    <div>
      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Country Filter */}
          <div>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent outline-none"
            >
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country === 'all' ? 'All Countries' : country}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent outline-none"
            >
              {types.map((type) => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cost Filter */}
        <div className="mt-4 flex gap-2">
          {['all', 'free', 'low-cost', 'standard', 'premium'].map((cost) => (
            <button
              key={cost}
              onClick={() => setSelectedCost(cost)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCost === cost
                  ? 'bg-teal text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cost === 'all' ? 'All Costs' : cost.charAt(0).toUpperCase() + cost.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredReferrals?.length ?? 0} result{filteredReferrals?.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Referral Cards */}
      {filteredReferrals && filteredReferrals.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredReferrals.map((referral) => (
            <div
              key={referral.id}
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-darkTeal">{referral.name}</h3>
                <span className="px-2 py-1 bg-softBlue/20 text-softBlue text-xs rounded">
                  {referral.type}
                </span>
              </div>

              {referral.description && (
                <p className="text-sm text-gray-600 mb-4">{referral.description}</p>
              )}

              {/* Specialties */}
              <div className="flex flex-wrap gap-2 mb-4">
                {(Array.isArray(referral.specialties) ? referral.specialties : []).map(
                  (specialty: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded"
                    >
                      {specialty}
                    </span>
                  )
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                {referral.address && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-teal mt-0.5 flex-shrink-0" />
                    <span>
                      {referral.city}, {referral.country}
                    </span>
                  </div>
                )}
                {referral.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-teal" />
                    <a href={`tel:${referral.phone}`} className="hover:text-teal transition-colors">
                      {referral.phone}
                    </a>
                  </div>
                )}
                {referral.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4 text-teal" />
                    <a
                      href={`mailto:${referral.email}`}
                      className="hover:text-teal transition-colors"
                    >
                      {referral.email}
                    </a>
                  </div>
                )}
                {referral.website && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe className="h-4 w-4 text-teal" />
                    <a
                      href={referral.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-teal transition-colors"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>

              {/* Cost & Languages */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700 capitalize">{referral.costRange}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Languages className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-700">
                      {(Array.isArray(referral.languages) ? referral.languages : []).join(', ')}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTrackReferral(referral.id)}
                  disabled={trackingId === referral.id}
                  className="flex items-center gap-1"
                >
                  {trackingId === referral.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <><Bookmark className="h-4 w-4" /> Track</>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white/80 rounded-xl">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No referrals found matching your criteria</p>
          <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
        </div>
      )}
    </div>
  )
}
