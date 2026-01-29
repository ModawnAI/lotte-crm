'use client'

import { useState, useTransition } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Account, accountTypeLabels, accountTierLabels, SalesRep } from '@/lib/database.types'
import { deleteAccount } from '@/lib/actions/accounts'
import { AccountForm } from './account-form'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

interface AccountTableProps {
  accounts: Account[]
  salesReps: SalesRep[]
}

const tierColors = {
  bronze: 'secondary',
  silver: 'outline',
  gold: 'warning',
  platinum: 'info',
} as const

export function AccountTable({ accounts, salesReps }: AccountTableProps) {
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`"${name}" 거래처를 삭제하시겠습니까?`)) return
    
    setDeletingId(id)
    startTransition(async () => {
      await deleteAccount(id)
      setDeletingId(null)
    })
  }

  const getSalesRepName = (id: string | null) => {
    if (!id) return '-'
    const rep = salesReps.find(r => r.id === id)
    return rep?.name || '-'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount)
  }

  if (accounts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        등록된 거래처가 없습니다.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>거래처명</TableHead>
          <TableHead>유형</TableHead>
          <TableHead>등급</TableHead>
          <TableHead>담당자</TableHead>
          <TableHead>연락처</TableHead>
          <TableHead>신용한도</TableHead>
          <TableHead>담당 영업</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {accounts.map((account) => (
          <TableRow key={account.id} className={deletingId === account.id ? 'opacity-50' : ''}>
            <TableCell className="font-medium">{account.name}</TableCell>
            <TableCell>
              <Badge variant="secondary">{accountTypeLabels[account.type]}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={tierColors[account.tier]}>{accountTierLabels[account.tier]}</Badge>
            </TableCell>
            <TableCell>{account.contact_person || '-'}</TableCell>
            <TableCell>{account.phone || '-'}</TableCell>
            <TableCell>{formatCurrency(account.credit_limit)}</TableCell>
            <TableCell>{getSalesRepName(account.assigned_sales_rep_id)}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={isPending}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <AccountForm 
                    account={account} 
                    salesReps={salesReps}
                    trigger={
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Pencil className="mr-2 h-4 w-4" />
                        수정
                      </DropdownMenuItem>
                    }
                  />
                  <DropdownMenuItem 
                    onClick={() => handleDelete(account.id, account.name)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    삭제
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
