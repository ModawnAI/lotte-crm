'use server'

import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { Order, OrderFormData, OrderItem } from '@/lib/database.types'
import { demoOrders, demoProducts } from '@/lib/demo-data'
import { revalidatePath } from 'next/cache'

export async function getOrders(): Promise<Order[]> {
  if (!isSupabaseConfigured()) {
    return demoOrders
  }
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      account:accounts(id, name, type),
      items:order_items(*, product:products(id, name, sku))
    `)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching orders:', error)
    return []
  }
  return data || []
}

export async function getOrder(id: string): Promise<Order | null> {
  if (!isSupabaseConfigured()) {
    return demoOrders.find(o => o.id === id) || null
  }
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      account:accounts(id, name, type, address, phone),
      items:order_items(*, product:products(id, name, sku, unit_size))
    `)
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching order:', error)
    return null
  }
  return data
}

export async function createOrder(formData: OrderFormData): Promise<{ success: boolean; error?: string; orderId?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true, orderId: 'demo-order-' + Date.now() }
  }
  
  const supabase = await createClient()
  
  // Get product prices
  const productIds = formData.items.map(item => item.product_id)
  const { data: products } = await supabase
    .from('products')
    .select('id, unit_price')
    .in('id', productIds)
  
  const productPrices = new Map<string, number>(products?.map((p: { id: string; unit_price: number }) => [p.id, p.unit_price] as [string, number]) || [])
  
  // Calculate totals
  let totalAmount = 0
  const items: Omit<OrderItem, 'id' | 'order_id' | 'product'>[] = formData.items.map(item => {
    const unitPrice: number = productPrices.get(item.product_id) || 0
    const subtotal = (unitPrice * item.quantity) * (1 - item.discount / 100)
    totalAmount += subtotal
    return {
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: unitPrice,
      discount: item.discount,
      subtotal
    }
  })
  
  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      account_id: formData.account_id,
      order_date: new Date().toISOString(),
      delivery_date: formData.delivery_date,
      status: 'pending',
      total_amount: totalAmount,
      notes: formData.notes
    })
    .select()
    .single()
  
  if (orderError || !order) {
    console.error('Error creating order:', orderError)
    return { success: false, error: orderError?.message }
  }
  
  // Create order items
  const orderItems = items.map(item => ({
    ...item,
    order_id: order.id
  }))
  
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)
  
  if (itemsError) {
    console.error('Error creating order items:', itemsError)
    // Rollback order
    await supabase.from('orders').delete().eq('id', order.id)
    return { success: false, error: itemsError.message }
  }
  
  revalidatePath('/orders')
  revalidatePath('/')
  return { success: true, orderId: order.id }
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true }
  }
  
  const supabase = await createClient()
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
  
  if (error) {
    console.error('Error updating order status:', error)
    return { success: false, error: error.message }
  }
  
  revalidatePath('/orders')
  revalidatePath(`/orders/${id}`)
  return { success: true }
}

export async function deleteOrder(id: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true }
  }
  
  const supabase = await createClient()
  
  // Delete order items first
  await supabase.from('order_items').delete().eq('order_id', id)
  
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting order:', error)
    return { success: false, error: error.message }
  }
  
  revalidatePath('/orders')
  return { success: true }
}

export async function getOrderStats() {
  if (!isSupabaseConfigured()) {
    // Calculate from demo data - current month orders
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const monthOrders = demoOrders.filter(o => new Date(o.created_at) >= startOfMonth)
    
    const byStatus: Record<string, number> = {}
    let revenue = 0
    let pending = 0
    
    monthOrders.forEach(order => {
      byStatus[order.status] = (byStatus[order.status] || 0) + 1
      if (order.status === 'delivered') {
        revenue += order.total_amount
      }
      if (order.status === 'pending') {
        pending++
      }
    })
    
    return { total: monthOrders.length, pending, revenue, byStatus }
  }
  
  const supabase = await createClient()
  
  // Get current month orders
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  
  const { data, error } = await supabase
    .from('orders')
    .select('status, total_amount, created_at')
    .gte('created_at', startOfMonth.toISOString())
  
  if (error) {
    return { total: 0, pending: 0, revenue: 0, byStatus: {} }
  }
  
  const byStatus: Record<string, number> = {}
  let revenue = 0
  let pending = 0
  
  data?.forEach((order: { status: string; total_amount: number }) => {
    byStatus[order.status] = (byStatus[order.status] || 0) + 1
    if (order.status === 'delivered') {
      revenue += order.total_amount
    }
    if (order.status === 'pending') {
      pending++
    }
  })
  
  return {
    total: data?.length || 0,
    pending,
    revenue,
    byStatus
  }
}

export async function getRecentOrders(limit: number = 5): Promise<Order[]> {
  if (!isSupabaseConfigured()) {
    return demoOrders.slice(0, limit)
  }
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      account:accounts(id, name)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching recent orders:', error)
    return []
  }
  return data || []
}
