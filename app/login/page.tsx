'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { login, setAuth, getAuthToken } from '@/lib/api'
import { Package, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (getAuthToken()) {
      router.replace('/dashboard')
    }
  }, [router])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(identifier.trim(), password)
      setAuth(result.token, result.user)
      toast.success(
        result.user?.role_id === 1
          ? 'Welcome back, Admin 👋'
          : 'Welcome back 👋',
      )
      await new Promise((resolve) => setTimeout(resolve, 1200))
      router.replace('/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid email or password'
      setError(message)
      toast.error('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/90 p-8 shadow-2xl">
        <div className="flex flex-col items-center gap-3 mb-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground text-2xl font-bold shadow-lg shadow-primary/20">
            <Package size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-semibold">ERP Lite Login</h1>
            <p className="text-sm text-muted-foreground">Access your ERP dashboard with your username or email.</p>
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-white/90 mb-2">
              Email or Username
            </label>
            <Input
              id="identifier"
              placeholder="john@example.com or johndoe"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || !identifier || !password}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
