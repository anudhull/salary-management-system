import { Router } from 'express'
import { asyncHandler } from '../middleware/errorHandler.js'
import { getByCountry } from '../controllers/insightsController.js'

const router = Router()

router.get('/by-country', asyncHandler(getByCountry))

export default router
