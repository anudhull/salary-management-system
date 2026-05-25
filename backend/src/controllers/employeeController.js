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
