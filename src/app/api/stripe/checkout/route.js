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
    // Debug — à supprimer après
    console.log('STRIPE_KEY exists:', !!process.env.STRIPE_SECRET_KEY)
    console.log('STRIPE_KEY length:', process.env.STRIPE_SECRET_KEY?.length)
    console.log('STRIPE_KEY start:', process.env.STRIPE_SECRET_KEY?.substring(0, 10))

    const { priceId, userId, email } = await req.json()
    console.log('priceId:', priceId)
    console.log('userId:', userId)

    let customerId

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({ email })
      customerId = customer.id
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?canceled=true`,
      metadata: { userId },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}