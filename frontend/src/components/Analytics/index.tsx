import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '../../api/client'
import { Text } from '@visx/text'
import { Wordcloud } from '@visx/wordcloud'
import { scaleLog } from '@visx/scale'
import './Analytics.css'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorFallback } from '../ErrorFallback'
import { useState, Suspense } from 'react'
import { WordMapControls } from './WordMapControls'
import { WordMapStyle, COLOR_SCHEMES } from './wordMapConfig'

interface Word {
    text: string
    value: number
}

interface TagData {
    tag: string
    count: number
}

interface TopicData {
    topic: string
    count: number
}

function WordMap({ words, width, height }: { words: Word[], width: number, height: number }) {
    const [style, setStyle] = useState<WordMapStyle>({
        colorScheme: 'default',
        minFontSize: 10,
        maxFontSize: 50,
        padding: 4,
        spiralType: 'archimedean',
        withRotation: false,
        fontFamily: 'Inter, system-ui, sans-serif'
    })

    if (!words?.length) return null;

    const values = words.map(w => w.value);
    const minValue = Math.max(1, Math.min(...values));
    const maxValue = Math.max(2, Math.max(...values));

    const fontSize = scaleLog({
        domain: [minValue, maxValue],
        range: [style.minFontSize, style.maxFontSize],
        base: Math.E,
    });

    const getRotationDegree = () => {
        const rand = Math.random();
        const degree = rand > 0.5 ? 60 : -60;
        return rand * degree;
    };

    return (
        <div className="word-map-container">
            <WordMapControls style={style} onChange={setStyle} />
            <div className="wordcloud">
                <Wordcloud
                    words={words}
                    width={width}
                    height={height}
                    fontSize={(w) => fontSize(w.value)}
                    font={style.fontFamily}
                    padding={style.padding}
                    spiral={style.spiralType}
                    rotate={style.withRotation ? getRotationDegree : 0}
                    random={() => 0.5}
                >
                    {(cloudWords) =>
                        cloudWords.map((w, i) => (
                            <Text
                                key={w.text}
                                fill={COLOR_SCHEMES[style.colorScheme][i % COLOR_SCHEMES[style.colorScheme].length]}
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
        .filter(({ count }: TagData) => count > 1)
        .slice(0, 200)
        .map(({ tag, count }: TagData) => ({
            text: tag,
            value: count,
        }))

    const topicWords = data?.topics
        .filter(({ count }: TopicData) => count > 2)
        .map(({ topic, count }: TopicData) => ({
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
