// UniGrading Version Management
// Update this single value to change version across the entire app

export const CURRENT_VERSION = 'v1.2'

// Version history for reference
export const VERSION_HISTORY = [
  {
    version: 'v1.0',
    date: '2024-12-01',
    description: 'Initial release with basic registration and wallet connection'
  },
  {
    version: 'v1.1',
    date: '2024-12-10',
    description: 'Added login functionality and real account data'
  },
  {
    version: 'v1.2',
    date: '2024-12-12',
    description: 'Removed all mock data, implemented real data from localStorage, optimized refresh rates'
  }
]

// Version display utilities
export const getVersionDisplay = () => CURRENT_VERSION
export const getVersionWithPrefix = (prefix: string) => `${prefix} ${CURRENT_VERSION}`
export const getFullAppTitle = () => `UniGrading ${CURRENT_VERSION} - Blockchain Grade Management`
export const getVersionDescription = () => {
  const current = VERSION_HISTORY.find(v => v.version === CURRENT_VERSION)
  return current?.description || 'Latest version'
}
