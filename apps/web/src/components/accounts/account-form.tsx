'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Account, AccountFormData, AccountType, AccountTier, accountTypeLabels, accountTierLabels, SalesRep } from '@/lib/database.types'
import { createAccount, updateAccount } from '@/lib/actions/accounts'

interface AccountFormProps {
  account?: Account
  salesReps: SalesRep[]
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function AccountForm({ account, salesReps, trigger, onSuccess }: AccountFormProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  const isEditing = !!account

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const data: AccountFormData = {
      name: formData.get('name') as string,
      type: formData.get('type') as AccountType,
      tier: formData.get('tier') as AccountTier,
      credit_limit: Number(formData.get('credit_limit')),
      address: formData.get('address') as string,
      contact_person: formData.get('contact_person') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      assigned_sales_rep_id: formData.get('assigned_sales_rep_id') as string || null,
    }

    startTransition(async () => {
      const result = isEditing 
        ? await updateAccount(account.id, data)
        : await createAccount(data)
      
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
        {trigger || <Button>{isEditing ? '수정' : '+ 거래처 추가'}</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? '거래처 수정' : '새 거래처 등록'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">거래처명 *</Label>
              <Input id="name" name="name" defaultValue={account?.name} required />
            </div>
            
            <div>
              <Label htmlFor="type">유형 *</Label>
              <Select name="type" defaultValue={account?.type || 'retailer'}>
                <SelectTrigger>
                  <SelectValue placeholder="유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(accountTypeLabels) as AccountType[]).map(type => (
                    <SelectItem key={type} value={type}>{accountTypeLabels[type]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="tier">등급 *</Label>
              <Select name="tier" defaultValue={account?.tier || 'bronze'}>
                <SelectTrigger>
                  <SelectValue placeholder="등급 선택" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(accountTierLabels) as AccountTier[]).map(tier => (
                    <SelectItem key={tier} value={tier}>{accountTierLabels[tier]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="credit_limit">신용 한도 (₩)</Label>
              <Input 
                id="credit_limit" 
                name="credit_limit" 
                type="number" 
                defaultValue={account?.credit_limit || 10000000} 
              />
            </div>
            
            <div>
              <Label htmlFor="assigned_sales_rep_id">담당 영업사원</Label>
              <Select name="assigned_sales_rep_id" defaultValue={account?.assigned_sales_rep_id || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="선택 안함" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">선택 안함</SelectItem>
                  {salesReps.map(rep => (
                    <SelectItem key={rep.id} value={rep.id}>{rep.name} ({rep.region})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="address">주소</Label>
              <Input id="address" name="address" defaultValue={account?.address} />
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="contact_person">담당자</Label>
              <Input id="contact_person" name="contact_person" defaultValue={account?.contact_person} />
            </div>
            
            <div>
              <Label htmlFor="phone">전화번호</Label>
              <Input id="phone" name="phone" type="tel" defaultValue={account?.phone} />
            </div>
            
            <div>
              <Label htmlFor="email">이메일</Label>
              <Input id="email" name="email" type="email" defaultValue={account?.email} />
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
