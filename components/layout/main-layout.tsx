'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SidebarNav } from './sidebar-nav'
import { TopNav } from './top-nav'
import { getAuthToken, clearAuth } from '@/lib/api'

export function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isReady, setIsReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      clearAuth()
      router.replace('/login')
      return
    }
    setIsReady(true)
  }, [router])

  if (!isReady) {
    return null
  }

  return (
    <>
      <TopNav />
      <SidebarNav />
      <main className="md:ml-64 pt-20 pb-8 px-4 md:px-8">
        {children}
      </main>
    </>
  )
}
