interface Props {
    items: string[]
    maxItems?: number
    maxLength?: number
}

export function TruncatedList({ items, maxItems = 3, maxLength = 50 }: Props) {
    if (!items?.length) return null

    const displayText = items
        .slice(0, maxItems)
        .join(', ')
        .slice(0, maxLength)

    const hasMore = items.length > maxItems || displayText.length >= maxLength
    const fullText = items.join(', ')

    return (
        <span title={hasMore ? fullText : undefined}>
            {displayText}
            {hasMore ? '...' : ''}
        </span>
    )
}
