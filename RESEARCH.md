# Lotte Chilsung CRM Research

## 클라이언트 개요

**Lotte Chilsung Beverage (롯데칠성음료)**
- 1950년 동방음료로 설립, 1974년 롯데칠성음료로 사명 변경
- 한국 최대 음료 회사 중 하나
- 본사: 서울

### 주요 브랜드
- **칠성사이다** - 대표 탄산음료
- **펩시콜라** - 1976년부터 한국 독점 유통
- **델몬트** - 1982년부터 파트너십 (오렌지주스 등)
- **게토레이** - 2001년부터 파트너십
- **레쓰비** - RTD 커피
- **클라우드** - 맥주 브랜드

### 글로벌 진출
- 중국, 필리핀, 미얀마, 파키스탄 지사
- 북미, 아시아 전역 수출

## CRM 요구사항 분석

### 음료 유통업 특화 기능

#### 1. 거래처 관리 (Account Management)
- **도매상** (Wholesaler) 관리
- **소매점** (Retailer) 관리 - 편의점, 마트, 식당
- **대형유통** (Enterprise) - 이마트, 롯데마트, GS25 등
- 거래처 등급 (티어) 시스템
- 신용 한도 관리

#### 2. 주문 관리 (Order Management)
- 정기 주문 스케줄링
- 계절별 수요 예측 (여름 음료 성수기 등)
- 최소 주문 수량 (MOQ) 설정
- 배송 일정 관리

#### 3. 재고 연동 (Inventory Integration)
- 실시간 재고 현황
- 자동 재주문 알림
- 유통기한 관리 (음료 특성상 중요)
- 창고별 재고 분배

#### 4. 영업사원 관리 (Sales Force)
- 담당 구역 배정
- 방문 일정 관리
- 실적 트래킹
- 모바일 앱 지원 (현장 영업)

#### 5. 마케팅 & 프로모션
- 시즌 프로모션 캠페인
- 번들 할인 관리
- 신제품 런칭 트래킹
- 거래처별 맞춤 프로모션

#### 6. 분석 & 리포팅
- 매출 대시보드
- 거래처별 실적
- 제품별 판매 분석
- 지역별 성과 비교

## 기술 스택 제안

### Frontend
- **Next.js 15** + TypeScript
- **Tailwind CSS** + shadcn/ui
- 반응형 (데스크톱 + 모바일 영업사원용)

### Backend
- **Supabase**
  - PostgreSQL DB
  - Row Level Security
  - Realtime subscriptions
  - Edge Functions

### 배포
- **Vercel** (Next.js 최적화)

### 주요 테이블 구조 (초안)

```sql
-- 거래처 (Accounts)
accounts (
  id, name, type, tier, 
  credit_limit, address, 
  contact_person, phone, email,
  assigned_sales_rep, 
  created_at, updated_at
)

-- 연락처 (Contacts)
contacts (
  id, account_id, name, 
  role, phone, email, 
  is_primary
)

-- 제품 (Products)
products (
  id, name, sku, category,
  unit_price, unit_size,
  min_order_qty, 
  is_active
)

-- 주문 (Orders)
orders (
  id, account_id, 
  order_date, delivery_date,
  status, total_amount,
  created_by
)

-- 주문 상세 (Order Items)
order_items (
  id, order_id, product_id,
  quantity, unit_price, 
  discount, subtotal
)

-- 영업사원 (Sales Reps)
sales_reps (
  id, name, email, phone,
  region, is_active
)

-- 활동 로그 (Activities)
activities (
  id, account_id, 
  activity_type, -- visit, call, email, order
  notes, created_by, created_at
)
```

## Phase 1 MVP 범위

1. ✅ 거래처 CRUD
2. ✅ 제품 카탈로그
3. ✅ 주문 생성/조회
4. ✅ 기본 대시보드
5. ✅ 사용자 인증 (Supabase Auth)

## 다음 단계

- [ ] Slack 채널 생성: `#proj-lotte-crm`
- [ ] Supabase 프로젝트 생성
- [ ] Next.js 보일러플레이트 세팅
- [ ] DB 스키마 구현
- [ ] 기본 UI 컴포넌트

---

*Generated: 2026-01-29*
