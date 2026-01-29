# 롯데칠성 CRM MVP

음료 유통 전문 CRM 시스템 - 거래처, 주문, 제품, 영업사원 관리

## 🚀 Live Demo

**https://web-three-nu-39.vercel.app**

현재 데모 모드로 동작하며, 샘플 데이터가 표시됩니다.

## ✨ 주요 기능

### 1. 거래처 관리 (Accounts)
- 도매상, 소매점, 대형유통 구분
- 거래처 등급 시스템 (브론즈/실버/골드/플래티넘)
- 신용 한도 관리
- 영업사원 배정

### 2. 제품 관리 (Products)
- 제품 카탈로그 CRUD
- 카테고리별 분류 (탄산음료, 주스, 커피, 차, 스포츠음료, 생수, 주류)
- 최소 주문 수량 설정
- 판매 상태 관리

### 3. 주문 관리 (Orders)
- 주문 생성 (다중 품목)
- 배송 일정 관리
- 주문 상태 추적 (대기중 → 확정 → 배송중 → 배송완료)
- 할인 적용

### 4. 영업사원 관리 (Sales Reps)
- 담당 구역 배정
- 거래처 배정
- 실적 트래킹

### 5. 대시보드
- 매출 현황
- 주문 현황
- 거래처별 실적
- 영업사원 실적

## 🛠️ 기술 스택

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## 📦 로컬 개발

```bash
# 의존성 설치
pnpm install

# 개발 서버 시작
pnpm dev
```

## 🔧 Supabase 연결하기

### 1. Supabase 프로젝트 생성
1. [supabase.com](https://supabase.com)에서 새 프로젝트 생성
2. Project URL과 anon key 복사

### 2. 데이터베이스 스키마 설정
Supabase SQL Editor에서 `supabase/schema.sql` 내용 실행

### 3. 환경변수 설정

로컬 개발:
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Vercel 배포:
1. Vercel 프로젝트 Settings → Environment Variables
2. 위 환경변수 추가
3. 재배포

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── (dashboard)/     # 메인 대시보드 레이아웃
│   │   ├── page.tsx     # 대시보드 홈
│   │   ├── customers/   # 거래처 관리
│   │   ├── products/    # 제품 관리
│   │   ├── orders/      # 주문 관리
│   │   └── sales-reps/  # 영업사원 관리
│   └── login/           # 로그인 페이지
├── components/
│   ├── ui/              # shadcn/ui 컴포넌트
│   ├── accounts/        # 거래처 관련 컴포넌트
│   ├── products/        # 제품 관련 컴포넌트
│   ├── orders/          # 주문 관련 컴포넌트
│   └── sales-reps/      # 영업사원 관련 컴포넌트
├── lib/
│   ├── actions/         # Server Actions
│   ├── supabase/        # Supabase 클라이언트
│   ├── database.types.ts # TypeScript 타입
│   └── demo-data.ts     # 데모 데이터
└── supabase/
    └── schema.sql       # 데이터베이스 스키마
```

## 📄 License

MIT
