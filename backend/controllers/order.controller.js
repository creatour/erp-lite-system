const db = require('../config/db')

const validateOrderPayload = (body) => {
  const errors = []
  const customerId = Number(body.customer_id)

  if (!Number.isInteger(customerId) || customerId <= 0) {
    errors.push('customer_id must be a positive integer')
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    errors.push('items must be a non-empty array')
  }

  const items = Array.isArray(body.items)
    ? body.items.map((item, index) => {
        const productId = Number(item.product_id)
        const quantity = Number(item.quantity)

        if (!Number.isInteger(productId) || productId <= 0) {
          errors.push(`items[${index}].product_id must be a positive integer`)
        }

        if (!Number.isInteger(quantity) || quantity <= 0) {
          errors.push(`items[${index}].quantity must be a positive integer`)
        }

        return {
          product_id: productId,
          quantity,
        }
      })
    : []

  return {
    customerId,
    items,
    status: body.status || 'pending',
    payment_method: body.payment_method || null,
    shipping_address: body.shipping_address || null,
    errors,
  }
}

exports.getOrders = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT o.*, c.name AS customer_name FROM orders o JOIN customers c ON o.customer_id = c.id ORDER BY o.created_at DESC'
    )
    res.json(rows)
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    res.status(500).json({ error: 'Unable to retrieve orders' })
  }
}

exports.getOrderById = async (req, res) => {
  try {
    const [orderRows] = await db.query(
      `SELECT
          o.id,
          o.customer_id,
          o.total_amount,
          o.status,
          o.payment_method,
          o.shipping_address,
          o.created_at,
          o.updated_at,
          c.name AS customer_name,
          c.email AS customer_email,
          c.phone AS customer_phone,
          c.address AS customer_address
        FROM orders o
        JOIN customers c ON o.customer_id = c.id
        WHERE o.id = ?`,
      [req.params.id]
    )

    if (orderRows.length === 0) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const order = orderRows[0]
    const [items] = await db.query(
      `SELECT
          oi.id,
          oi.product_id,
          p.name AS product_name,
          p.sku,
          oi.quantity,
          oi.unit_price,
          oi.total_price
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?`,
      [req.params.id]
    )

    res.json({
      id: order.id,
      customer_id: order.customer_id,
      total_amount: order.total_amount,
      status: order.status,
      payment_method: order.payment_method,
      shipping_address: order.shipping_address,
      created_at: order.created_at,
      updated_at: order.updated_at,
      customer: {
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone,
        address: order.customer_address,
      },
      items,
    })
  } catch (error) {
    console.error('Failed to fetch order:', error)
    res.status(500).json({ error: 'Unable to retrieve order' })
  }
}

