import { Router } from 'express'
import { asyncHandler } from '../middleware/errorHandler.js'
import { getByCountry, getByJobTitle } from '../controllers/insightsController.js'

const router = Router()

router.get('/by-country',  asyncHandler(getByCountry))
router.get('/job-title',   asyncHandler(getByJobTitle))

export default router
