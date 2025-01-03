import { Column } from '@tanstack/react-table'
import { VideoData } from '../../types/explorer'
import { useState } from 'react'

interface Props {
    columns: Column<VideoData, unknown>[]
    onChange: (columnIds: string[]) => void
}

export function ColumnSelector({ columns, onChange }: Props) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedColumns, setSelectedColumns] = useState<Set<string>>(() => {
        const stored = localStorage.getItem('explorer-column-visibility')
        if (stored) {
            const visibility = JSON.parse(stored)
            return new Set(Object.entries(visibility)
                .filter(([, isVisible]) => isVisible)
                .map(([id]) => id))
        }
        return new Set(columns.map(col => col.id))
    })

    const toggleColumn = (columnId: string) => {
        const newSelection = new Set(selectedColumns)
        if (newSelection.has(columnId)) {
            newSelection.delete(columnId)
        } else {
            newSelection.add(columnId)
        }
        setSelectedColumns(newSelection)

        const visibility: Record<string, boolean> = columns.reduce((acc, column) => ({
            ...acc,
            [column.id]: newSelection.has(column.id)
        }), {})

        localStorage.setItem('explorer-column-visibility', JSON.stringify(visibility))
        onChange(Object.keys(visibility).filter(id => visibility[id]))
    }

    return (
        <div className="column-selector">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="column-selector-button"
            >
                Columns ({selectedColumns.size}/{columns.length})
            </button>
            {isOpen && (
                <div className="column-selector-dropdown">
                    {columns.map(column => (
                        <label key={column.id} className="column-option">
                            <input
                                type="checkbox"
                                checked={selectedColumns.has(column.id)}
                                onChange={() => toggleColumn(column.id)}
                            />
                            <span>{column.columnDef.header as string}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    )
}
