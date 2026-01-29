'use server'

import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { SalesRep, SalesRepFormData } from '@/lib/database.types'
import { demoSalesReps, demoAccounts, demoOrders } from '@/lib/demo-data'
import { revalidatePath } from 'next/cache'

export async function getSalesReps(): Promise<SalesRep[]> {
  if (!isSupabaseConfigured()) {
    return demoSalesReps
  }
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sales_reps')
    .select('*')
    .order('name', { ascending: true })
  
  if (error) {
    console.error('Error fetching sales reps:', error)
    return []
  }
  return data || []
}

export async function getActiveSalesReps(): Promise<SalesRep[]> {
  if (!isSupabaseConfigured()) {
    return demoSalesReps.filter(r => r.is_active)
  }
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sales_reps')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })
  
  if (error) {
    console.error('Error fetching sales reps:', error)
    return []
  }
  return data || []
}

export async function getSalesRep(id: string): Promise<SalesRep | null> {
  if (!isSupabaseConfigured()) {
    return demoSalesReps.find(r => r.id === id) || null
  }
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sales_reps')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching sales rep:', error)
    return null
  }
  return data
}

export async function createSalesRep(formData: SalesRepFormData): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true }
  }
  
  const supabase = await createClient()
  const { error } = await supabase
    .from('sales_reps')
    .insert(formData)
  
  if (error) {
    console.error('Error creating sales rep:', error)
    return { success: false, error: error.message }
  }
  
  revalidatePath('/sales-reps')
  return { success: true }
}

export async function updateSalesRep(id: string, formData: Partial<SalesRepFormData>): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true }
  }
  
  const supabase = await createClient()
  const { error } = await supabase
    .from('sales_reps')
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq('id', id)
  
  if (error) {
    console.error('Error updating sales rep:', error)
    return { success: false, error: error.message }
  }
  
  revalidatePath('/sales-reps')
  revalidatePath(`/sales-reps/${id}`)
  return { success: true }
}

export async function deleteSalesRep(id: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    const hasAccounts = demoAccounts.some(a => a.assigned_sales_rep_id === id)
    if (hasAccounts) {
      return { success: false, error: '이 영업사원에게 배정된 거래처가 있습니다.' }
    }
    return { success: true }
  }
  
  const supabase = await createClient()
  
  // Check if there are accounts assigned to this sales rep
  const { data: accounts } = await supabase
    .from('accounts')
    .select('id')
    .eq('assigned_sales_rep_id', id)
    .limit(1)
  
  if (accounts && accounts.length > 0) {
    return { success: false, error: '이 영업사원에게 배정된 거래처가 있습니다. 먼저 거래처 배정을 변경해주세요.' }
  }
  
  const { error } = await supabase
    .from('sales_reps')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting sales rep:', error)
    return { success: false, error: error.message }
  }
  
  revalidatePath('/sales-reps')
  return { success: true }
}

export async function getSalesRepStats() {
  if (!isSupabaseConfigured()) {
    const byRegion: Record<string, number> = {}
    let active = 0
    
    demoSalesReps.forEach(rep => {
      if (rep.region) {
        byRegion[rep.region] = (byRegion[rep.region] || 0) + 1
      }
      if (rep.is_active) active++
    })
    
    return { total: demoSalesReps.length, active, byRegion }
  }
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sales_reps')
    .select('id, is_active, region')
  
  if (error) {
    return { total: 0, active: 0, byRegion: {} }
  }
  
  const byRegion: Record<string, number> = {}
  let active = 0
  
  data?.forEach((rep: { region: string; is_active: boolean }) => {
    if (rep.region) {
      byRegion[rep.region] = (byRegion[rep.region] || 0) + 1
    }
    if (rep.is_active) active++
  })
  
  return {
    total: data?.length || 0,
    active,
    byRegion
  }
}

export async function getSalesRepPerformance(): Promise<{ id: string; name: string; region: string; accountCount: number; monthlySales: number }[]> {
  if (!isSupabaseConfigured()) {
    // Calculate from demo data
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    return demoSalesReps
      .filter(rep => rep.is_active)
      .map(rep => {
        const accountCount = demoAccounts.filter(a => a.assigned_sales_rep_id === rep.id).length
        
        // Get sales for this rep's accounts
        const repAccountIds = demoAccounts
          .filter(a => a.assigned_sales_rep_id === rep.id)
          .map(a => a.id)
        
        const monthlySales = demoOrders
          .filter(o => 
            repAccountIds.includes(o.account_id) && 
            new Date(o.created_at) >= startOfMonth &&
            ['confirmed', 'shipped', 'delivered'].includes(o.status)
          )
          .reduce((sum, o) => sum + o.total_amount, 0)
        
        return {
          id: rep.id,
          name: rep.name,
          region: rep.region,
          accountCount,
          monthlySales
        }
      })
      .sort((a, b) => b.monthlySales - a.monthlySales)
  }
  
  const supabase = await createClient()
  
  // Get all active sales reps
  const { data: reps } = await supabase
    .from('sales_reps')
    .select('id, name, region')
    .eq('is_active', true)
  
  if (!reps) return []
  
  type SalesRepData = { id: string; name: string; region: string }
  
  // Get account counts per sales rep
  const { data: accounts } = await supabase
    .from('accounts')
    .select('assigned_sales_rep_id')
  
  const accountCounts = new Map<string, number>()
  accounts?.forEach((acc: { assigned_sales_rep_id: string | null }) => {
    if (acc.assigned_sales_rep_id) {
      accountCounts.set(acc.assigned_sales_rep_id, (accountCounts.get(acc.assigned_sales_rep_id) || 0) + 1)
    }
  })
  
  // Get monthly sales per sales rep (through their accounts)
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      total_amount,
      status,
      account:accounts!inner(assigned_sales_rep_id)
    `)
    .gte('created_at', startOfMonth.toISOString())
    .in('status', ['confirmed', 'shipped', 'delivered'])
  
  const salesByRep = new Map<string, number>()
  orders?.forEach((order: { total_amount: number; account: { assigned_sales_rep_id: string | null } | null }) => {
    const repId = order.account?.assigned_sales_rep_id
    if (repId) {
      salesByRep.set(repId, (salesByRep.get(repId) || 0) + order.total_amount)
    }
  })
  
  return (reps as SalesRepData[]).map(rep => ({
    id: rep.id,
    name: rep.name,
    region: rep.region,
    accountCount: accountCounts.get(rep.id) || 0,
    monthlySales: salesByRep.get(rep.id) || 0
  })).sort((a, b) => b.monthlySales - a.monthlySales)
}
