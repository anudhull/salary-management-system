import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pool from './config/db.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => res.json({ status: 'ok' }))

app.get('/db-health', async (req, res) => {
  await pool.query('SELECT 1')
  res.json({ status: 'db connected' })
})

export default app
