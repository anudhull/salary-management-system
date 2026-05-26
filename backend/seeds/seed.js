import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const read = (file) =>
  fs.readFileSync(path.join(__dirname, 'data', file), 'utf8')
    .split('\n').map(s => s.trim()).filter(Boolean)

const firstNames = read('first_names.txt')
const lastNames  = read('last_names.txt')

const DEPARTMENTS = [
  'Engineering', 'Product', 'Design', 'Marketing',
  'Sales', 'Finance', 'HR', 'Operations', 'Legal', 'Support',
]

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Germany',
  'France', 'Australia', 'India', 'Brazil', 'Japan', 'Singapore',
]

const JOB_TITLES = [
  { title: 'Software Engineer',        min: 70000,  max: 130000 },
  { title: 'Senior Software Engineer', min: 100000, max: 160000 },
  { title: 'Staff Engineer',           min: 140000, max: 200000 },
  { title: 'Engineering Manager',      min: 130000, max: 180000 },
  { title: 'Product Manager',          min: 90000,  max: 150000 },
  { title: 'Senior Product Manager',   min: 120000, max: 180000 },
  { title: 'Data Analyst',             min: 60000,  max: 100000 },
  { title: 'Data Scientist',           min: 90000,  max: 150000 },
  { title: 'Designer',                 min: 65000,  max: 120000 },
  { title: 'Marketing Manager',        min: 70000,  max: 120000 },
  { title: 'Sales Representative',     min: 50000,  max: 90000  },
  { title: 'HR Manager',               min: 65000,  max: 110000 },
  { title: 'Finance Analyst',          min: 65000,  max: 110000 },
  { title: 'Operations Manager',       min: 75000,  max: 130000 },
  { title: 'CTO',                      min: 180000, max: 280000 },
]

const EMPLOYMENT_TYPES = ['full-time', 'full-time', 'full-time', 'part-time', 'contract']

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const randDate = () => {
  const start = new Date('2015-01-01')
  const end   = new Date('2024-12-31')
  const ms = start.getTime() + Math.random() * (end.getTime() - start.getTime())
  return new Date(ms).toISOString().split('T')[0]
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

const TOTAL   = 10000
const BATCH   = 1000
const BATCHES = TOTAL / BATCH

const usedEmails = new Set()

const generateEmployee = () => {
  const first      = pick(firstNames)
  const last       = pick(lastNames)
  const full_name  = `${first} ${last}`
  const jobEntry   = pick(JOB_TITLES)
  const suffix     = Math.floor(10000 + Math.random() * 90000)
  const email      = `${first.toLowerCase()}.${last.toLowerCase()}${suffix}@company.com`
  const salary     = rand(jobEntry.min, jobEntry.max)
  const status     = Math.random() < 0.9 ? 'active' : 'inactive'

  return [
    full_name,
    email,
    jobEntry.title,
    pick(DEPARTMENTS),
    pick(COUNTRIES),
    salary,
    pick(EMPLOYMENT_TYPES),
    status,
    randDate(),
  ]
}

const seedBatch = async (client, batchNum) => {
  const rows = []
  let attempts = 0

  while (rows.length < BATCH) {
    const row = generateEmployee()
    if (!usedEmails.has(row[1])) {
      usedEmails.add(row[1])
      rows.push(row)
    }
    if (++attempts > BATCH * 3) break
  }

  const placeholders = rows.map(
    (_, i) => `($${i * 9 + 1},$${i * 9 + 2},$${i * 9 + 3},$${i * 9 + 4},$${i * 9 + 5},$${i * 9 + 6},$${i * 9 + 7},$${i * 9 + 8},$${i * 9 + 9})`
  ).join(',')

  await client.query(
    `INSERT INTO employees
      (full_name,email,job_title,department,country,salary,employment_type,status,hire_date)
     VALUES ${placeholders}`,
    rows.flat()
  )

  console.log(`Batch ${batchNum}/${BATCHES} inserted (${rows.length} rows)`)
}

const run = async () => {
  const client = await pool.connect()
  try {
    console.log('Clearing existing employees...')
    await client.query('TRUNCATE employees RESTART IDENTITY CASCADE')

    for (let i = 1; i <= BATCHES; i++) {
      await seedBatch(client, i)
    }

    console.log(`Done — ${TOTAL} employees seeded.`)
  } finally {
    client.release()
    await pool.end()
  }
}

run().catch(err => { console.error(err); process.exit(1) })
