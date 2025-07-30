'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useUniGrading } from '../hooks/useUniGrading'
import { PublicKey } from '@solana/web3.js'



export function GradeManager() {
  const { assignGrade, loading } = useUniGrading()
  const [gradeForm, setGradeForm] = useState({
    studentWallet: '',
    assignmentName: '',
    grade: '',
    maxGrade: '100'
  })

  const handleAssignGrade = async () => {
    if (!gradeForm.studentWallet || !gradeForm.assignmentName || !gradeForm.grade) {
      toast.error('Please fill in all required fields')
      return
    }

    const grade = parseInt(gradeForm.grade)
    const maxGrade = parseInt(gradeForm.maxGrade)

    if (isNaN(grade) || isNaN(maxGrade) || grade < 0 || maxGrade <= 0) {
      toast.error('Please enter valid grade values')
      return
    }

    if (grade > maxGrade) {
      toast.error('Grade cannot exceed maximum grade')
      return
    }

    try {
      await assignGrade(
        new PublicKey(gradeForm.studentWallet),
        gradeForm.assignmentName,
        grade,
        maxGrade
      )

      setGradeForm({
        studentWallet: '',
        assignmentName: '',
        grade: '',
        maxGrade: '100'
      })
      toast.success('Grade assigned successfully!')
    } catch (error) {
      console.error('Error assigning grade:', error)
      toast.error('Failed to assign grade')
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Grade Management</h3>

      {/* Grade Assignment Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Assign Grade</h4>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student Wallet Address *
            </label>
            <input
              type="text"
              value={gradeForm.studentWallet}
              onChange={(e) => setGradeForm({ ...gradeForm, studentWallet: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter student's wallet address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assignment Name *
            </label>
            <input
              type="text"
              value={gradeForm.assignmentName}
              onChange={(e) => setGradeForm({ ...gradeForm, assignmentName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Math Quiz 1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade *
              </label>
              <input
                type="number"
                value={gradeForm.grade}
                onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="85"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Grade
              </label>
              <input
                type="number"
                value={gradeForm.maxGrade}
                onChange={(e) => setGradeForm({ ...gradeForm, maxGrade: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="1"
              />
            </div>
          </div>

          <button
            onClick={handleAssignGrade}
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {loading ? 'Assigning Grade...' : 'Assign Grade'}
          </button>
        </div>
      </div>


    </div>
  )
}
