import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getSalesReps } from '@/lib/actions/sales-reps'
import { SalesRepTable } from '@/components/sales-reps/sales-rep-table'
import { SalesRepForm } from '@/components/sales-reps/sales-rep-form'

export default async function SalesRepsPage() {
  const salesReps = await getSalesReps()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">영업사원 관리</h1>
          <p className="text-muted-foreground">영업사원의 담당 구역과 실적을 관리합니다</p>
        </div>
        <SalesRepForm />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>영업사원 목록 ({salesReps.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesRepTable salesReps={salesReps} />
        </CardContent>
      </Card>
    </div>
  )
}
