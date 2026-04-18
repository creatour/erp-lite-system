const db = require('../config/db')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body
    if (!identifier || !password) {
      return res.status(400).json({ error: 'identifier and password are required' })
    }

    const [rows] = await db.query(
      'SELECT u.id, u.username, u.email, u.password_hash, r.id AS role_id, r.name AS role FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.email = ? OR u.username = ? LIMIT 1',
      [identifier, identifier]
    )

    if (rows.length === 0) {
      console.warn('Login failed: user not found for', identifier)
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const user = rows[0]
    const storedHash = user.password_hash
    if (!storedHash) {
      console.warn('Login failed: no password hash for user', identifier)
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, storedHash)
    if (!isMatch) {
      console.warn('Login failed: password mismatch for', identifier)
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const roleId = Number(user.role_id) || (user.role?.toString().toLowerCase() === 'admin' ? 1 : 2)
    const normalizedRole = roleId === 1 ? 'Admin' : 'Staff'
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role_id: roleId,
        role: normalizedRole,
      },
      process.env.JWT_SECRET || 'default_jwt_secret',
      {
        expiresIn: '1d',
      }
    )

    const responseUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role_id: roleId,
      role: normalizedRole,
    }

    console.debug('Login success response user:', responseUser)

    res.json({
      token,
      user: responseUser,
    })
  } catch (error) {
    console.error('Login failed:', error)
    res.status(500).json({ error: 'Unable to authenticate user' })
  }
}
