import type { StatsResponse } from '../types/api'
import type { VideoData } from '../types/explorer'

const API_URL = import.meta.env.VITE_API_URL
const API_BASE = import.meta.env.VITE_API_BASE

// Environment sanity check
console.log('\nFrontend Environment:')
console.log('------------------')
console.log('VITE_API_URL:', API_URL)
console.log('VITE_API_BASE:', API_BASE)
console.log('Full API URL:', `${API_URL}${API_BASE}/stats`)
console.log('------------------\n')

export const statsApi = {
    getStats: async (): Promise<StatsResponse> => {
        const url = `${API_URL}${API_BASE}/stats`
        console.log('Attempting fetch from:', url)

        try {
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                credentials: 'omit',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                throw new Error(
                    `Server responded with ${response.status}: ${response.statusText}`
                )
            }

            return response.json()
        } catch (error) {
            console.error('Fetch error:', error)
            throw error
        }
    },
}

export interface PaginatedResponse<T> {
    data: T[]
    meta: {
        total: number
        page: number
        pageSize: number
        pageCount: number
    }
}

export const explorerApi = {
    getVideos: async (
        page: number = 0,
        pageSize: number = 25,
        search?: string
    ): Promise<PaginatedResponse<VideoData>> => {
        const url = new URL(`${API_URL}${API_BASE}/explorer`)
        url.searchParams.set('page', page.toString())
        url.searchParams.set('pageSize', pageSize.toString())
        if (search) url.searchParams.set('search', search)

        console.log('Fetching videos from:', url.toString())

        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`Failed to fetch videos: ${response.status}`)
        }
        return response.json()
    },
}
