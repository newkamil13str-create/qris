import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendEmail(params: {
  to: string
  subject: string
  html: string
}) {
  try {
    await transporter.sendMail({
      from: `"KAMIL SHOP" <${process.env.SMTP_USER}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
    })
  } catch (err) {
    console.error('Email error:', err)
  }
}

export function planUpgradeEmail(name: string, plan: string, expiresAt: Date) {
  return `
    <div style="font-family:Inter,sans-serif;background:#0a0a0a;color:#fff;padding:32px;border-radius:12px;max-width:600px;margin:0 auto">
      <h1 style="color:#f5c518;font-size:24px;margin-bottom:8px">🎉 Plan Upgraded!</h1>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your KAMIL SHOP plan has been upgraded to <strong style="color:#f5c518">${plan}</strong>.</p>
      <p>Valid until: <strong>${expiresAt.toLocaleDateString('id-ID')}</strong></p>
      <p style="margin-top:24px"><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background:#f5c518;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Go to Dashboard</a></p>
      <hr style="border-color:#222;margin:24px 0"/>
      <p style="font-size:12px;color:#666">KAMIL SHOP — Dynamic QRIS Platform</p>
    </div>
  `
}

export function withdrawalEmail(name: string, status: 'APPROVED' | 'REJECTED', amount: number, note?: string) {
  const color = status === 'APPROVED' ? '#22c55e' : '#ef4444'
  const icon = status === 'APPROVED' ? '✅' : '❌'
  return `
    <div style="font-family:Inter,sans-serif;background:#0a0a0a;color:#fff;padding:32px;border-radius:12px;max-width:600px;margin:0 auto">
      <h1 style="color:${color};font-size:24px;margin-bottom:8px">${icon} Withdrawal ${status === 'APPROVED' ? 'Approved' : 'Rejected'}</h1>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your withdrawal of <strong>Rp ${amount.toLocaleString('id-ID')}</strong> has been <strong style="color:${color}">${status.toLowerCase()}</strong>.</p>
      ${note ? `<p>Note: ${note}</p>` : ''}
      <p style="margin-top:24px"><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/withdraw" style="background:#f5c518;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">View Details</a></p>
    </div>
  `
}
