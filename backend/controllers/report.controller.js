const db = require('../config/db')

exports.getSalesSummary = async (req, res) => {
  try {
    const [[{ totalSales, totalTransactions, averageTransaction }]] = await db.query(
      `SELECT
        COALESCE(SUM(total_amount), 0) AS totalSales,
        COUNT(id) AS totalTransactions,
        COALESCE(SUM(total_amount) / NULLIF(COUNT(id), 0), 0) AS averageTransaction
      FROM orders
      WHERE status = 'completed'`
    )

    res.json({
      totalSales: Number(totalSales),
      totalTransactions: Number(totalTransactions),
      averageTransaction: Number(averageTransaction),
    })
  } catch (error) {
    console.error('Failed to fetch sales summary:', error)
    res.status(500).json({ error: 'Unable to retrieve sales summary' })
  }
}

exports.getDailySales = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
        DATE(o.created_at) AS date,
        COALESCE(SUM(o.total_amount), 0) AS sales
      FROM orders o
      WHERE o.status = 'completed'
      GROUP BY DATE(o.created_at)
      ORDER BY DATE(o.created_at) ASC`
    )

    res.json(
      rows.map((row) => ({
        date: row.date,
        sales: Number(row.sales),
      }))
    )
  } catch (error) {
    console.error('Failed to fetch daily sales:', error)
    res.status(500).json({ error: 'Unable to retrieve daily sales' })
  }
}

exports.getSalesDetails = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
        DATE(o.created_at) AS date,
        p.name AS product,
        oi.quantity,
        oi.unit_price AS unitPrice,
        oi.total_price AS total,
        c.name AS customer
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      JOIN customers c ON o.customer_id = c.id
      WHERE o.status = 'completed'
      ORDER BY o.created_at DESC`
    )

    res.json(
      rows.map((row) => ({
        date: row.date,
        product: row.product,
        quantity: Number(row.quantity),
        unitPrice: Number(row.unitPrice),
        total: Number(row.total),
        customer: row.customer,
      }))
    )
  } catch (error) {
    console.error('Failed to fetch sales details:', error)
    res.status(500).json({ error: 'Unable to retrieve sales details' })
  }
}
