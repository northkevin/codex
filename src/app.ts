import express from 'express'
import cors from 'cors'
import statsRouter from './api/stats'

const app = express()

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`)
    next()
})

// CORS setup
app.use(cors())

// API routes
app.use('/api/v1/stats', statsRouter)

export default app
