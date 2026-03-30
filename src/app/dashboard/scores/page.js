'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ScoresPage() {
  const [scores, setScores] = useState([])
  const [newScore, setNewScore] = useState('')
  const [playedAt, setPlayedAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [userId, setUserId] = useState(null)
  const router = useRouter()

  

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth'); return }
      setUserId(session.user.id)
      fetchScores(session.user.id)
    }
    init()
  }, [])

  const fetchScores = async (uid) => {
    const { data } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', uid)
      .order('played_at', { ascending: false })
      .limit(5)
    setScores(data || [])
  }

  const handleAddScore = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const score = parseInt(newScore)
    if (score < 1 || score > 45) {
      setError('Score must be between 1 and 45 (Stableford format)')
      setLoading(false)
      return
    }

    // If already 5 scores, delete the oldest
    if (scores.length >= 5) {
      const oldest = scores[scores.length - 1]
      await supabase.from('scores').delete().eq('id', oldest.id)
    }

    const { error } = await supabase.from('scores').insert({
      user_id: userId,
      score,
      played_at: playedAt
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess('Score added successfully!')
      setNewScore('')
      setPlayedAt('')
      fetchScores(userId)
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    await supabase.from('scores').delete().eq('id', id)
    fetchScores(userId)
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

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold mb-2">🏌️ My Golf Scores</h2>
        <p className="text-gray-400 mb-8">Track your last 5 Stableford scores. Adding a 6th replaces the oldest.</p>

        {/* Add Score Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <h3 className="font-semibold mb-4">Add New Score</h3>
          <form onSubmit={handleAddScore} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Score (1–45)</label>
                <input
                  type="number"
                  min="1"
                  max="45"
                  value={newScore}
                  onChange={e => setNewScore(e.target.value)}
                  placeholder="e.g. 32"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Date Played</label>
                <input
                  type="date"
                  value={playedAt}
                  onChange={e => setPlayedAt(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                  required
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-4 py-2">{error}</p>}
            {success && <p className="text-green-400 text-sm bg-green-900/20 border border-green-800 rounded-lg px-4 py-2">{success}</p>}

            <button
              type="submit"
              disabled={loading || scores.length >= 5 && false}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Score'}
            </button>
          </form>
        </div>

        {/* Scores List */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="font-semibold mb-4">My Last 5 Scores</h3>
          {scores.length === 0 ? (
            <p className="text-gray-500 text-sm">No scores yet. Add your first score above!</p>
          ) : (
            <div className="space-y-3">
              {scores.map((s, index) => (
                <div key={s.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500 text-sm">#{index + 1}</span>
                    <div>
                      <p className="font-semibold text-green-400 text-lg">{s.score} pts</p>
                      <p className="text-gray-400 text-xs">{new Date(s.played_at).toLocaleDateString('en-GB')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-red-400 hover:text-red-300 text-sm transition"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}