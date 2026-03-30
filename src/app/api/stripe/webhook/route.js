import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }

  const session = event.data.object

  switch (event.type) {
    case 'checkout.session.completed': {
      const subscription = await stripe.subscriptions.retrieve(session.subscription)
      const userId = session.metadata.userId
      const plan = subscription.items.data[0].price.id === process.env.STRIPE_MONTHLY_PRICE_ID ? 'monthly' : 'yearly'

      await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          subscription_plan: plan,
          stripe_subscription_id: subscription.id,
          subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq('id', userId)
      break
    }

    case 'invoice.payment_succeeded': {
      const subscription = await stripe.subscriptions.retrieve(session.subscription)
      const customer = await stripe.customers.retrieve(session.customer)

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customer.id)
        .single()

      if (profile) {
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'active',
            subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('id', profile.id)
      }
      break
    }

    case 'customer.subscription.deleted':
    case 'customer.subscription.updated': {
      const customer = await stripe.customers.retrieve(session.customer)

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customer.id)
        .single()

      if (profile) {
        await supabase
          .from('profiles')
          .update({
            subscription_status: session.status === 'active' ? 'active' : 'inactive',
            subscription_end_date: new Date(session.current_period_end * 1000).toISOString(),
          })
          .eq('id', profile.id)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}