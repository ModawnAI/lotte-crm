'use client'

import { useState, useTransition } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Product, productCategoryLabels } from '@/lib/database.types'
import { deleteProduct } from '@/lib/actions/products'
import { ProductForm } from './product-form'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

interface ProductTableProps {
  products: Product[]
}

export function ProductTable({ products }: ProductTableProps) {
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`"${name}" 제품을 삭제하시겠습니까?`)) return
    
    setDeletingId(id)
    startTransition(async () => {
      await deleteProduct(id)
      setDeletingId(null)
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount)
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        등록된 제품이 없습니다.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>제품명</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>카테고리</TableHead>
          <TableHead>용량</TableHead>
          <TableHead>단가</TableHead>
          <TableHead>최소주문</TableHead>
          <TableHead>상태</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id} className={deletingId === product.id ? 'opacity-50' : ''}>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell className="font-mono text-sm">{product.sku}</TableCell>
            <TableCell>
              <Badge variant="secondary">{productCategoryLabels[product.category]}</Badge>
            </TableCell>
            <TableCell>{product.unit_size || '-'}</TableCell>
            <TableCell>{formatCurrency(product.unit_price)}</TableCell>
            <TableCell>{product.min_order_qty}</TableCell>
            <TableCell>
              <Badge variant={product.is_active ? 'success' : 'secondary'}>
                {product.is_active ? '판매중' : '판매중지'}
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
                  <ProductForm 
                    product={product} 
                    trigger={
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Pencil className="mr-2 h-4 w-4" />
                        수정
                      </DropdownMenuItem>
                    }
                  />
                  <DropdownMenuItem 
                    onClick={() => handleDelete(product.id, product.name)}
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
