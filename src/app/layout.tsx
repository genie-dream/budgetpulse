import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { BottomNav } from '@/components/layout/BottomNav'
import './globals.css'

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
    <html lang={locale} suppressHydrationWarning>
      <body className="bg-slate-900 text-slate-100 min-h-screen">
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
          <NextIntlClientProvider messages={messages}>
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
