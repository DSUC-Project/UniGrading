'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { UserRegistration } from './UserRegistration'
import { UserLogin } from './UserLogin'

interface AuthPageProps {
  onAuthComplete: (role: 'teacher' | 'student' | 'admin') => void
}

export function AuthPage({ onAuthComplete }: AuthPageProps) {
  const { publicKey } = useWallet()
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  // Check if user exists in localStorage
  const userExists = publicKey ? !!localStorage.getItem(`user_${publicKey.toString()}`) : false

  return (
    <div className="max-w-md mx-auto bg-white text-gray-900" style={{ colorScheme: 'light' }}>
      {/* Auth Mode Toggle */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setAuthMode('login')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                authMode === 'login'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                authMode === 'register'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* User Status */}
        {publicKey && (
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">
              Wallet: {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
            </p>
            <p className={`text-sm font-medium ${userExists ? 'text-green-600' : 'text-orange-600'}`}>
              {userExists ? 'Account found - You can login' : 'No account found - Please register'}
            </p>
          </div>
        )}

        {/* Auto-suggest based on user existence */}
        {publicKey && userExists && authMode === 'register' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              You already have an account. 
              <button
                onClick={() => setAuthMode('login')}
                className="ml-1 font-medium underline hover:no-underline"
              >
                Click here to login instead.
              </button>
            </p>
          </div>
        )}

        {publicKey && !userExists && authMode === 'login' && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-orange-800">
              No account found for this wallet. 
              <button
                onClick={() => setAuthMode('register')}
                className="ml-1 font-medium underline hover:no-underline"
              >
                Click here to register instead.
              </button>
            </p>
          </div>
        )}
      </div>

      {/* Auth Forms */}
      {authMode === 'login' ? (
        <UserLogin onLoginComplete={onAuthComplete} />
      ) : (
        <UserRegistration onRegistrationComplete={onAuthComplete} />
      )}
    </div>
  )
}
