import { PrismaClient } from '@prisma/client'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const prisma = new PrismaClient()

async function validateSetup() {
    try {
        // Check database connection
        await prisma.$connect()
        console.log('✅ Database connection successful')

        // Check Prisma schema
        const { stdout } = await execAsync('pnpm prisma format')
        console.log('✅ Prisma schema is valid')

        // Test database operations
        const testPodcast = await prisma.podcast.create({
            data: {
                title: 'Test Podcast',
                url: 'https://youtube.com/watch?v=test123',
                platform: 'youtube'
            }
        })
        console.log('✅ Database operations working')

        // Cleanup test data
        await prisma.podcast.delete({
            where: { id: testPodcast.id }
        })

    } catch (error) {
        console.error('❌ Setup validation failed:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

validateSetup() 