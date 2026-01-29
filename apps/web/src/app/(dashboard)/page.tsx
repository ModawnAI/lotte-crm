import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getAccountStats } from '@/lib/actions/accounts'
import { getOrderStats, getRecentOrders } from '@/lib/actions/orders'
import { getSalesRepStats, getSalesRepPerformance } from '@/lib/actions/sales-reps'
import { getProductStats } from '@/lib/actions/products'
import { orderStatusLabels } from '@/lib/database.types'

export default async function DashboardPage() {
  const [accountStats, orderStats, salesRepStats, productStats, recentOrders, salesPerformance] = await Promise.all([
    getAccountStats(),
    getOrderStats(),
    getSalesRepStats(),
    getProductStats(),
    getRecentOrders(5),
    getSalesRepPerformance()
  ])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">대시보드</h1>
        <p className="text-muted-foreground">롯데칠성음료 CRM 현황</p>
      </div>
      
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 거래처</CardTitle>
            <span className="text-2xl">🏢</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accountStats.total}</div>
            <p className="text-xs text-muted-foreground">
              도매 {accountStats.byType.wholesaler || 0} · 소매 {accountStats.byType.retailer || 0} · 대형유통 {accountStats.byType.enterprise || 0}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 달 주문</CardTitle>
            <span className="text-2xl">🛒</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.total}</div>
            <p className="text-xs text-muted-foreground">
              대기중: {orderStats.pending}건
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활동 영업사원</CardTitle>
            <span className="text-2xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesRepStats.active}</div>
            <p className="text-xs text-muted-foreground">
              전체: {salesRepStats.total}명
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 달 매출</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(orderStats.revenue)}</div>
            <p className="text-xs text-muted-foreground">
              배송완료 기준
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">등록 제품</CardTitle>
            <span className="text-2xl">📦</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productStats.total}</div>
            <p className="text-xs text-muted-foreground">
              판매중: {productStats.active}개
            </p>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">제품 카테고리별 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(productStats.byCategory).map(([category, count]) => (
                <Badge key={category} variant="secondary" className="text-sm">
                  {category === 'carbonated' && '탄산음료'}
                  {category === 'juice' && '주스'}
                  {category === 'coffee' && '커피'}
                  {category === 'tea' && '차'}
                  {category === 'sports' && '스포츠음료'}
                  {category === 'water' && '생수'}
                  {category === 'alcohol' && '주류'}
                  {category === 'other' && '기타'}
                  : {count}
                </Badge>
              ))}
              {Object.keys(productStats.byCategory).length === 0 && (
                <span className="text-muted-foreground text-sm">등록된 제품이 없습니다</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>최근 주문</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">아직 주문이 없습니다.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>거래처</TableHead>
                    <TableHead>금액</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>일시</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {(order.account as { name: string } | undefined)?.name || '-'}
                      </TableCell>
                      <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {orderStatusLabels[order.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(order.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>영업사원 실적 (이번 달)</CardTitle>
          </CardHeader>
          <CardContent>
            {salesPerformance.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">아직 데이터가 없습니다.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>지역</TableHead>
                    <TableHead>거래처</TableHead>
                    <TableHead>매출</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesPerformance.slice(0, 5).map((rep) => (
                    <TableRow key={rep.id}>
                      <TableCell className="font-medium">{rep.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{rep.region}</Badge>
                      </TableCell>
                      <TableCell>{rep.accountCount}개</TableCell>
                      <TableCell>{formatCurrency(rep.monthlySales)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
