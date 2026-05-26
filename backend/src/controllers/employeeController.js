import { validationResult } from 'express-validator'
import pool from '../config/db.js'
import { isUniqueViolation } from '../middleware/errorHandler.js'

const parseId = (param) => {
  const id = parseInt(param)
  return isNaN(id) || id <= 0 ? null : id
}

export const createEmployee = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const {
    full_name, email, job_title, department,
    country, salary, employment_type, status, hire_date,
  } = req.body

  try {
    const { rows } = await pool.query(
      `INSERT INTO employees
        (full_name, email, job_title, department, country, salary, employment_type, status, hire_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [full_name, email, job_title, department, country, salary, employment_type, status ?? 'active', hire_date]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    if (isUniqueViolation(err)) {
      return res.status(409).json({ error: 'Email already exists' })
    }
    throw err
  }
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
  const id = parseId(req.params.id)

  if (!id) {
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

export const deleteEmployee = async (req, res) => {
  const id = parseId(req.params.id)

  if (!id) {
    return res.status(400).json({ error: 'Invalid employee id' })
  }

  const { rows } = await pool.query(
    'DELETE FROM employees WHERE id = $1 RETURNING id',
    [id]
  )

  if (rows.length === 0) {
    return res.status(404).json({ error: 'Employee not found' })
  }

  res.status(204).send()
}

export const updateEmployee = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const id = parseInt(req.params.id)
  const { full_name, email, job_title, department, country, salary, employment_type, status, hire_date } = req.body

  try {
    const { rows } = await pool.query(
      `UPDATE employees
       SET full_name=$1, email=$2, job_title=$3, department=$4, country=$5,
           salary=$6, employment_type=$7, status=$8, hire_date=$9, updated_at=NOW()
       WHERE id=$10
       RETURNING *`,
      [full_name, email, job_title, department, country, salary, employment_type, status, hire_date, id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' })
    }

    res.json(rows[0])
  } catch (err) {
    if (isUniqueViolation(err)) {
      return res.status(409).json({ error: 'Email already exists' })
    }
    throw err
  }
}
