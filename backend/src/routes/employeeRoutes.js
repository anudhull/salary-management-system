import { Router } from 'express'
import { body } from 'express-validator'
import { createEmployee, getEmployees, getEmployeeById, updateEmployee } from '../controllers/employeeController.js'

const router = Router()

const employeeValidation = [
  body('full_name').notEmpty().withMessage('full_name is required'),
  body('email').isEmail().withMessage('valid email is required'),
  body('job_title').notEmpty().withMessage('job_title is required'),
  body('department').notEmpty().withMessage('department is required'),
  body('country').notEmpty().withMessage('country is required'),
  body('salary').isFloat({ min: 0 }).withMessage('salary must be a non-negative number'),
  body('employment_type').isIn(['full-time', 'part-time', 'contract']).withMessage('invalid employment type'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('invalid status'),
  body('hire_date').isISO8601().withMessage('hire_date must be a valid date'),
]

router.get('/', getEmployees)
router.post('/', employeeValidation, createEmployee)
router.get('/:id', getEmployeeById)
router.put('/:id', employeeValidation, updateEmployee)

export default router
