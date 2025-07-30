'use client'

import { useEffect, useState } from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export function WalletButton() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
        Connect Wallet
      </button>
    )
  }

  return <WalletMultiButton className="!bg-primary-600 hover:!bg-primary-700" />
}
