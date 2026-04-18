'use client'

import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { Button } from '@/components/ui/button'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Download, TrendingUp } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getSalesSummary, getDailySales, getSalesDetails, SalesSummary, DailySalesItem, SalesDetailsItem } from '@/lib/api'

interface SalesReport {
  date: string
  product: string
  quantity: number
  unitPrice: number
  total: number
  customer: string
}

export default function ReportsPage() {
  const [startDate] = useState<Date>(new Date('2024-01-01'))
  const [endDate] = useState<Date>(new Date('2024-01-31'))

  const [summary, setSummary] = useState<SalesSummary | null>(null)
  const [dailySales, setDailySales] = useState<DailySalesItem[]>([])
  const [salesDetails, setSalesDetails] = useState<SalesReport[]>([])
  const [loadingSummary, setLoadingSummary] = useState(true)
  const [loadingChart, setLoadingChart] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(true)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [dailySalesError, setDailySalesError] = useState<string | null>(null)
  const [detailsError, setDetailsError] = useState<string | null>(null)

  useEffect(() => {
    getSalesSummary()
      .then(setSummary)
      .catch((err) => {
        console.error('Failed to load sales summary:', err)
        setSummaryError(err instanceof Error ? err.message : 'Unable to load sales summary')
      })
      .finally(() => setLoadingSummary(false))

    getDailySales()
      .then(setDailySales)
      .catch((err) => {
        console.error('Failed to load daily sales:', err)
        setDailySalesError(err instanceof Error ? err.message : 'Unable to load daily sales')
      })
      .finally(() => setLoadingChart(false))

    getSalesDetails()
      .then(setSalesDetails)
      .catch((err) => {
        console.error('Failed to load sales details:', err)
        setDetailsError(err instanceof Error ? err.message : 'Unable to load sales details')
      })
      .finally(() => setLoadingDetails(false))
  }, [])

  const totalSales = summary?.totalSales ?? 0
  const totalTransactions = summary?.totalTransactions ?? 0
  const averageTransaction = summary?.averageTransaction ?? 0

  const handleExport = () => {
    const csv = [
      ['Date', 'Product', 'Quantity', 'Unit Price', 'Total', 'Customer'],
      ...salesDetails.map((item) => [
        formatDate(new Date(item.date)),
        item.product,
        item.quantity,
        `$${item.unitPrice}`,
        `$${item.total}`,
        item.customer,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sales-report.csv'
    a.click()
  }

  return (
    <MainLayout>
      <PageHeader
        title="Sales Reports"
        description="Analyze your sales performance and trends."
        action={
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download size={18} />
            Export CSV
          </Button>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Sales
              </p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {formatCurrency(totalSales)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {formatDate(startDate)} to {formatDate(endDate)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Total Transactions
          </p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {loadingSummary ? '...' : totalTransactions}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Completed orders
          </p>
          {summaryError ? (
            <p className="mt-2 text-sm text-destructive">{summaryError}</p>
          ) : null}
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Average Transaction
          </p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {loadingSummary ? '...' : formatCurrency(averageTransaction)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Per order
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Daily Sales Trend</h2>
        {loadingChart ? (
          <div className="h-[300px] w-full">
            <div className="h-full rounded-lg bg-slate-100 dark:bg-slate-800" />
          </div>
        ) : dailySalesError ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
            {dailySalesError}
          </div>
        ) : dailySales.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
            No sales data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                }}
              />
              <Legend />
              <Bar
                dataKey="sales"
                fill="var(--color-primary)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Sales Table */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Sales Details</h2>
        </div>
        {loadingDetails ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-10 rounded bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : detailsError ? (
          <div className="p-6 rounded-lg border border-destructive/20 bg-destructive/5 text-sm text-destructive">
            {detailsError}
          </div>
        ) : (
          <DataTable
            columns={[
              {
                key: 'date',
                label: 'Date',
                render: (val) => formatDate(new Date(String(val))),
              },
              { key: 'product', label: 'Product', width: 'w-32' },
              { key: 'quantity', label: 'Qty', width: 'w-16' },
              {
                key: 'unitPrice',
                label: 'Unit Price',
                render: (val) => formatCurrency(val as number),
              },
              {
                key: 'total',
                label: 'Total',
                render: (val) => (
                  <span className="font-semibold">
                    {formatCurrency(val as number)}
                  </span>
                ),
              },
              { key: 'customer', label: 'Customer', width: 'w-40' },
            ]}
            data={salesDetails}
          />
        )}
      </div>
    </MainLayout>
  )
}
