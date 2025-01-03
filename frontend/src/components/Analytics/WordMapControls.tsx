import { WordMapStyle, COLOR_SCHEMES, FONT_FAMILIES } from './wordMapConfig'
import './WordMapControls.css'

interface WordMapControlsProps {
    style: WordMapStyle
    onChange: (style: WordMapStyle) => void
}

export function WordMapControls({ style, onChange }: WordMapControlsProps) {
    return (
        <div className="word-map-controls">
            <div className="control-group">
                <label>
                    Color Scheme
                    <select
                        value={style.colorScheme}
                        onChange={e => onChange({
                            ...style,
                            colorScheme: e.target.value as keyof typeof COLOR_SCHEMES
                        })}
                    >
                        {Object.keys(COLOR_SCHEMES).map(scheme => (
                            <option key={scheme} value={scheme}>
                                {scheme.charAt(0).toUpperCase() + scheme.slice(1)}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="control-group">
                <label>
                    Font Size Range
                    <div className="range-inputs">
                        <input
                            type="range"
                            min="8"
                            max="24"
                            value={style.minFontSize}
                            onChange={e => onChange({
                                ...style,
                                minFontSize: Number(e.target.value)
                            })}
                        />
                        <span>{style.minFontSize}px</span>
                        <input
                            type="range"
                            min="25"
                            max="100"
                            value={style.maxFontSize}
                            onChange={e => onChange({
                                ...style,
                                maxFontSize: Number(e.target.value)
                            })}
                        />
                        <span>{style.maxFontSize}px</span>
                    </div>
                </label>
            </div>

            <div className="control-group">
                <label>
                    Font Family
                    <select
                        value={style.fontFamily}
                        onChange={e => onChange({
                            ...style,
                            fontFamily: e.target.value
                        })}
                    >
                        {FONT_FAMILIES.map(font => (
                            <option key={font} value={font}>
                                {font.split(',')[0]}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="control-group">
                <label>
                    Word Spacing
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={style.padding}
                        onChange={e => onChange({
                            ...style,
                            padding: Number(e.target.value)
                        })}
                    />
                    <span>{style.padding}px</span>
                </label>
            </div>

            <div className="control-group">
                <label>
                    Spiral Type
                    <select
                        value={style.spiralType}
                        onChange={e => onChange({
                            ...style,
                            spiralType: e.target.value as 'archimedean' | 'rectangular'
                        })}
                    >
                        <option value="archimedean">Archimedean</option>
                        <option value="rectangular">Rectangular</option>
                    </select>
                </label>
            </div>

            <div className="control-group">
                <label>
                    <input
                        type="checkbox"
                        checked={style.withRotation}
                        onChange={e => onChange({
                            ...style,
                            withRotation: e.target.checked
                        })}
                    />
                    Enable Word Rotation
                </label>
            </div>
        </div>
    )
}
