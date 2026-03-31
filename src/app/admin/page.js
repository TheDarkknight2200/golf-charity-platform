'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const [users, setUsers] = useState([])
  const [draws, setDraws] = useState([])
  const [charities, setCharities] = useState([])
  const [winners, setWinners] = useState([])
  const [activeTab, setActiveTab] = useState('users')
  const [loading, setLoading] = useState(false)
  const [newDraw, setNewDraw] = useState({ draw_date: '', jackpot_amount: '', pool_4match: '', pool_3match: '' })
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single()

      if (!profile?.is_admin) { router.push('/dashboard'); return }

      fetchAll()
    }
    init()
  }, [])

  const fetchAll = async () => {
    const { data: usersData } = await supabase.from('profiles').select('*')
    setUsers(usersData || [])

    const { data: drawsData } = await supabase.from('draws').select('*').order('draw_date', { ascending: false })
    setDraws(drawsData || [])

    const { data: charitiesData } = await supabase.from('charities').select('*')
    setCharities(charitiesData || [])

    const { data: winnersData } = await supabase
      .from('winners')
      .select('*, profiles(full_name, email), draws(draw_date)')
    setWinners(winnersData || [])
  }

  const handleCreateDraw = async (e) => {
    e.preventDefault()
    setLoading(true)

    const winningNumbers = []
    while (winningNumbers.length < 5) {
      const n = Math.floor(Math.random() * 45) + 1
      if (!winningNumbers.includes(n)) winningNumbers.push(n)
    }

    await supabase.from('draws').insert({
      draw_date: newDraw.draw_date,
      winning_numbers: winningNumbers,
      jackpot_amount: parseFloat(newDraw.jackpot_amount) || 0,
      pool_4match: parseFloat(newDraw.pool_4match) || 0,
      pool_3match: parseFloat(newDraw.pool_3match) || 0,
      status: 'pending'
    })

    setNewDraw({ draw_date: '', jackpot_amount: '', pool_4match: '', pool_3match: '' })
    fetchAll()
    setLoading(false)
  }

  const handlePublishDraw = async (drawId) => {
    await supabase.from('draws').update({ status: 'published' }).eq('id', drawId)
    fetchAll()
  }

  const handleDeleteDraw = async (drawId) => {
    await supabase.from('draws').delete().eq('id', drawId)
    fetchAll()
  }

  const handleToggleAdmin = async (userId, current) => {
    await supabase.from('profiles').update({ is_admin: !current }).eq('id', userId)
    fetchAll()
  }

  const handleUpdatePayment = async (winnerId) => {
    await supabase.from('winners').update({ payment_status: 'paid' }).eq('id', winnerId)
    fetchAll()
  }

  const handleVerification = async (winnerId, status) => {
    await supabase.from('winners').update({ verification_status: status }).eq('id', winnerId)
    fetchAll()
  }

  const tabs = ['users', 'draws', 'charities', 'winners']

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-green-500">
          ⛳ GolfCharity{' '}
          <span className="text-xs bg-red-600 px-2 py-0.5 rounded-full ml-2">ADMIN</span>
        </h1>
        <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-400 hover:text-white transition">
          ← Back to Dashboard
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: users.length, color: 'text-blue-400' },
            { label: 'Total Draws', value: draws.length, color: 'text-green-400' },
            { label: 'Charities', value: charities.length, color: 'text-purple-400' },
            { label: 'Winners', value: winners.length, color: 'text-yellow-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-800">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition border-b-2 -mb-px ${
                activeTab === tab ? 'border-green-500 text-green-400' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="space-y-3">
            {users.map(user => (
              <div key={user.id} className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{user.full_name || 'No name'}</p>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    user.subscription_status === 'active' ? 'bg-green-900/40 text-green-400' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {user.subscription_status}
                  </span>
                  <button
                    onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                    className={`text-xs px-3 py-1 rounded-lg transition ${
                      user.is_admin ? 'bg-red-900/40 text-red-400 hover:bg-red-900/60' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DRAWS TAB */}
        {activeTab === 'draws' && (
          <div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
              <h3 className="font-semibold mb-4">Create New Draw</h3>
              <form onSubmit={handleCreateDraw} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Draw Date</label>
                  <input type="datetime-local" value={newDraw.draw_date}
                    onChange={e => setNewDraw({...newDraw, draw_date: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                    required />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Jackpot ($)</label>
                  <input type="number" value={newDraw.jackpot_amount} placeholder="e.g. 1000"
                    onChange={e => setNewDraw({...newDraw, jackpot_amount: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">4 Match Pool ($)</label>
                  <input type="number" value={newDraw.pool_4match} placeholder="e.g. 500"
                    onChange={e => setNewDraw({...newDraw, pool_4match: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">3 Match Pool ($)</label>
                  <input type="number" value={newDraw.pool_3match} placeholder="e.g. 250"
                    onChange={e => setNewDraw({...newDraw, pool_3match: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500" />
                </div>
                <div className="col-span-2 md:col-span-4">
                  <button type="submit" disabled={loading}
                    className="bg-green-600 hover:bg-green-500 px-6 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50">
                    {loading ? 'Creating...' : 'Create Draw (Auto-generate numbers)'}
                  </button>
                </div>
              </form>
            </div>

            <div className="space-y-3">
              {draws.map(draw => (
                <div key={draw.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium">{new Date(draw.draw_date).toLocaleDateString('en-GB')}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        draw.status === 'published' ? 'bg-green-900/40 text-green-400' : 'bg-yellow-900/40 text-yellow-400'
                      }`}>{draw.status}</span>
                    </div>
                    <div className="flex gap-2">
                      {draw.status === 'pending' && (
                        <button onClick={() => handlePublishDraw(draw.id)}
                          className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded-lg text-xs transition">
                          Publish
                        </button>
                      )}
                      <button onClick={() => handleDeleteDraw(draw.id)}
                        className="bg-red-900/40 hover:bg-red-900/60 text-red-400 px-3 py-1 rounded-lg text-xs transition">
                        Delete
                      </button>
                    </div>
                  </div>
                  {draw.winning_numbers && (
                    <div className="flex gap-2">
                      {draw.winning_numbers.map((n, i) => (
                        <div key={i} className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-xs font-bold">
                          {n}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHARITIES TAB */}
        {activeTab === 'charities' && (
          <div className="space-y-3">
            {charities.map(charity => (
              <div key={charity.id} className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{charity.name}</p>
                  <p className="text-gray-400 text-sm">{charity.description}</p>
                </div>
                {charity.featured && (
                  <span className="text-xs bg-green-900/40 text-green-400 px-2 py-0.5 rounded-full">Featured</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* WINNERS TAB */}
        {activeTab === 'winners' && (
          <div className="space-y-3">
            {winners.length === 0 ? (
              <p className="text-gray-500">No winners yet.</p>
            ) : (
              winners.map(w => (
                <div key={w.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium">{w.profiles?.full_name || w.profiles?.email}</p>
                      <p className="text-gray-400 text-sm">{w.match_type} — ${w.prize_amount}</p>
                      <p className="text-gray-500 text-xs">
                        {w.draws?.draw_date ? new Date(w.draws.draw_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        w.payment_status === 'paid' ? 'bg-green-900/40 text-green-400' : 'bg-yellow-900/40 text-yellow-400'
                      }`}>
                        💰 {w.payment_status || 'pending'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        w.verification_status === 'approved' ? 'bg-green-900/40 text-green-400' :
                        w.verification_status === 'rejected' ? 'bg-red-900/40 text-red-400' :
                        'bg-yellow-900/40 text-yellow-400'
                      }`}>
                        {w.verification_status === 'approved' ? '✅' : w.verification_status === 'rejected' ? '❌' : '⏳'} {w.verification_status || 'pending'}
                      </span>
                    </div>
                  </div>

                  {/* Proof */}
                  {w.proof_url ? (
                    <div className="mb-3">
                      <a
                        href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/authenticated/winner-proofs/${w.proof_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 text-sm hover:underline">
                        📎 View Proof
                      </a>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm mb-3">⚠️ No proof uploaded yet</p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    {w.verification_status !== 'approved' && w.verification_status !== 'rejected' && w.proof_url && (
                      <>
                        <button
                          onClick={() => handleVerification(w.id, 'approved')}
                          className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded-lg text-xs transition">
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => handleVerification(w.id, 'rejected')}
                          className="bg-red-900/40 hover:bg-red-900/60 text-red-400 px-3 py-1 rounded-lg text-xs transition">
                          ❌ Reject
                        </button>
                      </>
                    )}
                    {w.verification_status === 'approved' && w.payment_status !== 'paid' && (
                      <button
                        onClick={() => handleUpdatePayment(w.id)}
                        className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded-lg text-xs transition">
                        💰 Mark Paid
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  )
}