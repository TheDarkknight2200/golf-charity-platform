'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function CharityPage() {
  const [charities, setCharities] = useState([])
  const [selectedCharity, setSelectedCharity] = useState(null)
  const [currentCharity, setCurrentCharity] = useState(null)
  const [percentage, setPercentage] = useState(10)
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth'); return }
      setUserId(session.user.id)

        const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status, charity_id, charity_percentage')
        .eq('id', session.user.id)
        .single()

        if (profile?.subscription_status !== 'active') {
            router.push('/dashboard/subscription')
            return
        }

        if (profile?.charity_id) {
            setCurrentCharity(profile.charity_id)
            setSelectedCharity(profile.charity_id)
            setPercentage(profile.charity_percentage || 10)
        }

      // Fetch charities
      const { data: charitiesData } = await supabase
        .from('charities')
        .select('*')
        .order('featured', { ascending: false })
      setCharities(charitiesData || [])

      
    }
    init()
  }, [])

  const handleSave = async () => {
    if (!selectedCharity) return
    setLoading(true)
    setSuccess('')

    await supabase
      .from('profiles')
      .update({
        charity_id: selectedCharity,
        charity_percentage: percentage
      })
      .eq('id', userId)

    setCurrentCharity(selectedCharity)
    setSuccess('Charity preference saved successfully!')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-green-500">⛳ GolfCharity</h1>
        <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-400 hover:text-white transition">
          ← Back to Dashboard
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold mb-2">❤️ Choose Your Charity</h2>
        <p className="text-gray-400 mb-8">A portion of your subscription goes directly to your chosen charity.</p>

        {/* Contribution Percentage */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="font-semibold mb-4">Contribution Percentage</h3>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="10"
              max="50"
              value={percentage}
              onChange={e => setPercentage(parseInt(e.target.value))}
              className="flex-1 accent-green-500"
            />
            <span className="text-2xl font-bold text-green-500 w-16 text-right">{percentage}%</span>
          </div>
          <p className="text-gray-500 text-xs mt-2">Minimum 10% — maximum 50%</p>
        </div>

        {/* Charities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {charities.map(charity => (
            <div
              key={charity.id}
              onClick={() => setSelectedCharity(charity.id)}
              className={`bg-gray-900 border rounded-xl p-5 cursor-pointer transition-all ${
                selectedCharity === charity.id
                  ? 'border-green-500 bg-green-900/10'
                  : 'border-gray-800 hover:border-gray-600'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold">{charity.name}</h4>
                <div className="flex items-center gap-2">
                  {charity.featured && (
                    <span className="text-xs bg-green-900/40 text-green-400 px-2 py-0.5 rounded-full">Featured</span>
                  )}
                  {selectedCharity === charity.id && (
                    <span className="text-green-500">✓</span>
                  )}
                </div>
              </div>
              <p className="text-gray-400 text-sm">{charity.description}</p>
            </div>
          ))}
        </div>

        {success && (
          <p className="text-green-400 text-sm bg-green-900/20 border border-green-800 rounded-lg px-4 py-3 mb-4">
            {success}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={!selectedCharity || loading}
          className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Charity Preference'}
        </button>
      </div>
    </div>
  )
}