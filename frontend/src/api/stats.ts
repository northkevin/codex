import axios, { AxiosError } from 'axios'
import type { StatsResponse, ApiError } from '../types'

const API_URL = 'http://localhost:3001/api'

export async function fetchStats(): Promise<StatsResponse> {
    try {
        const { data } = await axios.get<StatsResponse>(`${API_URL}/stats`)
        return data
    } catch (error) {
        if (error instanceof AxiosError) {
            throw {
                message: error.response?.data?.error || 'Failed to fetch stats',
                status: error.response?.status,
            } as ApiError
        }
        throw { message: 'Unknown error occurred' } as ApiError
    }
}
