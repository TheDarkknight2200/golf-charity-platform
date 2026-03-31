'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function WinnersPage() {
  const [user, setUser] = useState(null)
  const [winners, setWinners] = useState([])
  const [uploading, setUploading] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth'); return }
      setUser(session.user)

      const { data } = await supabase
        .from('winners')
        .select('*, draws(draw_date, winning_numbers)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (data) setWinners(data)
      setLoading(false)
    }
    init()
  }, [])

  const handleUpload = async (winnerId, file) => {
  if (!file) return
  setUploading(winnerId)

  const ext = file.name.split('.').pop()
  const path = `${winnerId}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('winner-proofs')
    .upload(path, file, { upsert: true })

  if (uploadError) {
    alert('Upload failed: ' + uploadError.message)
    setUploading(null)
    return
  }

  
  await supabase
    .from('winners')
    .update({
      proof_url: path,
      verification_status: 'pending'
    })
    .eq('id', winnerId)

  setWinners(prev => prev.map(w =>
    w.id === winnerId ? { ...w, proof_url: path, verification_status: 'pending' } : w
  ))
  setUploading(null)
}

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-900/20 border-green-800'
      case 'rejected': return 'text-red-400 bg-red-900/20 border-red-800'
      default: return 'text-yellow-400 bg-yellow-900/20 border-yellow-800'
    }
  }

  const getPaymentColor = (status) => {
    switch (status) {
      case 'paid': return 'text-green-400'
      default: return 'text-yellow-400'
    }
  }

  if (loading) return (
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

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold mb-2">🏆 My Winnings</h2>
        <p className="text-gray-400 mb-8">Upload your proof to claim your prize</p>

        {winners.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <p className="text-4xl mb-4">🎯</p>
            <p className="text-gray-400">No winnings yet. Keep playing!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {winners.map(winner => (
              <div key={winner.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg capitalize">{winner.match_type} Match 🎉</h3>
                    <p className="text-gray-400 text-sm">
                      Draw: {winner.draws?.draw_date
                        ? new Date(winner.draws.draw_date).toLocaleDateString()
                        : 'N/A'}
                    </p>
                    {winner.draws?.winning_numbers && (
                      <div className="flex gap-2 mt-2">
                        {winner.draws.winning_numbers.map((n, i) => (
                          <span key={i} className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                            {n}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-500">${winner.prize_amount}</p>
                    <p className={`text-sm font-medium capitalize mt-1 ${getPaymentColor(winner.payment_status)}`}>
                      {winner.payment_status || 'pending'}
                    </p>
                  </div>
                </div>

                {/* Verification Status */}
                <div className={`inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full border mb-4 ${getStatusColor(winner.verification_status)}`}>
                  {winner.verification_status === 'approved' ? '✅' : winner.verification_status === 'rejected' ? '❌' : '⏳'}
                  Verification: {winner.verification_status || 'pending'}
                </div>

                {/* Upload proof */}
                {winner.verification_status !== 'approved' && (
                  <div>
                    {winner.proof_url ? (
                      <div className="flex items-center gap-3">
                        <p className="text-green-400 text-sm">✅ Proof uploaded</p>
                        <label className="cursor-pointer text-xs text-gray-400 hover:text-white underline">
                          Replace
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={e => handleUpload(winner.id, e.target.files[0])}
                          />
                        </label>
                      </div>
                    ) : (
                      <label className={`cursor-pointer inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-sm transition ${uploading === winner.id ? 'opacity-50' : ''}`}>
                        {uploading === winner.id ? 'Uploading...' : '📎 Upload Proof'}
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          disabled={uploading === winner.id}
                          onChange={e => handleUpload(winner.id, e.target.files[0])}
                        />
                      </label>
                    )}
                    <p className="text-gray-500 text-xs mt-2">Upload a screenshot of your scores from the golf platform</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}