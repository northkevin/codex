import { PrismaClient } from '@prisma/client'
import { prisma } from '../../db'

export interface AttributeStats {
    productPlacement: {
        has: number
        none: number
        unknown: number
    }
    licensing: {
        licensed: number
        unlicensed: number
        unknown: number
    }
    privacy: {
        public: number
        other: number
        unknown: number
    }
    streaming: {
        livestream: number
        regular: number
    }
    metadata: {
        hasTags: number
        noTags: number
        hasTopics: number
        noTopics: number
    }
}

export async function getAttributeStats(
    prisma: PrismaClient
): Promise<AttributeStats> {
    const [productPlacement, licensing, privacy, streaming, metadata] =
        await Promise.all([
            // Product placement stats
            prisma.$queryRaw<{ has: number; none: number; unknown: number }[]>`
            SELECT
                COUNT(*) FILTER (WHERE has_paid_product_placement = true)::int as has,
                COUNT(*) FILTER (WHERE has_paid_product_placement = false)::int as none,
                COUNT(*) FILTER (WHERE has_paid_product_placement IS NULL)::int as unknown
            FROM videos
        `,

            // Licensing stats
            prisma.$queryRaw<
                {
                    licensed: number
                    unlicensed: number
                    unknown: number
                }[]
            >`
            SELECT
                COUNT(*) FILTER (WHERE licensed_content = true)::int as licensed,
                COUNT(*) FILTER (WHERE licensed_content = false)::int as unlicensed,
                COUNT(*) FILTER (WHERE licensed_content IS NULL)::int as unknown
            FROM videos
        `,

            // Privacy stats
            prisma.$queryRaw<
                {
                    public: number
                    other: number
                    unknown: number
                }[]
            >`
            SELECT
                COUNT(*) FILTER (WHERE privacy_status = 'public')::int as public,
                COUNT(*) FILTER (WHERE privacy_status IS NOT NULL AND privacy_status != 'public')::int as other,
                COUNT(*) FILTER (WHERE privacy_status IS NULL)::int as unknown
            FROM videos
        `,

            // Streaming stats
            prisma.$queryRaw<{ livestream: number; regular: number }[]>`
            SELECT
                COUNT(*) FILTER (WHERE was_livestream = true)::int as livestream,
                COUNT(*) FILTER (WHERE was_livestream = false)::int as regular
            FROM videos
        `,

            // Metadata stats
            prisma.$queryRaw<
                {
                    hasTags: number
                    noTags: number
                    hasTopics: number
                    noTopics: number
                }[]
            >`
            SELECT
                COUNT(*) FILTER (WHERE tags IS NOT NULL AND tags != '{}')::int as "hasTags",
                COUNT(*) FILTER (WHERE tags IS NULL OR tags = '{}')::int as "noTags",
                COUNT(*) FILTER (WHERE topic_categories IS NOT NULL AND topic_categories != '{}')::int as "hasTopics",
                COUNT(*) FILTER (WHERE topic_categories IS NULL OR topic_categories = '{}')::int as "noTopics"
            FROM videos
        `,
        ])

    return {
        productPlacement: productPlacement[0],
        licensing: licensing[0],
        privacy: privacy[0],
        streaming: streaming[0],
        metadata: metadata[0],
    }
}
