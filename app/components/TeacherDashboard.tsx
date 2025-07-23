'use client'

import { useState, useEffect } from 'react'
import { useUniGrading } from '../hooks/useUniGrading'

import { GradeManager } from './GradeManager'
import { getAllGrades } from '../lib/blockchain-utils'



interface GradeData {
  id: string
  studentWallet: string
  teacherWallet: string
  teacherName: string
  assignmentName: string
  grade: number
  maxGrade: number
  percentage: number
  createdAt: number
  timestamp: number
}

export function TeacherDashboard() {
  const { currentUser } = useUniGrading()
  const [activeTab, setActiveTab] = useState<'overview' | 'classrooms' | 'grades' | 'analytics' | 'reports'>('overview')
  const [myGrades, setMyGrades] = useState<GradeData[]>([])
  const [loading, setLoading] = useState(false)

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊', description: 'Teaching overview and statistics' },
    { id: 'classrooms', label: 'Manage Classes', icon: '🏫', description: 'Manage your classrooms' },
    { id: 'grades', label: 'Grade Management', icon: '📝', description: 'Assign and manage grades' },
    { id: 'analytics', label: 'Teaching Analytics', icon: '📈', description: 'Teaching performance metrics' },
    { id: 'reports', label: 'Reports', icon: '📋', description: 'Generate teaching reports' }
  ]

  // Load teacher's data
  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) return

      setLoading(true)
      try {
        // Get grades assigned by current teacher
        const allGrades = getAllGrades()
        const teacherGrades = allGrades.filter(
          (grade: any) => grade.teacherWallet === currentUser.authority.toString()
        )
        setMyGrades(teacherGrades)
      } catch (error) {
        console.error('Error loading teacher data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [currentUser])

  // Calculate statistics
  const getTeachingStats = () => {
    const averageGrade = myGrades.length > 0
      ? Math.round(myGrades.reduce((sum, grade) => sum + (grade.grade / grade.maxGrade * 100), 0) / myGrades.length)
      : 0
    const recentGrades = myGrades.filter(grade =>
      Date.now() - grade.timestamp < 7 * 24 * 60 * 60 * 1000 // Last 7 days
    ).length

    return {
      totalGrades: myGrades.length,
      averageGrade,
      recentGrades
    }
  }

  const stats = getTeachingStats()

  return (
    <div className="space-y-6 bg-white text-gray-900" style={{ colorScheme: 'light' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
            <p className="text-green-100">Welcome back, {currentUser?.username}!</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{stats.totalGrades}</div>
            <div className="text-sm text-green-200">Total Grades</div>
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
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              title={tab.description}
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading teaching data...</p>
          </div>
        )}

        {!loading && activeTab === 'overview' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Teaching Overview</h2>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.totalGrades}</div>
                <div className="text-sm text-purple-600">Grades Given</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.averageGrade}%</div>
                <div className="text-sm text-yellow-600">Avg Grade</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.recentGrades}</div>
                <div className="text-sm text-orange-600">This Week</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Recent Grading Activity</h3>
              <div className="space-y-2">
                {myGrades.slice(0, 5).map((grade, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-white rounded shadow-sm">
                    <div>
                      <p className="font-medium text-gray-900">{grade.assignmentName}</p>
                      <p className="text-sm text-gray-600">Student: {grade.studentWallet.slice(0, 8)}...</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${
                        grade.percentage >= 90 ? 'bg-green-100 text-green-800' :
                        grade.percentage >= 80 ? 'bg-blue-100 text-blue-800' :
                        grade.percentage >= 70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {grade.grade}/{grade.maxGrade} ({grade.percentage}%)
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(grade.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {myGrades.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No grades assigned yet</p>
                )}
              </div>
            </div>

            {/* Recent Grades */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Recent Grades</h3>
              <div className="space-y-2">
                {myGrades.slice(0, 5).map((grade, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-gray-900">{grade.assignmentName}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(grade.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-blue-600">
                          {grade.grade}/{grade.maxGrade}
                        </span>
                        <p className="text-xs text-gray-500">
                          {Math.round((grade.grade / grade.maxGrade) * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {myGrades.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No grades assigned yet
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!loading && activeTab === 'classrooms' && (
          <div className="p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏫</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Classroom Management</h3>
              <p className="text-gray-500">This feature is coming soon...</p>
            </div>
          </div>
        )}

        {!loading && activeTab === 'grades' && (
          <div className="p-6">
            <GradeManager />
          </div>
        )}

        {!loading && activeTab === 'students' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Student Analytics</h2>

            {/* Student Performance Overview */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Student Performance Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {myGrades.filter(g => g.percentage >= 90).length}
                  </div>
                  <div className="text-sm text-gray-600">A Students (90-100%)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {myGrades.filter(g => g.percentage >= 80 && g.percentage < 90).length}
                  </div>
                  <div className="text-sm text-gray-600">B Students (80-89%)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {myGrades.filter(g => g.percentage >= 70 && g.percentage < 80).length}
                  </div>
                  <div className="text-sm text-gray-600">C Students (70-79%)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {myGrades.filter(g => g.percentage < 70).length}
                  </div>
                  <div className="text-sm text-gray-600">Struggling (&lt;70%)</div>
                </div>
              </div>
            </div>

            {/* Top Performing Students */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Students</h3>
              <div className="space-y-2">
                {myGrades
                  .reduce((acc: any[], grade) => {
                    const existing = acc.find(item => item.studentWallet === grade.studentWallet)
                    if (existing) {
                      existing.totalGrades += grade.percentage
                      existing.count += 1
                    } else {
                      acc.push({
                        studentWallet: grade.studentWallet,
                        totalGrades: grade.percentage,
                        count: 1
                      })
                    }
                    return acc
                  }, [])
                  .map(item => ({ ...item, average: Math.round(item.totalGrades / item.count) }))
                  .sort((a, b) => b.average - a.average)
                  .slice(0, 10)
                  .map((student, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <span className="font-mono text-sm">{student.studentWallet.slice(0, 8)}...</span>
                        <span className="text-xs text-gray-500 ml-2">({student.count} assignments)</span>
                      </div>
                      <span className="font-bold text-green-600">{student.average}% avg</span>
                    </div>
                  ))}
                {myGrades.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No student data available</p>
                )}
              </div>
            </div>

            {/* Students Needing Attention */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Students Needing Attention</h3>
              <div className="space-y-2">
                {myGrades
                  .reduce((acc: any[], grade) => {
                    const existing = acc.find(item => item.studentWallet === grade.studentWallet)
                    if (existing) {
                      existing.totalGrades += grade.percentage
                      existing.count += 1
                    } else {
                      acc.push({
                        studentWallet: grade.studentWallet,
                        totalGrades: grade.percentage,
                        count: 1
                      })
                    }
                    return acc
                  }, [])
                  .map(item => ({ ...item, average: Math.round(item.totalGrades / item.count) }))
                  .filter(student => student.average < 70)
                  .sort((a, b) => a.average - b.average)
                  .slice(0, 10)
                  .map((student, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded">
                      <div>
                        <span className="font-mono text-sm">{student.studentWallet.slice(0, 8)}...</span>
                        <span className="text-xs text-gray-500 ml-2">({student.count} assignments)</span>
                      </div>
                      <span className="font-bold text-red-600">{student.average}% avg</span>
                    </div>
                  ))}
                {myGrades.filter(g => g.percentage < 70).length === 0 && (
                  <p className="text-gray-500 text-center py-4">All students performing well! 🎉</p>
                )}
              </div>
            </div>
          </div>
        )}

        {!loading && activeTab === 'analytics' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Teaching Analytics</h2>

            {/* Teaching Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Grading Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Grades Given:</span>
                    <span className="font-bold">{stats.totalGrades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Grade:</span>
                    <span className="font-bold text-blue-600">{stats.averageGrade}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Grades This Week:</span>
                    <span className="font-bold text-green-600">{stats.recentGrades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pass Rate (≥70%):</span>
                    <span className="font-bold text-purple-600">
                      {myGrades.length > 0
                        ? Math.round((myGrades.filter(g => g.percentage >= 70).length / myGrades.length) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Grade Distribution</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>A Grades (90-100%):</span>
                    <span className="font-bold text-green-600">
                      {myGrades.filter(g => Math.round((g.grade / g.maxGrade) * 100) >= 90).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>B Grades (80-89%):</span>
                    <span className="font-bold text-blue-600">
                      {myGrades.filter(g => {
                        const percentage = Math.round((g.grade / g.maxGrade) * 100)
                        return percentage >= 80 && percentage < 90
                      }).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>C Grades (70-79%):</span>
                    <span className="font-bold text-yellow-600">
                      {myGrades.filter(g => {
                        const percentage = Math.round((g.grade / g.maxGrade) * 100)
                        return percentage >= 70 && percentage < 80
                      }).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>D/F Grades (&lt;70%):</span>
                    <span className="font-bold text-red-600">
                      {myGrades.filter(g => Math.round((g.grade / g.maxGrade) * 100) < 70).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grade Distribution Chart */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Grade Distribution Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {myGrades.length > 0
                      ? Math.round((myGrades.filter(g => g.percentage >= 90).length / myGrades.length) * 100)
                      : 0}%
                  </div>
                  <div className="text-sm text-green-600">A Grades</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {myGrades.length > 0
                      ? Math.round((myGrades.filter(g => g.percentage >= 80 && g.percentage < 90).length / myGrades.length) * 100)
                      : 0}%
                  </div>
                  <div className="text-sm text-blue-600">B Grades</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-3xl font-bold text-yellow-600">
                    {myGrades.length > 0
                      ? Math.round((myGrades.filter(g => g.percentage >= 70 && g.percentage < 80).length / myGrades.length) * 100)
                      : 0}%
                  </div>
                  <div className="text-sm text-yellow-600">C Grades</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-3xl font-bold text-red-600">
                    {myGrades.length > 0
                      ? Math.round((myGrades.filter(g => g.percentage < 70).length / myGrades.length) * 100)
                      : 0}%
                  </div>
                  <div className="text-sm text-red-600">Below 70%</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && activeTab === 'reports' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Teaching Reports</h2>

            {/* Report Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Teaching Summary Report</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Teaching Overview</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Teacher:</strong> {currentUser?.username}</p>
                    <p><strong>Total Grades:</strong> {stats.totalGrades}</p>
                    <p><strong>Average Grade:</strong> {stats.averageGrade}%</p>
                    <p><strong>Report Generated:</strong> {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Performance Summary</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Total Assignments Graded:</strong> {stats.totalGrades}</p>
                    <p><strong>Class Average:</strong> {stats.averageGrade}%</p>
                    <p><strong>Pass Rate:</strong> {myGrades.length > 0
                      ? Math.round((myGrades.filter(g => g.percentage >= 70).length / myGrades.length) * 100)
                      : 0}%</p>
                    <p><strong>Excellence Rate (A):</strong> {myGrades.length > 0
                      ? Math.round((myGrades.filter(g => g.percentage >= 90).length / myGrades.length) * 100)
                      : 0}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Grade Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Grade Summary</h3>
              <div className="space-y-4">
                {myGrades.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Recent Assignments</h4>
                      <div className="space-y-2">
                        {myGrades.slice(0, 5).map((grade, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm">{grade.assignmentName}</span>
                            <span className="font-medium text-blue-600">
                              {Math.round((grade.grade / grade.maxGrade) * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Grade Statistics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Highest Grade:</span>
                          <span className="font-medium text-green-600">
                            {Math.max(...myGrades.map(g => Math.round((g.grade / g.maxGrade) * 100)))}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Lowest Grade:</span>
                          <span className="font-medium text-red-600">
                            {Math.min(...myGrades.map(g => Math.round((g.grade / g.maxGrade) * 100)))}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Assignments:</span>
                          <span className="font-medium">{myGrades.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No grades to report on</p>
                )}
              </div>
            </div>

            {/* Export Options */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Export Options</h3>
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    const reportData = {
                      teacher: currentUser?.username,
                      generatedAt: new Date().toISOString(),
                      stats,
                      grades: myGrades
                    }
                    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `teaching-report-${Date.now()}.json`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  📥 Export Full Report
                </button>
                <button
                  onClick={() => {
                    const csvData = myGrades.map(grade =>
                      `${grade.assignmentName},${grade.grade},${grade.maxGrade},${Math.round((grade.grade / grade.maxGrade) * 100)}%,${new Date(grade.timestamp).toLocaleDateString()}`
                    ).join('\n')
                    const csv = 'Assignment,Grade,Max Grade,Percentage,Date\n' + csvData
                    const blob = new Blob([csv], { type: 'text/csv' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `grades-export-${Date.now()}.csv`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  📊 Export Grades CSV
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
