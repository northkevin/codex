import express from 'express'
import cors from 'cors'
import statsRouter from './api/stats'

const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use('/api', statsRouter)

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
