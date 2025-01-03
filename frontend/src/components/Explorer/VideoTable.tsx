import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    createColumnHelper,
    flexRender,
    type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import type { VideoData } from '../../types/explorer'
import { formatDuration } from '../../utils/format'
import { CATEGORY_NAMES } from '../../constants'

const columnHelper = createColumnHelper<VideoData>()

const columns = [
    columnHelper.accessor('title', {
        header: 'Title',
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('channelTitle', {
        header: 'Channel',
        cell: (info) => info.getValue() || 'Unknown',
    }),
    columnHelper.accessor('categoryId', {
        header: 'Category',
        cell: (info) => CATEGORY_NAMES[info.getValue() || ''] || 'Unknown',
    }),
    columnHelper.accessor('viewCount', {
        header: 'Views',
        cell: (info) => Number(info.getValue()).toLocaleString(),
    }),
    columnHelper.accessor('duration', {
        header: 'Duration',
        cell: (info) => formatDuration(info.getValue() || ''),
    }),
    columnHelper.accessor('watches', {
        header: 'Watch Count',
        cell: (info) => info.getValue().length.toLocaleString(),
    }),
    columnHelper.accessor('wasLivestream', {
        header: 'Type',
        cell: (info) => (info.getValue() ? '🔴 Live' : '📹 Video'),
    }),
]

interface Props {
    data: VideoData[]
    meta: {
        total: number
        page: number
        pageSize: number
        pageCount: number
    }
    page: number
    pageSize: number
    globalFilter: string
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
    onSearch: (search: string) => void
    onGlobalFilterChange: (filter: string) => void
    sorting: SortingState
    onSortingChange: (sorting: SortingState) => void
}

export function VideoTable({
    data,
    meta,
    page,
    pageSize,
    globalFilter,
    onPageChange,
    onPageSizeChange,
    // onSearch,
    onGlobalFilterChange,
    sorting,
    onSortingChange,
}: Props) {
    const [pageInput, setPageInput] = useState('')

    const handleSortingChange = (updaterOrValue) => {
        const newSorting = typeof updaterOrValue === 'function'
            ? updaterOrValue(sorting)
            : updaterOrValue;

        // Convert to tri-state sorting
        const triStateSorting = newSorting.map(sort => {
            const currentSort = sorting.find(s => s.id === sort.id);
            if (!currentSort) return { ...sort, desc: false }; // First click: ascending
            if (!currentSort.desc) return { ...sort, desc: true }; // Second click: descending
            return null; // Third click: no sorting
        }).filter(Boolean);

        onSortingChange(triStateSorting);
    }

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            globalFilter,
            pagination: {
                pageSize,
                pageIndex: page,
            },
        },
        onSortingChange: handleSortingChange,
        onGlobalFilterChange: onGlobalFilterChange,
        manualSorting: true,
        manualPagination: true,
        pageCount: meta.pageCount,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        enableSortingRemoval: true,
    })

    const handleJumpToPage = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const newPage = Number(pageInput)
            if (!isNaN(newPage) && newPage >= 1 && newPage <= meta.pageCount) {
                onPageChange(newPage - 1)
            }
            setPageInput('')
        }
    }

    return (
        <div className="video-table-container">
            <div className="table-controls">
                <div className="controls-row">
                    <input
                        type="text"
                        value={globalFilter}
                        onChange={(e) => onGlobalFilterChange(e.target.value)}
                        placeholder="Search videos..."
                        className="search-input"
                    />
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="page-size-select"
                    >
                        {[10, 25, 50, 100].map((size) => (
                            <option key={size} value={size}>
                                Show {size}
                            </option>
                        ))}
                    </select>
                    <span className="record-count">
                        Showing {meta.page * meta.pageSize + 1}-
                        {Math.min((meta.page + 1) * meta.pageSize, meta.total)} of{' '}
                        {meta.total.toLocaleString()} records
                    </span>
                </div>
            </div>

            <div className="table-wrapper">
                <table>
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        onClick={header.column.getToggleSortingHandler()}
                                        className="p-3 text-left bg-gray-100 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2">
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                            {header.column.getIsSorted() && (
                                                <span className="text-gray-600">
                                                    {header.column.getIsSorted() === "asc" ? "↑" :
                                                     header.column.getIsSorted() === "desc" ? "↓" : ""}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pagination-controls">
                <button
                    onClick={() => onPageChange(0)}
                    disabled={page === 0}
                    className="pagination-button"
                >
                    {'<<'}
                </button>
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 0}
                    className="pagination-button"
                >
                    {'<'}
                </button>
                <span className="pagination-info">
                    Page {page + 1} of {meta.pageCount}
                </span>
                <div className="jump-to-page">
                    <input
                        type="text"
                        value={pageInput}
                        onChange={(e) => setPageInput(e.target.value)}
                        onKeyDown={handleJumpToPage}
                        placeholder="Go to page"
                        className="jump-input"
                    />
                </div>
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= meta.pageCount - 1}
                    className="pagination-button"
                >
                    {'>'}
                </button>
                <button
                    onClick={() => onPageChange(meta.pageCount - 1)}
                    disabled={page >= meta.pageCount - 1}
                    className="pagination-button"
                >
                    {'>>'}
                </button>
            </div>
        </div>
    )
}
