'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useUniGrading } from '../hooks/useUniGrading'
import { useAdminPermissions } from '../hooks/useAdminPermissions'
import { 
  getAllUsers, 
  getAllClassrooms, 
  getAllGrades,
  getProgramWalletInfo,
  getProgramTransactions,
  getBlockchainData,
  getWalletBalance,
  ProgramWalletInfo,
  TransactionInfo,
  BlockchainData
} from '../lib/blockchain-utils'
import toast from 'react-hot-toast'

interface SystemLog {
  id: string
  timestamp: number
  level: 'info' | 'warning' | 'error' | 'debug'
  category: 'system' | 'user' | 'blockchain' | 'data'
  message: string
  details?: any
}

interface PerformanceMetric {
  name: string
  value: number | string
  unit: string
  status: 'good' | 'warning' | 'critical'
  description: string
}

export function UnifiedDebugConsole() {
  const { publicKey, connected } = useWallet()
  const { currentUser } = useUniGrading()
  const { canAccessDebugConsole, validateAdminAction } = useAdminPermissions()
  
  const [activeTab, setActiveTab] = useState<'logs' | 'blockchain' | 'users' | 'performance' | 'data'>('logs')
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([])
  const [programWallet, setProgramWallet] = useState<ProgramWalletInfo | null>(null)
  const [transactions, setTransactions] = useState<TransactionInfo[]>([])
  const [blockchainData, setBlockchainData] = useState<BlockchainData | null>(null)
  const [loading, setLoading] = useState(false)

  // Check admin permissions
  if (!canAccessDebugConsole) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 text-xl mb-2">🚫</div>
        <h3 className="text-lg font-medium text-gray-900">Access Denied</h3>
        <p className="text-gray-600">Admin privileges required to access Debug Console</p>
      </div>
    )
  }

  // Load data
  useEffect(() => {
    loadAllData()
    generateInitialLogs()
    
    // Refresh every 10 seconds
    const interval = setInterval(() => {
      loadAllData()
      addPerformanceLog()
    }, 10000)
    
    return () => clearInterval(interval)
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      // Load blockchain data
      const [walletInfo, txHistory, chainData] = await Promise.all([
        getProgramWalletInfo().catch(() => null),
        getProgramTransactions(10).catch(() => []),
        getBlockchainData().catch(() => null)
      ])
      
      setProgramWallet(walletInfo)
      setTransactions(txHistory)
      setBlockchainData(chainData)
      
      addLog('info', 'system', 'Debug console data refreshed successfully')
    } catch (error) {
      addLog('error', 'system', 'Failed to load debug data', error)
    } finally {
      setLoading(false)
    }
  }

  const addLog = (level: SystemLog['level'], category: SystemLog['category'], message: string, details?: any) => {
    const newLog: SystemLog = {
      id: Date.now().toString() + Math.random(),
      timestamp: Date.now(),
      level,
      category,
      message,
      details
    }
    
    setSystemLogs(prev => [newLog, ...prev.slice(0, 99)]) // Keep last 100 logs
  }

  const generateInitialLogs = () => {
    addLog('info', 'system', 'Debug console initialized')
    addLog('info', 'user', `Admin ${currentUser?.username} accessed debug console`)
    addLog('info', 'data', 'Loading system data...')
  }

  const addPerformanceLog = () => {
    const users = getAllUsers()
    const grades = getAllGrades()
    addLog('debug', 'system', `Performance check: ${users.length} users, ${grades.length} grades`)
  }

  const clearLogs = () => {
    setSystemLogs([])
    addLog('info', 'system', 'System logs cleared by admin')
  }

  const exportLogs = () => {
    if (!validateAdminAction('export logs', 'export_data')) return
    
    const logsData = {
      logs: systemLogs,
      exportedAt: new Date().toISOString(),
      exportedBy: currentUser?.username
    }
    
    const blob = new Blob([JSON.stringify(logsData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `debug-logs-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    addLog('info', 'system', 'Debug logs exported')
    toast.success('Debug logs exported successfully')
  }

  // Performance metrics
  const users = getAllUsers()
  const classrooms = getAllClassrooms()
  const grades = getAllGrades()

  const performanceMetrics: PerformanceMetric[] = [
    {
      name: 'Total Users',
      value: users.length,
      unit: 'users',
      status: users.length > 50 ? 'good' : users.length > 20 ? 'warning' : 'critical',
      description: 'Total registered users in the system'
    },
    {
      name: 'Active Sessions',
      value: connected ? 1 : 0,
      unit: 'sessions',
      status: connected ? 'good' : 'warning',
      description: 'Number of active wallet connections'
    },
    {
      name: 'Data Refresh Rate',
      value: '10',
      unit: 'seconds',
      status: 'good',
      description: 'How often debug data is refreshed'
    },
    {
      name: 'LocalStorage Size',
      value: Math.round(new Blob([JSON.stringify(localStorage)]).size / 1024),
      unit: 'KB',
      status: 'good',
      description: 'Total size of localStorage data'
    },
    {
      name: 'System Health',
      value: 'Online',
      unit: '',
      status: 'good',
      description: 'Overall system health status'
    }
  ]

  const tabs = [
    { id: 'logs', label: 'System Logs', icon: '📋' },
    { id: 'blockchain', label: 'Blockchain Monitor', icon: '⛓️' },
    { id: 'users', label: 'User Activity', icon: '👤' },
    { id: 'performance', label: 'Performance', icon: '⚡' },
    { id: 'data', label: 'Data Inspector', icon: '🔍' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🔧 Unified Debug Console</h1>
            <p className="text-red-100">Advanced System Monitoring & Debugging</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={clearLogs}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
            >
              Clear Logs
            </button>
            <button
              onClick={exportLogs}
              className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm"
            >
              Export Logs
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading debug data...</p>
          </div>
        )}

        {!loading && activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">System Logs</h2>
              <div className="text-sm text-gray-600">
                {systemLogs.length} logs (last 100)
              </div>
            </div>
            
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
              {systemLogs.map((log) => (
                <div key={log.id} className="mb-1">
                  <span className="text-gray-500">
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>
                  <span className={`ml-2 ${
                    log.level === 'error' ? 'text-red-400' :
                    log.level === 'warning' ? 'text-yellow-400' :
                    log.level === 'debug' ? 'text-blue-400' :
                    'text-green-400'
                  }`}>
                    [{log.level.toUpperCase()}]
                  </span>
                  <span className="text-purple-400 ml-2">[{log.category}]</span>
                  <span className="text-white ml-2">{log.message}</span>
                  {log.details && (
                    <div className="text-gray-400 ml-8 text-xs">
                      {JSON.stringify(log.details, null, 2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && activeTab === 'blockchain' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Blockchain Monitor</h2>

            {/* Program Wallet Info */}
            {programWallet && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-3">Program Wallet Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-blue-600">Program ID</p>
                    <p className="font-mono text-sm">{programWallet.programId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Balance</p>
                    <p className="font-bold">{programWallet.balance.toFixed(4)} SOL</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Executable</p>
                    <p className={programWallet.executable ? 'text-green-600' : 'text-red-600'}>
                      {programWallet.executable ? '✅ Yes' : '❌ No'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Owner</p>
                    <p className="font-mono text-sm">{programWallet.owner.slice(0, 8)}...</p>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Transactions */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Recent Transactions</h3>
              <div className="space-y-2">
                {transactions.slice(0, 10).map((tx, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-mono text-sm">{tx.signature.slice(0, 16)}...</p>
                      <p className="text-xs text-gray-600">
                        Slot: {tx.slot} | {tx.blockTime ? new Date(tx.blockTime * 1000).toLocaleString() : 'Pending'}
                      </p>
                    </div>
                    <div className={`text-sm font-medium ${tx.err ? 'text-red-600' : 'text-green-600'}`}>
                      {tx.err ? '❌ Failed' : '✅ Success'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Blockchain Data */}
            {blockchainData && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-medium text-purple-900 mb-3">Network Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-purple-600">Current Slot</p>
                    <p className="font-bold">{blockchainData.currentSlot.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-600">Epoch</p>
                    <p className="font-bold">{blockchainData.epochInfo.epoch}</p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-600">Transaction Count</p>
                    <p className="font-bold">{blockchainData.networkStats.transactionCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-600">Avg Slot Time</p>
                    <p className="font-bold">{blockchainData.networkStats.averageSlotTime}s</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && activeTab === 'users' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">User Activity Monitor</h2>

            {/* User Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{users.length}</div>
                <div className="text-sm text-blue-600">Total Users</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{users.filter(u => u.isActive).length}</div>
                <div className="text-sm text-green-600">Active Users</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{users.filter(u => u.role === 'Teacher').length}</div>
                <div className="text-sm text-yellow-600">Teachers</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{users.filter(u => u.role === 'Student').length}</div>
                <div className="text-sm text-purple-600">Students</div>
              </div>
            </div>

            {/* Recent User Activity */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Recent User Registrations</h3>
              <div className="space-y-2">
                {users
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .slice(0, 10)
                  .map((user, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-gray-600">{user.role} | {user.walletAddress.slice(0, 8)}...</p>
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(user.createdAt * 1000).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {!loading && activeTab === 'performance' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Performance Metrics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{metric.name}</h3>
                    <span className={`w-3 h-3 rounded-full ${
                      metric.status === 'good' ? 'bg-green-500' :
                      metric.status === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {metric.value} {metric.unit}
                  </div>
                  <p className="text-sm text-gray-600">{metric.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && activeTab === 'data' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Data Inspector</h2>

            {/* Data Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Users Data</h3>
                <p className="text-2xl font-bold text-blue-900">{users.length}</p>
                <p className="text-sm text-blue-600">Records</p>
                <p className="text-xs text-blue-500 mt-1">
                  Size: {new Blob([JSON.stringify(users)]).size} bytes
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">Classrooms Data</h3>
                <p className="text-2xl font-bold text-green-900">{classrooms.length}</p>
                <p className="text-sm text-green-600">Records</p>
                <p className="text-xs text-green-500 mt-1">
                  Size: {new Blob([JSON.stringify(classrooms)]).size} bytes
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-900 mb-2">Grades Data</h3>
                <p className="text-2xl font-bold text-yellow-900">{grades.length}</p>
                <p className="text-sm text-yellow-600">Records</p>
                <p className="text-xs text-yellow-500 mt-1">
                  Size: {new Blob([JSON.stringify(grades)]).size} bytes
                </p>
              </div>
            </div>

            {/* Raw Data Preview */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Raw Data Preview (Latest 5 records)</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Latest Users:</h4>
                  <pre className="bg-gray-900 text-green-400 p-2 rounded text-xs overflow-x-auto">
                    {JSON.stringify(users.slice(-5), null, 2)}
                  </pre>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Latest Grades:</h4>
                  <pre className="bg-gray-900 text-green-400 p-2 rounded text-xs overflow-x-auto">
                    {JSON.stringify(grades.slice(-5), null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
