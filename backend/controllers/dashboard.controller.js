const db = require('../config/db')

exports.getSummary = async (req, res) => {
  try {
    const [[{ totalSales }]] = await db.query(
      "SELECT COALESCE(SUM(total_amount), 0) AS totalSales FROM orders WHERE status = 'completed'"
    )
    const [[{ totalOrders }]] = await db.query(
      'SELECT COUNT(*) AS totalOrders FROM orders'
    )
    const [[{ activeCustomers }]] = await db.query(
      "SELECT COUNT(*) AS activeCustomers FROM customers WHERE status = 'active'"
    )
    const [[{ totalProducts }]] = await db.query(
      'SELECT COUNT(*) AS totalProducts FROM products'
    )

    res.json({
      totalSales: Number(totalSales),
      totalOrders: Number(totalOrders),
      activeCustomers: Number(activeCustomers),
      totalProducts: Number(totalProducts),
    })
  } catch (error) {
    console.error('Failed to fetch dashboard summary:', error)
    res.status(500).json({ error: 'Unable to retrieve dashboard summary' })
  }
}

exports.getSalesOverview = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        DATE_FORMAT(created_at, '%b') AS month,
        MONTH(created_at) AS month_num,
        YEAR(created_at) AS year,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END), 0) AS sales,
        COUNT(*) AS orders
      FROM orders
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY YEAR(created_at), MONTH(created_at), DATE_FORMAT(created_at, '%b')
      ORDER BY year ASC, month_num ASC
    `)

    res.json(
      rows.map(({ month, sales, orders }) => ({
        month,
        sales: Number(sales),
        orders: Number(orders),
      }))
    )
  } catch (error) {
    console.error('Failed to fetch sales overview:', error)
    res.status(500).json({ error: 'Unable to retrieve sales overview' })
  }
}

exports.getRecentTransactions = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        o.id,
        c.name AS customer_name,
        o.total_amount AS amount,
        o.created_at AS date,
        o.status
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `)

    res.json(rows)
  } catch (error) {
    console.error('Failed to fetch recent transactions:', error)
    res.status(500).json({ error: 'Unable to retrieve recent transactions' })
  }
}
