import { useQuery } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorFallback } from '../ErrorFallback'
import { Suspense } from 'react'
import './ContentInsights.css'
import { analyticsApi } from '../../api/client'
import { ParentSize } from '@visx/responsive'
import { DurationVsViews } from './DurationVsViews'
import { PublishingHeatmap } from './PublishingHeatmap'

interface ViewsOverTime {
    date: string
    views: number
    title: string
}

interface TopPerforming {
    title: string
    views: number
    tags: string[]
    duration: number
    publishedAt: string
}

function ContentInsightsContent() {
    const { data } = useQuery({
        queryKey: ['content-insights'],
        queryFn: () => analyticsApi.getContentInsights(),
    })

    return (
        <div className="insights-container">
            <h1>Content Insights</h1>

            <section className="insights-section">
                <h2>Best Performing Content Patterns</h2>
                <div className="patterns-grid">
                    <div className="pattern-card">
                        <h3>Optimal Video Length</h3>
                        <ParentSize>
                            {({ width }) => (
                                <DurationVsViews
                                    data={data?.durationVsViews || []}
                                    width={width}
                                    height={300}
                                />
                            )}
                        </ParentSize>
                    </div>
                    <div className="pattern-card">
                        <h3>Best Publishing Times</h3>
                        <ParentSize>
                            {({ width }) => (
                                <PublishingHeatmap
                                    data={data?.publishingTimes || []}
                                    width={width}
                                    height={300}
                                />
                            )}
                        </ParentSize>
                    </div>
                    <div className="pattern-card">
                        <h3>Tag Combinations</h3>
                        {/* Tag correlation analysis */}
                    </div>
                </div>
            </section>

            <section className="insights-section">
                <h2>Top Performing Videos</h2>
                {/* Table of best videos with their patterns */}
            </section>
        </div>
    )
}

export function ContentInsights() {
    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense fallback={<div className="loading">Loading insights...</div>}>
                <ContentInsightsContent />
            </Suspense>
        </ErrorBoundary>
    )
}
