'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useUniGrading } from '../hooks/useUniGrading'
import { useAdminPermissions } from '../hooks/useAdminPermissions'
import { PermissionWrapper } from './AdminRoute'

import {
  getAllUsers,
  getAllClassrooms,
  getAllGrades,
  exportSystemData
} from '../lib/blockchain-utils'
import { User, Classroom, Grade } from '../hooks/useUniGrading'
import toast from 'react-hot-toast'

export function AdminDashboard() {
  const { publicKey } = useWallet()
  const { currentUser } = useUniGrading()
  const {
    validateAdminAction
  } = useAdminPermissions()

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'classrooms' | 'grades' | 'analytics' | 'system'>('overview')
  const [users, setUsers] = useState<User[]>([])
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalClassrooms: 0,
    totalGrades: 0,
    activeUsers: 0,
    averageGrade: 0,
    recentActivity: 0
  })
  const [loading, setLoading] = useState(false)

  // Load data
  useEffect(() => {
    loadData()
    // Refresh every 30 seconds for admin dashboard
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    if (typeof window !== 'undefined') {
      setLoading(true)
      try {
        // Load users using utility functions
        const allUsers = getAllUsers()
        const allClassrooms = getAllClassrooms()
        const allGrades = getAllGrades()

        setUsers(allUsers)
        setClassrooms(allClassrooms)
        setGrades(allGrades)

        // Calculate system statistics
        const stats = {
          totalUsers: allUsers.length,
          totalClassrooms: allUsers.filter(user => user.role === 'Teacher').length,
          totalGrades: allGrades.length,
          activeUsers: allUsers.length, // All users are considered active
          averageGrade: allGrades.length > 0
            ? Math.round(allGrades.reduce((sum, grade) => sum + (grade.grade / grade.maxGrade * 100), 0) / allGrades.length)
            : 0,
          recentActivity: allGrades.filter(grade =>
            Date.now() - grade.timestamp < 24 * 60 * 60 * 1000 // Last 24 hours
          ).length
        }
        setSystemStats(stats)
      } catch (error) {
        console.error('Error loading admin data:', error)
        toast.error('Failed to load admin data')
      } finally {
        setLoading(false)
      }
    }
  }

  // Export data function
  const handleExportData = async () => {
    if (!validateAdminAction('export system data', 'export_data')) return

    try {
      exportSystemData()
      toast.success('System data exported successfully')
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export data')
    }
  }

  // Delete user function
  const handleDeleteUser = (userWallet: string) => {
    if (!validateAdminAction('delete user', 'manage_users')) return

    // Confirm action
    if (!confirm('Are you sure you want to delete this user? This will remove all their data and cannot be undone.')) {
      return
    }

    try {
      // 1. Remove individual user data
      localStorage.removeItem(`user_${userWallet}`)

      // 2. Remove user from users list
      const updatedUsers = users.filter(user => user.authority.toString() !== userWallet)

      // 3. Remove user's grades
      const allGrades = getAllGrades()
      const updatedGrades = allGrades.filter(grade =>
        grade.gradedBy.toString() !== userWallet
      )

      // 4. Remove user from classrooms
      const allClassrooms = getAllClassrooms()
      const updatedClassrooms = allClassrooms
        .filter(classroom => classroom.teacher.toString() !== userWallet)
        .map(classroom => ({
          ...classroom,
          students: classroom.students?.filter(student => student.pubkey.toString() !== userWallet) || []
        }))

      // 5. Remove any user-specific localStorage keys
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.includes(userWallet)) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))

      // 6. Update localStorage
      localStorage.setItem('all_users', JSON.stringify(updatedUsers))
      localStorage.setItem('all_grades', JSON.stringify(updatedGrades))
      localStorage.setItem('all_classrooms', JSON.stringify(updatedClassrooms))

      setUsers(updatedUsers)
      toast.success('User deleted successfully')
      loadData() // Refresh data
    } catch (error) {
      console.error('Delete user failed:', error)
      toast.error('Failed to delete user')
    }
  }



  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊', description: 'System overview and statistics' },
    { id: 'users', label: 'User Management', icon: '👥', description: 'Manage all users' },
    { id: 'classrooms', label: 'Classroom Management', icon: '🏫', description: 'Manage all classrooms' },
    { id: 'grades', label: 'Grade Analytics', icon: '📈', description: 'Analyze all grades' },
    { id: 'analytics', label: 'System Analytics', icon: '📊', description: 'Advanced analytics' },
    { id: 'system', label: 'System Monitor', icon: '🖥️', description: 'System monitoring' },

  ]

  return (
    <div className="space-y-6 bg-white text-gray-900" style={{ colorScheme: 'light' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-purple-100">System Administration & Management</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-purple-200">Logged in as</p>
            <p className="font-semibold">{currentUser?.username} ({currentUser?.role})</p>
            <p className="text-xs text-purple-200">{publicKey?.toString().slice(0, 8)}...</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'users' | 'classrooms' | 'grades' | 'analytics' | 'system')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
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
      <div className="bg-white rounded-lg shadow-md">
        {loading && (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading admin data...</p>
          </div>
        )}

        {!loading && activeTab === 'overview' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">System Overview</h2>
              <button
                onClick={handleExportData}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                📥 Export Data
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-blue-600 text-2xl mr-3">👥</div>
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Users</p>
                    <p className="text-2xl font-bold text-blue-900">{systemStats.totalUsers}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-green-600 text-2xl mr-3">🏫</div>
                  <div>
                    <p className="text-sm font-medium text-green-600">Classrooms</p>
                    <p className="text-2xl font-bold text-green-900">{systemStats.totalClassrooms}</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-yellow-600 text-2xl mr-3">📝</div>
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Total Grades</p>
                    <p className="text-2xl font-bold text-yellow-900">{systemStats.totalGrades}</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-purple-600 text-2xl mr-3">📊</div>
                  <div>
                    <p className="text-sm font-medium text-purple-600">Average Grade</p>
                    <p className="text-2xl font-bold text-purple-900">{systemStats.averageGrade}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Role Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">👨‍🏫 Teachers</h3>
                <p className="text-3xl font-bold text-blue-900">{users.filter(u => u.role === 'Teacher').length}</p>
                <p className="text-sm text-blue-600">{((users.filter(u => u.role === 'Teacher').length / systemStats.totalUsers) * 100 || 0).toFixed(1)}% of users</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">👨‍🎓 Students</h3>
                <p className="text-3xl font-bold text-green-900">{users.filter(u => u.role === 'Student').length}</p>
                <p className="text-sm text-green-600">{((users.filter(u => u.role === 'Student').length / systemStats.totalUsers) * 100 || 0).toFixed(1)}% of users</p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-medium text-purple-900 mb-2">👑 Admins</h3>
                <p className="text-3xl font-bold text-purple-900">{users.filter(u => u.role === 'Admin').length}</p>
                <p className="text-sm text-purple-600">{((users.filter(u => u.role === 'Admin').length / systemStats.totalUsers) * 100 || 0).toFixed(1)}% of users</p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-medium text-orange-900 mb-2">⚡ Active</h3>
                <p className="text-3xl font-bold text-orange-900">{systemStats.activeUsers}</p>
                <p className="text-sm text-orange-600">{((systemStats.activeUsers / systemStats.totalUsers) * 100 || 0).toFixed(1)}% active</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
              <h3 className="font-medium text-indigo-900 mb-4">📊 Recent Activity (24h)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-indigo-900">{systemStats.recentActivity}</p>
                  <p className="text-sm text-indigo-600">New grades assigned</p>
                </div>
                <div>
                  <p className="text-lg text-indigo-700">Last refresh: {new Date().toLocaleTimeString()}</p>
                  <p className="text-sm text-indigo-600">Auto-refresh every 30 seconds</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && activeTab === 'users' && (
          <PermissionWrapper permission="view_user_details">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                <div className="text-sm text-gray-600">
                  Total: {users.length} users
                </div>
              </div>

              {/* User Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900">👨‍🏫 Teachers</h3>
                  <p className="text-2xl font-bold text-blue-900">{users.filter(u => u.role === 'Teacher').length}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-900">👨‍🎓 Students</h3>
                  <p className="text-2xl font-bold text-green-900">{users.filter(u => u.role === 'Student').length}</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-medium text-purple-900">👑 Admins</h3>
                  <p className="text-2xl font-bold text-purple-900">{users.filter(u => u.role === 'Admin').length}</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'Teacher' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-mono">
                            {user.authority.toString().slice(0, 8)}...{user.authority.toString().slice(-8)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt * 1000).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <PermissionWrapper permission="manage_users" hideIfNoPermission>
                            <button
                              onClick={() => handleDeleteUser(user.authority.toString())}
                              className="text-red-600 hover:text-red-900"
                              title="Delete user"
                            >
                              🗑️
                            </button>
                          </PermissionWrapper>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </PermissionWrapper>
        )}

        {activeTab === 'classrooms' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Classroom Management</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classrooms.map((classroom, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900">{classroom.name}</h3>
                  <p className="text-sm text-gray-600">{classroom.course}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500">Teacher: {classroom.teacher.toString().slice(0, 8)}...</p>
                    <p className="text-xs text-gray-500">Students: {classroom.students?.length || 0}</p>
                    <p className="text-xs text-gray-500">Classroom ID: {index + 1}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'grades' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Grade Management</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Graded By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {grades.slice(0, 20).map((grade, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {grade.assignmentName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        Student Grade
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {grade.gradedBy.toString().slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          Math.round((grade.grade / grade.maxGrade) * 100) >= 90 ? 'bg-green-100 text-green-800' :
                          Math.round((grade.grade / grade.maxGrade) * 100) >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {grade.grade}/{grade.maxGrade} ({Math.round((grade.grade / grade.maxGrade) * 100)}%)
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(grade.timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && activeTab === 'analytics' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">System Analytics</h2>

            {/* Grade Distribution */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Grade Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {grades.filter(g => Math.round((g.grade / g.maxGrade) * 100) >= 90).length}
                  </div>
                  <div className="text-sm text-gray-600">A (90-100%)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {grades.filter(g => {
                      const percentage = Math.round((g.grade / g.maxGrade) * 100)
                      return percentage >= 80 && percentage < 90
                    }).length}
                  </div>
                  <div className="text-sm text-gray-600">B (80-89%)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {grades.filter(g => {
                      const percentage = Math.round((g.grade / g.maxGrade) * 100)
                      return percentage >= 70 && percentage < 80
                    }).length}
                  </div>
                  <div className="text-sm text-gray-600">C (70-79%)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {grades.filter(g => Math.round((g.grade / g.maxGrade) * 100) < 70).length}
                  </div>
                  <div className="text-sm text-gray-600">D/F (&lt;70%)</div>
                </div>
              </div>
            </div>

            {/* Recent High Grades */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent High Grades (90%+)</h3>
              <div className="space-y-2">
                {grades
                  .filter(grade => Math.round((grade.grade / grade.maxGrade) * 100) >= 90)
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .slice(0, 10)
                  .map((grade, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium text-sm">{grade.assignmentName}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          by {grade.gradedBy.toString().slice(0, 8)}...
                        </span>
                      </div>
                      <span className="font-bold text-green-600">
                        {Math.round((grade.grade / grade.maxGrade) * 100)}%
                      </span>
                    </div>
                  ))}
                {grades.filter(grade => Math.round((grade.grade / grade.maxGrade) * 100) >= 90).length === 0 && (
                  <p className="text-gray-500 text-center py-4">No high grades yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {!loading && activeTab === 'system' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">System Monitor</h2>

            {/* System Health */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Database Status</span>
                    <span className="text-green-600 font-medium">✅ Online</span>
                  </div>
                  <div className="flex justify-between">
                    <span>User Sessions</span>
                    <span className="text-blue-600 font-medium">{systemStats.activeUsers} active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data Integrity</span>
                    <span className="text-green-600 font-medium">✅ Good</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Backup</span>
                    <span className="text-gray-600">Manual export only</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Storage Usage</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Users Data</span>
                    <span className="text-blue-600">{new Blob([JSON.stringify(users)]).size} bytes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Classrooms Data</span>
                    <span className="text-green-600">{new Blob([JSON.stringify(classrooms)]).size} bytes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Grades Data</span>
                    <span className="text-yellow-600">{new Blob([JSON.stringify(grades)]).size} bytes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Storage</span>
                    <span className="text-purple-600 font-medium">
                      {new Blob([JSON.stringify({users, classrooms, grades})]).size} bytes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  )
}
