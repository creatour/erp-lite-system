const db = require('../config/db')

exports.getCustomers = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM customers')
    res.json(rows)
  } catch (error) {
    console.error('Failed to fetch customers:', error)
    res.status(500).json({ error: 'Unable to retrieve customers' })
  }
}

exports.getCustomerById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM customers WHERE id = ?', [req.params.id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' })
    }
    res.json(rows[0])
  } catch (error) {
    console.error('Failed to fetch customer:', error)
    res.status(500).json({ error: 'Unable to retrieve customer' })
  }
}

exports.createCustomer = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body
    const [result] = await db.query(
      'INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)',
      [name, email, phone, address]
    )
    res.status(201).json({
      id: result.insertId,
      name,
      email,
      phone,
      address,
    })
  } catch (error) {
    console.error('Failed to create customer:', error)
    res.status(500).json({ error: 'Unable to create customer' })
  }
}

exports.updateCustomer = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body
    const [result] = await db.query(
      'UPDATE customers SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?',
      [name, email, phone, address, req.params.id]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Customer not found' })
    }
    res.json({ id: req.params.id, name, email, phone, address })
  } catch (error) {
    console.error('Failed to update customer:', error)
    res.status(500).json({ error: 'Unable to update customer' })
  }
}

exports.deleteCustomer = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM customers WHERE id = ?', [req.params.id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Customer not found' })
    }
    res.json({ message: 'Customer deleted successfully' })
  } catch (error) {
    console.error('Failed to delete customer:', error)
    res.status(500).json({ error: 'Unable to delete customer' })
  }
}
