import { Group } from '@visx/group'
import { scaleLinear } from '@visx/scale'
import { AxisBottom } from '@visx/axis'
import { Tooltip, useTooltip } from '@visx/tooltip'

interface PublishingHeatmapProps {
    data: Array<{
        hour: number
        views: number
    }>
    width: number
    height: number
}

export function PublishingHeatmap({ data, width, height }: PublishingHeatmapProps) {
    const margin = { top: 20, right: 20, bottom: 40, left: 50 }
    const {
        showTooltip,
        hideTooltip,
        tooltipData,
        tooltipLeft,
        tooltipTop,
    } = useTooltip<{ hour: number; avgViews: number }>()

    // Process data into bins
    const bins = Array.from({ length: 24 }, (_, hour) => {
        const hourData = data.filter(d => d.hour === hour)
        const avgViews = hourData.length
            ? hourData.reduce((sum, d) => sum + d.views, 0) / hourData.length
            : 0
        return { hour, avgViews }
    })

    // Bounds
    const xMax = width - margin.left - margin.right
    const yMax = height - margin.top - margin.bottom

    // Scales
    const xScale = scaleLinear({
        domain: [0, 23],
        range: [0, xMax],
    })

    const colorScale = scaleLinear({
        domain: [0, Math.max(...bins.map(b => b.avgViews))],
        range: ['#eee', 'var(--primary)'],
    })

    const binWidth = xMax / 24

    return (
        <div style={{ position: 'relative' }}>
            <svg width={width} height={height}>
                <Group left={margin.left} top={margin.top}>
                    <AxisBottom
                        scale={xScale}
                        top={yMax}
                        label="Hour of Day"
                        tickFormat={h => `${h}:00`}
                    />
                    {bins.map((bin, i) => (
                        <rect
                            key={i}
                            x={xScale(bin.hour)}
                            y={0}
                            width={binWidth}
                            height={yMax}
                            fill={colorScale(bin.avgViews)}
                            opacity={0.8}
                            onMouseEnter={() => {
                                showTooltip({
                                    tooltipData: bin,
                                    tooltipLeft: xScale(bin.hour) + margin.left,
                                    tooltipTop: margin.top,
                                })
                            }}
                            onMouseLeave={hideTooltip}
                        />
                    ))}
                </Group>
            </svg>
            {tooltipData && (
                <Tooltip
                    top={tooltipTop}
                    left={tooltipLeft}
                >
                    <div className="tooltip-content">
                        <div>Hour: {tooltipData.hour}:00</div>
                        <div>Avg Views: {Math.round(tooltipData.avgViews).toLocaleString()}</div>
                    </div>
                </Tooltip>
            )}
        </div>
    )
}
