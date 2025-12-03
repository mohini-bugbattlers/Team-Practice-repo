import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import AuthService from '@/services/auth'
import { redirect } from 'next/navigation'

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
  // Check authentication on server side
  if (typeof window === 'undefined') {
    // Server-side check - this won't work as expected in Next.js layout
    // We'll handle auth in client components instead
  }

  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
            <Header />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
