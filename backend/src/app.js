import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pool from './config/db.js'
import employeeRoutes from './routes/employeeRoutes.js'
import insightsRoutes from './routes/insightsRoutes.js'
import { errorMiddleware } from './middleware/errorHandler.js'

dotenv.config()

const app = express()

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173']

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true)
    else cb(new Error(`CORS: ${origin} not allowed`))
  },
}))
app.use(express.json())

app.get('/health', (req, res) => res.json({ status: 'ok' }))

app.get('/db-health', async (req, res) => {
  await pool.query('SELECT 1')
  res.json({ status: 'db connected' })
})

app.use('/api/employees', employeeRoutes)
app.use('/api/insights', insightsRoutes)

app.use(errorMiddleware)

export default app
