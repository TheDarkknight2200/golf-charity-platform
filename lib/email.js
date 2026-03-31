import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.NEXT_PUBLIC_FROM_EMAIL

export async function sendWelcomeEmail(email, fullName) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: '⛳ Welcome to GolfCharity!',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #030712; color: #fff; padding: 40px; border-radius: 12px;">
        <h1 style="color: #22c55e;">⛳ Welcome to GolfCharity!</h1>
        <p>Hi ${fullName},</p>
        <p>You're now part of a community of golfers making a difference with every round.</p>
        <h3 style="color: #22c55e;">What's next?</h3>
        <ul>
          <li>Subscribe to enter monthly draws</li>
          <li>Enter your last 5 Stableford scores</li>
          <li>Choose a charity to support</li>
        </ul>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
           style="display: inline-block; background: #22c55e; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">
          Go to Dashboard →
        </a>
        <p style="color: #6b7280; margin-top: 40px; font-size: 12px;">© 2026 GolfCharity</p>
      </div>
    `
  })
}

export async function sendDrawResultEmail(email, fullName, winningNumbers, matched, prizeAmount) {
  const isWinner = matched >= 3
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: isWinner ? '🎉 You won in this month draw!' : '🎁 This month draw results',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #030712; color: #fff; padding: 40px; border-radius: 12px;">
        <h1 style="color: #22c55e;">${isWinner ? '🎉 Congratulations!' : '🎁 Draw Results'}</h1>
        <p>Hi ${fullName},</p>
        ${isWinner
          ? `<p>You matched <strong>${matched} numbers</strong> and won <strong>$${prizeAmount}</strong>!</p>`
          : `<p>This month's draw has been completed. You matched <strong>${matched}</strong> numbers. Better luck next time!</p>`
        }
        <h3 style="color: #22c55e;">Winning Numbers</h3>
        <div style="display: flex; gap: 8px; margin: 16px 0;">
          ${winningNumbers.map(n => `
            <span style="background: #16a34a; color: white; width: 36px; height: 36px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold;">
              ${n}
            </span>
          `).join('')}
        </div>
        ${isWinner ? `
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/winners"
             style="display: inline-block; background: #22c55e; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">
            Claim Your Prize →
          </a>
        ` : ''}
        <p style="color: #6b7280; margin-top: 40px; font-size: 12px;">© 2026 GolfCharity</p>
      </div>
    `
  })
}

export async function sendWinnerVerifiedEmail(email, fullName, prizeAmount, status) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: status === 'approved' ? '✅ Your prize has been approved!' : '❌ Verification rejected',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #030712; color: #fff; padding: 40px; border-radius: 12px;">
        <h1 style="color: ${status === 'approved' ? '#22c55e' : '#ef4444'};">
          ${status === 'approved' ? '✅ Prize Approved!' : '❌ Verification Rejected'}
        </h1>
        <p>Hi ${fullName},</p>
        ${status === 'approved'
          ? `<p>Your prize of <strong>$${prizeAmount}</strong> has been approved and will be processed shortly.</p>`
          : `<p>Unfortunately your verification proof was rejected. Please upload a valid screenshot of your scores.</p>`
        }
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/winners"
           style="display: inline-block; background: #22c55e; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">
          View My Winnings →
        </a>
        <p style="color: #6b7280; margin-top: 40px; font-size: 12px;">© 2026 GolfCharity</p>
      </div>
    `
  })
}

export async function sendSubscriptionEmail(email, fullName, plan, endDate) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: '🎉 Subscription confirmed!',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #030712; color: #fff; padding: 40px; border-radius: 12px;">
        <h1 style="color: #22c55e;">🎉 Subscription Confirmed!</h1>
        <p>Hi ${fullName},</p>
        <p>Your <strong>${plan}</strong> subscription is now active.</p>
        <p>Your next renewal date is <strong>${new Date(endDate).toLocaleDateString()}</strong>.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
           style="display: inline-block; background: #22c55e; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">
          Go to Dashboard →
        </a>
        <p style="color: #6b7280; margin-top: 40px; font-size: 12px;">© 2026 GolfCharity</p>
      </div>
    `
  })
}