import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAccounts } from '@/lib/actions/accounts'
import { getActiveSalesReps } from '@/lib/actions/sales-reps'
import { AccountTable } from '@/components/accounts/account-table'
import { AccountForm } from '@/components/accounts/account-form'

export default async function CustomersPage() {
  const [accounts, salesReps] = await Promise.all([
    getAccounts(),
    getActiveSalesReps()
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">거래처 관리</h1>
          <p className="text-muted-foreground">도매상, 소매점, 대형유통 거래처를 관리합니다</p>
        </div>
        <AccountForm salesReps={salesReps} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>거래처 목록 ({accounts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountTable accounts={accounts} salesReps={salesReps} />
        </CardContent>
      </Card>
    </div>
  )
}
