import { validationResult } from 'express-validator'
import pool from '../config/db.js'

export const createEmployee = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const {
    full_name, email, job_title, department,
    country, salary, employment_type, status, hire_date,
  } = req.body

  const { rows } = await pool.query(
    `INSERT INTO employees
      (full_name, email, job_title, department, country, salary, employment_type, status, hire_date)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [full_name, email, job_title, department, country, salary, employment_type, status ?? 'active', hire_date]
  )

  res.status(201).json(rows[0])
}

export const getEmployees = async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const pageSize = parseInt(req.query.pageSize) || 20
  const offset = (page - 1) * pageSize
  const { search, country, department, employmentType, status } = req.query

  const conditions = []
  const params = []

  const addFilter = (value, column) => {
    if (value) {
      params.push(value)
      conditions.push(`${column} = $${params.length}`)
    }
  }

  if (search) {
    params.push(`%${search}%`)
    conditions.push(`full_name ILIKE $${params.length}`)
  }
  addFilter(country, 'country')
  addFilter(department, 'department')
  addFilter(employmentType, 'employment_type')
  addFilter(status, 'status')

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const [data, count] = await Promise.all([
    pool.query(`SELECT * FROM employees ${where} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, pageSize, offset]),
    pool.query(`SELECT COUNT(*) FROM employees ${where}`, params),
  ])

  res.json({
    data: data.rows,
    total: parseInt(count.rows[0].count),
    page,
    pageSize,
  })
}

export const getEmployeeById = async (req, res) => {
  const id = parseInt(req.params.id)

  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid employee id' })
  }

  const { rows } = await pool.query(
    'SELECT * FROM employees WHERE id = $1',
    [id]
  )

  if (rows.length === 0) {
    return res.status(404).json({ error: 'Employee not found' })
  }

  res.json(rows[0])
}
