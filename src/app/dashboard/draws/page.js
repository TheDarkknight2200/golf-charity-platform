'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function DrawsPage() {
  const [draws, setDraws] = useState([])
  const [myScores, setMyScores] = useState([])
  const [winners, setWinners] = useState([])
  const [userId, setUserId] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth'); return }
      setUserId(session.user.id)
      const { data: profile } = await supabase
  .from('profiles')
  .select('subscription_status')
  .eq('id', session.user.id)
  .single()

if (profile?.subscription_status !== 'active') {
  router.push('/dashboard/subscription')
  return
}

      // Fetch draws
      const { data: drawsData } = await supabase
        .from('draws')
        .select('*')
        .order('draw_date', { ascending: false })
      setDraws(drawsData || [])

      // Fetch my scores
      const { data: scoresData } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', session.user.id)
        .order('played_at', { ascending: false })
      setMyScores(scoresData || [])

      // Fetch my wins
      const { data: winnersData } = await supabase
        .from('winners')
        .select('*, draws(draw_date)')
        .eq('user_id', session.user.id)
      setWinners(winnersData || [])
    }
    init()
  }, [])

  const checkMatch = (scores, winningNumbers) => {
    if (!winningNumbers || scores.length === 0) return 0
    const userScores = scores.map(s => s.score)
    let matches = 0
    winningNumbers.forEach(n => {
      if (userScores.includes(n)) matches++
    })
    return matches
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
        <h2 className="text-2xl font-bold mb-2">🎁 Monthly Draws</h2>
        <p className="text-gray-400 mb-8">Your scores are automatically entered into monthly draws.</p>

        {/* My Scores Summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="font-semibold mb-4">My Current Scores</h3>
          {myScores.length === 0 ? (
            <p className="text-gray-500 text-sm">No scores yet — add scores to participate in draws.</p>
          ) : (
            <div className="flex gap-3 flex-wrap">
              {myScores.map(s => (
                <div key={s.id} className="bg-gray-800 rounded-lg px-4 py-2 text-center">
                  <p className="text-green-400 font-bold text-lg">{s.score}</p>
                  <p className="text-gray-500 text-xs">{new Date(s.played_at).toLocaleDateString('en-GB')}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Draws List */}
        <div className="space-y-4 mb-8">
          <h3 className="font-semibold">Recent Draws</h3>
          {draws.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <p className="text-gray-500 text-sm">No draws yet. The first draw will be announced soon!</p>
            </div>
          ) : (
            draws.map(draw => {
              const matches = checkMatch(myScores, draw.winning_numbers)
              return (
                <div key={draw.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-semibold">Draw — {new Date(draw.draw_date).toLocaleDateString('en-GB')}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        draw.status === 'published' ? 'bg-green-900/40 text-green-400' :
                        draw.status === 'pending' ? 'bg-yellow-900/40 text-yellow-400' :
                        'bg-gray-800 text-gray-400'
                      }`}>
                        {draw.status}
                      </span>
                    </div>
                    {draw.status === 'published' && matches > 0 && (
                      <span className="bg-green-600 text-white text-sm px-3 py-1 rounded-full font-semibold">
                        🏆 {matches} match{matches > 1 ? 'es' : ''}!
                      </span>
                    )}
                  </div>

                  {draw.winning_numbers && draw.status === 'published' && (
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Winning Numbers:</p>
                      <div className="flex gap-2">
                        {draw.winning_numbers.map((n, i) => (
                          <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                            myScores.map(s => s.score).includes(n)
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-800 text-gray-300'
                          }`}>
                            {n}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    <div className="bg-gray-800 rounded-lg p-3">
                      <p className="text-xs text-gray-400">Jackpot (5 match)</p>
                      <p className="font-bold text-green-400">${draw.jackpot_amount || 0}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                      <p className="text-xs text-gray-400">4 Match</p>
                      <p className="font-bold">${draw.pool_4match || 0}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                      <p className="text-xs text-gray-400">3 Match</p>
                      <p className="font-bold">${draw.pool_3match || 0}</p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* My Winnings */}
        {winners.length > 0 && (
          <div className="bg-gray-900 border border-green-800 rounded-xl p-6">
            <h3 className="font-semibold text-green-400 mb-4">🏆 My Winnings</h3>
            <div className="space-y-3">
              {winners.map(w => (
                <div key={w.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                  <div>
                    <p className="font-semibold">{w.match_type}</p>
                    <p className="text-gray-400 text-xs">{new Date(w.draws?.draw_date).toLocaleDateString('en-GB')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">${w.prize_amount}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      w.payment_status === 'paid' ? 'bg-green-900/40 text-green-400' : 'bg-yellow-900/40 text-yellow-400'
                    }`}>
                      {w.payment_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}