import express, { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { getAllStats } from '../services/stats/index'

const prisma = new PrismaClient()
export const router = express.Router()

router.get('/stats', async (_req: Request, res: Response) => {
    try {
        const minDate = new Date('2017-01-01')
        const stats = await getAllStats(minDate)
        res.json(stats)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to fetch stats' })
    }
})

export default router
