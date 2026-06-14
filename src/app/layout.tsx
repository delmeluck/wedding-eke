import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { ClientLayoutWrapper } from '@/components/ClientLayoutWrapper'

export const metadata: Metadata = {
  title: 'Ekow & Ekua | Wedding Celebration',
  description: 'Join us to celebrate the wedding of Ekow and Ekua — 19th December 2026, Bethany Methodist Church, Dzorwulu, Accra.',
  openGraph: {
    title: 'Ekow & Ekua Wedding',
    description: 'You are invited!',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Great+Vibes&family=Lato:wght@300;400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-cream">
        <Providers>
          <ClientLayoutWrapper>
            {children}
          </ClientLayoutWrapper>
        </Providers>
      </body>
    </html>
  )
}
