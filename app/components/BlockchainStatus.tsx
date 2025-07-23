'use client'

import { useBlockchain } from '@/hooks/useBlockchain'
import { useWallet } from '@solana/wallet-adapter-react'

export function BlockchainStatus() {
  const { connected } = useWallet()
  const { programHealthy, connected: blockchainConnected, getBalance } = useBlockchain()

  if (!connected) return null

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-medium text-gray-900 mb-2">🔗 Blockchain Status</h3>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span>Wallet:</span>
          <span className={connected ? 'text-green-600' : 'text-red-600'}>
            {connected ? '✅ Connected' : '❌ Disconnected'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Program:</span>
          <span className={programHealthy ? 'text-green-600' : 'text-red-600'}>
            {programHealthy ? '✅ Healthy' : '❌ Unavailable'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Service:</span>
          <span className={blockchainConnected ? 'text-green-600' : 'text-red-600'}>
            {blockchainConnected ? '✅ Ready' : '❌ Not Ready'}
          </span>
        </div>
      </div>
      
      {!programHealthy && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          ⚠️ Blockchain unavailable. App will use localStorage fallback.
        </div>
      )}
      
      {programHealthy && blockchainConnected && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
          🚀 Blockchain integration active! Data will be stored on-chain.
        </div>
      )}
    </div>
  )
}
