import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">거래처 관리</h1>
        <Button>+ 거래처 추가</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>거래처 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            등록된 거래처가 없습니다. 거래처를 추가해주세요.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
