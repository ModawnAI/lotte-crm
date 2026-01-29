-- Lotte Chilsung CRM Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE customer_type AS ENUM ('wholesaler', 'retailer', 'distributor');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipping', 'delivered', 'cancelled');
CREATE TYPE product_category AS ENUM ('carbonated', 'juice', 'water', 'tea', 'coffee', 'sports', 'other');

-- =====================================================
-- CUSTOMERS (거래처)
-- =====================================================

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type customer_type NOT NULL,
  business_number VARCHAR(20), -- 사업자등록번호
  representative VARCHAR(100), -- 대표자명
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  region VARCHAR(100), -- 지역
  sales_rep_id UUID, -- 담당 영업사원
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PRODUCTS (제품)
-- =====================================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE, -- 제품코드
  category product_category NOT NULL,
  brand VARCHAR(100), -- 브랜드 (칠성사이다, 펩시, 델몬트 등)
  unit VARCHAR(50), -- 단위 (박스, 캔, 병 등)
  unit_price DECIMAL(12, 2) NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SALES REPS (영업사원)
-- =====================================================

CREATE TABLE sales_reps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id), -- Supabase Auth 연결
  employee_number VARCHAR(20), -- 사번
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  region VARCHAR(100), -- 담당 지역
  target_monthly DECIMAL(15, 2), -- 월 목표 매출
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key to customers
ALTER TABLE customers 
ADD CONSTRAINT fk_customers_sales_rep 
FOREIGN KEY (sales_rep_id) REFERENCES sales_reps(id);

-- =====================================================
-- ORDERS (주문)
-- =====================================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE, -- 주문번호 (자동생성)
  customer_id UUID NOT NULL REFERENCES customers(id),
  sales_rep_id UUID REFERENCES sales_reps(id),
  status order_status DEFAULT 'pending',
  order_date DATE DEFAULT CURRENT_DATE,
  delivery_date DATE,
  total_amount DECIMAL(15, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ORDER ITEMS (주문 상세)
-- =====================================================

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  subtotal DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_customers_type ON customers(type);
CREATE INDEX idx_customers_region ON customers(region);
CREATE INDEX idx_customers_sales_rep ON customers(sales_rep_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_sales_rep ON orders(sales_rep_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_products_category ON products(category);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Auto-generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                      LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE TRIGGER trigger_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION generate_order_number();

-- Update order total
CREATE OR REPLACE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE orders 
  SET total_amount = (
    SELECT COALESCE(SUM(subtotal), 0) 
    FROM order_items 
    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.order_id, OLD.order_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_order_total
  AFTER INSERT OR UPDATE OR DELETE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_order_total();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_sales_reps_updated_at
  BEFORE UPDATE ON sales_reps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_reps ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policies (authenticated users can access all data for now)
CREATE POLICY "Authenticated users can view customers" ON customers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert customers" ON customers
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update customers" ON customers
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view products" ON products
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert products" ON products
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update products" ON products
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view sales_reps" ON sales_reps
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert sales_reps" ON sales_reps
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update sales_reps" ON sales_reps
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view orders" ON orders
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert orders" ON orders
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update orders" ON orders
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view order_items" ON order_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert order_items" ON order_items
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update order_items" ON order_items
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete order_items" ON order_items
  FOR DELETE TO authenticated USING (true);

-- =====================================================
-- SAMPLE DATA (Optional - Remove in production)
-- =====================================================

-- Sample products (롯데칠성 대표 제품들)
INSERT INTO products (name, code, category, brand, unit, unit_price, description) VALUES
('칠성사이다 250ml 캔', 'CS-250C', 'carbonated', '칠성사이다', '박스(24캔)', 12000, '대한민국 대표 사이다'),
('칠성사이다 500ml 페트', 'CS-500P', 'carbonated', '칠성사이다', '박스(20병)', 18000, '대한민국 대표 사이다'),
('펩시콜라 250ml 캔', 'PC-250C', 'carbonated', '펩시', '박스(24캔)', 13000, '전세계가 사랑하는 콜라'),
('펩시콜라 500ml 페트', 'PC-500P', 'carbonated', '펩시', '박스(20병)', 19000, '전세계가 사랑하는 콜라'),
('델몬트 오렌지 1L', 'DM-O1L', 'juice', '델몬트', '박스(12병)', 24000, '100% 오렌지 주스'),
('델몬트 포도 1L', 'DM-G1L', 'juice', '델몬트', '박스(12병)', 24000, '100% 포도 주스'),
('아이시스 500ml', 'IS-500', 'water', '아이시스', '박스(20병)', 8000, '깨끗한 생수'),
('칸타타 콘트라베이스 275ml', 'KT-CB275', 'coffee', '칸타타', '박스(20병)', 32000, '프리미엄 RTD 커피'),
('게토레이 600ml', 'GT-600', 'sports', '게토레이', '박스(20병)', 28000, '스포츠 음료');
