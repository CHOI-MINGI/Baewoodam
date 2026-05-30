# 배우담 (Baewoodam)

> 배우와 에이전시를 잇는 캐스팅 플랫폼

배우는 프로필과 포트폴리오를 등록하고 캐스팅 제안을 받습니다.  
에이전시는 프로젝트와 배역을 만들고 어울리는 배우를 찾아 제안을 보냅니다.

---

## 기술 스택

| 분류 | 기술 |
|---|---|
| 프레임워크 | Next.js 15 (App Router) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS |
| 데이터베이스 | PostgreSQL (Supabase) |
| ORM | Prisma |
| 인증 | NextAuth.js (credentials) |
| 스토리지 | Supabase Storage |
| 유효성 검사 | Zod + react-hook-form |
| 이미지 크롭 | react-easy-crop |
| 레이트 리밋 | Upstash Redis |

---

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 만들고 아래 값을 채웁니다.

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="랜덤 문자열"
NEXTAUTH_URL="http://localhost:3000"

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# Upstash Redis (레이트 리밋, 선택)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

### 3. DB 마이그레이션

```bash
npm run db:migrate
```

### 4. 개발 서버 실행

```bash
npm run dev
```

### 5. Supabase Storage 버킷 생성 (최초 1회)

```bash
npm run setup:buckets
```

---

## 주요 명령어

```bash
npm run dev          # 개발 서버 (localhost:3000)
npm run build        # 프로덕션 빌드 (prisma generate 포함)
npm run db:migrate   # DB 마이그레이션 실행
npm run db:studio    # Prisma Studio (DB 시각화)
npm run db:reset     # DB 초기화 (개발용)
```

---

## 기능 상세 설명

> 로그인한 사람이 누구냐에 따라 화면이 다르게 보입니다.  
> 코드에서는 `roleType` 값으로 구분합니다. (`AGENCY` = 에이전시, `ACTOR` = 배우)

---

### 1. 회원가입 · 로그인

#### 전체 플로우

```
로그인 화면 (/login)
    └─ "회원가입" 클릭
           ↓
    역할 선택 (/signup)
    ┌──────────────┐  ┌──────────────────┐
    │  배우         │  │  에이전시 / 감독  │
    └──────────────┘  └──────────────────┘
           ↓
    약관 동의 (/signup/terms?role=ACTOR|AGENCY)
           ↓
    이메일 · 비밀번호 입력 (/signup/basic?role=...)
           ↓
    프로필 설정
    ├─ 배우:      이름 · 나이대 · 사진  (/signup/profile)
    └─ 에이전시:  이름 · 소속 · 직무   (/signup/agency)
           ↓
    가입 완료 (/signup/complete)
```

#### 화면별 입력 항목

| 화면 | 경로 | 입력 항목 |
|---|---|---|
| 역할 선택 | `/signup` | 배우 / 에이전시·감독 선택 |
| 약관 동의 | `/signup/terms` | 서비스 이용약관(필수), 개인정보(필수), 마케팅(선택) |
| 기본 정보 | `/signup/basic` | 이메일, 비밀번호(영문+숫자 8자 이상), 비밀번호 확인 |
| 배우 프로필 | `/signup/profile` | 이름, 한 줄 소개, 나이대, 프로필 사진(3:4 크롭) |
| 에이전시 프로필 | `/signup/agency` | 이름, 소속사명, 직무 |

- 비밀번호는 bcrypt로 해시 저장
- 가입 직후 자동 로그인 처리
- 이메일 중복 시 에러 메시지 표시

---

### 2. 캐스팅 제안 (핵심 기능)

#### 한 줄 요약

에이전시가 배우에게 "우리 작품에 출연해 주세요" 하고 제안을 보내고,  
배우가 수락한 뒤 오디션 영상을 제출하면, 에이전시가 최종 결정하는 기능입니다.

#### 등장인물

| 역할 | 하는 일 |
|---|---|
| **에이전시** | 작품·배역을 만들고, 어울리는 배우를 찾아 제안을 보냄 |
| **배우** | 제안을 받고, 수락/거절하고, 오디션 영상을 제출함 |

#### 전체 흐름

```
[에이전시]
1. 프로젝트(작품) 생성            → /projects/new
2. 배역(캐릭터) 등록               → /projects/[id]/characters
3. 배역마다 "배우 찾기" 클릭
   → 배우를 골라 제안 발송         → /casting/send
        │
        │  배우에게 제안 도착 + 알림
        ▼
[배우]
4. "받은 제안" 목록 확인           → /casting
5. 제안 상세 확인 후 수락 / 거절    → /casting/[id]
6. 수락 시 오디션 영상 제출         → /casting/[id]/accept
        │
        │  에이전시에게 영상 전달 + 알림
        ▼
[에이전시]
7. 오디션 영상 확인                → /casting/[id]
```

