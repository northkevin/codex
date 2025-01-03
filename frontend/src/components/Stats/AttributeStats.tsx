import type { AttributeStats as AttributeStatsType } from '../../types'

interface Props {
    data: AttributeStatsType
}

export function AttributeStatsSection({ data }: Props) {
    const formatPercent = (value: number, total: number) => {
        return `${((value / total) * 100).toFixed(1)}%`
    }

    const renderAttributeBar = (label: string, value: number, total: number) => (
        <div className="attribute-bar">
            <div className="label">{label}</div>
            <div className="bar" style={{ width: formatPercent(value, total) }} />
            <div className="value">{formatPercent(value, total)}</div>
        </div>
    )

    return (
        <div className="stat-section">
            <h2>Video Attributes</h2>
            <div className="attributes-grid">
                <div className="attribute-group">
                    <h3>Product Placement</h3>
                    <div className="attribute-bars">
                        {renderAttributeBar(
                            'Has Placement',
                            data.productPlacement.has,
                            data.streaming.livestream + data.streaming.regular
                        )}
                        {renderAttributeBar(
                            'No Placement',
                            data.productPlacement.none,
                            data.streaming.livestream + data.streaming.regular
                        )}
                        {renderAttributeBar(
                            'Unknown',
                            data.productPlacement.unknown,
                            data.streaming.livestream + data.streaming.regular
                        )}
                    </div>
                </div>

                <div className="attribute-group">
                    <h3>Licensing</h3>
                    <div className="attribute-bars">
                        {renderAttributeBar(
                            'Licensed',
                            data.licensing.licensed,
                            data.streaming.livestream + data.streaming.regular
                        )}
                        {renderAttributeBar(
                            'Unlicensed',
                            data.licensing.unlicensed,
                            data.streaming.livestream + data.streaming.regular
                        )}
                        {renderAttributeBar(
                            'Unknown',
                            data.licensing.unknown,
                            data.streaming.livestream + data.streaming.regular
                        )}
                    </div>
                </div>

                <div className="attribute-group">
                    <h3>Privacy Status</h3>
                    <div className="attribute-bars">
                        {renderAttributeBar(
                            'Public',
                            data.privacy.public,
                            data.streaming.livestream + data.streaming.regular
                        )}
                        {renderAttributeBar(
                            'Other',
                            data.privacy.other,
                            data.streaming.livestream + data.streaming.regular
                        )}
                        {renderAttributeBar(
                            'Unknown',
                            data.privacy.unknown,
                            data.streaming.livestream + data.streaming.regular
                        )}
                    </div>
                </div>

                <div className="attribute-group">
                    <h3>Stream Type</h3>
                    <div className="attribute-bars">
                        {renderAttributeBar(
                            'Livestream',
                            data.streaming.livestream,
                            data.streaming.livestream + data.streaming.regular
                        )}
                        {renderAttributeBar(
                            'Regular',
                            data.streaming.regular,
                            data.streaming.livestream + data.streaming.regular
                        )}
                    </div>
                </div>

                <div className="attribute-group">
                    <h3>Metadata</h3>
                    <div className="attribute-bars">
                        {renderAttributeBar(
                            'Has Tags',
                            data.metadata.hasTags,
                            data.metadata.hasTags + data.metadata.noTags
                        )}
                        {renderAttributeBar(
                            'No Tags',
                            data.metadata.noTags,
                            data.metadata.hasTags + data.metadata.noTags
                        )}
                        {renderAttributeBar(
                            'Has Topics',
                            data.metadata.hasTopics,
                            data.metadata.hasTopics + data.metadata.noTopics
                        )}
                        {renderAttributeBar(
                            'No Topics',
                            data.metadata.noTopics,
                            data.metadata.hasTopics + data.metadata.noTopics
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
