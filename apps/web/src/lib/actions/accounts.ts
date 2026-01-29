'use server'

import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/server'
import { Account, AccountFormData } from '@/lib/database.types'
import { demoAccounts } from '@/lib/demo-data'
import { revalidatePath } from 'next/cache'

export async function getAccounts(): Promise<Account[]> {
  if (!isSupabaseConfigured()) {
    return demoAccounts
  }
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching accounts:', error)
    return []
  }
  return data || []
}

export async function getAccount(id: string): Promise<Account | null> {
  if (!isSupabaseConfigured()) {
    return demoAccounts.find(a => a.id === id) || null
  }
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching account:', error)
    return null
  }
  return data
}

export async function createAccount(formData: AccountFormData): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true } // Demo mode - pretend it worked
  }
  
  const supabase = await createClient()
  const { error } = await supabase
    .from('accounts')
    .insert(formData)
  
  if (error) {
    console.error('Error creating account:', error)
    return { success: false, error: error.message }
  }
  
  revalidatePath('/customers')
  return { success: true }
}

export async function updateAccount(id: string, formData: Partial<AccountFormData>): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true } // Demo mode
  }
  
  const supabase = await createClient()
  const { error } = await supabase
    .from('accounts')
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq('id', id)
  
  if (error) {
    console.error('Error updating account:', error)
    return { success: false, error: error.message }
  }
  
  revalidatePath('/customers')
  revalidatePath(`/customers/${id}`)
  return { success: true }
}

export async function deleteAccount(id: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true } // Demo mode
  }
  
  const supabase = await createClient()
  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting account:', error)
    return { success: false, error: error.message }
  }
  
  revalidatePath('/customers')
  return { success: true }
}

export async function getAccountStats() {
  if (!isSupabaseConfigured()) {
    const byType: Record<string, number> = {}
    const byTier: Record<string, number> = {}
    
    demoAccounts.forEach(account => {
      byType[account.type] = (byType[account.type] || 0) + 1
      byTier[account.tier] = (byTier[account.tier] || 0) + 1
    })
    
    return { total: demoAccounts.length, byType, byTier }
  }
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('accounts')
    .select('type, tier')
  
  if (error) {
    return { total: 0, byType: {}, byTier: {} }
  }
  
  const byType: Record<string, number> = {}
  const byTier: Record<string, number> = {}
  
  data?.forEach((account: { type: string; tier: string }) => {
    byType[account.type] = (byType[account.type] || 0) + 1
    byTier[account.tier] = (byTier[account.tier] || 0) + 1
  })
  
  return {
    total: data?.length || 0,
    byType,
    byTier
  }
}
