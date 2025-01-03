import * as dotenv from 'dotenv'
import path from 'path'
import app from './app'

// Load environment variables
const environment = process.env.NODE_ENV || 'development'
dotenv.config({ path: path.resolve(process.cwd(), `.env.${environment}`) })

const port = process.env.PORT || 3001

// Start server
const server = app.listen(port, () => {
    console.log('\n🚀 Server started!')
    console.log('------------------')
    console.log('Environment:', environment)
    console.log('Port:', port)
    console.log('URL:', `http://localhost:${port}`)
    console.log('------------------\n')
})

// Handle shutdown gracefully
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down...')
    server.close()
})
