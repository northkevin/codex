const { PrismaClient } = require('@prisma/client')
const fs = require('fs')

const prisma = new PrismaClient()

async function importVideos() {
    const data = JSON.parse(fs.readFileSync('scripts/watch-history.json', 'utf8'))
    const errorLog = []

    console.log(`Found ${data.length} watch entries to import`)

    let importedVideos = 0
    let importedWatches = 0

    for (const entry of data) {
        try {
            // First upsert the video
            const video = await prisma.video.upsert({
                where: {
                    videoId: entry.video_id,
                },
                update: {}, // Don't update existing videos
                create: {
                    videoId: entry.video_id,
                    title: entry.title,
                    channelId: entry.channel_url?.split('/channel/')?.[1],
                    channelTitle: entry.channel_title,
                }
            })

            // Then create the watch history entry
            await prisma.watchHistory.create({
                data: {
                    videoId: entry.video_id,
                    watchedAt: new Date(entry.watched_at)
                }
            })

            importedVideos++
            importedWatches++

            if (importedWatches % 100 === 0) {
                console.log(`Processed ${importedWatches} watch entries...`)
            }
        } catch (error) {
            const errorEntry = {
                entry: entry,
                error: error.message,
                timestamp: new Date().toISOString()
            }
            errorLog.push(errorEntry)
            console.error(`Failed to import entry: ${entry.title}`)
        }
    }

    // Save error log if there were any errors
    if (errorLog.length > 0) {
        const errorLogPath = `scripts/import_errors_${new Date().toISOString().replace(/[:.]/g, '-')}.json`
        fs.writeFileSync(errorLogPath, JSON.stringify(errorLog, null, 2))
        console.log(`\nErrors were encountered and saved to ${errorLogPath}`)
    }

    console.log(`\nImport complete!`)
    console.log(`Unique videos: ${importedVideos}`)
    console.log(`Watch entries: ${importedWatches}`)
    console.log(`Errors: ${errorLog.length}`)
}

importVideos()
    .catch(error => {
        console.error('Fatal error:', error)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
    .finally(() => prisma.$disconnect()) 