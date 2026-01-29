import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DemoBanner } from '@/components/demo-banner'
import { isSupabaseConfigured } from '@/lib/supabase/server'
import { 
  LayoutDashboard, 
  Building2, 
  Package, 
  ShoppingCart, 
  Users,
  LogOut
} from 'lucide-react'

const navItems = [
  { href: '/', label: '대시보드', icon: LayoutDashboard },
  { href: '/customers', label: '거래처', icon: Building2 },
  { href: '/products', label: '제품', icon: Package },
  { href: '/orders', label: '주문', icon: ShoppingCart },
  { href: '/sales-reps', label: '영업사원', icon: Users },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isDemoMode = !isSupabaseConfigured()
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Demo Banner */}
      {isDemoMode && <DemoBanner />}
      
      {/* Sidebar */}
      <aside className={`fixed left-0 z-40 h-screen w-64 border-r bg-white dark:bg-gray-800 ${isDemoMode ? 'top-10' : 'top-0'}`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold">
                LC
              </div>
              <span className="font-bold text-lg">롯데칠성 CRM</span>
            </Link>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
          
          {/* Footer */}
          <div className="border-t p-4">
            <form action="/auth/signout" method="POST">
              <Button variant="ghost" className="w-full justify-start gap-3" type="submit">
                <LogOut className="h-5 w-5" />
                로그아웃
              </Button>
            </form>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className={`ml-64 ${isDemoMode ? 'pt-10' : ''}`}>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
