/**
 * YouTube Metadata Update Script
 *
 * Updates video records in the database with metadata from YouTube Data API
 *
 * Input: scripts/scripts/data/youtube/youtube_data_processed.json
 * Format: Array of video metadata objects with fields matching our Prisma schema
 *
 * Run commands:
 * 1. Make sure Prisma client is generated:
 *    pnpm prisma generate
 *
 * 2. Run the update script:
 *    pnpm update-videos
 *
 * The script will:
 * - Process all videos in batches
 * - Update metadata fields
 * - Skip videos not found in DB
 * - Log any errors to update_errors_{timestamp}.json
 */

import { prisma } from '../lib/prisma.js'
import fs from 'fs'
import path from 'path'

// Configure path to JSON file relative to this script
const YOUTUBE_DATA_PATH = path.resolve(
    __dirname,
    '../../scripts/scripts/data/youtube/youtube_data_processed.json'
)

async function updateVideos() {
    try {
        // Read and parse JSON file
        const data = JSON.parse(fs.readFileSync(YOUTUBE_DATA_PATH, 'utf8'))
        console.log(`Found ${data.length} videos to update`)

        let updated = 0
        let skipped = 0
        const errors = []

        for (const video of data) {
            try {
                // Update video with new metadata
                await prisma.video.update({
                    where: {
                        videoId: video.videoId,
                    },
                    data: {
                        title: video.title,
                        description: video.description,
                        thumbnailUrl: video.thumbnailUrl,
                        tags: video.tags || [],
                        categoryId: video.categoryId,
                        audioLanguage: video.audioLanguage,
                        duration: video.duration,
                        licensedContent: video.licensedContent,
                        viewCount: video.viewCount
                            ? BigInt(video.viewCount)
                            : null,
                        likeCount: video.likeCount
                            ? BigInt(video.likeCount)
                            : null,
                        commentCount: video.commentCount
                            ? BigInt(video.commentCount)
                            : null,
                        channelId: video.channelId,
                        channelTitle: video.channelTitle,
                        publishedAt: video.publishedAt
                            ? new Date(video.publishedAt)
                            : null,

                        // Status details
                        privacyStatus: video.privacyStatus,
                        license: video.license,
                        embeddable: video.embeddable,

                        // Topic details
                        topicCategories: video.topicCategories || [],

                        // Recording details
                        recordingDate: video.recordingDate
                            ? new Date(video.recordingDate)
                            : null,
                        recordingLocation: video.recordingLocation,

                        // Live streaming details
                        wasLivestream: video.wasLivestream,
                        actualStartTime: video.actualStartTime
                            ? new Date(video.actualStartTime)
                            : null,
                        actualEndTime: video.actualEndTime
                            ? new Date(video.actualEndTime)
                            : null,

                        // Product placement
                        hasPaidProductPlacement: video.hasPaidProductPlacement,

                        // Update timestamp
                        metadataUpdatedAt: new Date(),
                    },
                })
                updated++

                if (updated % 100 === 0) {
                    console.log(`Updated ${updated} videos...`)
                }
            } catch (error: any) {
                if (error.code === 'P2025') {
                    // Record not found
                    skipped++
                } else {
                    errors.push({
                        videoId: video.videoId,
                        error: error.message,
                    })
                }
            }
        }

        console.log('\nUpdate complete!')
        console.log(`Updated: ${updated}`)
        console.log(`Skipped: ${skipped}`)
        console.log(`Errors: ${errors.length}`)

        if (errors.length > 0) {
            const errorLog = path.resolve(
                __dirname,
                `update_errors_${new Date().toISOString().replace(/[:.]/g, '-')}.json`
            )
            fs.writeFileSync(errorLog, JSON.stringify(errors, null, 2))
            console.log(`Error details written to: ${errorLog}`)
        }
    } catch (error) {
        console.error('Fatal error:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

updateVideos()
