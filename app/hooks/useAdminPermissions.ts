import { useCallback } from 'react'
import { useUniGrading } from './useUniGrading'
import toast from 'react-hot-toast'

export type Permission = 
  | 'view_all_users'
  | 'view_user_details'
  | 'manage_users'
  | 'view_all_classrooms'
  | 'manage_classrooms'
  | 'view_all_grades'
  | 'manage_grades'
  | 'access_debug_console'
  | 'export_data'
  | 'system_administration'

export type UserRole = 'Teacher' | 'Student' | 'Admin'

// Define permissions for each role
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  Student: [
    // Students have very limited permissions
  ],
  Teacher: [
    'view_all_classrooms', // Can view classrooms they teach
    'manage_classrooms',   // Can manage their own classrooms
    'view_all_grades',     // Can view grades they assigned
    'manage_grades'        // Can assign grades
  ],
  Admin: [
    // Admins have all permissions
    'view_all_users',
    'view_user_details',
    'manage_users',
    'view_all_classrooms',
    'manage_classrooms',
    'view_all_grades',
    'manage_grades',
    'access_debug_console',
    'export_data',
    'system_administration'
  ]
}

export function useAdminPermissions() {
  const { currentUser } = useUniGrading()

  // Check if user has a specific permission
  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!currentUser) return false
    
    const userPermissions = ROLE_PERMISSIONS[currentUser.role] || []
    return userPermissions.includes(permission)
  }, [currentUser])

  // Check if user is admin
  const isAdmin = useCallback((): boolean => {
    return currentUser?.role === 'Admin'
  }, [currentUser])

  // Check if user is teacher
  const isTeacher = useCallback((): boolean => {
    return currentUser?.role === 'Teacher'
  }, [currentUser])

  // Check if user is student
  const isStudent = useCallback((): boolean => {
    return currentUser?.role === 'Student'
  }, [currentUser])

  // Require admin permission with error handling
  const requireAdmin = useCallback((action?: string): boolean => {
    if (!isAdmin()) {
      const actionText = action ? ` to ${action}` : ''
      toast.error(`Admin privileges required${actionText}`)
      return false
    }
    return true
  }, [isAdmin])

  // Require specific permission with error handling
  const requirePermission = useCallback((permission: Permission, action?: string): boolean => {
    if (!hasPermission(permission)) {
      const actionText = action ? ` to ${action}` : ''
      toast.error(`Insufficient permissions${actionText}`)
      return false
    }
    return true
  }, [hasPermission])

  // Get all permissions for current user
  const getUserPermissions = useCallback((): Permission[] => {
    if (!currentUser) return []
    return ROLE_PERMISSIONS[currentUser.role] || []
  }, [currentUser])

  // Check if user can access admin dashboard
  const canAccessAdminDashboard = useCallback((): boolean => {
    return hasPermission('system_administration')
  }, [hasPermission])

  // Check if user can view debug console
  const canAccessDebugConsole = useCallback((): boolean => {
    return hasPermission('access_debug_console')
  }, [hasPermission])

  // Check if user can view other users' data
  const canViewUserDetails = useCallback((): boolean => {
    return hasPermission('view_user_details')
  }, [hasPermission])

  // Check if user can export system data
  const canExportData = useCallback((): boolean => {
    return hasPermission('export_data')
  }, [hasPermission])

  // Check if user can manage other users
  const canManageUsers = useCallback((): boolean => {
    return hasPermission('manage_users')
  }, [hasPermission])

  // Get user role display
  const getRoleDisplay = useCallback((): string => {
    if (!currentUser) return 'Not logged in'
    
    switch (currentUser.role) {
      case 'Admin':
        return 'System Administrator'
      case 'Teacher':
        return 'Teacher'
      case 'Student':
        return 'Student'
      default:
        return 'Unknown Role'
    }
  }, [currentUser])

  // Get permission level description
  const getPermissionLevel = useCallback((): string => {
    if (!currentUser) return 'No access'
    
    switch (currentUser.role) {
      case 'Admin':
        return 'Full system access'
      case 'Teacher':
        return 'Classroom management access'
      case 'Student':
        return 'Limited student access'
      default:
        return 'No access'
    }
  }, [currentUser])

  // Validate admin action with logging
  const validateAdminAction = useCallback((action: string, permission?: Permission): boolean => {
    if (!currentUser) {
      console.warn(`Unauthorized access attempt: ${action} - No user logged in`)
      toast.error('Please log in to continue')
      return false
    }

    if (permission && !hasPermission(permission)) {
      console.warn(`Permission denied: ${currentUser.username} (${currentUser.role}) attempted ${action}`)
      toast.error(`Access denied: ${action}`)
      return false
    }

    if (!isAdmin() && permission && ['system_administration', 'access_debug_console'].includes(permission)) {
      console.warn(`Admin access denied: ${currentUser.username} (${currentUser.role}) attempted ${action}`)
      toast.error('Admin privileges required')
      return false
    }

    console.log(`Action authorized: ${currentUser.username} (${currentUser.role}) - ${action}`)
    return true
  }, [currentUser, hasPermission, isAdmin])

  return {
    // Permission checks
    hasPermission,
    requirePermission,
    getUserPermissions,
    
    // Role checks
    isAdmin,
    isTeacher,
    isStudent,
    requireAdmin,
    
    // Specific feature access
    canAccessAdminDashboard,
    canAccessDebugConsole,
    canViewUserDetails,
    canExportData,
    canManageUsers,
    
    // Display helpers
    getRoleDisplay,
    getPermissionLevel,
    
    // Validation
    validateAdminAction,
    
    // Current user info
    currentUser,
    userRole: currentUser?.role || null
  }
}
