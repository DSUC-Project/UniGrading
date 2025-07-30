import { useWallet } from '@solana/wallet-adapter-react'
import { useState, useEffect, useMemo } from 'react'
import { BlockchainService } from '@/lib/blockchain-service'
import { User, Classroom, Grade } from './useUniGrading'
import toast from 'react-hot-toast'

export function useBlockchain() {
  const wallet = useWallet()
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [programHealthy, setProgramHealthy] = useState(false)

  // Create blockchain service instance
  const blockchainService = useMemo(() => {
    if (wallet.connected && wallet.publicKey && wallet.signTransaction && wallet.signAllTransactions) {
      return new BlockchainService({
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      })
    }
    return null
  }, [wallet.connected, wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions])

  // Check program health on connection
  useEffect(() => {
    const checkHealth = async () => {
      if (blockchainService) {
        const healthy = await blockchainService.checkProgramHealth()
        setProgramHealthy(healthy)
        if (!healthy) {
          toast.error('Blockchain program not accessible. Using fallback mode.')
        }
      }
    }
    checkHealth()
  }, [blockchainService])

  // Load current user from blockchain
  useEffect(() => {
    const loadUser = async () => {
      if (blockchainService && programHealthy) {
        try {
          const user = await blockchainService.getUser()
          setCurrentUser(user)
        } catch (error) {
          console.error('Failed to load user from blockchain:', error)
        }
      }
    }
    loadUser()
  }, [blockchainService, programHealthy])

  // ==================== USER OPERATIONS ====================

  const registerUser = async (username: string, role: 'Teacher' | 'Student' | 'Admin'): Promise<string | null> => {
    if (!blockchainService) {
      throw new Error('Blockchain service not available')
    }

    setLoading(true)
    try {
      const tx = await blockchainService.registerUser(username, role)
      if (tx) {
        // Reload user data
        const user = await blockchainService.getUser()
        setCurrentUser(user)
      }
      return tx
    } finally {
      setLoading(false)
    }
  }

  const getAllUsers = async (): Promise<User[]> => {
    if (!blockchainService) return []
    
    try {
      return await blockchainService.getAllUsers()
    } catch (error) {
      console.error('Failed to get all users:', error)
      return []
    }
  }

  // ==================== CLASSROOM OPERATIONS ====================

  const createClassroom = async (name: string, course: string): Promise<string | null> => {
    if (!blockchainService) {
      throw new Error('Blockchain service not available')
    }

    setLoading(true)
    try {
      return await blockchainService.createClassroom(name, course)
    } finally {
      setLoading(false)
    }
  }

  const getAllClassrooms = async (): Promise<Classroom[]> => {
    if (!blockchainService) return []
    
    try {
      return await blockchainService.getAllClassrooms()
    } catch (error) {
      console.error('Failed to get all classrooms:', error)
      return []
    }
  }

  // ==================== GRADE OPERATIONS ====================

  const addGrade = async (
    studentWallet: string,
    assignmentName: string,
    grade: number,
    maxGrade: number
  ): Promise<string | null> => {
    if (!blockchainService) {
      throw new Error('Blockchain service not available')
    }

    setLoading(true)
    try {
      const { PublicKey } = await import('@solana/web3.js')
      const studentPubkey = new PublicKey(studentWallet)
      return await blockchainService.addGrade(studentPubkey, assignmentName, grade, maxGrade)
    } finally {
      setLoading(false)
    }
  }

  const getAllGrades = async (): Promise<Grade[]> => {
    if (!blockchainService) return []
    
    try {
      return await blockchainService.getAllGrades()
    } catch (error) {
      console.error('Failed to get all grades:', error)
      return []
    }
  }

  // ==================== UTILITY OPERATIONS ====================

  const getBalance = async (): Promise<number> => {
    if (!blockchainService) return 0
    
    try {
      return await blockchainService.getBalance()
    } catch (error) {
      console.error('Failed to get balance:', error)
      return 0
    }
  }

  const exportBlockchainData = async () => {
    if (!blockchainService) {
      toast.error('Blockchain service not available')
      return
    }

    try {
      const [users, classrooms, grades] = await Promise.all([
        getAllUsers(),
        getAllClassrooms(),
        getAllGrades()
      ])

      const data = {
        users,
        classrooms,
        grades,
        exportedAt: new Date().toISOString(),
        source: 'blockchain'
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `unigrading-blockchain-export-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Blockchain data exported successfully!')
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export blockchain data')
    }
  }

  // ==================== MIGRATION HELPERS ====================

  const migrateFromLocalStorage = async () => {
    if (!blockchainService) {
      toast.error('Blockchain service not available')
      return
    }

    setLoading(true)
    try {
      // Get localStorage data
      const localUsers = JSON.parse(localStorage.getItem('all_users') || '[]')
      const localClassrooms = JSON.parse(localStorage.getItem('all_classrooms') || '[]')
      const localGrades = JSON.parse(localStorage.getItem('all_grades') || '[]')

      let migrated = 0

      // Note: This is a simplified migration
      // In practice, you'd need to handle conflicts, validation, etc.
      
      toast.success(`Found ${localUsers.length} users, ${localClassrooms.length} classrooms, ${localGrades.length} grades to migrate`)
      toast.info('Migration feature coming soon - manual re-entry required for now')
      
    } catch (error) {
      console.error('Migration failed:', error)
      toast.error('Migration failed')
    } finally {
      setLoading(false)
    }
  }

  return {
    // State
    loading,
    currentUser,
    programHealthy,
    connected: wallet.connected && !!blockchainService,
    
    // User operations
    registerUser,
    getAllUsers,
    
    // Classroom operations
    createClassroom,
    getAllClassrooms,
    
    // Grade operations
    addGrade,
    getAllGrades,
    
    // Utility operations
    getBalance,
    exportBlockchainData,
    migrateFromLocalStorage,
    
    // Service instance (for advanced usage)
    blockchainService
  }
}
