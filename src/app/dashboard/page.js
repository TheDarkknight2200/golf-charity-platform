'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [participation, setParticipation] = useState({
    drawsEntered: 0,
    upcomingDraws: 0,
    totalWinnings: 0,
  })
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth'); return }
      setUser(session.user)

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      setProfile(data)

      const { data: allDraws } = await supabase.from('draws').select('*')
      const { data: myScores } = await supabase.from('scores').select('score').eq('user_id', session.user.id)
      const { data: myWinnings } = await supabase.from('winners').select('prize_amount').eq('user_id', session.user.id)

      const publishedDraws = allDraws?.filter(d => d.status === 'published') || []
      const upcomingDraws = allDraws?.filter(d => d.status === 'pending') || []
      const userScores = myScores?.map(s => s.score) || []
      const drawsEntered = publishedDraws.filter(draw => draw.winning_numbers?.some(n => userScores.includes(n))).length
      const totalWinnings = myWinnings?.reduce((sum, w) => sum + (w.prize_amount || 0), 0) || 0

      setParticipation({ drawsEntered, upcomingDraws: upcomingDraws.length, totalWinnings })
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
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between animate-fade-in">
        <h1 className="text-xl font-bold text-green-500">⛳ GolfCharity</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user.email}</span>
          {profile?.is_admin && (
            <button
              onClick={() => router.push('/admin')}
              className="btn-press text-xs bg-red-900/40 text-red-400 hover:bg-red-900/60 px-3 py-1 rounded-lg transition">
              Admin
            </button>
          )}
          <button
            onClick={handleLogout}
            className="btn-press text-sm bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Welcome */}
        <div className="mb-8 animate-fade-in-up">
          <h2 className="text-2xl font-bold">Welcome back, {profile?.full_name || 'Golfer'} 👋</h2>
          <p className="text-gray-400 mt-1">Track your scores, support your charity and win prizes.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="animate-fade-in-up delay-100 card-hover bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">Subscription</p>
            <p className={`text-2xl font-bold mt-1 ${profile?.subscription_status === 'active' ? 'text-green-500' : 'text-red-400'}`}>
              {profile?.subscription_status === 'active' ? 'Active' : 'Inactive'}
            </p>
            {profile?.subscription_status !== 'active' && (
              <button
                onClick={() => router.push('/dashboard/subscription')}
                className="btn-press mt-3 text-xs bg-green-600 hover:bg-green-500 px-3 py-1 rounded-lg transition">
                Subscribe now
              </button>
            )}
          </div>
          <div className="animate-fade-in-up delay-200 card-hover bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">My Charity</p>
            <p className="text-2xl font-bold mt-1">{profile?.charity_id ? 'Selected' : 'Not selected'}</p>
          </div>
          <div className="animate-fade-in-up delay-300 card-hover bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">Charity Contribution</p>
            <p className="text-2xl font-bold mt-1 text-green-500">{profile?.charity_percentage || 10}%</p>
          </div>
        </div>

        {/* Participation Summary */}
        <div className="animate-fade-in-up delay-400 bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <h3 className="font-semibold mb-4">📊 Participation Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">{participation.drawsEntered}</p>
              <p className="text-gray-400 text-sm mt-1">Draws Entered</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-400">{participation.upcomingDraws}</p>
              <p className="text-gray-400 text-sm mt-1">Upcoming Draws</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-400">${participation.totalWinnings}</p>
              <p className="text-gray-400 text-sm mt-1">Total Winnings</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: '🏌️', title: 'My Scores', desc: 'Enter and track your last 5 golf scores.', btn: 'Add Score', path: '/dashboard/scores', color: 'bg-green-600 hover:bg-green-500' },
            { icon: '❤️', title: 'My Charity', desc: 'Choose your charity and set your contribution.', btn: 'Choose Charity', path: '/dashboard/charity', color: 'bg-gray-700 hover:bg-gray-600' },
            { icon: '🎁', title: 'Monthly Draw', desc: 'View upcoming draws and your participation status.', btn: 'View Draw', path: '/dashboard/draws', color: 'bg-gray-700 hover:bg-gray-600' },
            { icon: '❤️', title: 'Make a Donation', desc: 'Donate directly to a charity, independent of your subscription.', btn: 'Donate Now', path: '/dashboard/donate', color: 'bg-gray-700 hover:bg-gray-600' },
            { icon: '🏆', title: 'My Winnings', desc: 'View your prizes and upload verification proof.', btn: 'View Winnings', path: '/dashboard/winners', color: 'bg-gray-700 hover:bg-gray-600' },
          ].map((item, index) => (
            <div key={item.title} className={`animate-fade-in-up delay-${(index + 1) * 100} card-hover bg-gray-900 border border-gray-800 rounded-xl p-6`}>
              <h3 className="font-semibold mb-2">{item.icon} {item.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{item.desc}</p>
              <button
                onClick={() => router.push(item.path)}
                className={`btn-press ${item.color} px-4 py-2 rounded-lg text-sm font-medium transition`}>
                {item.btn}
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}