const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
const AUTH_TOKEN_KEY = 'token'
const AUTH_USER_KEY = 'erp_lite_user'

type ApiResponse<T> = Promise<T>

export type AuthUser = {
  id?: number | string
  username: string
  email: string
  role_id?: number | string
  role?: string
  role_name?: string
}

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  if (!token) return null
  try {
    const [, payload] = token.split('.')
    const decoded = JSON.parse(atob(payload))
    if (decoded.exp && Date.now() / 1000 >= decoded.exp) {
      clearAuth()
      return null
    }
    return token
  } catch {
    clearAuth()
    return null
  }
}

export const getStoredUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(AUTH_USER_KEY)
  if (!raw) return null
  try {
    const user = JSON.parse(raw) as AuthUser
    if (user.role_id == null) {
      const token = getAuthToken()
      if (token) {
        try {
          const [, payload] = token.split('.')
          const decoded = JSON.parse(atob(payload))
          const roleId = decoded?.role_id != null ? Number(decoded.role_id) : undefined
          if (roleId != null) {
            const merged = { ...user, role_id: roleId }
            console.debug('Recovered role_id from token payload:', merged)
            return merged
          }
          if (decoded?.role) {
            const roleIdFromRole = decoded.role.toString().toLowerCase() === 'admin' ? 1 : 2
            const merged = { ...user, role_id: roleIdFromRole }
            console.debug('Recovered role_id from token.role fallback:', merged)
            return merged
          }
        } catch {
          // ignore invalid token payload
        }
      }
    }
    return user
  } catch {
    return null
  }
}

export const setAuth = (token: string, user: AuthUser) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(AUTH_TOKEN_KEY, token)
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

export const clearAuth = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
}

export const login = async (identifier: string, password: string): ApiResponse<{ token: string; user: AuthUser }> => {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifier, password }),
    })
    return checkResponse<{ token: string; user: AuthUser }>(res)
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')
          ? `Unable to reach the auth server at ${API_URL}. Make sure the backend is running.`
          : error.message,
      )
    }
    throw error
  }
}

export const getAuthHeaders = () => {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const authFetch = async (path: string, options: RequestInit = {}) => {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  }

  const token = getAuthToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${path}`, {
    cache: 'no-store',
    ...options,
    headers,
  })

  return response
}

async function checkResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    if (res.status === 401) {
      clearAuth()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    const text = await res.text()
    let errorDetail = text
    try {
      const body = JSON.parse(text)
      errorDetail = body.error || JSON.stringify(body)
    } catch {
      // ignore parse failure and keep raw text
    }
    throw new Error(`API error: ${res.status} ${res.statusText} - ${errorDetail}`)
  }
  return res.json()
}

export type Product = {
  id?: number | string
  name: string
  sku: string
  price: number
  stock: number
  status?: string
}

export type Customer = {
  id?: number | string
  name: string
  email: string
  phone: string
  address: string
  status?: string
  created_at?: string
}

export type User = {
  id?: number | string
  username: string
  email: string
  role_name?: string
  role?: string
  password?: string
  status?: string
  created_at?: string
}

export type OrderItem = {
  product_id: number | string
  quantity: number
  unit_price?: number
  total_price?: number
  product_name?: string
  sku?: string
}

export type Order = {
  id?: number | string
  customer_id: number | string
  customer_name?: string
  total_amount: number
  status?: string
  payment_method?: string | null
  shipping_address?: string | null
  items?: OrderItem[]
  created_at?: string
  updated_at?: string
}

export const getProducts = async (): ApiResponse<Product[]> => {
  const res = await authFetch('/products')
  return checkResponse<Product[]>(res)
}

export const createProduct = async (data: Product): ApiResponse<Product> => {
  const res = await authFetch('/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  return checkResponse<Product>(res)
}

export const updateProduct = async (
  id: number | string,
  data: Partial<Product>,
): ApiResponse<Product> => {
  const res = await authFetch(`/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  return checkResponse<Product>(res)
}

export const deleteProduct = async (id: number | string): ApiResponse<{ message: string }> => {
  const res = await authFetch(`/products/${id}`, {
    method: 'DELETE',
  })
  return checkResponse<{ message: string }>(res)
}

export const getCustomers = async (): ApiResponse<Customer[]> => {
  const res = await authFetch('/customers')
  return checkResponse<Customer[]>(res)
}

