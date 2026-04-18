const db = require('../config/db')
const bcrypt = require('bcrypt')

const ensureRole = async (roleName) => {
  if (!roleName) {
    throw new Error('Role name is required')
  }

  const [rows] = await db.query('SELECT id FROM roles WHERE name = ?', [roleName])
  if (rows.length > 0) {
    return rows[0].id
  }

  const [result] = await db.query('INSERT INTO roles (name) VALUES (?)', [roleName])
  return result.insertId
}

exports.getUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT u.id, u.username, u.email, u.status, u.created_at, r.name AS role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id ORDER BY u.created_at DESC'
    )
    res.json(rows)
  } catch (error) {
    console.error('Failed to fetch users:', error)
    res.status(500).json({ error: 'Unable to retrieve users' })
  }
}

exports.getUserById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT u.id, u.username, u.email, u.status, u.created_at, r.name AS role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.id = ?',
      [req.params.id]
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(rows[0])
  } catch (error) {
    console.error('Failed to fetch user:', error)
    res.status(500).json({ error: 'Unable to retrieve user' })
  }
}

exports.createUser = async (req, res) => {
  try {
    const { username, email, role_name, status, password } = req.body
    if (!username || !email) {
      return res.status(400).json({ error: 'username and email are required' })
    }

    const roleId = await ensureRole(role_name || 'Staff')
    const passwordToHash = password || 'changeme123'
    const passwordHash = await bcrypt.hash(passwordToHash, 10)
    const [result] = await db.query(
      'INSERT INTO users (username, email, password_hash, first_name, last_name, phone, role_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [username, email, passwordHash, '', '', '', roleId, status || 'active']
    )

    res.status(201).json({
      id: result.insertId,
      username,
      email,
      role_name: role_name || 'Staff',
      status: status || 'active',
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to create user:', error)
    res.status(500).json({ error: error?.message || 'Unable to create user' })
  }
}

exports.updateUser = async (req, res) => {
  try {
    const { username, email, role_name, status, password } = req.body
    const userId = req.params.id
    const roleId = await ensureRole(role_name || 'Staff')

    let query = 'UPDATE users SET username = ?, email = ?, role_id = ?, status = ?'
    const params = [username || '', email || '', roleId, status || 'active']

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10)
      query += ', password_hash = ?'
      params.push(passwordHash)
    }

    query += ' WHERE id = ?'
    params.push(userId)

    const [result] = await db.query(query, params)

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      id: userId,
      username,
      email,
      role_name: role_name || 'Staff',
      status: status || 'active',
    })
  } catch (error) {
    console.error('Failed to update user:', error)
    res.status(500).json({ error: 'Unable to update user' })
  }
}

exports.deleteUser = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [req.params.id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Failed to delete user:', error)
    res.status(500).json({ error: 'Unable to delete user' })
  }
}
