import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SalesRepsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">영업사원 관리</h1>
        <Button>+ 영업사원 추가</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>영업사원 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            등록된 영업사원이 없습니다.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
