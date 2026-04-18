require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt')
const db = require('./config/db')
const authRoutes = require('./routes/auth.routes')
const productRoutes = require('./routes/product.routes')
const orderRoutes = require('./routes/order.routes')
const customerRoutes = require('./routes/customer.routes')
const userRoutes = require('./routes/user.routes')
const dashboardRoutes = require('./routes/dashboard.routes')
const reportRoutes = require('./routes/report.routes')
const authMiddleware = require('./middleware/auth.middleware')

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'ERP backend is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/products', authMiddleware.requireAuth, productRoutes)
app.use('/api/orders', authMiddleware.requireAuth, orderRoutes)
app.use('/api/customers', authMiddleware.requireAuth, customerRoutes)
app.use('/api/users', authMiddleware.requireAuth, userRoutes)
app.use('/api/dashboard', authMiddleware.requireAuth, dashboardRoutes)
app.use('/api/reports', authMiddleware.requireAuth, reportRoutes)

app.use((req, res) => {
  res.status(404).json({ error: 'Resource not found' })
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

const port = process.env.PORT || 4000

const ensureDefaultAdmin = async () => {
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@erp.com'
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123'
  const adminUsername = process.env.DEFAULT_ADMIN_USERNAME || 'admin'
  const adminRole = process.env.DEFAULT_ADMIN_ROLE || 'Admin'
  const forceReset = process.env.DEFAULT_ADMIN_FORCE === 'true'

  const [existingAdminRows] = await db.query(
    'SELECT u.id, u.username, u.email, u.password_hash, r.name AS role FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.email = ? OR u.username = ? LIMIT 1',
    [adminEmail, adminUsername],
  )

  const [roleRows] = await db.query('SELECT id FROM roles WHERE name = ? LIMIT 1', [adminRole])
  let roleId
  if (roleRows.length > 0) {
    roleId = roleRows[0].id
  } else {
    const [result] = await db.query('INSERT INTO roles (name) VALUES (?)', [adminRole])
    roleId = result.insertId
  }

  if (existingAdminRows.length === 0) {
    const passwordHash = await bcrypt.hash(adminPassword, 10)
    await db.query(
      'INSERT INTO users (username, email, password_hash, first_name, last_name, phone, role_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [adminUsername, adminEmail, passwordHash, '', '', '', roleId, 'active'],
    )
    console.log(`Seeded default admin: ${adminEmail}`)
    return
  }

  const existingAdmin = existingAdminRows[0]
  const storedHash = existingAdmin.password_hash
  if (!storedHash) {
    if (forceReset) {
      const passwordHash = await bcrypt.hash(adminPassword, 10)
      await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, existingAdmin.id])
      console.log(`Reset admin password for ${adminEmail}`)
    }
    return
  }

  const isMatch = await bcrypt.compare(adminPassword, storedHash)
  if (!isMatch && forceReset) {
    const passwordHash = await bcrypt.hash(adminPassword, 10)
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, existingAdmin.id])
    console.log(`Reset admin password for ${adminEmail}`)
  }
}

const startServer = async () => {
  try {
    await db.query('SELECT 1')
    await ensureDefaultAdmin()
    app.listen(port, () => {
      console.log(`ERP backend listening on http://localhost:${port}`)
    })
  } catch (error) {
    console.error('Unable to connect to the database. Please check your .env settings:')
    console.error(error.message)
    process.exit(1)
  }
}

startServer()
