import QRCode from 'qrcode'

export async function generateQRCodeDataURL(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    width: 300,
    margin: 2,
    color: { dark: '#6b21a8', light: '#fef7ed' },
    errorCorrectionLevel: 'H',
  })
}

export async function generateQRCodeSVG(text: string): Promise<string> {
  return QRCode.toString(text, { type: 'svg', margin: 2 })
}

export function rsvpUrl(qrCode: string) {
  const base = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  return `${base}/rsvp?code=${qrCode}`
}