#### 제안 상태 5가지

| 상태값 | 한글 | 의미 |
|---|---|---|
| `PENDING` | 대기중 | 제안 발송, 배우 미응답 |
| `ACCEPTED` | 수락 | 배우 수락 (오디션 영상 없음) |
| `AUDITION_SUBMITTED` | 오디션 제출 | 배우가 오디션 영상까지 제출 |
| `REJECTED` | 거절 | 배우가 거절 (거절 사유 포함 가능) |
| `EXPIRED` | 만료 | 기한 초과 자동 마감 |

정상 흐름: `PENDING → ACCEPTED → AUDITION_SUBMITTED`  
거절 흐름: `PENDING → REJECTED`

#### 화면별 상세

**제안 보내기 `/casting/send`**

두 가지 진입 경로:

- **배역에서 출발** (`?projectId=xxx&characterId=yyy`)
  1. 3D 캐러셀로 배우 선택 (나이대·성별·지역·필모 수 필터)
  2. 촬영 기간·지역·출연 조건·메시지 작성 후 발송
- **배우에서 출발** (`?actorId=xxx`)
  - 배우가 정해진 상태에서 작품·배역 선택 후 발송

**제안 목록 `/casting`**

- 에이전시 → "보낸 제안" 목록
- 배우 → "받은 제안" 목록
- 탭 필터: 전체 / 대기중 / 수락 / 거절 / 마감

**제안 상세 `/casting/[id]`**

| 대상 | 상태 | 표시 |
|---|---|---|
| 배우 | PENDING | [수락하기] [거절하기] 버튼 |
| 배우 | ACCEPTED | [오디션 영상 제출하기] 버튼 |
| 에이전시 | PENDING | "배우의 응답을 기다리는 중" |
| 에이전시 | ACCEPTED | "오디션 제출을 기다리는 중" |
| 에이전시 | AUDITION_SUBMITTED | 오디션 영상 재생 가능 |

**오디션 제출 `/casting/[id]/accept`**

- mp4/mov 영상 업로드 + 코멘트 입력
- 제출 시 상태 `AUDITION_SUBMITTED` 로 변경 + 에이전시 알림

#### DB 저장 구조 (CastingOffer 테이블)

| 컬럼 | 설명 | 누가 채우나 |
|---|---|---|
| project / character | 어떤 작품의 어떤 배역인지 | 에이전시 |
| sender | 제안 보낸 에이전시 | 에이전시 |
| receiver | 제안 받는 배우 | 에이전시 |
| shootingPeriod | 촬영 기간 | 에이전시 |
| shootingLocation | 촬영 지역 | 에이전시 |
| conditions | 출연 조건 | 에이전시 |
| message | 배우에게 보내는 말 | 에이전시 |
| status | 현재 상태 | 시스템 (자동) |
| rejectReason | 거절 사유 | 배우 (거절 시) |
| auditionVideoUrl | 오디션 영상 주소 | 배우 (제출 시) |
| auditionNote | 오디션 코멘트 | 배우 (제출 시) |

---

### 3. 배우 프로필 · 포트폴리오

#### 마이페이지 `/mypage`

- 배경 이미지 (16:9 크롭 업로드)
- 프로필 사진 · 이름 · 나이대 · 지역 · 프로필 완성도 막대
- 공개/비공개 토글 (비공개 시 배우 검색에서 숨김)
- 필모그래피 목록 (연도별 그룹)
- 스킬 및 특기
- 대표 영상 (isFeatured 작품 + 쇼릴)
- 최근 활동 (필모 등록 / 쇼릴 업로드 / 캐스팅 수락·거절, 최신 4건)

#### 배우 프로필 수정 `/profile-edit`

| 항목 | 입력 방식 |
|---|---|
| 프로필 사진 | 파일 선택 → 3:4 비율 크롭 |
| 이름 | 텍스트 입력 |
| 한 줄 소개 | 텍스트 입력 |
| 활동 지역 | 드럼롤 피커 |
| 소속 | 텍스트 자유 입력 |
| 나이대 | 드럼롤 피커 |
| 성별 | 드럼롤 피커 (남성/여성) |
| 연락 가능한 시간 | 텍스트 입력 |
| 메모 (캐스팅 디렉터에게) | 텍스트 입력 |

#### 배우 프로필 상세 (남이 볼 때) `/actors/[id]`

- 배경 이미지 · 프로필 사진 · 기본 정보
- 필모그래피 / 스킬 / 쇼릴
- 에이전시 계정으로 보면 "캐스팅 제안 보내기" 버튼 표시

---

### 4. 필모그래피 관리

#### 목록 `/filmography`

