'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Product, ProductFormData, ProductCategory, productCategoryLabels } from '@/lib/database.types'
import { createProduct, updateProduct } from '@/lib/actions/products'

interface ProductFormProps {
  product?: Product
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function ProductForm({ product, trigger, onSuccess }: ProductFormProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  const isEditing = !!product

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const data: ProductFormData = {
      name: formData.get('name') as string,
      sku: formData.get('sku') as string,
      category: formData.get('category') as ProductCategory,
      unit_price: Number(formData.get('unit_price')),
      unit_size: formData.get('unit_size') as string,
      min_order_qty: Number(formData.get('min_order_qty')),
      is_active: formData.get('is_active') === 'true',
      image_url: formData.get('image_url') as string || null,
    }

    startTransition(async () => {
      const result = isEditing 
        ? await updateProduct(product.id, data)
        : await createProduct(data)
      
      if (result.success) {
        setOpen(false)
        onSuccess?.()
      } else {
        setError(result.error || '오류가 발생했습니다')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>{isEditing ? '수정' : '+ 제품 추가'}</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? '제품 수정' : '새 제품 등록'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">제품명 *</Label>
              <Input id="name" name="name" defaultValue={product?.name} required />
            </div>
            
            <div>
              <Label htmlFor="sku">SKU *</Label>
              <Input id="sku" name="sku" defaultValue={product?.sku} required placeholder="예: CSD-001" />
            </div>
            
            <div>
              <Label htmlFor="category">카테고리 *</Label>
              <Select name="category" defaultValue={product?.category || 'carbonated'}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(productCategoryLabels) as ProductCategory[]).map(cat => (
                    <SelectItem key={cat} value={cat}>{productCategoryLabels[cat]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="unit_price">단가 (₩) *</Label>
              <Input 
                id="unit_price" 
                name="unit_price" 
                type="number" 
                defaultValue={product?.unit_price || 1000} 
                required
              />
            </div>
            
            <div>
              <Label htmlFor="unit_size">용량/규격</Label>
              <Input 
                id="unit_size" 
                name="unit_size" 
                defaultValue={product?.unit_size} 
                placeholder="예: 500ml, 1.5L"
              />
            </div>
            
            <div>
              <Label htmlFor="min_order_qty">최소 주문 수량</Label>
              <Input 
                id="min_order_qty" 
                name="min_order_qty" 
                type="number" 
                defaultValue={product?.min_order_qty || 1} 
              />
            </div>
            
            <div>
              <Label htmlFor="is_active">상태</Label>
              <Select name="is_active" defaultValue={String(product?.is_active ?? true)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">판매중</SelectItem>
                  <SelectItem value="false">판매중지</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="image_url">이미지 URL</Label>
              <Input 
                id="image_url" 
                name="image_url" 
                type="url" 
                defaultValue={product?.image_url || ''} 
                placeholder="https://..."
              />
            </div>
          </div>
          
          {error && <p className="text-sm text-red-500">{error}</p>}
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? '저장 중...' : isEditing ? '수정' : '등록'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
