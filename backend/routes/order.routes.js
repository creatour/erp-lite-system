const express = require('express')
const router = express.Router()
const orderController = require('../controllers/order.controller')
const { requireAdmin } = require('../middleware/auth.middleware')

router.get('/', orderController.getOrders)
router.get('/:id', orderController.getOrderById)
router.post('/', requireAdmin, orderController.createOrder)
router.post('/confirm/:id', requireAdmin, orderController.confirmOrder)
router.put('/:id', requireAdmin, orderController.updateOrder)
router.delete('/:id', requireAdmin, orderController.deleteOrder)

module.exports = router