exports.createOrder = async (req, res) => {
  const { customerId, items, status, payment_method, shipping_address, errors } = validateOrderPayload(req.body)

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors })
  }

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'items must be a non-empty array' })
  }

  let connection

  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    const [customerRows] = await connection.query(
      'SELECT id FROM customers WHERE id = ?',
      [customerId]
    )

    if (customerRows.length === 0) {
      await connection.rollback()
      return res.status(404).json({ error: 'Customer not found' })
    }

    const productIds = [...new Set(items.map((item) => item.product_id))]
    const placeholders = productIds.map(() => '?').join(',')
    const [productRows] = await connection.query(
      `SELECT id, name, price, stock FROM products WHERE id IN (${placeholders})`,
      productIds
    )

    if (productRows.length !== productIds.length) {
      const foundIds = productRows.map((product) => product.id)
      const missingIds = productIds.filter((id) => !foundIds.includes(id))
      await connection.rollback()
      return res.status(400).json({ error: 'Some ordered products are invalid', invalid_product_ids: missingIds })
    }

    const productMap = productRows.reduce((map, product) => {
      map[product.id] = product
      return map
    }, {})

    const aggregatedItems = items.reduce((map, item) => {
      if (!map[item.product_id]) {
        map[item.product_id] = { product_id: item.product_id, quantity: 0 }
      }
      map[item.product_id].quantity += item.quantity
      return map
    }, {})

    for (const item of Object.values(aggregatedItems)) {
      const product = productMap[item.product_id]
      if (product && item.quantity > product.stock) {
        await connection.rollback()
        return res.status(409).json({
          error: `Insufficient stock for "${product.name}". Requested: ${item.quantity}, available: ${product.stock}.`,
          product_id: product.id,
          available_stock: product.stock,
        })
      }
    }

    const orderItems = Object.values(aggregatedItems).map((item) => {
      const product = productMap[item.product_id]
      const unitPrice = Number(product.price)
      const quantity = Number(item.quantity)
      const totalPrice = Number((unitPrice * quantity).toFixed(2))
      return {
        product_id: item.product_id,
        quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
      }
    })

    const orderTotal = Number(orderItems.reduce((sum, item) => sum + item.total_price, 0).toFixed(2))

    const [orderResult] = await connection.query(
      'INSERT INTO orders (customer_id, total_amount, status, payment_method, shipping_address) VALUES (?, ?, ?, ?, ?)',
      [customerId, orderTotal, 'pending', payment_method, shipping_address]
    )

    const orderId = orderResult.insertId
    const itemRecords = orderItems.map((item) => [orderId, item.product_id, item.quantity, item.unit_price, item.total_price])

    await connection.query(
      'INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES ?',
      [itemRecords]
    )

    await connection.commit()

    const [createdOrderRows] = await connection.query(
      `SELECT o.*, c.name AS customer_name FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.id = ?`,
      [orderId]
    )

    const createdOrder = createdOrderRows[0]

    res.status(201).json({
      id: createdOrder.id,
      customer_id: createdOrder.customer_id,
      customer_name: createdOrder.customer_name,
      total_amount: createdOrder.total_amount,
      status: createdOrder.status,
      payment_method: createdOrder.payment_method,
      shipping_address: createdOrder.shipping_address,
      created_at: createdOrder.created_at,
      updated_at: createdOrder.updated_at,
      items: orderItems,
    })
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback()
      } catch (rollbackError) {
        console.error('Failed to rollback order transaction:', rollbackError)
      }
    }

    console.error('Failed to create order:', error)
    res.status(500).json({ error: 'Unable to create order' })
  } finally {
    if (connection) {
      connection.release()
    }
  }
}

exports.confirmOrder = async (req, res) => {
  const orderId = Number(req.params.id)

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return res.status(400).json({ error: 'Invalid order id' })
  }

  let connection

  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    const [orderRows] = await connection.query(
      'SELECT id, status FROM orders WHERE id = ? FOR UPDATE',
      [orderId]
    )

    if (orderRows.length === 0) {
      await connection.rollback()
      return res.status(404).json({ error: 'Order not found' })
    }

    const order = orderRows[0]

    if (order.status === 'completed') {
      await connection.rollback()
      return res.status(400).json({ error: 'Order is already completed' })
    }

    const [items] = await connection.query(
      `SELECT
          oi.product_id,
          oi.quantity,
          p.stock
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ? FOR UPDATE`,
      [orderId]
    )

    if (items.length === 0) {
      await connection.rollback()
      return res.status(400).json({ error: 'Order has no items to confirm' })
    }

    const insufficientItem = items.find((item) => item.stock < item.quantity)
    if (insufficientItem) {
      await connection.rollback()
      return res.status(409).json({ error: 'Insufficient stock', product_id: insufficientItem.product_id })
    }

    for (const item of items) {
      await connection.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      )
    }

    await connection.query(
      "UPDATE orders SET status = 'completed' WHERE id = ?",
      [orderId]
    )

    await connection.commit()

    const [updatedOrderRows] = await connection.query(
      `SELECT o.*, c.name AS customer_name FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.id = ?`,
      [orderId]
    )

    const updatedOrder = updatedOrderRows[0]

    res.json({
      id: updatedOrder.id,
      status: updatedOrder.status,
      customer_id: updatedOrder.customer_id,
      customer_name: updatedOrder.customer_name,
      total_amount: updatedOrder.total_amount,
      payment_method: updatedOrder.payment_method,
      shipping_address: updatedOrder.shipping_address,
      created_at: updatedOrder.created_at,
      updated_at: updatedOrder.updated_at,
    })
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback()
      } catch (rollbackError) {
        console.error('Failed to rollback confirm order transaction:', rollbackError)
      }
    }

    console.error('Failed to confirm order:', error)
    res.status(500).json({ error: 'Unable to confirm order' })
  } finally {
    if (connection) {
      connection.release()
    }
  }
}

