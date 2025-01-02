import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

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
                        videoId: video.videoId
                    },
                    data: {
                        title: video.title,
                        description: video.description,
                        thumbnailUrl: video.thumbnailUrl,
                        categoryId: video.categoryId,
                        audioLanguage: video.audioLanguage,
                        duration: video.duration,
                        tags: video.tags || []
                    }
                })
                updated++

                if (updated % 100 === 0) {
                    console.log(`Updated ${updated} videos...`)
                }
            } catch (error: any) {
                if (error.code === 'P2025') { // Record not found
                    skipped++
                } else {
                    errors.push({
                        videoId: video.videoId,
                        error: error.message
                    })
                }
            }
        }

        console.log('\nUpdate complete!')
        console.log(`Updated: ${updated}`)
        console.log(`Skipped: ${skipped}`)
        console.log(`Errors: ${errors.length}`)

        if (errors.length > 0) {
            const errorLog = path.resolve(__dirname, `update_errors_${new Date().toISOString().replace(/[:.]/g, '-')}.json`)
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
