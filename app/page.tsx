'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import {
  Package,
  ShoppingCart,
  BarChart3,
  Users,
  ArrowRight,
  Zap,
  Shield,
  Headphones,
} from 'lucide-react'
import { ThemeToggle } from '@/components/layout/theme-toggle'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                <Package className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold hidden sm:inline">ERP Lite</span>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button
                variant="ghost"
                onClick={() => router.push('/login')}
              >
                Login
              </Button>
              <Button
                onClick={() => router.push('/login')}
                className="bg-primary hover:bg-primary/90"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-block">
                <span className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                  <Zap className="w-4 h-4 mr-2" />
                  Modern ERP Solution
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
                Manage Your Business Efficiently
              </h1>

              <p className="text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 text-balance">
                A modern ERP system for managing inventory, sales, and customers. Streamline your operations and make data-driven decisions.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => router.push('/login')}
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push('/login')}
                >
                  View Demo
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border/50">
                <div>
                  <div className="text-2xl font-bold">100+</div>
                  <div className="text-sm text-muted-foreground">Features</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">50K+</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 rounded-2xl blur-3xl" />
                <div className="relative bg-card border border-border rounded-2xl p-8 shadow-2xl">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-background px-4 py-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">ERP Preview</p>
                        <p className="text-sm font-semibold text-foreground">Sales dashboard</p>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted px-3 py-1 text-xs text-muted-foreground">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        Live data
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-2xl border border-border/70 bg-background p-4 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Revenue</p>
                        <p className="mt-3 text-xl font-semibold text-foreground">$72.8K</p>
                        <p className="text-xs text-muted-foreground mt-2">+13.2% this week</p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-background p-4 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Orders</p>
                        <p className="mt-3 text-xl font-semibold text-foreground">1,052</p>
                        <p className="text-xs text-muted-foreground mt-2">23 new today</p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-background p-4 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Customers</p>
                        <p className="mt-3 text-xl font-semibold text-foreground">3,824</p>
                        <p className="text-xs text-muted-foreground mt-2">Active</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-background p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">Weekly trend</p>
                          <p className="text-xs text-muted-foreground">Revenue vs last week</p>
                        </div>
                        <div className="text-xs font-semibold text-primary">+9.4%</div>
                      </div>
                      <div className="flex items-end gap-2 h-28">
                        <div className="flex-1 rounded-full bg-primary/70" style={{ height: '34%' }} />
                        <div className="flex-1 rounded-full bg-primary/50" style={{ height: '46%' }} />
                        <div className="flex-1 rounded-full bg-primary/30" style={{ height: '58%' }} />
                        <div className="flex-1 rounded-full bg-primary/70" style={{ height: '52%' }} />
                        <div className="flex-1 rounded-full bg-primary/50" style={{ height: '66%' }} />
                        <div className="flex-1 rounded-full bg-primary/30" style={{ height: '48%' }} />
                        <div className="flex-1 rounded-full bg-primary/70" style={{ height: '58%' }} />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-background p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-foreground">Recent activity</p>
                        <p className="text-xs text-muted-foreground">Today</p>
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="grid grid-cols-[1fr_auto] gap-4 rounded-2xl bg-muted/50 p-3">
                          <div>
                            <p className="font-medium text-foreground">ORD-2176</p>
                            <p className="text-xs mt-1">Shipped • 12 min ago</p>
                          </div>
                          <p className="font-semibold text-foreground">$620</p>
                        </div>
                        <div className="grid grid-cols-[1fr_auto] gap-4 rounded-2xl bg-muted/50 p-3">
                          <div>
                            <p className="font-medium text-foreground">INV-1842</p>
                            <p className="text-xs mt-1">Paid • 35 min ago</p>
                          </div>
                          <p className="font-semibold text-foreground">$1,260</p>
                        </div>
                        <div className="grid grid-cols-[1fr_auto] gap-4 rounded-2xl bg-muted/50 p-3">
                          <div>
                            <p className="font-medium text-foreground">ORD-1914</p>
                            <p className="text-xs mt-1">Pending • 1 hr ago</p>
                          </div>
                          <p className="font-semibold text-foreground">$310</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Everything you need to manage your business operations in one place
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-background border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Inventory Management</h3>
              <p className="text-muted-foreground">
                Track stock levels, manage SKUs, and automate reordering in real-time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-background border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <ShoppingCart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Order Management</h3>
              <p className="text-muted-foreground">
                Create, process, and track orders with ease. Monitor status updates in real-time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-background border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Analytics & Reports</h3>
              <p className="text-muted-foreground">
                Get detailed insights with charts and reports. Make data-driven decisions.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-background border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Customer Management</h3>
              <p className="text-muted-foreground">
                Manage customer profiles, track interactions, and build relationships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Fast & Responsive</h3>
              <p className="text-muted-foreground">
                Lightning-fast performance built with modern technology for seamless operations.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Secure & Reliable</h3>
              <p className="text-muted-foreground">
                Enterprise-grade security with 99.9% uptime guarantee for your peace of mind.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                <Headphones className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">24/7 Support</h3>
              <p className="text-muted-foreground">
                Dedicated support team available around the clock to help you succeed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-balance">
            Ready to transform your business?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
            Join thousands of businesses using ERP Lite to streamline their operations and boost growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90"
              onClick={() => router.push('/login')}
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/login')}
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold">ERP Lite</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Modern ERP system for business management.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button onClick={() => router.push('/login')} className="hover:text-foreground transition-colors">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/login')} className="hover:text-foreground transition-colors">
                    Pricing
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button onClick={() => router.push('/login')} className="hover:text-foreground transition-colors">
                    About
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/login')} className="hover:text-foreground transition-colors">
                    Contact
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button onClick={() => router.push('/login')} className="hover:text-foreground transition-colors">
                    Privacy
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/login')} className="hover:text-foreground transition-colors">
                    Terms
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8">
            <p className="text-center text-sm text-muted-foreground">
              © 2024 ERP Lite System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
