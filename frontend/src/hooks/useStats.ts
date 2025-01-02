import { useQuery } from '@tanstack/react-query'
import { fetchStats } from '../api/stats'
import type { StatsResponse, ApiError } from '../types'

export function useStats() {
    return useQuery<StatsResponse, ApiError>({
        queryKey: ['stats'],
        queryFn: fetchStats,
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
        retry: 2, // Retry failed requests twice
    })
}
