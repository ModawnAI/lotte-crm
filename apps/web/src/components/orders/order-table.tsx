'use client'

import { useState, useTransition } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Order, OrderStatus, orderStatusLabels } from '@/lib/database.types'
import { deleteOrder, updateOrderStatus } from '@/lib/actions/orders'
import { MoreHorizontal, Trash2, CheckCircle, Truck, Package, XCircle } from 'lucide-react'

interface OrderTableProps {
  orders: Order[]
}

const statusColors: Record<OrderStatus, 'secondary' | 'warning' | 'info' | 'success' | 'destructive'> = {
  pending: 'warning',
  confirmed: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'destructive',
}

const statusIcons: Record<OrderStatus, React.ComponentType<{ className?: string }>> = {
  pending: Package,
  confirmed: CheckCircle,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
}

export function OrderTable({ orders }: OrderTableProps) {
  const [isPending, startTransition] = useTransition()
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleStatusChange = (id: string, status: OrderStatus) => {
    setProcessingId(id)
    startTransition(async () => {
      await updateOrderStatus(id, status)
      setProcessingId(null)
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('이 주문을 삭제하시겠습니까?')) return
    
    setProcessingId(id)
    startTransition(async () => {
      await deleteOrder(id)
      setProcessingId(null)
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        등록된 주문이 없습니다.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>주문번호</TableHead>
          <TableHead>거래처</TableHead>
          <TableHead>주문일</TableHead>
          <TableHead>배송예정</TableHead>
          <TableHead>금액</TableHead>
          <TableHead>품목수</TableHead>
          <TableHead>상태</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const StatusIcon = statusIcons[order.status]
          return (
            <TableRow key={order.id} className={processingId === order.id ? 'opacity-50' : ''}>
              <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}</TableCell>
              <TableCell className="font-medium">
                {(order.account as { name: string } | undefined)?.name || '-'}
              </TableCell>
              <TableCell>{formatDate(order.order_date)}</TableCell>
              <TableCell>{order.delivery_date ? formatDate(order.delivery_date) : '-'}</TableCell>
              <TableCell>{formatCurrency(order.total_amount)}</TableCell>
              <TableCell>{order.items?.length || 0}개</TableCell>
              <TableCell>
                <Badge variant={statusColors[order.status]} className="gap-1">
                  <StatusIcon className="h-3 w-3" />
                  {orderStatusLabels[order.status]}
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
                    {order.status === 'pending' && (
                      <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'confirmed')}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        주문 확정
                      </DropdownMenuItem>
                    )}
                    {order.status === 'confirmed' && (
                      <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'shipped')}>
                        <Truck className="mr-2 h-4 w-4" />
                        배송 시작
                      </DropdownMenuItem>
                    )}
                    {order.status === 'shipped' && (
                      <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'delivered')}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        배송 완료
                      </DropdownMenuItem>
                    )}
                    {(order.status === 'pending' || order.status === 'confirmed') && (
                      <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'cancelled')}>
                        <XCircle className="mr-2 h-4 w-4" />
                        주문 취소
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDelete(order.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
