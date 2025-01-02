// Re-export all types
export * from './stats'
export * from './api'

// Add React Query error type
export interface ApiError {
    message: string
    status?: number
}
