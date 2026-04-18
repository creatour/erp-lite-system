const express = require('express')
const router = express.Router()
const customerController = require('../controllers/customer.controller')
const { requireAdmin } = require('../middleware/auth.middleware')

router.get('/', customerController.getCustomers)
router.get('/:id', customerController.getCustomerById)
router.post('/', requireAdmin, customerController.createCustomer)
router.put('/:id', requireAdmin, customerController.updateCustomer)
router.delete('/:id', requireAdmin, customerController.deleteCustomer)

module.exports = router
