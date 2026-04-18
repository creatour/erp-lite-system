'use client'

import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { ModalForm } from '@/components/shared/modal-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Eye, Trash2, AlertCircle, Package } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { createOrder, confirmOrder, deleteOrder, getCustomers, getOrderDetails, getOrders, getProducts, getStoredUser, updateOrder, Customer, Order, OrderItem, Product } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

const initialOrder: Partial<Order> = {
  customer_id: '',
  total_amount: 0,
  status: 'pending',
}

const initialOrderItem = { product_id: '', quantity: 1 }

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newOrder, setNewOrder] = useState<Partial<Order>>(initialOrder)
  const [newOrderItems, setNewOrderItems] = useState<Array<{ product_id: string; quantity: number }>>([initialOrderItem])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [authUser, setAuthUser] = useState<{ role_id?: number | string } | null>(null)

  useEffect(() => {
    fetchOrders()
    fetchCustomers()
    fetchProducts()
    setAuthUser(getStoredUser())
  }, [])

  const isStaff = Number(authUser?.role_id) === 2

  const fetchCustomers = async () => {
    try {
      const data = await getCustomers()
      setCustomers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const data = await getProducts()
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setProducts([])
    }
  }

  const fetchOrders = async () => {
    try {
      const data = await getOrders()
      setOrders(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    }
  }

  const filteredOrders =
    statusFilter === 'all'
      ? orders
      : orders.filter((o) => o.status === statusFilter)

  const handleViewOrder = async (order: Order) => {
    if (!order.id) return

    try {
      const detail = await getOrderDetails(order.id)
      setSelectedOrder(detail)
      setIsModalOpen(true)
    } catch (error) {
      console.error('Failed to load order details:', error)
      toast({
        title: 'Unable to load order',
        description: 'Could not fetch order details.',
        variant: 'destructive',
      })
    }
  }

  const handleAddOrder = async () => {
    if (isStaff) return
    await fetchProducts()
    setNewOrder(initialOrder)
    setNewOrderItems([initialOrderItem])
    setIsCreateModalOpen(true)
  }

  const handleCreateOrder = async () => {
    if (!newOrder.customer_id) {
      toast({
        title: 'Missing customer',
        description: 'Please select a customer before saving.',
        variant: 'destructive',
      })
      return
    }

    const items = newOrderItems
      .filter((item) => item.product_id)
      .map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
      }))

    if (items.length === 0) {
      toast({
        title: 'Missing items',
        description: 'Please add at least one product to the order.',
        variant: 'destructive',
      })
      return
    }

    if (items.some((item) => item.quantity <= 0)) {
      toast({
        title: 'Invalid quantity',
        description: 'All product quantities must be greater than 0.',
        variant: 'destructive',
      })
      return
    }

    // Frontend stock guard
    const overStockItem = newOrderItems.find((item) => {
      if (!item.product_id) return false
      const product = products.find((p) => String(p.id) === item.product_id)
      return product ? item.quantity > product.stock : false
    })
    if (overStockItem) {
      const product = products.find((p) => String(p.id) === overStockItem.product_id)
      toast({
        title: 'Quantity exceeds stock',
        description: `"${product?.name}" only has ${product?.stock} pcs available.`,
        variant: 'destructive',
      })
      return
    }

    try {
      const created = await createOrder({
        customer_id: newOrder.customer_id,
        items,
      })

      setOrders([created, ...orders])
      setIsCreateModalOpen(false)
      setNewOrder(initialOrder)
      setNewOrderItems([initialOrderItem])
      toast({
        title: 'Order created',
        description: 'New order was saved to the database.',
      })
    } catch (error) {
      console.error('Failed to create order:', error)
      const message = error instanceof Error ? error.message : 'Unable to save the new order.'
      toast({
        title: 'Failed to create order',
        description: message,
        variant: 'destructive',
      })
    }
  }

  const handleDeleteOrder = async (orderId: number | string | undefined) => {
    if (!orderId) return

    try {
      await deleteOrder(orderId)
      setOrders(orders.filter((o) => o.id !== orderId))
      toast({
        title: 'Order deleted',
        description: 'Order was removed from the database.',
      })
    } catch (error) {
      console.error('Failed to delete order:', error)
      toast({
        title: 'Failed to delete order',
        description: 'Unable to delete the order.',
        variant: 'destructive',
      })
    }
  }

  const handleStatusChange = async (orderId: number | string, newStatus: string) => {
    try {
      let updated

      if (newStatus === 'completed') {
        updated = await confirmOrder(orderId)
      } else {
        updated = await updateOrder(orderId, { status: newStatus })
      }

      setOrders(
        orders.map((o) =>
          o.id === orderId ? { ...o, status: updated.status ?? o.status } : o
        ),
      )
      toast({
        title: 'Order updated',
        description: 'Order status was saved to the database.',
      })
    } catch (error) {
      console.error('Failed to update order:', error)
      const message = error instanceof Error ? error.message : 'Unable to save order status.'
      toast({
        title: 'Failed to update order',
        description: message,
        variant: 'destructive',
      })
    }
  }

  const newOrderTotal = newOrderItems.reduce((sum, item) => {
    const product = products.find((product) => String(product.id) === item.product_id)
    return sum + (product?.price ?? 0) * item.quantity
  }, 0)

  const handleNewOrderItemChange = (index: number, field: 'product_id' | 'quantity', value: string | number) => {
    setNewOrderItems((current) =>
      current.map((item, idx) => {
        if (idx !== index) return item
        return {
          ...item,
          [field]: field === 'quantity' ? Number(value) : String(value),
        }
      }),
    )
  }

  const addNewOrderItem = () => {
    setNewOrderItems((current) => [...current, { ...initialOrderItem }])
  }

  const removeNewOrderItem = (index: number) => {
    setNewOrderItems((current) => current.filter((_, idx) => idx !== index))
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'processing':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      default:
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }
  }

  return (
    <MainLayout>
      <PageHeader
        title="Orders Management"
        description="Track and manage all customer orders."
        action={
          <Button onClick={handleAddOrder} className="gap-2" disabled={isStaff}>
            Add Order
          </Button>
        }
      />

      <div className="mb-6 w-full md:w-48">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <DataTable
          columns={[
            { key: 'id', label: 'Order ID', width: 'w-24' },
            { key: 'customer_name', label: 'Customer', width: 'w-40' },
            {
              key: 'created_at',
              label: 'Date',
              render: (val) =>
                val ? formatDate(new Date(String(val))) : '-',
            },
            {
              key: 'total_amount',
              label: 'Amount',
              render: (val) => formatCurrency(val as number),
            },
            {
              key: 'status',
              label: 'Status',
              render: (val, order) => {
                const status = String(val)
                const isTerminal = status === 'completed' || status === 'cancelled'
                return (
                <Select
                  value={status}
                  disabled={isTerminal}
                  onValueChange={(newStatus) => {
                    const orderId = (order as Order).id
                    if (orderId != null) {
                      handleStatusChange(orderId, newStatus)
                    }
                  }}
                >
                  <SelectTrigger className={`w-32 ${getStatusBadgeColor(String(val))}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                )
              },
            },
            {
              key: 'id',
              label: 'Actions',
              render: (_, order) => (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewOrder(order as Order)}
                    className="p-2 hover:bg-muted rounded transition-colors"
                  >
                    <Eye size={16} className="text-primary" />
                  </button>
                  <button
                    onClick={() => handleDeleteOrder((order as Order).id)}
                    disabled={isStaff}
                    className="p-2 hover:bg-muted rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                  </button>
                </div>
              ),
            },
          ]}
          data={filteredOrders}
        />
      </div>

      <ModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Order Details - ${selectedOrder?.id}`}
      >
        {selectedOrder ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Customer</label>
                <p className="font-medium">{selectedOrder.customer_name}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Order Date</label>
                <p className="font-medium">
                  {selectedOrder.created_at
                    ? formatDate(new Date(selectedOrder.created_at))
                    : '-'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Total Amount</label>
                <p className="font-medium">{formatCurrency(selectedOrder.total_amount)}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Status</label>
                <p
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium mt-2 ${getStatusBadgeColor(
                    String(selectedOrder.status),
                  )}`}
                >
                  {selectedOrder.status}
                </p>
              </div>
            </div>

            {selectedOrder.items && selectedOrder.items.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold mt-4 mb-2">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={`${item.product_id}-${item.quantity}`} className="rounded-lg border border-border p-3">
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">{item.product_name || `Product #${item.product_id}`}</p>
                          <p className="text-xs text-muted-foreground">SKU: {item.sku || '-'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{formatCurrency(item.total_price ?? 0)}</p>
                          <p className="text-xs text-muted-foreground">{item.quantity} pcs</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="pt-4 border-t border-border">
              {selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' ? (
                <Button
                  type="button"
                  onClick={async () => {
                    if (!selectedOrder.id) return
                    try {
                      const confirmed = await confirmOrder(selectedOrder.id)
                      setSelectedOrder(confirmed)
                      setOrders(
                        orders.map((o) =>
                          o.id === selectedOrder.id ? { ...o, status: confirmed.status ?? o.status } : o
                        ),
                      )
                      toast({
                        title: 'Order confirmed',
                        description: 'Stock has been deducted and the order is now completed.',
                      })
                    } catch (error) {
                      console.error('Failed to confirm order:', error)
                      const message = error instanceof Error ? error.message : 'Unable to confirm order.'
                      toast({
                        title: 'Failed to confirm order',
                        description: message,
                        variant: 'destructive',
                      })
                    }
                  }}
                >
                  Confirm Order
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Order confirmed and ready for processing.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </ModalForm>

      {/* ── Create New Order Modal ─────────────────────────────────────────── */}
      {(() => {
        const hasStockError = newOrderItems.some((item) => {
          if (!item.product_id) return false
          const p = products.find((p) => String(p.id) === item.product_id)
          return p ? item.quantity > p.stock : false
        })

        return (
          <ModalForm
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            title="Create New Order"
            onSubmit={handleCreateOrder}
            submitLabel="Create Order"
            submitDisabled={hasStockError}
            size="lg"
          >
            <div className="space-y-6">

              {/* ── Customer ─────────────────────────────────────────────── */}
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Customer</h3>
                <Select
                  value={String(newOrder.customer_id || '')}
                  onValueChange={(value) =>
                    setNewOrder({ ...newOrder, customer_id: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a customer…" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={String(customer.id)}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* ── Order Items ───────────────────────────────────────────── */}
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Order Items</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Select products and set quantities.</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addNewOrderItem}>
                    + Add Product
                  </Button>
                </div>

                {newOrderItems.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
                    <Package size={28} className="opacity-40" />
                    <p className="text-sm">Add at least one product to continue.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Column headers */}
                    <div className="grid grid-cols-[1fr_120px_110px_48px] gap-3 px-1">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Product</span>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quantity</span>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Line Total</span>
                      <span />
                    </div>

                    {newOrderItems.map((item, index) => {
                      const product = products.find((p) => String(p.id) === item.product_id)
                      const stock = product?.stock ?? Infinity
                      const unitPrice = product?.price ?? 0
                      const lineTotal = Number((unitPrice * item.quantity).toFixed(2))
                      const isOverStock = product ? item.quantity > stock : false
                      const remaining = product ? stock - item.quantity : null

                      return (
                        <div key={index} className="space-y-1.5">
                          <div className="grid grid-cols-[1fr_120px_110px_48px] gap-3 items-start">
                            {/* Product selector */}
                            <div className="space-y-1">
                              <Select
                                value={item.product_id}
                                onValueChange={(value) => handleNewOrderItemChange(index, 'product_id', value)}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Choose product…" />
                                </SelectTrigger>
                                <SelectContent>
                                  {products.map((opt) => (
                                    <SelectItem key={opt.id} value={String(opt.id)}>
                                      <span>{opt.name}</span>
                                      <span className="ml-2 text-xs text-muted-foreground">({opt.stock} in stock)</span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {product && (
                                <p className="text-xs text-muted-foreground pl-0.5">
                                  {formatCurrency(product.price)} / pc · {product.stock} pcs available
                                </p>
                              )}
                            </div>

                            {/* Quantity input */}
                            <div className="space-y-1">
                              <Input
                                type="number"
                                min={1}
                                max={product ? product.stock : undefined}
                                value={item.quantity}
                                onChange={(e) =>
                                  handleNewOrderItemChange(index, 'quantity', Number(e.target.value))
                                }
                                className={isOverStock ? 'border-red-500 focus-visible:ring-red-500' : ''}
                              />
                              {product && !isOverStock && remaining !== null && remaining >= 0 && (
                                <p className="text-xs text-muted-foreground pl-0.5">{remaining} remaining</p>
                              )}
                            </div>

                            {/* Line total */}
                            <div>
                              <Input
                                readOnly
                                value={product ? formatCurrency(lineTotal) : '—'}
                                className="bg-muted/50 text-right font-medium"
                              />
                            </div>

                            {/* Remove */}
                            <button
                              type="button"
                              onClick={() => removeNewOrderItem(index)}
                              className="mt-0.5 h-10 w-10 flex items-center justify-center rounded-md border border-border text-destructive hover:bg-destructive/10 transition-colors"
                              aria-label="Remove item"
                            >
                              ×
                            </button>
                          </div>

                          {/* Stock error */}
                          {isOverStock && (
                            <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 pl-0.5">
                              <AlertCircle size={13} />
                              <span className="text-xs font-medium">
                                Quantity exceeds available stock ({product?.stock} pcs available).
                              </span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* ── Order Summary ─────────────────────────────────────────── */}
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Order Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Amount</label>
                    <div className="text-xl font-bold text-foreground">{formatCurrency(newOrderTotal)}</div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</label>
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                      Pending
                    </span>
                  </div>
                </div>

                {hasStockError && (
                  <div className="mt-4 flex items-center gap-2 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2">
                    <AlertCircle size={14} className="text-red-600 dark:text-red-400 shrink-0" />
                    <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                      Fix stock quantity errors above before creating the order.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </ModalForm>
        )
      })()}
    </MainLayout>
  )
}
