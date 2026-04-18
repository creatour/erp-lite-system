'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  Menu,
  X,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { getAuthToken, getStoredUser } from '@/lib/api'

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
  },
  {
    label: 'Inventory',
    href: '/inventory',
    icon: Package,
  },
  {
    label: 'Orders',
    href: '/orders',
    icon: ShoppingCart,
  },
  {
    label: 'Customers',
    href: '/customers',
    icon: Users,
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: FileText,
  },
  {
    label: 'User Management',
    href: '/user-management',
    icon: Settings,
    adminOnly: true,
  },
]

export function SidebarNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<{ role_id?: number | string } | null>(null)

  const [decodedRoleId, setDecodedRoleId] = useState<number | null>(null)

  useEffect(() => {
    const storedUser = getStoredUser()
    const token = getAuthToken()

    if (token) {
      try {
        const [, payload] = token.split('.')
        const decoded = JSON.parse(atob(payload))
        const tokenRoleId = decoded?.role_id != null ? Number(decoded.role_id) : null
        setDecodedRoleId(tokenRoleId)
        console.debug('Sidebar token decoded:', decoded)
      } catch (error) {
        console.warn('Failed to decode JWT payload for sidebar user:', error)
      }
    }

    if (storedUser) {
      setUser(storedUser)
      console.debug('Sidebar user loaded from localStorage:', storedUser)
      return
    }
  }, [])

  const userRoleId = user?.role_id != null ? Number(user.role_id) : decodedRoleId
  const isAdmin = userRoleId === 1

  const navItemsToShow = navItems.filter((item) => {
    if (item.adminOnly && !isAdmin) {
      return false
    }
    return true
  })

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-primary text-primary-foreground rounded-lg"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border pt-20 px-4 md:px-0 transition-transform duration-300 z-40 md:z-auto md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="space-y-2">
          {navItemsToShow.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                )}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 z-30 mt-16"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
