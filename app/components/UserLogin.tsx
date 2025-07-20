'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import toast from 'react-hot-toast'

interface UserLoginProps {
  onLoginComplete: (role: 'teacher' | 'student') => void
}

export function UserLogin({ onLoginComplete }: UserLoginProps) {
  const { connected, publicKey } = useWallet()
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const handleLogin = async () => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first')
      return
    }

    setIsLoggingIn(true)
    try {
      // Check if user exists in localStorage
      const savedUser = localStorage.getItem(`user_${publicKey.toString()}`)

      if (!savedUser) {
        toast.error('No account found for this wallet. Please register first.')
        setIsLoggingIn(false)
        return
      }

      await new Promise(resolve => setTimeout(resolve, 1500))

      const userData = JSON.parse(savedUser)

      // Verify user data integrity
      if (!userData.username || !userData.role) {
        toast.error('Invalid user data. Please register again.')
        localStorage.removeItem(`user_${publicKey.toString()}`)
        setIsLoggingIn(false)
        return
      }

      // Check if user is active
      if (userData.isActive === false) {
        toast.error('Your account has been deactivated. Please contact an administrator.')
        setIsLoggingIn(false)
        return
      }

      toast.success(`Welcome back, ${userData.username}!`)
      onLoginComplete(userData.role.toLowerCase() as 'teacher' | 'student')

    } catch (error) {
      console.error('Login error:', error)
      toast.error('Login failed. Please try again.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  if (!connected) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Login to UniGrading</h3>
          <p className="text-gray-600 mb-4">
            Please connect your wallet to login to your existing account.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Connect the same wallet you used to register your account.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Check if user exists (with error handling)
  const userExists = publicKey && typeof window !== 'undefined' ? !!localStorage.getItem(`user_${publicKey.toString()}`) : false
  const userData = userExists && publicKey ? (() => {
    try {
      return JSON.parse(localStorage.getItem(`user_${publicKey.toString()}`) || '{}')
    } catch (error) {
      console.error('Error parsing user data:', error)
      return null
    }
  })() : null

  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-gray-900" style={{ colorScheme: 'light' }}>
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Login to UniGrading</h3>

        {userExists && userData ? (
          <div className="space-y-4">
            {/* User Info Preview */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-green-800">Account Found</span>
              </div>
              <div className="text-sm text-green-700">
                <p><strong>Username:</strong> {userData.username}</p>
                <p><strong>Role:</strong> {userData.role}</p>
                <p><strong>Registered:</strong> {new Date(userData.createdAt * 1000).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoggingIn ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </div>
              ) : (
                'Login to Dashboard'
              )}
            </button>

            {/* Additional Info */}
            <div className="text-xs text-gray-500">
              <p>Your account data is stored locally and linked to your wallet address.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* No Account Found */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-orange-800">No Account Found</span>
              </div>
              <p className="text-sm text-orange-700">
                No account is associated with this wallet address.
              </p>
            </div>

            <div className="text-sm text-gray-600">
              <p>You need to register first before you can login.</p>
              <p className="mt-2">Switch to the Register tab to create a new account.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
