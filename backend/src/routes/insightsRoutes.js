import { Router } from 'express'
import { asyncHandler } from '../middleware/errorHandler.js'
import { getOverview, getByCountry, getByJobTitle, getRecentHires } from '../controllers/insightsController.js'

const router = Router()

router.get('/overview',      asyncHandler(getOverview))
router.get('/by-country',    asyncHandler(getByCountry))
router.get('/job-title',     asyncHandler(getByJobTitle))
router.get('/recent-hires',  asyncHandler(getRecentHires))

export default router
