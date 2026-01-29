# Lotte Chilsung CRM

> B2B CRM system for Lotte Chilsung Beverage distribution management

## Overview

음료 유통 특화 CRM 시스템 - 거래처, 주문, 영업사원, 재고 관리

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Deployment**: Vercel

## Features

### Core Modules
- 🏢 **거래처 관리** - 도매상, 소매점, 대형유통
- 📦 **주문 관리** - 생성, 추적, 배송 일정
- 👥 **영업사원 관리** - 구역 배정, 실적 트래킹
- 📊 **대시보드** - 매출 분석, 리포팅

### Phase 1 (MVP)
- [ ] 사용자 인증
- [ ] 거래처 CRUD
- [ ] 제품 카탈로그
- [ ] 주문 생성/조회
- [ ] 기본 대시보드

## Project Structure

```
lotte-crm/
├── README.md
├── RESEARCH.md
├── apps/
│   └── web/          # Next.js app
├── packages/
│   └── db/           # Supabase schema & types
└── docs/
    └── requirements/ # Business requirements
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test
```

## Links

- Slack: `#proj-lotte-crm`
- Client: Lotte Chilsung Beverage

---

*Client: Lotte | Project: CRM | Started: 2026-01-29*
