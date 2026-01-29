-- Lotte Chilsung CRM Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sales Representatives Table
CREATE TABLE IF NOT EXISTS sales_reps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  region TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accounts (거래처) Table
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('wholesaler', 'retailer', 'enterprise')),
  tier TEXT NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  credit_limit NUMERIC DEFAULT 10000000,
  address TEXT,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  assigned_sales_rep_id UUID REFERENCES sales_reps(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  phone TEXT,
  email TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('carbonated', 'juice', 'coffee', 'tea', 'sports', 'water', 'alcohol', 'other')),
  unit_price NUMERIC NOT NULL,
  unit_size TEXT,
  min_order_qty INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
  order_date TIMESTAMPTZ DEFAULT NOW(),
  delivery_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total_amount NUMERIC DEFAULT 0,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  subtotal NUMERIC NOT NULL
);

-- Activities Table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('visit', 'call', 'email', 'order', 'note')),
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_accounts_sales_rep ON accounts(assigned_sales_rep_id);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(type);
CREATE INDEX IF NOT EXISTS idx_orders_account ON orders(account_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_activities_account ON activities(account_id);

-- Row Level Security (RLS) Policies
-- For now, allow all authenticated users to access all data
-- In production, you'd want more granular policies

ALTER TABLE sales_reps ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access for MVP (adjust for production)
CREATE POLICY "Allow all for sales_reps" ON sales_reps FOR ALL USING (true);
CREATE POLICY "Allow all for accounts" ON accounts FOR ALL USING (true);
CREATE POLICY "Allow all for contacts" ON contacts FOR ALL USING (true);
CREATE POLICY "Allow all for products" ON products FOR ALL USING (true);
CREATE POLICY "Allow all for orders" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all for order_items" ON order_items FOR ALL USING (true);
CREATE POLICY "Allow all for activities" ON activities FOR ALL USING (true);

-- Insert sample data
INSERT INTO sales_reps (name, email, phone, region, is_active) VALUES
  ('김영업', 'kim@lottechilsung.co.kr', '010-1234-5678', '서울', true),
  ('이판매', 'lee@lottechilsung.co.kr', '010-2345-6789', '경기', true),
  ('박거래', 'park@lottechilsung.co.kr', '010-3456-7890', '부산', true)
ON CONFLICT DO NOTHING;

INSERT INTO products (name, sku, category, unit_price, unit_size, min_order_qty, is_active) VALUES
  ('칠성사이다 500ml', 'CSD-500', 'carbonated', 1500, '500ml', 24, true),
  ('칠성사이다 1.5L', 'CSD-1500', 'carbonated', 2500, '1.5L', 12, true),
  ('펩시콜라 500ml', 'PEP-500', 'carbonated', 1500, '500ml', 24, true),
  ('펩시콜라 1.5L', 'PEP-1500', 'carbonated', 2500, '1.5L', 12, true),
  ('델몬트 오렌지 1L', 'DEL-OJ-1000', 'juice', 3500, '1L', 12, true),
  ('델몬트 사과 1L', 'DEL-AP-1000', 'juice', 3500, '1L', 12, true),
  ('레쓰비 마일드 175ml', 'LET-M-175', 'coffee', 1200, '175ml', 30, true),
  ('레쓰비 카페타임 240ml', 'LET-C-240', 'coffee', 1800, '240ml', 24, true),
  ('게토레이 600ml', 'GAT-600', 'sports', 2000, '600ml', 24, true),
  ('아이시스 500ml', 'ICE-500', 'water', 800, '500ml', 24, true),
  ('클라우드 500ml', 'CLD-500', 'alcohol', 2500, '500ml', 24, true),
  ('순하리 소주 360ml', 'SHR-360', 'alcohol', 1800, '360ml', 20, true)
ON CONFLICT DO NOTHING;

INSERT INTO accounts (name, type, tier, credit_limit, address, contact_person, phone, email) VALUES
  ('GS25 강남점', 'retailer', 'silver', 5000000, '서울시 강남구 테헤란로 123', '최편의', '02-1234-5678', 'gs_gangnam@gs25.co.kr'),
  ('이마트 용산점', 'enterprise', 'platinum', 100000000, '서울시 용산구 한강대로 100', '김대형', '02-2345-6789', 'yongsan@emart.co.kr'),
  ('세븐일레븐 홍대점', 'retailer', 'bronze', 3000000, '서울시 마포구 와우산로 29', '박세븐', '02-3456-7890', 'hongdae@7eleven.co.kr'),
  ('대한음료 도매', 'wholesaler', 'gold', 50000000, '경기도 성남시 분당구 판교로 256', '정도매', '031-456-7890', 'daehan@wholesale.co.kr'),
  ('롯데마트 잠실점', 'enterprise', 'platinum', 80000000, '서울시 송파구 올림픽로 240', '이마트', '02-567-8901', 'jamsil@lottemart.co.kr')
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Schema created successfully!' as result;
