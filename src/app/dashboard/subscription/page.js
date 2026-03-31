'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SubscriptionPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth'); return }
      setUser(session.user)
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      setProfile(data)
    }
    getUser()
  }, [])

  const handleSubscribe = async (plan) => {
    setLoading(plan)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, userId: user.id, email: user.email }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
    setLoading(null)
  }

  const handlePortal = async () => {
    setLoading('portal')
    const res = await fetch('/api/stripe/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
    setLoading(null)
  }

  if (!profile) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-white">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="animate-fade-in border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-green-500">⛳ GolfCharity</h1>
        <button
          onClick={() => router.push('/dashboard')}
          className="btn-press text-sm bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition">
          ← Back
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="animate-fade-in-up text-3xl font-bold text-center mb-2">Subscription</h2>
        <p className="animate-fade-in-up delay-100 text-gray-400 text-center mb-12">Choose your plan and start winning</p>

        {profile.subscription_status === 'active' ? (
          <div className="animate-fade-in-up delay-200 bg-green-900/20 border border-green-800 rounded-xl p-6 mb-8 text-center">
            <p className="text-green-400 font-semibold text-lg">✅ Your subscription is active</p>
            <p className="text-gray-400 mt-1">
              Plan : {profile.subscription_plan === 'monthly' ? 'Monthly' : 'Yearly'} —
              Renews on {new Date(profile.subscription_end_date).toLocaleDateString()}
            </p>
            <button
              onClick={handlePortal}
              disabled={loading === 'portal'}
              className="btn-press mt-4 bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg text-sm transition disabled:opacity-50">
              {loading === 'portal' ? 'Loading...' : 'Manage my subscription'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="animate-fade-in-up delay-200 card-hover bg-gray-900 border border-gray-800 rounded-xl p-8">
              <h3 className="text-xl font-bold mb-2">Monthly</h3>
              <p className="text-4xl font-bold text-green-500 mb-1">$9.99<span className="text-lg text-gray-400">/mo</span></p>
              <p className="text-gray-400 text-sm mb-6">Billed monthly, cancel anytime</p>
              <ul className="space-y-2 mb-8 text-sm text-gray-300">
                <li>✅ Enter monthly draws</li>
                <li>✅ Track your scores</li>
                <li>✅ Support your charity</li>
              </ul>
              <button
                onClick={() => handleSubscribe('monthly')}
                disabled={loading !== null}
                className="btn-press w-full bg-green-600 hover:bg-green-500 py-3 rounded-lg font-semibold transition disabled:opacity-50">
                {loading === 'monthly' ? 'Loading...' : 'Subscribe Monthly'}
              </button>
            </div>

            <div className="animate-fade-in-up delay-300 card-hover bg-gray-900 border border-green-700 rounded-xl p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs px-3 py-1 rounded-full animate-pulse-glow">
                Best Value
              </div>
              <h3 className="text-xl font-bold mb-2">Yearly</h3>
              <p className="text-4xl font-bold text-green-500 mb-1">$99.99<span className="text-lg text-gray-400">/yr</span></p>
              <p className="text-gray-400 text-sm mb-6">Save 2 months vs monthly</p>
              <ul className="space-y-2 mb-8 text-sm text-gray-300">
                <li>✅ Enter monthly draws</li>
                <li>✅ Track your scores</li>
                <li>✅ Support your charity</li>
                <li>✅ 2 months free</li>
              </ul>
              <button
                onClick={() => handleSubscribe('yearly')}
                disabled={loading !== null}
                className="btn-press w-full bg-green-600 hover:bg-green-500 py-3 rounded-lg font-semibold transition disabled:opacity-50">
                {loading === 'yearly' ? 'Loading...' : 'Subscribe Yearly'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}