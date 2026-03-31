import { sendWinnerVerifiedEmail } from '@/lib/email'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const { winnerId, status } = await req.json()

    const { data: winner } = await supabase
      .from('winners')
      .select('*, profiles(email, full_name)')
      .eq('id', winnerId)
      .single()

    await sendWinnerVerifiedEmail(
      winner.profiles.email,
      winner.profiles.full_name,
      winner.prize_amount,
      status
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Winner verified email error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}