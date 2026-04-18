const express = require('express')
const router = express.Router()
const reportController = require('../controllers/report.controller')

router.get('/sales-summary', reportController.getSalesSummary)
router.get('/daily-sales', reportController.getDailySales)
router.get('/sales-details', reportController.getSalesDetails)

module.exports = router
