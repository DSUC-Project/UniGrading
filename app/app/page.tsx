'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useState, useEffect } from 'react'
import { Dashboard } from '@/components/Dashboard'
import { AuthPage } from '@/components/AuthPage'
import { WalletButton } from '@/components/WalletButton'
import { RegistrationDebug } from '@/components/RegistrationDebug'
import { CURRENT_VERSION } from '@/constants/version'
import NoSSR from '@/components/NoSSR'

export default function Home() {
  return (
    <NoSSR>
      <HomeContent />
    </NoSSR>
  )
}

function HomeContent() {
  const { connected, publicKey } = useWallet()
  const [isRegistered, setIsRegistered] = useState(false)
  const [userRole, setUserRole] = useState<'teacher' | 'student' | 'admin' | null>(null)

  useEffect(() => {
    // Check if user is registered
    // This would typically involve checking the blockchain for user account
    if (connected && publicKey) {
      // For now, we'll simulate this check
      // In a real app, you'd query the blockchain here
      checkUserRegistration()
    }
  }, [connected, publicKey])

  const checkUserRegistration = async () => {
    if (!publicKey) return

    // Check if user exists in localStorage
    const savedUser = localStorage.getItem(`user_${publicKey.toString()}`)
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setIsRegistered(true)
      setUserRole(userData.role.toLowerCase() as 'teacher' | 'student' | 'admin')
    } else {
      setIsRegistered(false)
      setUserRole(null)
    }
  }

  const handleRegistrationComplete = (role: 'teacher' | 'student' | 'admin') => {
    setIsRegistered(true)
    setUserRole(role)
  }

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            UniGrading
          </h1>
          <div className="flex items-center justify-center mb-6">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {CURRENT_VERSION}
            </span>
          </div>
          <p className="text-xl text-gray-600 mb-8">
            Decentralized University Grading System
          </p>
          <p className="text-gray-500 mb-8">
            Connect your Solana wallet to get started
          </p>
          <WalletButton />
        </div>
      </div>
    )
  }

  if (!isRegistered) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">UniGrading</h1>
            <WalletButton />
          </div>
          <AuthPage onAuthComplete={handleRegistrationComplete} />
        </div>
        {process.env.NODE_ENV === 'development' && <RegistrationDebug />}
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">UniGrading Dashboard</h1>
          <WalletButton />
        </div>
        <Dashboard userRole={userRole} />
      </div>
    </div>
  )
}
