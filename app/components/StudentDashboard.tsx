'use client'

import { useState, useEffect } from 'react'
import { useUniGrading } from '../hooks/useUniGrading'
import { getAllGrades, getAllClassrooms } from '../lib/blockchain-utils'

interface Grade {
  assignmentName: string
  grade: number
  maxGrade: number
  timestamp: number
  gradedBy: string
  percentage: number
}

interface ClassroomInfo {
  id: string
  name: string
  course: string
  teacherName: string
  students: any[]
}

export function StudentDashboard() {
  const { loading, currentUser } = useUniGrading()
  const [activeTab, setActiveTab] = useState<'overview' | 'grades' | 'analytics' | 'classrooms' | 'profile'>('overview')
  const [grades, setGrades] = useState<Grade[]>([])
  const [classrooms, setClassrooms] = useState<ClassroomInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 500))

      if (currentUser) {
        // Get grades for current user
        const allGrades = getAllGrades()
        const userGrades = allGrades
          .filter((grade: any) => grade.studentWallet === currentUser.authority.toString())
          .map((grade: any) => ({
            assignmentName: grade.assignmentName,
            grade: grade.grade,
            maxGrade: grade.maxGrade,
            timestamp: grade.timestamp,
            gradedBy: grade.teacherName,
            percentage: grade.percentage
          }))
          .sort((a: any, b: any) => b.timestamp - a.timestamp) // Sort by newest first

        setGrades(userGrades)

        // Get classrooms where user is a student
        const allClassrooms = getAllClassrooms()
        const userClassrooms = allClassrooms.filter((classroom: any) =>
          classroom.students?.some((student: any) =>
            student.pubkey === currentUser.authority.toString()
          )
        )
        setClassrooms(userClassrooms)
      } else {
        setGrades([])
        setClassrooms([])
      }

      setIsLoading(false)
    }

    loadData()

    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [currentUser])

  const calculateAverage = () => {
    if (grades.length === 0) return 0
    const total = grades.reduce((sum, grade) => sum + grade.percentage, 0)
    return Math.round(total / grades.length)
  }

  const getGradeDistribution = () => {
    return {
      A: grades.filter(g => g.percentage >= 90).length,
      B: grades.filter(g => g.percentage >= 80 && g.percentage < 90).length,
      C: grades.filter(g => g.percentage >= 70 && g.percentage < 80).length,
      D: grades.filter(g => g.percentage < 70).length
    }
  }

  const getRecentGrades = () => {
    return grades.slice(0, 5) // Last 5 grades
  }

  const getGradesBySubject = () => {
    const subjects: { [key: string]: Grade[] } = {}
    grades.forEach(grade => {
      const subject = grade.assignmentName.split(' ')[0] // Assume first word is subject
      if (!subjects[subject]) subjects[subject] = []
      subjects[subject].push(grade)
    })
    return subjects
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊', description: 'Grade summary and overview' },
    { id: 'grades', label: 'Detailed Grades', icon: '📝', description: 'All grades and assignments' },
    { id: 'analytics', label: 'Progress Analytics', icon: '📈', description: 'Performance analysis' },
    { id: 'classrooms', label: 'My Classes', icon: '🏫', description: 'Enrolled classrooms' },
    { id: 'profile', label: 'Academic Profile', icon: '👤', description: 'Student profile and history' }
  ]

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  const gradeDistribution = getGradeDistribution()

  return (
    <div className="space-y-6 bg-white text-gray-900" style={{ colorScheme: 'light' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Student Dashboard</h1>
            <p className="text-blue-100">Welcome back, {currentUser?.username}!</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{calculateAverage()}%</div>
            <div className="text-sm text-blue-200">Overall Average</div>
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
                  ? 'border-blue-500 text-blue-600'
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
        {activeTab === 'overview' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Academic Overview</h2>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{calculateAverage()}%</div>
                <div className="text-sm text-blue-600">Overall Average</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{grades.length}</div>
                <div className="text-sm text-green-600">Total Assignments</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{gradeDistribution.A}</div>
                <div className="text-sm text-purple-600">A Grades</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{classrooms.length}</div>
                <div className="text-sm text-orange-600">Enrolled Classes</div>
              </div>
            </div>

            {/* Recent Grades */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Recent Grades</h3>
              <div className="space-y-2">
                {getRecentGrades().map((grade, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-white rounded shadow-sm">
                    <div>
                      <p className="font-medium text-gray-900">{grade.assignmentName}</p>
                      <p className="text-sm text-gray-600">Graded by {grade.gradedBy}</p>
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
                {grades.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No grades available yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'grades' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Detailed Grades</h2>

            {grades.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">📝</div>
                <p>No grades available yet.</p>
                <p className="text-sm">Check back later for your assignment grades.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assignment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Graded By
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {grades.map((grade, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {grade.assignmentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {grade.grade}/{grade.maxGrade}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            grade.percentage >= 90 ? 'bg-green-100 text-green-800' :
                            grade.percentage >= 80 ? 'bg-blue-100 text-blue-800' :
                            grade.percentage >= 70 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {grade.percentage}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(grade.timestamp).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {grade.gradedBy}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Progress Analytics</h2>

            {/* Grade Distribution */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Grade Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{gradeDistribution.A}</div>
                  <div className="text-sm text-gray-600">A (90-100%)</div>
                  <div className="text-xs text-gray-500">
                    {grades.length > 0 ? Math.round((gradeDistribution.A / grades.length) * 100) : 0}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{gradeDistribution.B}</div>
                  <div className="text-sm text-gray-600">B (80-89%)</div>
                  <div className="text-xs text-gray-500">
                    {grades.length > 0 ? Math.round((gradeDistribution.B / grades.length) * 100) : 0}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{gradeDistribution.C}</div>
                  <div className="text-sm text-gray-600">C (70-79%)</div>
                  <div className="text-xs text-gray-500">
                    {grades.length > 0 ? Math.round((gradeDistribution.C / grades.length) * 100) : 0}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{gradeDistribution.D}</div>
                  <div className="text-sm text-gray-600">D/F (&lt;70%)</div>
                  <div className="text-xs text-gray-500">
                    {grades.length > 0 ? Math.round((gradeDistribution.D / grades.length) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Trends */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Academic Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Overall Average:</span>
                      <span className="font-bold text-blue-600">{calculateAverage()}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Highest Grade:</span>
                      <span className="font-bold text-green-600">
                        {grades.length > 0 ? Math.max(...grades.map(g => g.percentage)) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lowest Grade:</span>
                      <span className="font-bold text-red-600">
                        {grades.length > 0 ? Math.min(...grades.map(g => g.percentage)) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Assignment Statistics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Assignments:</span>
                      <span className="font-bold">{grades.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Passing Grades (≥70%):</span>
                      <span className="font-bold text-green-600">
                        {grades.filter(g => g.percentage >= 70).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Excellent Grades (≥90%):</span>
                      <span className="font-bold text-purple-600">{gradeDistribution.A}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'classrooms' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">My Classes</h2>

            {classrooms.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">🏫</div>
                <p>You are not enrolled in any classes yet.</p>
                <p className="text-sm">Contact your teacher to be added to a classroom.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classrooms.map((classroom, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-4">
                      <div className="text-2xl mr-3">🏫</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{classroom.name}</h3>
                        <p className="text-sm text-gray-600">{classroom.course}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Teacher:</span>
                        <span className="font-medium">{classroom.teacherName}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Students:</span>
                        <span className="font-medium">{classroom.students?.length || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">My Grades:</span>
                        <span className="font-medium">
                          {grades.filter(g => g.gradedBy === classroom.teacherName).length}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Academic Profile</h2>

            {/* Student Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Student Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Username</p>
                  <p className="font-medium">{currentUser?.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="font-medium">{currentUser?.role}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Wallet Address</p>
                  <p className="font-mono text-sm">{currentUser?.authority.toString().slice(0, 16)}...</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Registration Date</p>
                  <p className="font-medium">
                    {currentUser ? new Date(currentUser.createdAt * 1000).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Academic Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{calculateAverage()}%</div>
                  <div className="text-sm text-blue-600">Overall GPA</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{classrooms.length}</div>
                  <div className="text-sm text-green-600">Enrolled Classes</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{grades.length}</div>
                  <div className="text-sm text-purple-600">Total Assignments</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {grades.slice(0, 5).map((grade, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center">
                      <div className="text-lg mr-3">📝</div>
                      <div>
                        <p className="font-medium text-gray-900">{grade.assignmentName}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(grade.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-sm font-semibold rounded-full ${
                      grade.percentage >= 90 ? 'bg-green-100 text-green-800' :
                      grade.percentage >= 80 ? 'bg-blue-100 text-blue-800' :
                      grade.percentage >= 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {grade.percentage}%
                    </span>
                  </div>
                ))}
                {grades.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
