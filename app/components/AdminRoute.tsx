'use client'

import { ReactNode } from 'react'
import { useAdminPermissions, Permission } from '../hooks/useAdminPermissions'

interface AdminRouteProps {
  children: ReactNode
  requiredPermission?: Permission
  fallback?: ReactNode
  showError?: boolean
}

export function AdminRoute({ 
  children, 
  requiredPermission = 'system_administration',
  fallback,
  showError = true 
}: AdminRouteProps) {
  const { hasPermission, currentUser, getRoleDisplay } = useAdminPermissions()

  // Check if user is logged in
  if (!currentUser) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">
            Please connect your wallet and register to access this area.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-800 text-sm">
              This area requires user authentication.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Check if user has required permission
  if (!hasPermission(requiredPermission)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-red-500 text-6xl mb-4">⛔</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this area.
          </p>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Current User:</span>
                <span className="font-medium">{currentUser.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Role:</span>
                <span className="font-medium">{getRoleDisplay()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Required Permission:</span>
                <span className="font-medium text-red-600">{requiredPermission}</span>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">
              {requiredPermission === 'system_administration' 
                ? 'Admin privileges required to access this area.'
                : `Permission "${requiredPermission}" required.`
              }
            </p>
          </div>

          {showError && (
            <div className="mt-4 text-xs text-gray-500">
              If you believe this is an error, please contact your system administrator.
            </div>
          )}
        </div>
      </div>
    )
  }

  // User has permission, render children
  return <>{children}</>
}

// Specific admin route components
export function AdminDashboardRoute({ children }: { children: ReactNode }) {
  return (
    <AdminRoute requiredPermission="system_administration">
      {children}
    </AdminRoute>
  )
}

export function DebugConsoleRoute({ children }: { children: ReactNode }) {
  return (
    <AdminRoute requiredPermission="access_debug_console">
      {children}
    </AdminRoute>
  )
}

export function UserManagementRoute({ children }: { children: ReactNode }) {
  return (
    <AdminRoute requiredPermission="view_user_details">
      {children}
    </AdminRoute>
  )
}

export function DataExportRoute({ children }: { children: ReactNode }) {
  return (
    <AdminRoute requiredPermission="export_data">
      {children}
    </AdminRoute>
  )
}

// Permission-based component wrapper
interface PermissionWrapperProps {
  children: ReactNode
  permission: Permission
  fallback?: ReactNode
  hideIfNoPermission?: boolean
}

export function PermissionWrapper({ 
  children, 
  permission, 
  fallback,
  hideIfNoPermission = false 
}: PermissionWrapperProps) {
  const { hasPermission } = useAdminPermissions()

  if (!hasPermission(permission)) {
    if (hideIfNoPermission) {
      return null
    }
    return fallback || (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-yellow-800 text-sm">
          Insufficient permissions to view this content.
        </p>
      </div>
    )
  }

  return <>{children}</>
}

// Role-based component wrapper
interface RoleWrapperProps {
  children: ReactNode
  allowedRoles: ('Admin' | 'Teacher' | 'Student')[]
  fallback?: ReactNode
  hideIfNoAccess?: boolean
}

export function RoleWrapper({ 
  children, 
  allowedRoles, 
  fallback,
  hideIfNoAccess = false 
}: RoleWrapperProps) {
  const { currentUser } = useAdminPermissions()

  if (!currentUser || !allowedRoles.includes(currentUser.role)) {
    if (hideIfNoAccess) {
      return null
    }
    return fallback || (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-gray-600 text-sm">
          This content is not available for your role.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
