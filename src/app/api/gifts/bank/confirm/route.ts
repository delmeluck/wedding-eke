import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'iotchere55@gmail.com'

// POST /api/gifts/bank/confirm
// Called when guest clicks "I've Sent the Transfer" in BankDrawer.
export async function POST(req: NextRequest) {
  const { donorName, donorEmail, amount, bankName, accountName } = await req.json()

  try {
    const displayAmount = amount ? `GH₵ ${Number(amount).toLocaleString()}` : 'an amount'
    const displayName   = donorName ?? 'A guest'
    const displayBank   = bankName  ?? 'bank transfer'

    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `Bank transfer gift confirmed: ${displayAmount} from ${displayName}`,
      html: `
<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#fff;">
  <h2 style="color:#166534;margin:0 0 4px;">Bank Transfer Confirmed 🏦</h2>
  <p style="color:#555;margin:0 0 20px;font-size:14px;">E &amp; E Wedding</p>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <tr><td style="padding:8px 0;color:#888;width:140px;">From</td><td style="padding:8px 0;color:#222;font-weight:600;">${displayName}</td></tr>
    ${donorEmail ? `<tr><td style="padding:8px 0;color:#888;">Email</td><td style="padding:8px 0;color:#222;">${donorEmail}</td></tr>` : ''}
    <tr><td style="padding:8px 0;color:#888;">Amount</td><td style="padding:8px 0;color:#222;font-weight:600;">${displayAmount}</td></tr>
    <tr><td style="padding:8px 0;color:#888;">Bank</td><td style="padding:8px 0;color:#222;">${displayBank}</td></tr>
    ${accountName ? `<tr><td style="padding:8px 0;color:#888;">Account Name</td><td style="padding:8px 0;color:#222;">${accountName}</td></tr>` : ''}
  </table>
  <p style="color:#C9A227;font-family:Georgia,serif;font-style:italic;font-size:18px;margin:24px 0 0;">With love, Ekow &amp; Ekua</p>
</div>`,
    })

    if (donorEmail) {
      await sendEmail({
        to: donorEmail,
        subject: 'Your gift to Ekow & Ekua — Thank you! 🎉',
        html: `
<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#fff;">
  <h2 style="color:#8F5DAF;margin:0 0 4px;">Thank You${donorName ? `, ${donorName}` : ''}! 🎉</h2>
  <p style="color:#555;line-height:1.7;margin:0 0 16px;">Your bank transfer gift of <strong>${displayAmount}</strong> has been noted. Ekow &amp; Ekua are truly grateful for your love and generosity.</p>
  <p style="color:#C9A227;font-family:Georgia,serif;font-style:italic;font-size:18px;margin:0;">With love, Ekow &amp; Ekua 💛</p>
</div>`,
      })
    }
  } catch (e) {
    console.error('[bank/confirm] email error:', e)
  }

  return NextResponse.json({ ok: true })
}
