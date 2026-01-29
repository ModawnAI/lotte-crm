// Database types for Lotte Chilsung CRM
// Generated from schema.sql

export type CustomerType = 'wholesaler' | 'retailer' | 'distributor'
export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled'
export type ProductCategory = 'carbonated' | 'juice' | 'water' | 'tea' | 'coffee' | 'sports' | 'other'

export interface Customer {
  id: string
  name: string
  type: CustomerType
  business_number: string | null
  representative: string | null
  phone: string | null
  email: string | null
  address: string | null
  region: string | null
  sales_rep_id: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  code: string | null
  category: ProductCategory
  brand: string | null
  unit: string | null
  unit_price: number
  description: string | null
  image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SalesRep {
  id: string
  user_id: string | null
  employee_number: string | null
  name: string
  phone: string | null
  email: string | null
  region: string | null
  target_monthly: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string | null
  customer_id: string
  sales_rep_id: string | null
  status: OrderStatus
  order_date: string
  delivery_date: string | null
  total_amount: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
  created_at: string
}

// With relations
export interface CustomerWithSalesRep extends Customer {
  sales_rep: SalesRep | null
}

export interface OrderWithDetails extends Order {
  customer: Customer
  sales_rep: SalesRep | null
  items: (OrderItem & { product: Product })[]
}

// Form types
export type CustomerInsert = Omit<Customer, 'id' | 'created_at' | 'updated_at'>
export type CustomerUpdate = Partial<CustomerInsert>

export type ProductInsert = Omit<Product, 'id' | 'created_at' | 'updated_at'>
export type ProductUpdate = Partial<ProductInsert>

export type SalesRepInsert = Omit<SalesRep, 'id' | 'created_at' | 'updated_at'>
export type SalesRepUpdate = Partial<SalesRepInsert>

export type OrderInsert = Omit<Order, 'id' | 'order_number' | 'total_amount' | 'created_at' | 'updated_at'>
export type OrderUpdate = Partial<OrderInsert>

export type OrderItemInsert = Omit<OrderItem, 'id' | 'created_at'>
