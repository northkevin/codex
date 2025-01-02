import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function backup() {
    const videos = await prisma.video.findMany({
        include: {
            watches: true
        }
    })

    fs.writeFileSync(
        `backup_data_${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
        JSON.stringify(videos, null, 2)
    )

    await prisma.$disconnect()
}

backup()