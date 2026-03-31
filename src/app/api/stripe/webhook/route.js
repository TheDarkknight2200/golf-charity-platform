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

  const data = event.data.object

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
  const subscription = await stripe.subscriptions.retrieve(data.subscription)
  const userId = data.metadata.userId
  const plan = subscription.items.data[0].price.id === process.env.STRIPE_MONTHLY_PRICE_ID ? 'monthly' : 'yearly'

  await supabase
    .from('profiles')
    .update({
      subscription_status: 'active',
      subscription_plan: plan,
      stripe_subscription_id: subscription.id,
      subscription_end_date: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
    })
    .eq('id', userId)

  
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name, subscription_end_date')
    .eq('id', userId)
    .single()

  if (profile) {
    const { sendSubscriptionEmail } = await import('@/lib/email')
    await sendSubscriptionEmail(profile.email, profile.full_name, plan, profile.subscription_end_date)
  }
  break
}

      case 'invoice.payment_succeeded': {
        // data est une invoice ici
        const subscriptionId = data.subscription
        if (!subscriptionId) break

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const customerId = data.customer

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          await supabase
            .from('profiles')
            .update({
              subscription_status: 'active',
              subscription_end_date: subscription.current_period_end 
  ? new Date(subscription.current_period_end * 1000).toISOString() 
  : null,
            })
            .eq('id', profile.id)
        }
        break
      }

      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        const customerId = data.customer

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          await supabase
            .from('profiles')
            .update({
              subscription_status: data.status === 'active' ? 'active' : 'inactive',
              subscription_end_date: subscription.current_period_end 
  ? new Date(subscription.current_period_end * 1000).toISOString() 
  : null,
            })
            .eq('id', profile.id)
        }
        break
      }
    }
  } catch (error) {
    console.error('Webhook handler error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}