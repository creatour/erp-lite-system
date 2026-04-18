const express = require('express')
const router = express.Router()
const productController = require('../controllers/product.controller')
const { requireAdmin } = require('../middleware/auth.middleware')

router.get('/', productController.getProducts)
router.get('/:id', productController.getProductById)
router.post('/', requireAdmin, productController.createProduct)
router.put('/:id', requireAdmin, productController.updateProduct)
router.delete('/:id', requireAdmin, productController.deleteProduct)

module.exports = router
