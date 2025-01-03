import { useQuery } from '@tanstack/react-query'
import { explorerApi } from '../../api/client'
import { VideoTable } from './VideoTable'
import './Explorer.css'
import { useState, useEffect } from 'react'
import { SortingState, VisibilityState } from '@tanstack/react-table'

const STORAGE_KEY = 'explorer-column-visibility'

export function Explorer() {
    const [page, setPage] = useState(0)
    const [pageSize, setPageSize] = useState(25)
    const [search, setSearch] = useState('')
    const [globalFilter, setGlobalFilter] = useState('')
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
        const stored = localStorage.getItem(STORAGE_KEY)
        return stored ? JSON.parse(stored) : {}
    })

    // Persist column visibility to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(columnVisibility))
    }, [columnVisibility])

    const { data, isLoading, error } = useQuery({
        queryKey: ['videos', page, pageSize, search, sorting],
        queryFn: () => explorerApi.getVideos(
            page,
            pageSize,
            search || globalFilter,
            sorting.length ? sorting : undefined
        ),
    })

    // Reset page when filters change
    useEffect(() => {
        setPage(0)
    }, [pageSize, search, sorting])

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
                sorting={sorting}
                columnVisibility={columnVisibility}
                onColumnVisibilityChange={setColumnVisibility}
                onSortingChange={setSorting}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                onSearch={handleSearch}
                globalFilter={globalFilter}
                onGlobalFilterChange={setGlobalFilter}
            />
        </div>
    )
}
