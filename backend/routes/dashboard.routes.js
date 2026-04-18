const express = require('express')
const router = express.Router()
const dashboardController = require('../controllers/dashboard.controller')

router.get('/summary', dashboardController.getSummary)
router.get('/sales-overview', dashboardController.getSalesOverview)
router.get('/recent-transactions', dashboardController.getRecentTransactions)

module.exports = router
