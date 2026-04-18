'use client'

import { Bell, LogOut } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { clearAuth, getStoredUser } from '@/lib/api'
import { toast } from 'sonner'

export function TopNav() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<{ username?: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    setUser(getStoredUser())
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-30 flex items-center justify-between px-4 md:pl-72">
      <div className="flex-1"></div>
      
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-4 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="text-sm font-medium hidden sm:block">{user?.username || 'User'}</div>
        </div>

        {/* Logout */}
        <button
          onClick={() => {
            clearAuth()
            toast.success('Logged out successfully')
            router.replace('/')
          }}
          className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  )
}