- 연도별 그룹으로 표시
- 수정(✏️) · 삭제(✕) 버튼

#### 등록 · 수정 `/filmography/new`, `/filmography/[id]`

| 항목 | 설명 |
|---|---|
| 작품명 | 필수 |
| 미디어 타입 | 드라마·영화·OTT·웹드라마·단편·광고·뮤직비디오·기타 |
| 배역 구분 | 주연·조연·단역·기타 |
| 캐릭터명 | 선택 |
| 장르 | 선택 |
| 연도 | 드럼롤 피커 |
| 썸네일 | 이미지 업로드 |
| YouTube URL | 입력 시 썸네일 자동 추출 |
| 설명 | 선택 |

---

### 5. 쇼릴 (대표 영상) 관리

#### 목록 `/showreel`

- 등록된 쇼릴 카드 목록
- 썸네일 클릭 → "대표영상으로 설정할까요?" 확인
  - ★ 배지로 현재 대표 표시
  - 하나만 대표 가능 (설정 시 나머지 자동 해제)
- 수정(✏️) · 삭제(✕)

#### 등록 `/showreel/new`

- 영상 파일 업로드 (Supabase Storage `showreels` 버킷)
- 제목 · 설명 · 태그 입력

---

### 6. 작품 관리 (YouTube)

#### 목록 `/works`

- YouTube 작품 + 쇼릴 한 화면에 표시
- **★ 대표영상 설정** 버튼
  - 선택 모드 진입 → 작품 클릭 → "대표영상으로 설정할까요?" 확인
  - 대표 작품 클릭 시 해제 가능
  - 하나만 대표 가능

#### 등록 `/works/new`

- YouTube URL 입력 → oEmbed API로 제목·썸네일 자동 추출
- 장르 · 연도 · 내 역할 · 설명 · 공개여부 설정

---

### 7. 에이전시 홈 (배우 탐색)

경로: `/home` (에이전시 계정)

#### 3D 캐러셀 (추천 배우)

- CSS `perspective` + `rotateY` 로 원근감 있는 3D 카드 구현
- 중앙 카드 크게, 양옆 카드 `rotateY(±42deg) scale(0.80)` 로 표시
- 좌우 화살표 버튼 / 하단 아바타 썸네일 클릭으로 탐색
- 중앙 배우 클릭 → 해당 배우 프로필 상세로 이동

#### 필터

| 필터 | 방식 |
|---|---|
| 나이대 | 드럼롤 피커 |
| 성별 | 드럼롤 피커 |
| 활동 지역 | 목록 선택 |
| 필모 수 | 단일 슬라이더 (X편 이상, 최대 50) |

#### 전체 배우 그리드

- 4열 그리드 · 필터 조건 실시간 반영

---

### 8. 프로젝트 관리 (에이전시)

#### 목록 `/projects`

- 상태 탭: 전체 / 모집중 / 진행중 / 완료됨
- 카드에 제목 · 미디어타입 · 캐스팅 진행률 막대 표시

#### 생성 `/projects/new`

- 제목 · 미디어타입 · 장르 · 플랫폼 · 줄거리 · 시놉시스

#### 배역(캐릭터) 관리 `/projects/[id]/characters`

- 캐릭터 이름 · 나이대 · 성별 · 설명 · 키워드 등록
- 각 캐릭터마다 **"배우 찾기"** 버튼 → 제안 전송 화면으로 이동
- 추가 · 수정 · 삭제

---

### 9. 알림

경로: `/notifications`

| 트리거 | 알림 대상 | 내용 |
|---|---|---|
| 에이전시가 제안 발송 | 배우 | "새 캐스팅 제안이 도착했어요" |
| 배우가 수락 | 에이전시 | "배우가 제안을 수락했어요" |
| 배우가 거절 | 에이전시 | "배우가 제안을 거절했어요" |
| 배우가 오디션 제출 | 에이전시 | "오디션 영상이 제출됐어요" |

- 읽지 않은 알림 개수 → 하단 탭바 뱃지에 표시
- 알림 클릭 → 해당 제안 상세로 이동

---

### 10. 설정

경로: `/settings`

- 이름 · 이메일 표시
- 에이전시 계정이면 소속 · 직무도 표시
- **프로필 수정** 클릭 → roleType에 따라 자동 분기
  - 배우 → `/profile-edit`
  - 에이전시 → `/profile-edit/agency`
- 알림 설정 (캐스팅 제안 / 댓글·좋아요 / 서비스 공지)
- 로그아웃
- 계정 삭제 (삭제 전 주의 사항 모달 + 재확인)

---

### 11. 이미지 크롭

프로필·배경 사진은 업로드 전 반드시 크롭 UI를 거칩니다.

