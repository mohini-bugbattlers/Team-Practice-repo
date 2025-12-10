import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import CompanyLayout from '@/components/CompanyLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Prathmesh Roadlines - Company Panel',
  description: 'Company management panel for requesting transport services and managing payments',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <CompanyLayout>
          {children}
        </CompanyLayout>
      </body>
    </html>
  )
}
