import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '../../api/client'
import { Text } from '@visx/text'
import { Wordcloud } from '@visx/wordcloud'
import { scaleLog } from '@visx/scale'
import './Analytics.css'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorFallback } from '../ErrorFallback'
import { useState, Suspense } from 'react'

interface Word {
    text: string
    value: number
}

const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b']
const getColor = (i: number) => colors[i % colors.length]

function WordMap({ words, width, height }: { words: Word[], width: number, height: number }) {
    const [spiralType, setSpiralType] = useState<'archimedean' | 'rectangular'>('archimedean');
    const [withRotation, setWithRotation] = useState(false);

    if (!words?.length) return null;



    const values = words.map(w => w.value);
    const minValue = Math.max(1, Math.min(...values));
    const maxValue = Math.max(2, Math.max(...values));

    const fontSize = scaleLog({
        domain: [minValue, maxValue],
        range: [10, 50],
        base: Math.E,
    });

    const getRotationDegree = () => {
        const rand = Math.random();
        const degree = rand > 0.5 ? 60 : -60;
        return rand * degree;
    };

    return (
        <div className="wordcloud">
            <Wordcloud
                words={words}
                width={width}
                height={height}
                fontSize={(w) => fontSize(w.value)}
                font={'Inter, system-ui, sans-serif'}
                padding={4}
                spiral={spiralType}
                rotate={withRotation ? getRotationDegree : 0}
                random={() => 0.5}
            >
                {(cloudWords) =>
                    cloudWords.map((w, i) => (
                        <Text
                            key={w.text}
                            fill={getColor(i)}
                            textAnchor="middle"
                            transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
                            fontSize={w.size}
                            fontFamily={w.font}
                        >
                            {w.text}
                        </Text>
                    ))
                }
            </Wordcloud>
            <div className="controls">
                <label>
                    Spiral type &nbsp;
                    <select
                        onChange={(e) => setSpiralType(e.target.value as 'archimedean' | 'rectangular')}
                        value={spiralType}
                    >
                        <option value="archimedean">archimedean</option>
                        <option value="rectangular">rectangular</option>
                    </select>
                </label>
                <label>
                    With rotation &nbsp;
                    <input
                        type="checkbox"
                        checked={withRotation}
                        onChange={() => setWithRotation(!withRotation)}
                    />
                </label>
            </div>
        </div>
    );
}

export function Analytics() {
    return (
        <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => window.location.reload()}
        >
            <Suspense fallback={<div className="loading">Loading analytics...</div>}>
                <AnalyticsContent />
            </Suspense>
        </ErrorBoundary>
    )
}

function AnalyticsContent() {
    const { data } = useQuery({
        queryKey: ['word-maps'],
        queryFn: () => analyticsApi.getWordMaps(),
    })

    const tagWords = data?.tags
        .filter(({ count }) => count > 1)
        .slice(0, 200)
        .map(({ tag, count }) => ({
            text: tag,
            value: count,
        }))

    const topicWords = data?.topics
        .filter(({ count }) => count > 2)
        .map(({ topic, count }) => ({
            text: topic,
            value: count,
        }))

    return (
        <div className="analytics-container">
            <h1>Video Analytics</h1>

            <section className="word-map-section">
                <h2>Tag Cloud</h2>
                <WordMap
                    words={tagWords}
                    width={800}
                    height={400}
                />
            </section>

            <section className="word-map-section">
                <h2>Topic Categories</h2>
                <WordMap
                    words={topicWords}
                    width={800}
                    height={400}
                />
            </section>
        </div>
    )
}