| 위치 | 비율 | 경로 |
|---|---|---|
| 배우 프로필 사진 (회원가입) | 3:4 | `/signup/profile` |
| 배우 프로필 사진 (수정) | 3:4 | `/profile-edit` |
| 배경 이미지 | 16:9 | `/mypage` |

- 드래그 → 위치 조절
- 마우스 휠 / 하단 슬라이더 / 핀치 줌 → 크기 조절
- 출력 최대 1200px 너비로 자동 제한

---

## 영상 두 종류 구분

| 종류 | 무엇 | 어디 저장 | 공개 범위 |
|---|---|---|---|
| **쇼릴** | 배우의 평소 대표 연기 모음 | Supabase Storage | 누구나 |
| **오디션 영상** | 특정 배역을 위해 새로 찍은 영상 | Supabase Storage | 해당 제안의 에이전시만 |

> 비유: 쇼릴 = 포트폴리오, 오디션 영상 = 해당 회사 면접 실기

---

## 데이터베이스 주요 모델

```
User
├── ActorProfile      배우 전용 (나이대·성별·신체·스킬)
├── AgencyProfile     에이전시 전용 (소속·직무)
├── Filmography[]     필모그래피
├── Showreel[]        쇼릴
├── Work[]            YouTube 작품
├── Project[]         에이전시가 만든 프로젝트
├── CastingOffer[]    보낸/받은 제안
└── Notification[]    알림

Project
└── Character[]       배역 목록

CastingOffer
├── sender   → User (에이전시)
├── receiver → User (배우)
├── project  → Project
├── character → Character
└── status: PENDING | ACCEPTED | AUDITION_SUBMITTED | REJECTED | EXPIRED
```

---

## 파일 구조

```
src/
├── app/
│   ├── (auth)/                   # 로그인·회원가입 레이아웃
│   │   ├── login/
│   │   └── signup/
│   │       ├── page.tsx          # 역할 선택
│   │       ├── terms/            # 약관 동의
│   │       ├── basic/            # 이메일·비밀번호
│   │       ├── profile/          # 배우 프로필 설정
│   │       └── agency/           # 에이전시 프로필 설정
│   ├── (main)/                   # 메인 레이아웃 (사이드바)
│   │   ├── home/                 # 홈 (배우·에이전시 분기)
│   │   ├── actors/               # 배우 탐색·상세
│   │   ├── casting/              # 제안 목록·상세·발송·오디션
│   │   ├── projects/             # 프로젝트 관리 (에이전시)
│   │   ├── works/                # 작품 관리
│   │   └── notifications/        # 알림
│   ├── (mypage)/                 # 마이페이지 레이아웃
│   │   ├── mypage/               # 포트폴리오
│   │   ├── profile-edit/         # 배우 프로필 수정
│   │   │   └── agency/           # 에이전시 프로필 수정
│   │   ├── filmography/          # 필모그래피
│   │   ├── showreel/             # 쇼릴
│   │   ├── skills/               # 스킬
│   │   └── settings/             # 설정
│   └── api/                      # API 라우트
│       ├── actors/
│       ├── casting/
│       ├── filmography/
│       ├── projects/
│       ├── showreel/
│       ├── users/
│       │   ├── me/               # 내 정보 조회·수정
│       │   └── activity/         # 최근 활동
│       └── works/
├── components/
│   ├── home/
│   │   ├── ActorHome.tsx         # 배우 홈
│   │   └── AgencyHome.tsx        # 에이전시 홈 (3D 캐러셀)
│   └── shared/
│       ├── Sidebar.tsx
│       ├── BottomTabBar.tsx
│       ├── DrumrollPicker.tsx
│       ├── FilterBottomSheet.tsx
│       └── ImageCropper.tsx      # 이미지 크롭 UI
├── lib/
│   ├── auth.ts                   # NextAuth 설정
│   ├── db.ts                     # Prisma 클라이언트
│   ├── storage.ts                # Supabase Storage 헬퍼
│   └── cropImage.ts              # Canvas 크롭 유틸
├── types/index.ts                # 공통 타입 정의
└── constants/index.ts            # 공통 상수

prisma/
└── schema.prisma                 # DB 스키마
```

---

## Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 프리뷰 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 환경 변수 등록

Vercel 대시보드 → **Settings → Environment Variables** 에서  
`.env` 파일의 모든 키를 동일하게 등록합니다.

> `NEXTAUTH_URL` 은 배포된 실제 도메인으로 변경해야 합니다.  
> 예: `https://baewoodam.vercel.app`

### 빌드 설정

`package.json`의 build 스크립트에 `prisma generate` 가 포함되어 있어  
별도 설정 없이 Vercel에서 자동 실행됩니다.

```json
"build": "prisma generate && next build"
```
