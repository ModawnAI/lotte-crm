// Database types for Lotte Chilsung CRM

export type AccountType = 'wholesaler' | 'retailer' | 'enterprise'
export type AccountTier = 'bronze' | 'silver' | 'gold' | 'platinum'
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
export type ProductCategory = 'carbonated' | 'juice' | 'coffee' | 'tea' | 'sports' | 'water' | 'alcohol' | 'other'

export interface Account {
  id: string
  name: string
  type: AccountType
  tier: AccountTier
  credit_limit: number
  address: string
  contact_person: string
  phone: string
  email: string
  assigned_sales_rep_id: string | null
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  account_id: string
  name: string
  role: string
  phone: string
  email: string
  is_primary: boolean
  created_at: string
}

export interface Product {
  id: string
  name: string
  sku: string
  category: ProductCategory
  unit_price: number
  unit_size: string
  min_order_qty: number
  is_active: boolean
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  account_id: string
  order_date: string
  delivery_date: string | null
  status: OrderStatus
  total_amount: number
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // Relations
  account?: Account
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  discount: number
  subtotal: number
  // Relations
  product?: Product
}

export interface SalesRep {
  id: string
  name: string
  email: string
  phone: string
  region: string
  is_active: boolean
  created_at: string
  updated_at: string
  // Computed
  account_count?: number
  monthly_sales?: number
}

export interface Activity {
  id: string
  account_id: string
  activity_type: 'visit' | 'call' | 'email' | 'order' | 'note'
  notes: string
  created_by: string | null
  created_at: string
  // Relations
  account?: Account
}

// Form types
export type AccountFormData = Omit<Account, 'id' | 'created_at' | 'updated_at'>
export type ProductFormData = Omit<Product, 'id' | 'created_at' | 'updated_at'>
export type SalesRepFormData = Omit<SalesRep, 'id' | 'created_at' | 'updated_at' | 'account_count' | 'monthly_sales'>
export type OrderFormData = {
  account_id: string
  delivery_date: string | null
  notes: string | null
  items: {
    product_id: string
    quantity: number
    discount: number
  }[]
}

// Label helpers
export const accountTypeLabels: Record<AccountType, string> = {
  wholesaler: '도매상',
  retailer: '소매점',
  enterprise: '대형유통'
}

export const accountTierLabels: Record<AccountTier, string> = {
  bronze: '브론즈',
  silver: '실버',
  gold: '골드',
  platinum: '플래티넘'
}

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: '대기중',
  confirmed: '확정',
  shipped: '배송중',
  delivered: '배송완료',
  cancelled: '취소됨'
}

export const productCategoryLabels: Record<ProductCategory, string> = {
  carbonated: '탄산음료',
  juice: '주스',
  coffee: '커피',
  tea: '차',
  sports: '스포츠음료',
  water: '생수',
  alcohol: '주류',
  other: '기타'
}
