'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { SalesRep, SalesRepFormData } from '@/lib/database.types'
import { createSalesRep, updateSalesRep } from '@/lib/actions/sales-reps'

interface SalesRepFormProps {
  salesRep?: SalesRep
  trigger?: React.ReactNode
  onSuccess?: () => void
}

const REGIONS = ['서울', '경기', '인천', '강원', '충북', '충남', '대전', '세종', '전북', '전남', '광주', '경북', '경남', '대구', '울산', '부산', '제주']

export function SalesRepForm({ salesRep, trigger, onSuccess }: SalesRepFormProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  const isEditing = !!salesRep

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const data: SalesRepFormData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      region: formData.get('region') as string,
      is_active: formData.get('is_active') === 'true',
    }

    startTransition(async () => {
      const result = isEditing 
        ? await updateSalesRep(salesRep.id, data)
        : await createSalesRep(data)
      
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
        {trigger || <Button>{isEditing ? '수정' : '+ 영업사원 추가'}</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? '영업사원 수정' : '새 영업사원 등록'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">이름 *</Label>
              <Input id="name" name="name" defaultValue={salesRep?.name} required />
            </div>
            
            <div>
              <Label htmlFor="email">이메일 *</Label>
              <Input id="email" name="email" type="email" defaultValue={salesRep?.email} required />
            </div>
            
            <div>
              <Label htmlFor="phone">전화번호</Label>
              <Input id="phone" name="phone" type="tel" defaultValue={salesRep?.phone} />
            </div>
            
            <div>
              <Label htmlFor="region">담당 지역 *</Label>
              <Select name="region" defaultValue={salesRep?.region || '서울'}>
                <SelectTrigger>
                  <SelectValue placeholder="지역 선택" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="is_active">상태</Label>
              <Select name="is_active" defaultValue={String(salesRep?.is_active ?? true)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">활동중</SelectItem>
                  <SelectItem value="false">비활동</SelectItem>
                </SelectContent>
              </Select>
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
