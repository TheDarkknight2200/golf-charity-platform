'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }
      setUser(session.user)

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      setProfile(data)
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (!user) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-white">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      
      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-green-500">⛳ GolfCharity</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user.email}</span>
          <button
            onClick={handleLogout}
            className="text-sm bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
         <button
  onClick={() => router.push('/admin')}
  className="text-xs bg-red-900/40 text-red-400 hover:bg-red-900/60 px-3 py-1 rounded-lg transition">
  Admin
</button>
      </nav>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Welcome back, {profile?.full_name || 'Golfer'} 👋</h2>
          <p className="text-gray-400 mt-1">Track your scores, support your charity and win prizes.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">Subscription</p>
            <p className={`text-2xl font-bold mt-1 ${profile?.subscription_status === 'active' ? 'text-green-500' : 'text-red-400'}`}>
              {profile?.subscription_status === 'active' ? 'Active' : 'Inactive'}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">My Charity</p>
            <p className="text-2xl font-bold mt-1">{profile?.charity_id ? 'Selected' : 'Not selected'}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">Charity Contribution</p>
            <p className="text-2xl font-bold mt-1 text-green-500">{profile?.charity_percentage || 10}%</p>
          </div>
        </div>

        {/* Quick Actions */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
    <h3 className="font-semibold mb-2">🏌️ My Scores</h3>
    <p className="text-gray-400 text-sm mb-4">Enter and track your last 5 golf scores.</p>
    <button
      onClick={() => router.push('/dashboard/scores')}
      className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-sm font-medium transition">
      Add Score
    </button>
  </div>
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
    <h3 className="font-semibold mb-2">❤️ My Charity</h3>
    <p className="text-gray-400 text-sm mb-4">Choose your charity and set your contribution.</p>
    <button
      onClick={() => router.push('/dashboard/charity')}
      className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm font-medium transition">
      Choose Charity
    </button>
  </div>
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
    <h3 className="font-semibold mb-2">🎁 Monthly Draw</h3>
    <p className="text-gray-400 text-sm mb-4">View upcoming draws and your participation status.</p>
   <button
  onClick={() => router.push('/dashboard/draws')}
  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm font-medium transition">
  View Draw
</button>
   
  </div>
</div>

      </div>
    </div>
  )
}