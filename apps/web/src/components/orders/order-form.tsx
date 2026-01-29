'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Account, Product, OrderFormData } from '@/lib/database.types'
import { createOrder } from '@/lib/actions/orders'
import { Plus, Trash2 } from 'lucide-react'

interface OrderFormProps {
  accounts: Account[]
  products: Product[]
  trigger?: React.ReactNode
  onSuccess?: () => void
}

interface OrderItemInput {
  product_id: string
  quantity: number
  discount: number
}

export function OrderForm({ accounts, products, trigger, onSuccess }: OrderFormProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<OrderItemInput[]>([{ product_id: '', quantity: 1, discount: 0 }])

  const addItem = () => {
    setItems([...items, { product_id: '', quantity: 1, discount: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof OrderItemInput, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const getProductPrice = (productId: string) => {
    const product = products.find(p => p.id === productId)
    return product?.unit_price || 0
  }

  const calculateSubtotal = (item: OrderItemInput) => {
    const price = getProductPrice(item.product_id)
    return (price * item.quantity) * (1 - item.discount / 100)
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + calculateSubtotal(item), 0)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    
    // Validate items
    const validItems = items.filter(item => item.product_id && item.quantity > 0)
    if (validItems.length === 0) {
      setError('최소 1개 이상의 제품을 선택해주세요')
      return
    }
    
    const data: OrderFormData = {
      account_id: formData.get('account_id') as string,
      delivery_date: formData.get('delivery_date') as string || null,
      notes: formData.get('notes') as string || null,
      items: validItems,
    }

    startTransition(async () => {
      const result = await createOrder(data)
      
      if (result.success) {
        setOpen(false)
        setItems([{ product_id: '', quantity: 1, discount: 0 }])
        onSuccess?.()
      } else {
        setError(result.error || '오류가 발생했습니다')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>+ 주문 생성</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새 주문 생성</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="account_id">거래처 *</Label>
              <Select name="account_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="거래처 선택" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="delivery_date">배송 예정일</Label>
              <Input 
                id="delivery_date" 
                name="delivery_date" 
                type="date"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>주문 품목</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" />
                품목 추가
              </Button>
            </div>
            
            <div className="space-y-2 border rounded-lg p-4">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Select 
                      value={item.product_id}
                      onValueChange={(value) => updateItem(index, 'product_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="제품 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(product => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} ({formatCurrency(product.unit_price)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24">
                    <Input 
                      type="number" 
                      placeholder="수량"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="w-20">
                    <Input 
                      type="number" 
                      placeholder="할인%"
                      min={0}
                      max={100}
                      value={item.discount}
                      onChange={(e) => updateItem(index, 'discount', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="w-28 text-right py-2 font-medium">
                    {formatCurrency(calculateSubtotal(item))}
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <div className="flex justify-end pt-4 border-t">
                <div className="text-lg font-bold">
                  합계: {formatCurrency(calculateTotal())}
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">메모</Label>
            <Textarea 
              id="notes" 
              name="notes" 
              placeholder="배송 관련 요청사항 등"
              rows={2}
            />
          </div>
          
          {error && <p className="text-sm text-red-500">{error}</p>}
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? '생성 중...' : '주문 생성'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
