'use server'

import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { Product, ProductFormData } from '@/lib/database.types'
import { demoProducts } from '@/lib/demo-data'
import { revalidatePath } from 'next/cache'

export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return demoProducts
  }
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true })
  
  if (error) {
    console.error('Error fetching products:', error)
    return []
  }
  return data || []
}

export async function getActiveProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return demoProducts.filter(p => p.is_active)
  }
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })
  
  if (error) {
    console.error('Error fetching products:', error)
    return []
  }
  return data || []
}

export async function getProduct(id: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    return demoProducts.find(p => p.id === id) || null
  }
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching product:', error)
    return null
  }
  return data
}

export async function createProduct(formData: ProductFormData): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true }
  }
  
  const supabase = await createClient()
  const { error } = await supabase
    .from('products')
    .insert(formData)
  
  if (error) {
    console.error('Error creating product:', error)
    return { success: false, error: error.message }
  }
  
  revalidatePath('/products')
  return { success: true }
}

export async function updateProduct(id: string, formData: Partial<ProductFormData>): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true }
  }
  
  const supabase = await createClient()
  const { error } = await supabase
    .from('products')
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq('id', id)
  
  if (error) {
    console.error('Error updating product:', error)
    return { success: false, error: error.message }
  }
  
  revalidatePath('/products')
  revalidatePath(`/products/${id}`)
  return { success: true }
}

export async function deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true }
  }
  
  const supabase = await createClient()
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting product:', error)
    return { success: false, error: error.message }
  }
  
  revalidatePath('/products')
  return { success: true }
}

export async function getProductStats() {
  if (!isSupabaseConfigured()) {
    const byCategory: Record<string, number> = {}
    let active = 0
    
    demoProducts.forEach(product => {
      byCategory[product.category] = (byCategory[product.category] || 0) + 1
      if (product.is_active) active++
    })
    
    return { total: demoProducts.length, active, byCategory }
  }
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('category, is_active')
  
  if (error) {
    return { total: 0, active: 0, byCategory: {} }
  }
  
  const byCategory: Record<string, number> = {}
  let active = 0
  
  data?.forEach((product: { category: string; is_active: boolean }) => {
    byCategory[product.category] = (byCategory[product.category] || 0) + 1
    if (product.is_active) active++
  })
  
  return {
    total: data?.length || 0,
    active,
    byCategory
  }
}
