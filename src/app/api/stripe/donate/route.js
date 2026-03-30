import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const { amount, charityId, charityName, userId, email } = await req.json()

    if (!amount || amount < 1) {
      return NextResponse.json({ error: 'Minimum donation is $1' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Donation to ${charityName}`,
            description: 'One-time charitable donation via GolfCharity',
          },
          unit_amount: Math.round(amount * 100), // convertir en centimes
        },
        quantity: 1,
      }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/donate?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/donate?canceled=true`,
      metadata: { userId, charityId, amount: amount.toString() },
    })

    // Créer le don en pending
    await supabase.from('donations').insert({
      user_id: userId,
      charity_id: charityId,
      amount: Math.round(amount * 100),
      stripe_payment_intent_id: session.id,
      status: 'pending',
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Donation error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}