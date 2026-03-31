import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
  <h1 className="text-xl font-bold text-green-500">⛳ GolfCharity</h1>
  <div className="flex gap-3 items-center">
    <Link href="/charities" className="text-sm text-gray-400 hover:text-white transition px-4 py-2">
      Charities
    </Link>
    <Link href="/auth" className="text-sm text-gray-400 hover:text-white transition px-4 py-2">
      Sign In
    </Link>
    <Link href="/auth" className="text-sm bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition font-medium">
      Get Started
    </Link>
  </div>
</nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <span className="text-green-500 text-sm font-medium bg-green-900/20 border border-green-800 px-4 py-1.5 rounded-full">
          Play Golf. Win Prizes. Change Lives.
        </span>
        <h1 className="text-5xl md:text-6xl font-bold mt-6 mb-6 leading-tight">
          The Golf Platform That<br />
          <span className="text-green-500">Gives Back</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
          Track your Stableford scores, enter monthly prize draws and support the charity of your choice — all in one place.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth" className="bg-green-600 hover:bg-green-500 text-white font-semibold px-8 py-4 rounded-xl transition text-lg">
            Start Playing →
          </Link>
          <a href="#how-it-works" className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-8 py-4 rounded-xl transition text-lg">
            How It Works
          </a>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-800 py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '$50,000+', label: 'Prize Pool Distributed' },
            { value: '1,200+', label: 'Active Players' },
            { value: '15+', label: 'Charities Supported' },
            { value: '£120,000+', label: 'Donated to Charities' },
          ].map(stat => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-green-500">{stat.value}</p>
              <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
        <p className="text-gray-400 text-center mb-12">Three simple steps to play, win and give back.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', icon: '🏌️', title: 'Track Your Scores', desc: 'Enter your last 5 Stableford golf scores after each round. Your scores are your draw entries.' },
            { step: '02', icon: '🎁', title: 'Enter Monthly Draws', desc: 'Every month, 5 winning numbers are drawn. Match 3, 4 or all 5 to win a share of the prize pool.' },
            { step: '03', icon: '❤️', title: 'Support a Charity', desc: 'Choose your charity at signup. A portion of every subscription goes directly to causes you care about.' },
          ].map(item => (
            <div key={item.step} className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-gray-600 text-sm font-mono">{item.step}</span>
                <span className="text-3xl">{item.icon}</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Prize Pools */}
      <section className="bg-gray-900/50 border-y border-gray-800 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Prize Structure</h2>
          <p className="text-gray-400 text-center mb-12">The more you match, the more you win.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { match: '5 Numbers', label: 'Jackpot', share: '40%', color: 'border-green-500 bg-green-900/10', badge: 'bg-green-600' },
              { match: '4 Numbers', label: '2nd Prize', share: '35%', color: 'border-gray-700', badge: 'bg-gray-700' },
              { match: '3 Numbers', label: '3rd Prize', share: '25%', color: 'border-gray-700', badge: 'bg-gray-700' },
            ].map(prize => (
              <div key={prize.match} className={`border rounded-2xl p-8 text-center ${prize.color}`}>
                <span className={`text-xs text-white px-3 py-1 rounded-full ${prize.badge}`}>{prize.label}</span>
                <p className="text-4xl font-bold mt-4 mb-2">{prize.share}</p>
                <p className="text-gray-400">of prize pool</p>
                <p className="text-green-400 font-semibold mt-4">{prize.match} matched</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Charities */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Charities We Support</h2>
        <p className="text-gray-400 text-center mb-12">Every subscription contributes to a cause that matters.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            'Save The Children',
            'Red Cross Gambia',
            'WWF Africa',
            'UNICEF Senegal',
            'Doctors Without Borders',
            'Your Chosen Charity →',
          ].map(name => (
            <div key={name} className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 text-center">
              <p className="font-medium text-sm">{name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold mb-4">Ready to Play?</h2>
        <p className="text-gray-400 mb-8 text-lg">Join thousands of golfers making a difference with every round.</p>
        <Link href="/auth" className="bg-green-600 hover:bg-green-500 text-white font-semibold px-10 py-4 rounded-xl transition text-lg inline-block">
          Join GolfCharity Today →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-8 text-center">
        <p className="text-gray-500 text-sm">© 2026 GolfCharity. All rights reserved.</p>
      </footer>

    </div>
  )
}