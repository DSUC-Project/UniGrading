'use client'

import { useState } from 'react'
import { TeacherDashboard } from './TeacherDashboard'
import { StudentDashboard } from './StudentDashboard'
import { AdminDashboard } from './AdminDashboard'
import { AdminDashboardRoute } from './AdminRoute'

interface DashboardProps {
  userRole: 'teacher' | 'student' | 'admin' | null
}

export function Dashboard({ userRole }: DashboardProps) {
  if (!userRole) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading user information...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section - Only for non-admin users */}
      {userRole !== 'admin' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome, {userRole === 'teacher' ? 'Teacher' : 'Student'}!
          </h2>
          <p className="text-gray-600">
            {userRole === 'teacher'
              ? 'Manage your classrooms and assign grades to students.'
              : 'View your grades and track your academic progress.'
            }
          </p>
        </div>
      )}

      {/* Main Content */}
      <div>
        {userRole === 'teacher' && <TeacherDashboard />}
        {userRole === 'student' && <StudentDashboard />}
        {userRole === 'admin' && (
          <AdminDashboardRoute>
            <AdminDashboard />
          </AdminDashboardRoute>
        )}
      </div>
    </div>
  )
}
