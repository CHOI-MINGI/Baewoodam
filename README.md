# 배우담 (Baewoodam)

배우와 에이전시를 연결하는 캐스팅 플랫폼 앱

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: PostgreSQL (Supabase) + Prisma v7
- **Auth**: NextAuth v5 (Credentials + Google)
- **Storage**: Supabase Storage
- **State**: Zustand + TanStack Query

## Design System

| Token | Value |
|---|---|
| Brand (red) | `#E53935` |
| Dark navy | `#1A1A2E` |
| Background | `#F5F5F5` |
| Text primary | `#1A1A1A` |
| Text secondary | `#888888` |
| Font | Pretendard |

## Getting Started

```bash
# 1. 환경변수 설정
cp .env.example .env.local
# .env.local 에 DATABASE_URL, NEXTAUTH_SECRET, SUPABASE_* 값 입력

# 2. 의존성 설치
npm install

# 3. DB 마이그레이션
npx prisma migrate dev

# 4. Supabase 버킷 생성
npx ts-node src/scripts/create-buckets.ts

# 5. 개발 서버 실행
npm run dev
```

## Environment Variables

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # 회원가입·로그인 플로우
│   ├── (main)/          # 메인 탭 화면 (홈·배우·프로젝트·캐스팅·알림)
│   ├── (mypage)/        # 마이페이지 · 설정
│   └── api/             # API Routes
├── components/
│   ├── shared/          # BottomTabBar, DrumrollPicker, FilterBottomSheet …
│   ├── filmography/
│   └── ui/              # shadcn 컴포넌트
├── constants/           # 공통 상수 (장르·지역·역할 맵 등)
├── lib/                 # auth, db, storage 유틸
└── types/               # 공통 TypeScript 타입
```

## Key Features

- **배우 탐색**: 나이대·성별·지역·필모 편수 필터, 드럼롤 피커
- **캐스팅 제안**: 에이전시→배우 제안 발송, 수락/거절, 오디션 영상 제출
- **필모그래피 관리**: 연도별 타임라인, 썸네일 업로드
- **쇼릴 업로드**: Supabase Storage 직접 업로드, 진행 바
- **PWA**: 홈 화면 추가, 오프라인 대응
- **알림**: 캐스팅 상태 변경 실시간 알림