export const createCustomer = async (data: Customer): ApiResponse<Customer> => {
  const res = await authFetch('/customers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  return checkResponse<Customer>(res)
}

export const getUsers = async (): ApiResponse<User[]> => {
  const res = await authFetch('/users')
  return checkResponse<User[]>(res)
}

export const createUser = async (data: Partial<User>): ApiResponse<User> => {
  const res = await authFetch('/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  return checkResponse<User>(res)
}

export const updateUser = async (
  id: number | string,
  data: Partial<User>,
): ApiResponse<User> => {
  const res = await authFetch(`/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  return checkResponse<User>(res)
}

export const deleteUser = async (id: number | string): ApiResponse<{ message: string }> => {
  const res = await authFetch(`/users/${id}`, {
    method: 'DELETE',
  })
  return checkResponse<{ message: string }>(res)
}

export const updateCustomer = async (
  id: number | string,
  data: Customer,
): ApiResponse<Customer> => {
  const res = await authFetch(`/customers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  return checkResponse<Customer>(res)
}

export const deleteCustomer = async (id: number | string): ApiResponse<{ message: string }> => {
  const res = await authFetch(`/customers/${id}`, {
    method: 'DELETE',
  })
  return checkResponse<{ message: string }>(res)
}

export const getOrders = async (): ApiResponse<Order[]> => {
  const res = await authFetch('/orders')
  return checkResponse<Order[]>(res)
}

export const getOrderDetails = async (id: number | string): ApiResponse<Order> => {
  const res = await authFetch(`/orders/${id}`)
  return checkResponse<Order>(res)
}

export const createOrder = async (data: {
  customer_id: number | string
  items: Array<{ product_id: number | string; quantity: number }>
  payment_method?: string | null
  shipping_address?: string | null
}): ApiResponse<Order> => {
  const res = await authFetch('/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  return checkResponse<Order>(res)
}

export const confirmOrder = async (id: number | string): ApiResponse<Order> => {
  const res = await authFetch(`/orders/confirm/${id}`, {
    method: 'POST',
  })
  return checkResponse<Order>(res)
}

export const deleteOrder = async (id: number | string): ApiResponse<{ message: string }> => {
  const res = await authFetch(`/orders/${id}`, {
    method: 'DELETE',
  })
  return checkResponse<{ message: string }>(res)
}

// ── Dashboard ──────────────────────────────────────────────────────────────

export type DashboardSummary = {
  totalSales: number
  totalOrders: number
  activeCustomers: number
  totalProducts: number
}

export type SalesOverviewItem = {
  month: string
  sales: number
  orders: number
}

export type RecentTransaction = {
  id: number | string
  customer_name: string
  amount: number
  date: string
  status: string
}

export const getDashboardSummary = async (): ApiResponse<DashboardSummary> => {
  const res = await authFetch('/dashboard/summary')
  return checkResponse<DashboardSummary>(res)
}

export const getDashboardSalesOverview = async (range?: string): ApiResponse<SalesOverviewItem[]> => {
  const url = range ? `/dashboard/sales-overview?range=${range}` : '/dashboard/sales-overview'
  const res = await authFetch(url)
  return checkResponse<SalesOverviewItem[]>(res)
}

export const getDashboardRecentTransactions = async (): ApiResponse<RecentTransaction[]> => {
  const res = await authFetch('/dashboard/recent-transactions')
  return checkResponse<RecentTransaction[]>(res)
}

export type SalesSummary = {
  totalSales: number
  totalTransactions: number
  averageTransaction: number
}

export type DailySalesItem = {
  date: string
  sales: number
}

export type SalesDetailsItem = {
  date: string
  product: string
  quantity: number
  unitPrice: number
  total: number
  customer: string
}

export const getSalesSummary = async (): ApiResponse<SalesSummary> => {
  const res = await authFetch('/reports/sales-summary')
  return checkResponse<SalesSummary>(res)
}

export const getDailySales = async (): ApiResponse<DailySalesItem[]> => {
  const res = await authFetch('/reports/daily-sales')
  return checkResponse<DailySalesItem[]>(res)
}

export const getSalesDetails = async (): ApiResponse<SalesDetailsItem[]> => {
  const res = await authFetch('/reports/sales-details')
  return checkResponse<SalesDetailsItem[]>(res)
}

export const updateOrder = async (
  id: number | string,
  data: Partial<Order>,
): ApiResponse<Order> => {
  const res = await authFetch(`/orders/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  return checkResponse<Order>(res)
}
