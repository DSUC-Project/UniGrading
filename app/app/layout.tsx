import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WalletContextProvider } from '@/components/WalletContextProvider'
import { Toaster } from 'react-hot-toast'
import { CURRENT_VERSION, getFullAppTitle, getVersionDescription } from '@/constants/version'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: getFullAppTitle(),
  description: `Decentralized university grading system on Solana - ${getVersionDescription()}`,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletContextProvider>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
            <div className="flex-1">
              {children}
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-4 px-6">
              <div className="max-w-6xl mx-auto flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">UniGrading</span> - Decentralized University Grading System
                </div>
                <div className="text-sm text-gray-500">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {CURRENT_VERSION}
                  </span>
                  <span className="ml-2">Built on Solana</span>
                </div>
              </div>
            </footer>
          </div>
          <Toaster position="top-right" />
        </WalletContextProvider>
      </body>
    </html>
  )
}
