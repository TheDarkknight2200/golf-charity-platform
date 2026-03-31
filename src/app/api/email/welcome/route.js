import { sendWelcomeEmail } from '@/lib/email'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { email, fullName } = await req.json()
    await sendWelcomeEmail(email, fullName)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Welcome email error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}