const ALLOWED_ORDER_STATUSES = ['pending', 'processing', 'completed', 'cancelled', 'returned']

// Hook: called when an order transitions to 'cancelled'.
// Extend this in the future to roll back stock deductions for completed orders.
async function onOrderCancelled(connection, orderId) {
  // TODO: if order was previously 'completed', restore stock for each order_item
  console.log(`[ERP] Order ${orderId} marked as cancelled. Stock rollback hook ready for implementation.`)
}

exports.updateOrder = async (req, res) => {
  const orderId = req.params.id

  // ── Debug logging ──────────────────────────────────────────────────────────
  console.log(`[updateOrder] order id   : ${orderId}`)
  console.log(`[updateOrder] req.body   :`, req.body)
  console.log(`[updateOrder] status     : ${req.body.status}`)

  const { status } = req.body

  // ── Validate status ────────────────────────────────────────────────────────
  if (!status) {
    return res.status(400).json({ error: 'status is required' })
  }

  if (!ALLOWED_ORDER_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Invalid status "${status}". Allowed values: ${ALLOWED_ORDER_STATUSES.join(', ')}`,
    })
  }

  let connection

  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    // ── Fetch current order ────────────────────────────────────────────────
    const [orderRows] = await connection.query(
      'SELECT id, status FROM orders WHERE id = ? FOR UPDATE',
      [orderId]
    )

    if (orderRows.length === 0) {
      await connection.rollback()
      return res.status(404).json({ error: 'Order not found' })
    }

    const currentStatus = orderRows[0].status

    // ── Business rules ─────────────────────────────────────────────────────
    if (currentStatus === 'completed' && status !== 'completed') {
      await connection.rollback()
      return res.status(400).json({ error: 'Cannot modify a completed order' })
    }

    if (currentStatus === 'cancelled' && status !== 'cancelled') {
      await connection.rollback()
      return res.status(400).json({ error: 'Cannot modify a cancelled order' })
    }

    // Transitioning to completed via updateOrder requires stock check (use confirmOrder instead)
    if (status === 'completed' && currentStatus !== 'completed') {
      await connection.rollback()
      return res.status(400).json({
        error: 'Use the confirm endpoint (POST /orders/confirm/:id) to complete an order',
      })
    }

    // ── Safe parameterized status-only update ──────────────────────────────
    const [result] = await connection.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, orderId]
    )

    if (result.affectedRows === 0) {
      await connection.rollback()
      return res.status(404).json({ error: 'Order not found' })
    }

    // ── Post-update hooks ──────────────────────────────────────────────────
    if (status === 'cancelled') {
      await onOrderCancelled(connection, orderId)
    }

    await connection.commit()

    // Return the full updated order row
    const [updatedRows] = await connection.query(
      'SELECT o.*, c.name AS customer_name FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.id = ?',
      [orderId]
    )

    const updated = updatedRows[0]
    res.json({
      id: updated.id,
      customer_id: updated.customer_id,
      customer_name: updated.customer_name,
      total_amount: updated.total_amount,
      status: updated.status,
      payment_method: updated.payment_method,
      shipping_address: updated.shipping_address,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    })
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback()
      } catch (rollbackError) {
        console.error('[updateOrder] Failed to rollback transaction:', rollbackError)
      }
    }
    console.error('[updateOrder] Failed to update order:', error)
    res.status(500).json({ error: 'Unable to update order', message: error.message })
  } finally {
    if (connection) {
      connection.release()
    }
  }
}

exports.deleteOrder = async (req, res) => {
  let connection

  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    await connection.query('DELETE FROM order_items WHERE order_id = ?', [req.params.id])
    const [result] = await connection.query('DELETE FROM orders WHERE id = ?', [req.params.id])

    if (result.affectedRows === 0) {
      await connection.rollback()
      return res.status(404).json({ error: 'Order not found' })
    }

    await connection.commit()
    res.json({ message: 'Order deleted successfully' })
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback()
      } catch (rollbackError) {
        console.error('Failed to rollback delete order transaction:', rollbackError)
      }
    }
    console.error('Failed to delete order:', error)
    res.status(500).json({ error: 'Unable to delete order' })
  } finally {
    if (connection) {
      connection.release()
    }
  }
}
