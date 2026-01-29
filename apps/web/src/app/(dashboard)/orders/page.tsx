import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getOrders } from '@/lib/actions/orders'
import { getAccounts } from '@/lib/actions/accounts'
import { getActiveProducts } from '@/lib/actions/products'
import { OrderTable } from '@/components/orders/order-table'
import { OrderForm } from '@/components/orders/order-form'

export default async function OrdersPage() {
  const [orders, accounts, products] = await Promise.all([
    getOrders(),
    getAccounts(),
    getActiveProducts()
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">주문 관리</h1>
          <p className="text-muted-foreground">주문 생성, 조회 및 배송 상태를 관리합니다</p>
        </div>
        <OrderForm accounts={accounts} products={products} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>주문 목록 ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderTable orders={orders} />
        </CardContent>
      </Card>
    </div>
  )
}
