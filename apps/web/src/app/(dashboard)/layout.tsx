import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    redirect('/login')
  }

  const supabase = await createClient()
  if (!supabase) {
    redirect('/login')
  }
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-gray-50">
        <div className="p-6">
          <h1 className="text-xl font-bold text-primary">롯데칠성 CRM</h1>
        </div>
        <nav className="space-y-1 px-3">
          <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100">
            📊 대시보드
          </Link>
          <Link href="/customers" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100">
            🏢 거래처
          </Link>
          <Link href="/products" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100">
            📦 제품
          </Link>
          <Link href="/orders" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100">
            🛒 주문
          </Link>
          <Link href="/sales-reps" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100">
            👥 영업사원
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        <header className="flex h-16 items-center justify-between border-b px-6">
          <div />
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <form action="/auth/signout" method="post">
              <Button variant="outline" size="sm">로그아웃</Button>
            </form>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
