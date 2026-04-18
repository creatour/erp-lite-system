const db = require('../config/db')

exports.getProducts = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products')
    res.json(rows)
  } catch (error) {
    console.error('Failed to fetch products:', error)
    res.status(500).json({ error: 'Unable to retrieve products' })
  }
}

exports.getProductById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json(rows[0])
  } catch (error) {
    console.error('Failed to fetch product:', error)
    res.status(500).json({ error: 'Unable to retrieve product' })
  }
}

exports.createProduct = async (req, res) => {
  try {
    const { name, sku, price, stock } = req.body
    const [result] = await db.query(
      'INSERT INTO products (name, sku, price, stock) VALUES (?, ?, ?, ?)',
      [name, sku, parseFloat(price), parseInt(stock, 10)]
    )
    res.status(201).json({
      id: result.insertId,
      name,
      sku,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
    })
  } catch (error) {
    console.error('Failed to create product:', error)
    res.status(500).json({ error: 'Unable to create product' })
  }
}

exports.updateProduct = async (req, res) => {
  try {
    const { name, sku, price, stock } = req.body
    const [result] = await db.query(
      'UPDATE products SET name = ?, sku = ?, price = ?, stock = ? WHERE id = ?',
      [name, sku, parseFloat(price), parseInt(stock, 10), req.params.id]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json({ id: req.params.id, name, sku, price: parseFloat(price), stock: parseInt(stock, 10) })
  } catch (error) {
    console.error('Failed to update product:', error)
    res.status(500).json({ error: 'Unable to update product' })
  }
}

exports.deleteProduct = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [req.params.id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Failed to delete product:', error)
    res.status(500).json({ error: 'Unable to delete product' })
  }
}
