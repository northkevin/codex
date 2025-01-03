import { useQuery } from '@tanstack/react-query'
import { explorerApi } from '../../api/client'
import { VideoTable } from './VideoTable'
import './Explorer.css'
import { useState } from 'react'

export function Explorer() {
    const [page, setPage] = useState(0)
    const [pageSize, setPageSize] = useState(25)
    const [search, setSearch] = useState('')
    const [globalFilter, setGlobalFilter] = useState('')

    const { data, isLoading, error } = useQuery({
        queryKey: ['videos', page, pageSize, search],
        queryFn: () => explorerApi.getVideos(page, pageSize, search || globalFilter),
    })

    // Handlers for state changes
    const handlePageChange = (newPage: number) => {
        console.log('Page changing to:', newPage)
        setPage(newPage)
    }

    const handlePageSizeChange = (newSize: number) => {
        console.log('Page size changing to:', newSize)
        setPageSize(newSize)
        setPage(0) // Reset to first page when changing page size
    }

    const handleSearch = (searchTerm: string) => {
        console.log('Search term:', searchTerm)
        setSearch(searchTerm)
        setPage(0) // Reset to first page when searching
    }

    if (isLoading) return <div className="loading">Loading videos...</div>
    if (error) return <div className="error">Failed to load videos</div>
    if (!data) return null

    return (
        <div className="explorer-container">
            <h1>Video Explorer</h1>
            <VideoTable
                data={data.data}
                meta={data.meta}
                page={page}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                onSearch={handleSearch}
                globalFilter={globalFilter}
                onGlobalFilterChange={setGlobalFilter}
            />
        </div>
    )
}
