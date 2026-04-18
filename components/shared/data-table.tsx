'use client'

import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface Column<T> {
  key: keyof T
  label: string
  render?: (value: any, item: T) => React.ReactNode
  width?: string
}

interface DataTableProps<T extends Record<string, any>> {
  columns: Column<T>[]
  data?: T[] | null
  onRowClick?: (item: T) => void
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
}: DataTableProps<T>) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="border border-border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border">
            {columns.map((col, idx) => (
              <TableHead
                key={`${String(col.key)}-${idx}`}
                className={cn('bg-muted/50 font-semibold', col.width)}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((item, rowIndex) => {
            // SAFE KEY STRATEGY (ERP STYLE)
            const rowKey =
              item?.id ??
              item?.ID ??
              item?.uuid ??
              `${rowIndex}`

            return (
              <TableRow
                key={rowKey}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  'border-b border-border',
                  onRowClick && 'cursor-pointer hover:bg-muted/50 transition-colors'
                )}
              >
                {columns.map((col, colIndex) => {
                  const value = item?.[col.key]

                  return (
                    <TableCell
                      key={`${String(col.key)}-${rowKey}-${colIndex}`}
                      className="py-4"
                    >
                      {col.render
                        ? col.render(value, item)
                        : value !== null && value !== undefined
                          ? String(value)
                          : '-'}
                    </TableCell>
                  )
                })}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}