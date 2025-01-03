import { Group } from '@visx/group'
import { scaleLinear } from '@visx/scale'
import { Circle } from '@visx/shape'
import { Grid } from '@visx/grid'
import { Axis } from '@visx/axis'
import { Tooltip, useTooltip } from '@visx/tooltip'

interface DataPoint {
    duration: number
    views: number
    title: string
}

interface DurationVsViewsProps {
    data: DataPoint[]
    width: number
    height: number
}

export function DurationVsViews({ data, width, height }: DurationVsViewsProps) {
    const margin = { top: 20, right: 20, bottom: 40, left: 50 }
    const {
        showTooltip,
        hideTooltip,
        tooltipData,
        tooltipLeft,
        tooltipTop,
    } = useTooltip<DataPoint>()

    // Bounds
    const xMax = width - margin.left - margin.right
    const yMax = height - margin.top - margin.bottom

    // Scales
    const xScale = scaleLinear({
        domain: [0, Math.max(...data.map(d => d.duration))],
        range: [0, xMax],
    })

    const yScale = scaleLinear({
        domain: [0, Math.max(...data.map(d => d.views))],
        range: [yMax, 0],
    })

    return (
        <div style={{ position: 'relative' }}>
            <svg width={width} height={height}>
                <Group left={margin.left} top={margin.top}>
                    <Grid
                        xScale={xScale}
                        yScale={yScale}
                        width={xMax}
                        height={yMax}
                        stroke="var(--border-color)"
                        strokeOpacity={0.2}
                    />
                    <Axis
                        orientation="bottom"
                        scale={xScale}
                        top={yMax}
                        label="Duration (minutes)"
                    />
                    <Axis
                        orientation="left"
                        scale={yScale}
                        label="Views"
                    />
                    {data.map((d, i) => (
                        <Circle
                            key={i}
                            cx={xScale(d.duration)}
                            cy={yScale(d.views)}
                            r={5}
                            fill="var(--primary)"
                            opacity={0.6}
                            onMouseEnter={() => {
                                showTooltip({
                                    tooltipData: d,
                                    tooltipLeft: xScale(d.duration),
                                    tooltipTop: yScale(d.views),
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
                        <strong>{tooltipData.title}</strong>
                        <div>Duration: {Math.round(tooltipData.duration)}min</div>
                        <div>Views: {tooltipData.views.toLocaleString()}</div>
                    </div>
                </Tooltip>
            )}
        </div>
    )
}
