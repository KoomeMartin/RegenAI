import Link from 'next/link'
import { Heart, Shield, Users, Brain, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-warmBeige via-lightTeal/20 to-softBlue/20">
      {/* Header */}
      <header className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Heart className="h-8 w-8 text-teal" />
          <span className="text-2xl font-bold text-darkTeal">SafeSpace Africa</span>
        </div>
        <Link
          href="/dashboard"
          className="px-6 py-2 bg-teal text-white rounded-lg hover:bg-darkTeal transition-colors font-medium shadow-md hover:shadow-lg"
        >
          Get Started
        </Link>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-darkTeal mb-6">
          Your Mental Health,
          <br />
          <span className="text-teal">Your Safe Space</span>
        </h1>
        <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
          Anonymous, affordable, and culturally sensitive mental health support available 24/7
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-4 bg-teal text-white text-lg rounded-lg hover:bg-darkTeal transition-all shadow-lg hover:shadow-xl"
        >
          Get Started - Explore Now
          <ArrowRight className="h-5 w-5" />
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Shield className="h-12 w-12 text-teal" />}
            title="Complete Anonymity"
            description="Your identity stays private with our anonymous alias system"
          />
          <FeatureCard
            icon={<Brain className="h-12 w-12 text-softBlue" />}
            title="24/7 AI Support"
            description="Get immediate emotional support whenever you need it"
          />
          <FeatureCard
            icon={<Users className="h-12 w-12 text-teal" />}
            title="Peer Support Groups"
            description="Connect with others who understand your journey"
          />
          <FeatureCard
            icon={<Heart className="h-12 w-12 text-softBlue" />}
            title="Professional Referrals"
            description="Access to affordable mental health professionals across Africa"
          />
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-xl">
          <h2 className="text-3xl font-bold text-darkTeal mb-4">
            You Don't Have to Face This Alone
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            Join a supportive community that understands and cares
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 bg-teal text-white text-lg rounded-lg hover:bg-darkTeal transition-all shadow-lg hover:shadow-xl"
          >
            Get Started - Sign Up
          </Link>
        </div>
      </section>

      {/* Crisis Support */}
      <section className="max-w-6xl mx-auto px-4 py-8 mb-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
          <h3 className="text-lg font-bold text-red-800 mb-2">In Crisis?</h3>
          <p className="text-red-700">
            If you're experiencing a mental health emergency, please call your local crisis helpline immediately.
          </p>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-darkTeal mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
