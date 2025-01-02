import type { CategoryStats as CategoryStatsType } from '../../types'
import { CATEGORY_NAMES } from '../../constants'

interface Props {
    data: CategoryStatsType
}

export function CategoryStats({ data }: Props) {
    const totalVideos = data.categoryDistribution.reduce(
        (sum, cat) => sum + cat._count,
        0
    )

    return (
        <div className="stat-section">
            <h2>Video Categories</h2>
            <div className="category-stats">
                {data.categoryDistribution.map(cat => (
                    <div key={cat.categoryId} className="category-item">
                        <span className="category">
                            {CATEGORY_NAMES[cat.categoryId] || cat.categoryId}
                        </span>
                        <div
                            className="bar"
                            style={{
                                width: `${(cat._count / totalVideos) * 100}%`
                            }}
                        />
                        <span className="count">
                            {cat._count.toLocaleString()} ({Math.round((cat._count / totalVideos) * 100)}%)
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
