'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function DonatePage() {
  const [user, setUser] = useState(null)
  const [charities, setCharities] = useState([])
  const [selectedCharity, setSelectedCharity] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth'); return }
      setUser(session.user)

      // Vérifier si success ou canceled
      const params = new URLSearchParams(window.location.search)
      if (params.get('success')) setSuccess(true)

      // Charger les charities
      const { data } = await supabase.from('charities').select('*').order('name')
      if (data) setCharities(data)
    }
    init()
  }, [])

  const handleDonate = async (e) => {
    e.preventDefault()
    if (!selectedCharity) { setError('Please select a charity'); return }
    if (!amount || amount < 1) { setError('Minimum donation is $1'); return }

    setLoading(true)
    setError('')

    const charity = charities.find(c => c.id === selectedCharity)

    const res = await fetch('/api/stripe/donate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: parseFloat(amount),
        charityId: selectedCharity,
        charityName: charity?.name,
        userId: user.id,
        email: user.email,
      }),
    })

    const { url, error: err } = await res.json()
    if (err) { setError(err); setLoading(false); return }
    if (url) window.location.href = url
  }

  if (!user) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-white">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-green-500">⛳ GolfCharity</h1>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition">
          ← Back
        </button>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-center mb-2">❤️ Make a Donation</h2>
        <p className="text-gray-400 text-center mb-8">Support a charity directly, independent of your subscription</p>

        {success && (
          <div className="bg-green-900/20 border border-green-800 rounded-xl p-4 mb-6 text-center">
            <p className="text-green-400 font-semibold">✅ Thank you for your donation!</p>
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
          <form onSubmit={handleDonate} className="space-y-6">

            {/* Charity selector */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Select a Charity</label>
              <select
                value={selectedCharity}
                onChange={e => setSelectedCharity(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                required>
                <option value="">Choose a charity...</option>
                {charities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Donation Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="1"
                  step="0.01"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-4 py-3 text-white focus:outline-none focus:border-green-500"
                  required
                />
              </div>
            </div>

            {/* Quick amounts */}
            <div className="flex gap-2">
              {[5, 10, 25, 50].map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAmount(a.toString())}
                  className={`flex-1 py-2 rounded-lg text-sm transition ${
                    amount === a.toString()
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}>
                  ${a}
                </button>
              ))}
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-500 py-3 rounded-lg font-semibold transition disabled:opacity-50">
              {loading ? 'Redirecting to payment...' : `Donate ${amount ? '$' + amount : ''}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}