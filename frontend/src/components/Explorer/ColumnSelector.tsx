import { Column } from '@tanstack/react-table'
import { useState } from 'react'

interface Props {
    columns: Column<any, any>[]
    onChange: (columnIds: string[]) => void
}

export function ColumnSelector({ columns, onChange }: Props) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedColumns, setSelectedColumns] = useState<Set<string>>(
        new Set(columns.map(col => col.id))
    )

    const toggleColumn = (columnId: string) => {
        const newSelection = new Set(selectedColumns)
        if (newSelection.has(columnId)) {
            newSelection.delete(columnId)
        } else {
            newSelection.add(columnId)
        }
        setSelectedColumns(newSelection)
        onChange(Array.from(newSelection))
    }

    return (
        <div className="column-selector">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="column-selector-button"
            >
                Columns ({selectedColumns.size})
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
