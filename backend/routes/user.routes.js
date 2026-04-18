const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')
const { requireAdmin } = require('../middleware/auth.middleware')

router.get('/', userController.getUsers)
router.get('/:id', userController.getUserById)
router.post('/', requireAdmin, userController.createUser)
router.put('/:id', requireAdmin, userController.updateUser)
router.delete('/:id', requireAdmin, userController.deleteUser)

module.exports = router
