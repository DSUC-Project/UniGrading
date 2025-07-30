'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useUniGrading } from '../hooks/useUniGrading'

export function RegistrationDebug() {
  const { connected, publicKey } = useWallet()
  const { currentUser, loading } = useUniGrading()
  const [isExpanded, setIsExpanded] = useState(false)
  const [registrationData, setRegistrationData] = useState<any>(null)

  useEffect(() => {
    if (publicKey) {
      const userData = localStorage.getItem(`user_${publicKey.toString()}`)
      setRegistrationData(userData ? JSON.parse(userData) : null)
    }
  }, [publicKey, currentUser])

  const debugInfo = {
    wallet: {
      connected,
      publicKey: publicKey?.toString() || 'Not connected',
      balance: 'N/A (Not implemented)',
    },
    registration: {
      isRegistered: !!currentUser,
      userData: currentUser,
      localStorageData: registrationData,
    },
    system: {
      loading,
      timestamp: new Date().toISOString(),
      localStorage: {
        allUsers: JSON.parse(localStorage.getItem('all_users') || '[]').length,
        allClassrooms: JSON.parse(localStorage.getItem('all_classrooms') || '[]').length,
      }
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="Toggle Debug Info"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Debug Panel */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 w-96 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Registration Debug</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Wallet Info */}
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-2">Wallet Status</h4>
              <div className="bg-gray-50 rounded p-2 text-xs">
                <div className="flex justify-between">
                  <span>Connected:</span>
                  <span className={connected ? 'text-green-600' : 'text-red-600'}>
                    {connected ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Address:</span>
                  <span className="font-mono text-xs">
                    {publicKey ? `${publicKey.toString().slice(0, 8)}...` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Registration Status */}
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-2">Registration Status</h4>
              <div className="bg-gray-50 rounded p-2 text-xs">
                <div className="flex justify-between">
                  <span>Registered:</span>
                  <span className={debugInfo.registration.isRegistered ? 'text-green-600' : 'text-red-600'}>
                    {debugInfo.registration.isRegistered ? 'Yes' : 'No'}
                  </span>
                </div>
                {currentUser && (
                  <>
                    <div className="flex justify-between mt-1">
                      <span>Username:</span>
                      <span>{currentUser.username}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Role:</span>
                      <span className={`px-1 rounded text-xs ${
                        currentUser.role === 'Teacher' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {currentUser.role}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* System Info */}
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-2">System Info</h4>
              <div className="bg-gray-50 rounded p-2 text-xs">
                <div className="flex justify-between">
                  <span>Loading:</span>
                  <span className={loading ? 'text-yellow-600' : 'text-green-600'}>
                    {loading ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Total Users:</span>
                  <span>{debugInfo.system.localStorage.allUsers}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Total Classes:</span>
                  <span>{debugInfo.system.localStorage.allClassrooms}</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Last Update: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Raw Data */}
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-2">Raw Data</h4>
              <div className="bg-black text-green-400 rounded p-2 text-xs font-mono max-h-32 overflow-y-auto">
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  if (publicKey) {
                    localStorage.removeItem(`user_${publicKey.toString()}`)
                    window.location.reload()
                  }
                }}
                className="flex-1 bg-red-600 text-white text-xs py-1 px-2 rounded hover:bg-red-700"
              >
                Clear User Data
              </button>
              <button
                onClick={() => {
                  localStorage.clear()
                  window.location.reload()
                }}
                className="flex-1 bg-orange-600 text-white text-xs py-1 px-2 rounded hover:bg-orange-700"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
