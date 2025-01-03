import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
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
}

export function VideoTable({ data }: Props) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = useState('')

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    })

    return (
        <div className="video-table-container">
            <div className="table-controls">
                <input
                    type="text"
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Search videos..."
                    className="search-input"
                />
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
                                        className={
                                            header.column.getCanSort()
                                                ? 'sortable'
                                                : ''
                                        }
                                    >
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
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
        </div>
    )
}
