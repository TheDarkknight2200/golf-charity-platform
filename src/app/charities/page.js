'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function CharitiesPage() {
  const [charities, setCharities] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const categories = ['all', 'health', 'education', 'environment', 'children', 'general']

  useEffect(() => {
    const loadCharities = async () => {
      const { data } = await supabase
        .from('charities')
        .select('*')
        .order('featured', { ascending: false })
        .order('name')
      if (data) {
        setCharities(data)
        setFiltered(data)
      }
      setLoading(false)
    }
    loadCharities()
  }, [])

  useEffect(() => {
    let result = charities

    if (search) {
      result = result.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (category !== 'all') {
      result = result.filter(c => c.category === category)
    }

    setFiltered(result)
  }, [search, category, charities])

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1
          onClick={() => router.push('/')}
          className="text-xl font-bold text-green-500 cursor-pointer">
          ⛳ GolfCharity
        </h1>
        <button
          onClick={() => router.push('/auth')}
          className="text-sm bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg transition">
          Get Started
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-center mb-2">Our Charities</h2>
        <p className="text-gray-400 text-center mb-10">Every subscription supports a cause that matters</p>

        {/* Featured */}
        {charities.filter(c => c.featured).length > 0 && (
          <div className="mb-10">
            <h3 className="text-lg font-semibold text-green-500 mb-4">⭐ Featured Charity</h3>
            {charities.filter(c => c.featured).map(c => (
              <div key={c.id} className="bg-gradient-to-r from-green-900/30 to-gray-900 border border-green-800 rounded-xl p-6 flex gap-6 items-center">
                {c.image_url && (
                  <img src={c.image_url} alt={c.name} className="w-20 h-20 rounded-xl object-cover" />
                )}
                <div className="flex-1">
                  <h4 className="text-xl font-bold">{c.name}</h4>
                  <p className="text-gray-400 mt-1">{c.description}</p>
                  {c.website && (
                    <a href={c.website} target="_blank" rel="noopener noreferrer"
                      className="text-green-400 text-sm mt-2 inline-block hover:underline">
                      Visit website →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search charities..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
          />
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm capitalize transition ${
                  category === cat
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <p className="text-gray-400 text-center">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 text-center">No charities found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(c => (
              <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-green-800 transition">
                {c.image_url && (
                  <img src={c.image_url} alt={c.name} className="w-full h-40 object-cover rounded-lg mb-4" />
                )}
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-lg">{c.name}</h4>
                  {c.featured && <span className="text-xs bg-green-900/40 text-green-400 px-2 py-1 rounded-full">Featured</span>}
                </div>
                <p className="text-gray-400 text-sm mb-3">{c.description}</p>
                {c.category && (
                  <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full capitalize">{c.category}</span>
                )}
                {c.website && (
                  <a href={c.website} target="_blank" rel="noopener noreferrer"
                    className="block text-green-400 text-sm mt-3 hover:underline">
                    Visit website →
                  </a>
                )}
                {/* Events */}
                {c.events && c.events.length > 0 && (
                  <div className="mt-4 border-t border-gray-800 pt-4">
                    <p className="text-xs text-gray-500 mb-2">Upcoming Events</p>
                    {c.events.map((ev, i) => (
                      <div key={i} className="text-sm text-gray-300">📅 {ev.name} — {ev.date}</div>
                    ))}
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