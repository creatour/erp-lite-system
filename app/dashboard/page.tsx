'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { MainLayout } from '@/components/layout/main-layout'

const MotionDiv = motion.div as any
import { PageHeader } from '@/components/shared/page-header'
import { StatsCard } from '@/components/shared/stats-card'
import { DataTable } from '@/components/shared/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  getDashboardSummary,
  getDashboardSalesOverview,
  getDashboardRecentTransactions,
  DashboardSummary,
  SalesOverviewItem,
  RecentTransaction,
} from '@/lib/api'

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

function getStatusColor(status: string) {
  return STATUS_COLORS[status.toLowerCase()] ?? STATUS_COLORS.pending
}

function getTrendPercentage(current: number, previous: number) {
  if (!previous || previous === 0) {
    return 0
  }
  return Number(((current - previous) / previous * 100).toFixed(1))
}

const sectionMotion = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
}

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [salesOverview, setSalesOverview] = useState<SalesOverviewItem[]>([])
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
  const [loadingSummary, setLoadingSummary] = useState(true)
  const [loadingChart, setLoadingChart] = useState(true)
  const [loadingTransactions, setLoadingTransactions] = useState(true)
  const [selectedRange, setSelectedRange] = useState<'day' | 'week' | 'month' | 'year'>('year')

  const handleRangeChange = (range: 'day' | 'week' | 'month' | 'year') => {
    setLoadingChart(true)
    setSelectedRange(range)
  }

  useEffect(() => {
    getDashboardSummary()
      .then(setSummary)
      .catch((err) => console.error('Failed to load summary:', err))
      .finally(() => setLoadingSummary(false))

    getDashboardSalesOverview(selectedRange)
      .then(setSalesOverview)
      .catch((err) => console.error('Failed to load sales overview:', err))
      .finally(() => setLoadingChart(false))

    getDashboardRecentTransactions()
      .then(setRecentTransactions)
      .catch((err) => console.error('Failed to load recent transactions:', err))
      .finally(() => setLoadingTransactions(false))
  }, [selectedRange])

  const totalSales = salesOverview.reduce((sum, item) => sum + item.sales, 0)
  const latestValue = salesOverview.length > 0 ? salesOverview[salesOverview.length - 1].sales : 0
  const previousValue = salesOverview.length > 1 ? salesOverview[salesOverview.length - 2].sales : 0
  const isPositive = latestValue >= previousValue
  const percentageChange = previousValue > 0 ? ((latestValue - previousValue) / previousValue * 100).toFixed(1) : '0.0'

  const latestOrdersPoint = salesOverview.length > 1 ? salesOverview.at(-1) : null
  const previousOrdersPoint = salesOverview.length > 1 ? salesOverview.at(-2) : null
  const totalOrdersTrend = latestOrdersPoint && previousOrdersPoint
    ? getTrendPercentage(latestOrdersPoint.orders, previousOrdersPoint.orders)
    : 0

  const rangeOptions = [
    { key: 'day' as const, label: '1D' },
    { key: 'week' as const, label: '7D' },
    { key: 'month' as const, label: '1M' },
    { key: 'year' as const, label: '1Y' },
  ]

  const statCards = [
    {
      title: 'Total Sales',
      value: summary?.totalSales ?? 0,
      formattedValue: (
        <CountUp
          end={summary?.totalSales ?? 0}
          duration={1.8}
          separator="," 
          formattingFn={(value: string | number) => formatCurrency(Number(value))}
        />
      ),
      icon: DollarSign,
      variant: 'success',
      trend: {
        value: parseFloat(percentageChange),
        isPositive: isPositive,
      },
    },
    {
      title: 'Total Orders',
      value: summary?.totalOrders ?? 0,
      formattedValue: (
        <CountUp
          end={summary?.totalOrders ?? 0}
          duration={1.8}
          separator="," 
        />
      ),
      icon: ShoppingCart,
      variant: 'default',
      trend: {
        value: totalOrdersTrend,
        isPositive: totalOrdersTrend >= 0,
      },
    },
    {
      title: 'Active Customers',
      value: summary?.activeCustomers ?? 0,
      formattedValue: (
        <CountUp
          end={summary?.activeCustomers ?? 0}
          duration={1.8}
          separator="," 
        />
      ),
      icon: Users,
      variant: 'success',
      trend: {
        value: 6.4,
        isPositive: true,
      },
    },
    {
      title: 'Total Products',
      value: summary?.totalProducts ?? 0,
      formattedValue: (
        <CountUp
          end={summary?.totalProducts ?? 0}
          duration={1.8}
          separator="," 
        />
      ),
      icon: Package,
      variant: 'warning',
      trend: {
        value: 3.2,
        isPositive: true,
      },
    },
  ]

  return (
    <MainLayout>
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's your business overview."
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loadingSummary ? (
          Array.from({ length: 4 }).map((_, i) => (
            <MotionDiv
              key={i}
              initial="hidden"
              animate="visible"
              variants={sectionMotion}
              transition={{ duration: 0.45, delay: i * 0.05, ease: 'easeOut' }}
            >
              <Skeleton className="h-[110px] rounded-lg" />
            </MotionDiv>
          ))
        ) : (
          <>
            {statCards.map((card, index) => (
              <MotionDiv
                key={card.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.07, ease: 'easeOut' }}
                whileHover={{ y: -2, scale: 1.01 }}
              >
                <StatsCard
                  title={card.title}
                  value={card.formattedValue}
                  icon={card.icon}
                  variant={card.variant as 'default' | 'success' | 'warning' | 'danger'}
                  trend={card.trend}
                />
              </MotionDiv>
            ))}
          </>
        )}
      </div>

      {/* Chart */}
      <div className="bg-card border border-border rounded-3xl p-6 mb-8 shadow-sm transition-all duration-500 ease-out">
        <MotionDiv
          className="space-y-4"
          initial="hidden"
          animate="visible"
          variants={sectionMotion}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground/80">Sales Overview</p>
              <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">Performance over the last 12 months</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold">{formatCurrency(totalSales)}</p>
                <p className={`text-sm font-medium ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {isPositive ? '+' : ''}{percentageChange}% from last period
                </p>
              </div>
                {rangeOptions.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => handleRangeChange(option.key)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
                      selectedRange === option.key
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
            </div>
          </div>
          {loadingChart ? (
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
            >
              <Skeleton className="h-[300px] w-full rounded-2xl" />
            </MotionDiv>
          ) : salesOverview.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
              No sales data for selected period.
            </div>
          ) : (
            <ResponsiveContainer key={selectedRange} width="100%" height={300}>
              <AreaChart data={salesOverview} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor={isPositive ? 'var(--color-primary)' : 'var(--color-destructive)'} stopOpacity={0.28} />
                    <stop offset="95%" stopColor={isPositive ? 'var(--color-primary)' : 'var(--color-destructive)'} stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeOpacity={0.04} vertical={false} />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3', stroke: 'var(--color-border)' }}
                  contentStyle={{
                    backgroundColor: 'var(--color-background)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '16px',
                    boxShadow: '0 18px 45px rgba(15, 23, 42, 0.08)',
                  }}
                  labelStyle={{ color: 'var(--color-muted-foreground)', fontSize: 12 }}
                  formatter={(value: number) => [formatCurrency(value), 'Sales']}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke={isPositive ? 'var(--color-primary)' : 'var(--color-destructive)'}
                  strokeWidth={2}
                  fill="url(#salesGradient)"
                  activeDot={{ r: 4, strokeWidth: 2, fill: 'var(--color-background)' }}
                  animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </MotionDiv>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        {loadingTransactions ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded" />
            ))}
          </div>
        ) : (
          <DataTable
            columns={[
              { key: 'id', label: 'Order ID', width: 'w-24' },
              { key: 'customer_name', label: 'Customer', width: 'w-40' },
              {
                key: 'amount',
                label: 'Amount',
                render: (val) => formatCurrency(val as number),
              },
              {
                key: 'date',
                label: 'Date',
                render: (val) => (val ? formatDate(new Date(String(val))) : '-'),
              },
              {
                key: 'status',
                label: 'Status',
                render: (val) => (
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusColor(String(val))}`}
                  >
                    {String(val)}
                  </span>
                ),
              },
            ]}
            data={recentTransactions}
          />
        )}
      </div>
    </MainLayout>
  )
}
