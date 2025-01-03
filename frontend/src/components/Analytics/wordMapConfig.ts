export const COLOR_SCHEMES = {
    default: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'],
    sunset: ['#ff7e5f', '#feb47b', '#ff9966', '#ff6b6b', '#c06c84', '#6c5b7b'],
    ocean: ['#00204a', '#005792', '#00b2ca', '#00dffc', '#00a8b5', '#007991'],
    forest: ['#2d5a27', '#538d22', '#73a942', '#96be8c', '#aad576', '#606c38'],
    candy: ['#ff499e', '#d264b6', '#a480cf', '#779be7', '#49b6ff', '#1ac0c6'],
}

export const FONT_FAMILIES = [
    'Inter, system-ui, sans-serif',
    'Georgia, serif',
    'Menlo, monospace',
    'Comic Sans MS, cursive',
    'Impact, fantasy',
]

export interface WordMapStyle {
    colorScheme: keyof typeof COLOR_SCHEMES
    minFontSize: number
    maxFontSize: number
    padding: number
    spiralType: 'archimedean' | 'rectangular'
    withRotation: boolean
    fontFamily: string
}
