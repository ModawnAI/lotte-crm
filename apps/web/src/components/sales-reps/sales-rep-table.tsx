'use client'

import { useState, useTransition } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { SalesRep } from '@/lib/database.types'
import { deleteSalesRep } from '@/lib/actions/sales-reps'
import { SalesRepForm } from './sales-rep-form'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

interface SalesRepTableProps {
  salesReps: SalesRep[]
}

export function SalesRepTable({ salesReps }: SalesRepTableProps) {
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`"${name}" 영업사원을 삭제하시겠습니까?`)) return
    
    setDeletingId(id)
    setError(null)
    startTransition(async () => {
      const result = await deleteSalesRep(id)
      if (!result.success) {
        setError(result.error || '삭제 실패')
      }
      setDeletingId(null)
    })
  }

  if (salesReps.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        등록된 영업사원이 없습니다.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
          {error}
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>이름</TableHead>
            <TableHead>이메일</TableHead>
            <TableHead>전화번호</TableHead>
            <TableHead>담당 지역</TableHead>
            <TableHead>상태</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {salesReps.map((rep) => (
            <TableRow key={rep.id} className={deletingId === rep.id ? 'opacity-50' : ''}>
              <TableCell className="font-medium">{rep.name}</TableCell>
              <TableCell>{rep.email}</TableCell>
              <TableCell>{rep.phone || '-'}</TableCell>
              <TableCell>
                <Badge variant="outline">{rep.region}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={rep.is_active ? 'success' : 'secondary'}>
                  {rep.is_active ? '활동중' : '비활동'}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isPending}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <SalesRepForm 
                      salesRep={rep} 
                      trigger={
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Pencil className="mr-2 h-4 w-4" />
                          수정
                        </DropdownMenuItem>
                      }
                    />
                    <DropdownMenuItem 
                      onClick={() => handleDelete(rep.id, rep.name)}
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
    </div>
  )
}
