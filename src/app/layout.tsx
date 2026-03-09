// src/app/layout.tsx
// TODO: Replace Inter with Pretendard when font is available.
// Download PretendardVariable.woff2 from:
// https://github.com/orioncactus/pretendard/releases/download/v1.3.9/PretendardVariable.woff2
// and place it at public/fonts/PretendardVariable.woff2, then switch to:
//
// import localFont from 'next/font/local'
// const pretendard = localFont({
//   src: '../../public/fonts/PretendardVariable.woff2',
//   display: 'swap',
//   weight: '45 920',
//   variable: '--font-pretendard',
//   fallback: ['system-ui', '-apple-system', 'sans-serif'],
// })
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { BottomNav } from '@/components/layout/BottomNav'
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pretendard',
})

export const metadata: Metadata = {
  title: 'BudgetPulse',
  description: 'Real-time budget management — know your daily spending limit',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BudgetPulse',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html
      lang={locale}
      className={inter.variable}
      suppressHydrationWarning
    >
      <body className={`${inter.className} bg-slate-900 text-slate-100 min-h-screen`}>
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
          <NextIntlClientProvider messages={messages}>
            <ServiceWorkerRegistration />
            <main className="pb-20">
              {children}
            </main>
            <BottomNav />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
