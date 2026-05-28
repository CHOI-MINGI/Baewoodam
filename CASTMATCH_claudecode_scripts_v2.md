# CASTMATCH (배우담) — Claude Code 스크립트 v2
# 피그마 디자인 반영 업데이트

---

## 디자인 시스템 요약 (전체 스크립트에 적용)

```
디자인 토큰:
- 배경: #FFFFFF, #F5F5F5
- 텍스트: #1A1A1A (primary), #888888 (secondary)
- 포인트 컬러: #E53935 (레드) — 선택/활성 상태
- 버튼: 배경 #1A1A2E (다크 네이비), 텍스트 흰색, border-radius: 9999px (완전 라운드)
- 비활성 버튼: 배경 #D9D9D9, 텍스트 #999999
- 인풋: 하단 보더만 있는 스타일 (border-bottom: 1px solid #E0E0E0)
- 에러 컬러: #E53935
- 태그/배지: 테두리형 (border: 1px solid #E0E0E0), 선택 시 border-color: #E53935, color: #E53935
- 폰트: Pretendard
- 모바일 기준: 375px 너비, iOS 스타일
```

---

## SCRIPT 01 — 프로젝트 초기화 + 패키지 설치

```
Next.js 14 App Router 기반의 배우담(CASTMATCH) 웹앱을 세팅해줘.

1. Next.js 프로젝트 생성:
npx create-next-app@latest baewoodam --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

2. baewoodam 디렉토리로 이동 후 패키지 설치:
npm install zustand @tanstack/react-query @tanstack/react-query-devtools
npm install next-auth@beta
npm install prisma @prisma/client
npm install zod react-hook-form @hookform/resolvers
npm install @upstash/redis @upstash/ratelimit
npm install resend
npm install next-pwa
npm install lucide-react
npm install date-fns
npm install clsx tailwind-merge
npm install bcryptjs
npm install -D @types/bcryptjs
npm install sharp
npm install @supabase/supabase-js

3. npx prisma init 실행

4. npx shadcn@latest init
   - Style: Default
   - Base color: Neutral
   - CSS variables: Yes

5. shadcn 컴포넌트 설치:
npx shadcn@latest add button input label card badge avatar tabs dialog select textarea toast dropdown-menu separator skeleton sheet slider switch

6. tailwind.config.ts에 Pretendard 폰트와 커스텀 컬러 추가:
- 포인트 컬러: primary: '#E53935'
- 다크 버튼: dark: '#1A1A2E'  
- 배경: bg-app: '#F5F5F5'

7. src/lib/utils.ts — cn 유틸 함수 (clsx + tailwind-merge)

8. globals.css에 Pretendard 폰트 import 추가:
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
body { font-family: 'Pretendard', sans-serif; }

설치 완료 후 package.json 보여줘.
```

---

## SCRIPT 02 — 폴더 구조

```
배우담 프로젝트 폴더 구조를 만들어줘.

src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── signup/
│   │   │   ├── terms/          # 약관동의
│   │   │   ├── basic/          # 이메일/비밀번호
│   │   │   ├── profile/        # 이름/사진/나이대 (배우)
│   │   │   ├── agency/         # 소속/직무/선호장르 (에이전시)
│   │   │   └── complete/       # 가입완료
│   │   ├── password-reset/     # 비밀번호 재설정
│   │   └── layout.tsx
│   ├── (main)/
│   │   ├── home/               # 배우 추천 리스트
│   │   ├── actors/
│   │   │   └── [id]/           # 배우 프로필 상세
│   │   ├── projects/           # 프로젝트 목록
│   │   │   ├── new/
│   │   │   └── [id]/
│   │   │       └── characters/
│   │   │           └── new/
│   │   ├── casting/            # 캐스팅 제안
│   │   │   ├── send/           # 제안 보내기
│   │   │   └── [id]/           # 제안 상세
│   │   ├── notifications/      # 알림
│   │   └── layout.tsx          # 하단 탭바 포함
│   ├── (mypage)/
│   │   ├── mypage/             # 배우 마이페이지
│   │   ├── filmography/        # 필모그래피 수정
│   │   │   └── [id]/           # 작품 편집
│   │   ├── showreel/
│   │   │   └── new/            # 쇼릴 추가
│   │   ├── settings/           # 설정/계정관리
│   │   └── profile-edit/       # 프로필 편집
│   └── api/
│       ├── auth/
│       ├── users/
│       ├── actors/
│       ├── filmography/
│       ├── showreel/
│       ├── projects/
│       ├── casting/
│       └── notifications/
├── components/
│   ├── ui/                     # shadcn
│   ├── auth/
│   ├── actor/
│   ├── filmography/
│   ├── showreel/
│   ├── project/
│   ├── casting/
│   ├── notification/
│   └── shared/
│       ├── BottomTabBar.tsx
│       ├── TopHeader.tsx
│       ├── FilterBottomSheet.tsx
│       └── DrumrollPicker.tsx
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   ├── redis.ts
│   ├── email.ts
│   ├── storage.ts              # Supabase Storage
│   └── validations/
├── hooks/
├── store/
├── types/
└── constants/

.env.local:
DATABASE_URL=""
DIRECT_URL=""
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
RESEND_API_KEY=""
FROM_EMAIL="noreply@baewoodam.com"
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""
```

---

## SCRIPT 03 — Prisma 스키마

```
배우담 Prisma 스키마를 prisma/schema.prisma에 작성해줘.

1. User
- id (cuid)
- email (unique)
- emailVerified (DateTime?)
- passwordHash (String?)
- name (String?)
- image (String?)           # Supabase Storage URL
- roleType (Enum: ACTOR, AGENCY, ADMIN)
- onboardingCompleted (Boolean default false)
- bio (String?)             # 한 줄 소개
- location (String?)        # 활동 지역
- contactableTime (String?) # 연락 가능한 시간 (예: "평일 10:00-19:00")
- contactMemo (String?)     # 캐스팅 디렉터에게 보내는 메모
- isActive (Boolean default true)
- createdAt, updatedAt

2. ActorProfile (배우 전용 추가 정보)
- id (cuid)
- userId (User 1:1)
- ageRange (Enum: TEENS, TWENTIES, THIRTIES, FORTIES, FIFTIES)
- gender (Enum: MALE, FEMALE, OTHER)
- height (Int?)
- weight (Int?)
- skills (String[])         # 스킬 및 특기 태그
- preferredGenres (String[]) # 선호 장르
- publicPortfolioUrl (String?) # 외부 포트폴리오 링크

3. AgencyProfile (에이전시 전용)
- id (cuid)
- userId (User 1:1)
- companyName (String?)     # 소속 회사명
- position (String?)        # 직무 (실장, 팀장 등)
- preferredGenres (String[])

4. Filmography (필모그래피)
- id (cuid)
- userId (User 참조)
- title (String)            # 작품명
- mediaType (Enum: FILM, DRAMA, OTT, WEB_DRAMA, SHORT_FILM, AD, MUSIC_VIDEO, OTHER)
- role (Enum: LEAD, SUPPORTING, EXTRA, OTHER)
- characterName (String?)   # 배역명
- genre (String?)           # 장르 한 줄 설명
- year (Int)
- thumbnailUrl (String?)    # 포스터 이미지
- description (String?)     # 한 줄 설명
- sortOrder (Int default 0)
- createdAt, updatedAt

5. Showreel (배우 쇼릴/대표 영상)
- id (cuid)
- userId (User 참조)
- title (String)
- description (String?)
- videoUrl (String)         # Supabase Storage URL (mp4/mov)
- thumbnailUrl (String?)    # 자동 생성 또는 업로드
- duration (Int?)           # 초 단위
- filmographyId (String?)   # 관련 작품 연결
- tags (String[])           # 해시태그
- isFeatured (Boolean default false)
- sortOrder (Int default 0)
- createdAt, updatedAt

6. Project (캐스팅 프로젝트 - 에이전시용)
- id (cuid)
- ownerUserId (User 참조)
- title (String)
- mediaType (Enum: DRAMA, FILM, OTT, WEB_DRAMA, AD, OTHER)
- genre (String?)
- platform (String?)        # OTT 플랫폼 등
- logline (String?)         # 로그라인
- synopsis (String?)        # 시놉시스
- recruitStatus (Enum: OPEN, IN_PROGRESS, CLOSED default OPEN)
- createdAt, updatedAt

7. Character (프로젝트 캐릭터)
- id (cuid)
- projectId (Project 참조)
- name (String)             # 역할명
- ageRange (Enum 같은 것)
- gender (같은 Enum)
- description (String?)     # 한 줄 설명
- keywords (String[])       # 키워드 태그
- castingStatus (Enum: OPEN, CASTING, CAST default OPEN)
- createdAt, updatedAt

8. CastingOffer (캐스팅 제안)
- id (cuid)
- projectId (Project 참조)
- characterId (Character 참조)
- senderUserId (User - 에이전시)
- receiverUserId (User - 배우)
- shootingPeriod (String?)  # 촬영 예상 기간
- shootingLocation (String?) # 주요 촬영 지역
- conditions (String?)      # 출연 조건
- message (String?)         # 배우에게 전하고 싶은 말
- status (Enum: PENDING, ACCEPTED, REJECTED, AUDITION_SUBMITTED, EXPIRED)
- rejectReason (String?)
- auditionVideoUrl (String?) # Supabase Storage URL
- auditionNote (String?)    # 기타 정보
- createdAt, updatedAt

9. Notification (알림)
- id (cuid)
- userId (User 참조)
- type (Enum: CASTING, FEED, SYSTEM)
- title (String)
- body (String)
- link (String?)
- isRead (Boolean default false)
- createdAt

10. RecentlyViewedActor (최근 본 배우 - 에이전시용)
- id (cuid)
- viewerUserId (에이전시)
- actorUserId (배우)
- viewedAt (DateTime)

모든 인덱스 추가 후 npx prisma generate 실행.
```

---

## SCRIPT 04 — 공통 상수 + 타입

```
배우담 공통 상수와 타입 파일을 만들어줘.

1. src/constants/index.ts

AGE_RANGE_OPTIONS: ['10대', '20대', '30대', '40대', '50대']
AGE_RANGE_MAP: { TEENS: '10대', TWENTIES: '20대', THIRTIES: '30대', FORTIES: '40대', FIFTIES: '50대' }

GENDER_OPTIONS: ['남성', '여성']

LOCATION_OPTIONS: [
  '서울', '경기도', '인천', '부산', '대구', '광주', '대전', '울산',
  '세종', '강원도', '충청북도', '충청남도', '전라북도', '전라도',
  '경상북도', '경상도', '제주도'
]

GENRE_OPTIONS: ['드라마', '로맨스', '코미디', '액션', '스릴러', 'SF', '판타지', '공포', '범죄', '역사']

MEDIA_TYPE_OPTIONS: ['드라마', '영화', 'OTT', '웹드라마', '단편', '광고', '뮤직비디오', '기타']
MEDIA_TYPE_MAP: { DRAMA: '드라마', FILM: '영화', OTT: 'OTT', ... }

ROLE_OPTIONS: ['주연', '조연', '단역', '기타']
ROLE_MAP: { LEAD: '주연', SUPPORTING: '조연', EXTRA: '단역', OTHER: '기타' }

POSITION_OPTIONS: ['실장', '팀장', '매니저', '대표', '프리랜서', '기타']

SKILL_SUGGESTIONS: [
  '액션(와이어 수중)', '피아노', '검술', '승마', '외국어 연기',
  '현대 무용', '발레', '노래', '기타(악기)', '운전', '승마',
  '보컬', '랩', '방언 연기', '카리스마', '청춘물 감성'
]

CASTING_STATUS_MAP: {
  PENDING: '대기중',
  ACCEPTED: '수락',
  REJECTED: '거절',
  AUDITION_SUBMITTED: '오디션 제출',
  EXPIRED: '만료'
}

NOTIFICATION_TYPE_MAP: { CASTING: '캐스팅', FEED: '피드', SYSTEM: '시스템' }

2. src/types/index.ts
- ActorListItem: 배우 목록용 (id, name, image, ageRange, location, skills, filmographyCount, showreelCount)
- ActorDetail: 배우 상세 (ActorListItem + bio, contactableTime, filmographies, showreels, portfolio)
- FilmographyItem: 필모그래피 항목
- ShowreelItem: 쇼릴 항목
- CastingOfferWithDetails: 제안 + 프로젝트 + 캐릭터 + 발신자 + 수신자
- NotificationItem: 알림 항목

3. src/lib/db.ts — Prisma 싱글톤

4. src/lib/storage.ts — Supabase Storage 클라이언트
uploadFile(bucket, path, file) → URL 반환
deleteFile(bucket, path)
버킷: 'showreels', 'profiles', 'filmography-thumbnails', 'auditions'
```

---

## SCRIPT 05 — 인증 시스템

```
배우담 NextAuth v5 인증을 구현해줘.

1. src/lib/auth.ts
- Credentials Provider (이메일/비밀번호, bcryptjs)
- Google Provider
- PrismaAdapter
- JWT 전략
- 콜백: jwt에 id/roleType/onboardingCompleted 저장

2. src/app/api/auth/[...nextauth]/route.ts

3. src/app/api/auth/signup/route.ts
POST 처리:
- 이메일 중복 체크
- bcryptjs 해시
- User 생성 (onboardingCompleted: false)
- 201 반환

4. src/middleware.ts
보호 라우트: /home/*, /actors/*, /projects/*, /casting/*, /mypage/*, /settings/*, /notifications/*
온보딩 미완료 → /signup/profile 리다이렉트
이미 로그인 + /login, /signup 접근 → /home 리다이렉트
```

---

## SCRIPT 06 — 회원가입 플로우 (Step 1~2: 약관 + 기본정보)

```
배우담 회원가입 Step 1~2 화면을 만들어줘.

디자인 기준:
- 배경: 흰색
- 버튼: 완전 라운드(border-radius: 9999px), 활성화 시 #1A1A2E 다크, 비활성 시 #D9D9D9
- 인풋: 하단 보더만 있는 언더라인 스타일
- 에러 텍스트: #E53935 빨간색

1. src/app/(auth)/signup/terms/page.tsx
약관동의 화면:
- 상단: "서비스 이용을 위해\n약관에 동의 해주세요." 텍스트
- "약관 전체 동의" 체크박스 (선택 시 빨간 체크 아이콘)
- [필수] 서비스 이용약관 동의 (체크박스 + 화살표)
- [필수] 개인정보 처리방침 동의
- [선택] 마케팅 정보 수신 동의
- 전체 동의 시 "전체 동의하고 다음" 버튼 활성화
- 상태 관리: react-hook-form

2. src/app/(auth)/signup/basic/page.tsx
기본정보 입력 (3가지 상태: default/error/enable):
- 뒤로가기 ← + "회원가입" 타이틀
- 이메일 주소 인풋 (언더라인 스타일, 우측 X 클리어 버튼)
- 에러 시: 인풋 하단 보더 빨간색 + "형식이 올바르지 않아요." 빨간 텍스트
- 비밀번호 인풋 (우측 눈 아이콘 + X 버튼)
- 에러 시: "비밀번호 조건을 여기에 넣어주세요." 에러 텍스트
- 비밀번호 확인 인풋
- 에러 시: "비밀번호가 일치하지 않아요." 에러 텍스트
- 모든 조건 충족 시 "다음" 버튼 다크 활성화

Zod 검증:
- 이메일: email 형식
- 비밀번호: 최소 8자, 영문+숫자 조합
- 비밀번호 확인: password와 일치

3. src/app/(auth)/password-reset/page.tsx
비밀번호 재설정:
- 큰 타이틀 "비밀번호 재설정"
- 부제목 "가입하신 이메일 주소를 입력하면\n재설정 링크를 보내드릴게요"
- 이메일 인풋 (언더라인)
- 이메일 입력 시 "재설정 링크 보내기" 버튼 활성화
- POST /api/auth/password/reset-request 호출
```

---

## SCRIPT 07 — 회원가입 플로우 (Step 3: 배우 프로필 + 완료)

```
배우담 배우 회원가입 Step 3과 완료 화면을 만들어줘.

1. src/app/(auth)/signup/profile/page.tsx
배우 프로필 입력 (3가지 상태: default/나이대선택/enable):

- 뒤로가기 ← + "회원가입" 타이틀
- 프로필 사진 업로드:
  - 원형 회색 기본 아바타 (카메라 아이콘)
  - 클릭 시 파일 선택 → Supabase Storage 업로드
  - 업로드 후 실제 사진으로 교체
  - 우측 하단 연필 아이콘 오버레이
- 이름 인풋 (언더라인, 플레이스홀더: "활동명 입력")
- 한 줄 소개 Textarea (플레이스홀더: "캐릭터를 잘 나타내는 한 줄 소개를 작성해 보세요")
- 나이대 Select:
  - 클릭 시 하단에서 드럼롤 피커 스타일 바텀시트 등장
  - 목록: 50대 / 40대 / 30대(선택됨) / 20대 / 10대
  - 선택된 항목: 배경 흰색 + 텍스트 굵게, 위아래 항목 흐리게(opacity 낮춤)
  - "확인" 버튼으로 닫기
- 이름/소개/나이대 모두 입력 시 "다음" 버튼 활성화

2. src/components/shared/DrumrollPicker.tsx
드럼롤 스타일 피커 컴포넌트:
- 바텀시트 형태 (Sheet 사용)
- 5개 항목 보임, 중앙이 선택됨
- 선택된 항목: font-weight 600, 배경 #F5F5F5
- 위아래로 스크롤 가능
- 상단: "타이틀" 텍스트, 하단: "확인" 버튼

3. src/app/(auth)/signup/complete/page.tsx
회원가입 완료:
- 중앙 정렬
- 빨간 체크 원형 아이콘 (배경 #E53935, 흰색 체크)
- "회원가입이\n완료되었습니다." 굵은 타이틀
- "이제 서비스를 시작해 보세요!" 서브텍스트
- "홈으로" 버튼 (다크, 라운드)
→ 클릭 시 PATCH /api/users/me {onboardingCompleted: true} + /home 이동

4. src/app/api/users/me/route.ts
PATCH: roleType, onboardingCompleted, name, bio, ageRange, image 등 저장
GET: 현재 유저 정보 반환
```

---

## SCRIPT 08 — 에이전시 회원가입

```
배우담 에이전시 회원가입 화면을 만들어줘.

1. src/app/(auth)/signup/agency/page.tsx
에이전시 기본정보 (2가지 상태: default/enable):
- 뒤로가기 ← + "회원가입" 타이틀
- 소속 인풋 (언더라인, 플레이스홀더: "회사명 또는 프리랜서 입력")
- 직무 Select (드럼롤 피커: 실장/팀장/매니저/대표/프리랜서/기타)
- 선호 장르 (다중 선택 태그):
  - 우측 상단: "다중 선택 가능" 안내
  - 태그 목록: 드라마, 로맨스, 코미디, 액션, 스릴러, SF, 판타지
  - 기본: 테두리형 (#E0E0E0 보더)
  - 선택 시: 보더 #E53935, 텍스트 #E53935
- 소속+직무+장르 1개 이상 시 "다음" 활성화

에이전시 가입 완료는 공통 complete 페이지 사용.

2. src/app/api/auth/signup/route.ts 수정
body에 roleType('ACTOR' | 'AGENCY') 포함 받아서 처리
ACTOR면 → /signup/profile
AGENCY면 → /signup/agency
로 분기 안내 (클라이언트에서 처리)
```

---

## SCRIPT 09 — 공통 레이아웃 + 하단 탭바

```
배우담 메인 레이아웃과 하단 탭바를 만들어줘.

1. src/app/(main)/layout.tsx
- 콘텐츠 영역 + 하단 고정 탭바
- 모바일 기준 max-width: 430px, 중앙 정렬
- 콘텐츠 영역 padding-bottom: 80px (탭바 높이)

2. src/components/shared/BottomTabBar.tsx
하단 탭바 (5개 탭):
배우 로그인 시:
- 홈 → /home
- 추천 배우 → /actors (에이전시만? 배우는 뭐가 올지 확인 필요)
- 프로젝트 → /projects
- 알림 → /notifications (새 알림 있으면 빨간 dot)
- 마이 → /mypage

에이전시 로그인 시:
- 홈(배우 추천) → /home
- 프로젝트 → /projects
- 캐스팅 제안 → /casting
- 알림 → /notifications
- 마이 → /settings

탭 스타일:
- 기본: 아이콘 회색 + 라벨 회색
- 활성: 아이콘 #1A1A2E 다크 + 라벨 #1A1A2E
- 아이콘: lucide-react 사용

3. src/components/shared/TopHeader.tsx
상단 헤더:
- 좌측: ← 뒤로가기 버튼 (또는 없음)
- 중앙: 페이지 타이틀
- 우측: 액션 버튼 (검색, 설정 등 옵셔널)
props: title, showBack, rightAction

4. src/app/(main)/home/page.tsx
홈 화면 (배우 추천 리스트):
- 상단: "← '{캐릭터명}' 추천 배우" + 검색 아이콘
  (캐릭터명은 에이전시가 마지막으로 선택한 캐릭터 기반, 없으면 "인기 배우")
- 필터 칩 바 (가로 스크롤):
  나이대 ∨ | 성별 ∨ | 활동 지역 ∨ | 필모 수 ∨
  선택된 필터 칩: 배경 #1A1A2E 다크, 텍스트 흰색
  기본 칩: 흰색 배경, 회색 보더
- 배우 카드 (세로 스크롤):
  가로 너비 꽉 찬 카드, 세로로 쌓임
  카드 내용:
    - 배우 사진 (좌측, 정방형 130px, border-radius 8px)
    - 우측: 이름(굵게), 나이대·필모수, 스킬 태그들
    - 하단: 최근 본 배우 아바타들 (겹쳐진 스타일, 작게)
- 빈 상태: "조건에 맞는 배우가 없어요" + "필터 초기화" 버튼
- 최근 본 배우: 하단 고정 영역 (원형 아바타 4개)

5. src/components/shared/FilterBottomSheet.tsx
필터 바텀시트 (Sheet 컴포넌트 사용):
- 나이대 필터: 드럼롤 피커
- 성별 필터: 드럼롤 피커 (여자/남자)
- 활동 지역: 리스트 선택 (경기도/서울/전라도/경상도/제주도 등)
- 필모 수: 범위 슬라이더 (0~30개, 포인트 컬러 #E53935)
각 필터마다 별도 바텀시트로 열림.
선택 후 "확인" 버튼.
```

---

## SCRIPT 10 — 배우 프로필 상세

```
배우담 배우 프로필 상세 페이지를 만들어줘.

1. src/app/(main)/actors/[id]/page.tsx
두 가지 헤더 스타일 (스크롤에 따라 전환):
- 상단 전체 사진 (세로로 긴 포트레이트 이미지, 어두운 그라데이션 오버레이)
  - 좌측 상단: ← 뒤로가기 (흰색)
  - 우측 상단: 북마크 아이콘
  - 하단에 이름 + 출생연도 + 필모수 + 한 줄 소개 (흰 텍스트)
- 스크롤 시 상단 고정 헤더로 전환

필모그래피 섹션:
- "필모그래피" 타이틀
- 연도별 그룹핑 (2023, 2022...)
  - 연도 헤더 (작은 회색 텍스트)
  - 작품 항목:
    - 좌측: 포스터 썸네일 (60x80px, rounded)
    - 중앙: 미디어타입 배지(작게, 회색), 작품명(굵게), 배역 + 배우 이름
    - 항목 왼쪽에 세로 타임라인 점

스킬 및 특기 섹션:
- "스킬 및 특기" 타이틀
- 태그들 (테두리형, wrap)

대표 영상 섹션:
- "대표 영상" 타이틀
- 영상 썸네일 카드 (16:9, 재생 아이콘 오버레이)
- 영상 제목 + 길이

하단 고정 버튼 영역:
- "포트폴리오" 버튼 (아웃라인, 다운로드 아이콘)
- "연락하기" 버튼 (다크, 전화 아이콘) — 에이전시만 보임

2. src/app/api/actors/[id]/route.ts
GET: 배우 상세 정보 (공개된 배우만)
- User + ActorProfile + Filmography(연도순) + Showreel

3. src/app/api/actors/route.ts  
GET: 배우 목록 (필터+페이지네이션)
쿼리: ageRange, gender, location, minFilmo, maxFilmo, cursor, limit=10
roleType=ACTOR, isActive=true인 유저만
응답: id, name, image, ageRange, location, skills, filmographyCount
```

---

## SCRIPT 11 — 배우 마이페이지

```
배우담 배우 마이페이지를 만들어줘.

1. src/app/(mypage)/mypage/page.tsx
배우 마이페이지:
- 상단: "마이페이지" 타이틀 + 설정 아이콘(우측)
- 프로필 영역 (배경 이미지 스타일):
  - 전체 너비 이미지 (배우 프로필 사진, 어두운 오버레이)
  - 이름 + 출생연도 + 필모수
  - 한 줄 소개
  - "수정하기" 버튼 (아웃라인) + "팔로워 현황보기" 버튼 (다크)
- 필모그래피 섹션:
  - "필모그래피" 타이틀 + "수정하기" 링크(우측)
  - 배우 프로필 상세와 동일한 연도별 목록
- 스킬 및 특기:
  - "스킬 및 특기" + "수정하기" 링크
  - 태그들
- 대표 영상:
  - "대표 영상" + "수정하기" 링크
  - 영상 카드들

2. src/app/(mypage)/filmography/page.tsx
필모그래피 관리:
- "← 필모그래피 관리" 헤더
- 연도별 그룹화된 작품 목록
- 각 작품 우측: ✎ 수정 아이콘 + × 삭제 아이콘
- 우측 하단 "+" FAB 버튼 → 작품 추가

3. src/app/(mypage)/filmography/new/page.tsx + [id]/page.tsx
작품 편집 화면:
- "← 작품 편집" 헤더
- 작품명 인풋 (언더라인)
- 연도 Select (드럼롤: 2024, 2023, 2022...)
- 역할 Select (드럼롤: 주연/조연/단역/기타)
- 한 줄 설명 인풋
- 장르 태그 멀티선택 (드라마, 로맨스, 코미디, 액션 등)
  선택된 태그: 빨간 보더+텍스트
- "삭제하기" 버튼 (회색) + "저장하기" 버튼 (다크)
- 저장 시 PUT /api/filmography/[id]

4. src/app/api/filmography/route.ts
GET: 내 필모그래피 목록 (연도 내림차순)
POST: 필모그래피 추가

src/app/api/filmography/[id]/route.ts
PUT: 수정 (본인만)
DELETE: 삭제 (본인만)
```

---

## SCRIPT 12 — 쇼릴(대표 영상) 업로드

```
배우담 쇼릴 추가 기능을 구현해줘.

디자인 기준: 영상 직접 업로드 (mp4/mov), YouTube URL 아님.

1. src/app/(mypage)/showreel/new/page.tsx
쇼릴 추가 화면 (2가지 상태: default/enable):
- "← 새 쇼릴 추가" 헤더
- 영상 파일 업로드 영역:
  - 점선 보더 박스
  - 업로드 아이콘 + "파일을 업로드 해주세요" + "mp4, mov 파일 형식" 안내
  - 클릭 시 파일 선택
  - 업로드 후: 파일명 + 용량 + × 버튼으로 항목 표시
    (예: 독백_연기_영상_김배우.mp4 / 15.5MB)
  - 여러 파일 추가 가능
- 쇼릴 제목 인풋 (언더라인)
- 설명 Textarea (자유 작성)
- 관련 작품 Select (내 필모그래피에서 선택)
- 태그 입력:
  - 플레이스홀더: "#액션쇼릴 #감정연기 (쉼표로 구분)"
  - 입력된 태그들: 테두리형 태그 + × 버튼
- 모든 필수 항목 입력 시 "추가하기" 버튼 활성화 (다크)

2. src/app/api/showreel/route.ts
POST /api/showreel:
- multipart/form-data
- 파일 크기 제한: 500MB
- 허용 형식: video/mp4, video/quicktime
- Supabase Storage 'showreels' 버킷에 업로드
  경로: {userId}/{timestamp}_{filename}
- Showreel DB 레코드 생성
- 201 반환

3. src/app/api/showreel/[id]/route.ts
DELETE: 쇼릴 삭제 (Storage + DB 모두)
PATCH: 제목/설명/태그 수정

4. src/lib/storage.ts
uploadVideo(userId, file) 함수:
- 파일 크기/형식 검증
- Supabase Storage에 스트리밍 업로드
- 업로드 진행률 콜백 지원
- 완료 시 공개 URL 반환

uploadImage(bucket, userId, file) 함수:
- 프로필/필모그래피 썸네일용
```

---

## SCRIPT 13 — 프로젝트 + 캐릭터 생성

```
배우담 프로젝트와 캐릭터 생성 화면을 만들어줘.

1. src/app/(main)/projects/page.tsx
진행중인 프로젝트 목록:
- 상단: "← 프로젝트" 헤더
- 탭: 전체 | 진행중 | 기초중 | 완료됨
- 프로젝트 카드:
  - 포스터 썸네일 (좌측)
  - 미디어타입 배지 + 제목 + "캐릭터 N명"
  - 캐스팅 진행률 바 (빨간색, %)
  - 상태: "캐스팅 완료" 배지
- 하단 "+" 버튼 "새 프로젝트 만들기"
- 최근 본 배우 영역 (원형 아바타 + 이름 + 나이대, 가로 스크롤)

2. src/app/(main)/projects/new/page.tsx
새 프로젝트 만들기 (2상태: default/enable):
- "← 새 프로젝트 만들기" 헤더
- 작품 제목 인풋 (언더라인)
- 장르 Select (드럼롤: 드라마/로맨스/코미디...)
- 플랫폼 Select (드럼롤: OTT/지상파/케이블/유튜브...)
- 로그라인 인풋 (한 줄 설명)
- 시놉시스 Textarea
  플레이스홀더: "전체 줄거리나 기획 의도를 자유롭게 적어주세요"
- 모두 입력 시 "다음" 활성화 → 캐릭터 설정으로 이동

3. src/app/(main)/projects/[id]/characters/page.tsx
캐릭터 설정 화면 (2상태: default/enable):
- "← 새 프로젝트 만들기" 헤더
- 상단: "시놉시스에 등장하는\n주요 인물들을 등록해 주세요." 안내 텍스트
- 캐릭터 목록:
  - 각 항목: 이름 + 나이대·성별 + 한 줄 설명 + ✎ × 버튼
  - 빈 상태: 회색 X 아이콘 + "등록한 인물이 없어요\n주요 인물을 추가해 주세요"
- "주요 인물 추가하기" 버튼 (다크, 하단)
- 1명 이상 등록 시 "배우 추천 받기" 버튼 활성화

4. src/app/(main)/projects/[id]/characters/new/page.tsx
캐릭터 추가 화면 (2상태: default/enable):
- "← 캐릭터 추가" 헤더
- 역할명 인풋 (언더라인, 예: "김철수")
- 나이대 Select (드럼롤)
- 성별 Select:
  토글 버튼 스타일 (남성 | 여성)
  선택 시 배경 #1A1A2E, 텍스트 흰색
- 한 줄 설명 인풋
- 키워드 태그 입력:
  - 미리 제안된 태그들 (차분함, 유머러스, 리더십, 괴짜, 냉철함)
  - "+ 추가하기" 버튼
  - 선택된 태그: 빨간 보더+텍스트
- "저장하기" 버튼 활성화/비활성화

5. src/app/api/projects/route.ts
POST: 프로젝트 생성 (AGENCY만)
GET: 내 프로젝트 목록

src/app/api/projects/[id]/characters/route.ts
POST: 캐릭터 추가
GET: 캐릭터 목록

src/app/api/projects/[id]/characters/[charId]/route.ts
PUT: 캐릭터 수정
DELETE: 캐릭터 삭제
```

---

## SCRIPT 14 — 캐스팅 제안 발송 + 목록

```
배우담 캐스팅 제안 발송과 목록 화면을 만들어줘.

1. src/app/(main)/casting/send/page.tsx
캐스팅 제안 보내기 (2상태: default/enable):
URL에 actorId 쿼리파라미터로 받음

- 상단: 배우 정보 카드 (사진, 이름, 나이대·필모수, 스킬 태그들)
- 프로젝트 Select (드롭다운: 내 프로젝트 목록)
- 캐릭터 Select (선택한 프로젝트의 캐릭터들)
- 촬영 예상 기간 (날짜 범위 인풋: YYYY.MM.DD ~ YYYY.MM.DD, 우측 달력 아이콘)
- 촬영 지역 인풋 (언더라인, 예: "경기도 용인시 에버랜드")
- 출연 조건 인풋 (언더라인, 예: "출연료, 게약 조건 등")
- 배우에게 전하고 싶은 말 Textarea
  플레이스홀더: "캐릭터와 배우가 잘 어울리는 이유, 제안 배경 등을 자유롭게 작성해 주세요."
- 필수 항목(프로젝트/캐릭터/기간/지역) 모두 입력 시 "제안 보내기" 버튼 활성화

2. src/app/(main)/casting/page.tsx
캐스팅 제안함 (발송한 제안 목록):
- 상단 탭: 전체 | 확인안함 | 수락 | 거절 | 마감
- 제안 카드:
  - 좌측: 포스터 이미지 (80x100px)
  - 중앙:
    - 미디어타입 배지 (드라마/영화 등)
    - 작품명 (굵게)
    - 배역명
    - 제안자명 (감독/작가 표시)
    - 상태 배지 (수락됨: 초록, 거절: 회색, 대기: 없음)
    - 날짜 (2024.12.18 스타일)
  - 카드들 세로 스크롤

3. src/app/(main)/casting/[id]/page.tsx
캐스팅 제안 상세:
- 상단: 포스터 이미지 (전체 너비, aspect 3:4)
- 작품 정보:
  - 미디어타입 배지 + 작품명
  - 배역명 + 배우 이름
  - 바로 아래: 촬영URL 링크
- 프로젝트 정보 섹션:
  - 장르
  - 로그라인 (긴 텍스트)
  - 캐릭터 설정 (텍스트)
- 조건 및 일정 섹션:
  - 촬영 예상 기간
  - 주요 촬영 지역
  - 출연 조건
- 감독/작가 메모 섹션 (긴 텍스트)
- 하단 고정: "거절하기" (아웃라인) + "수락하기" (다크) 버튼

4. src/app/api/casting/route.ts
POST: 제안 발송 + 수신자 알림 생성
GET?type=sent: 보낸 제안 목록 (상태 필터 포함)
GET?type=received: 받은 제안 목록

src/app/api/casting/[id]/respond/route.ts
POST: { action: 'accept' | 'reject', rejectReason? }
상태 전이 검증 후 발신자 알림 생성
```

---

## SCRIPT 15 — 캐스팅 제안 수락 + 오디션 영상 제출

```
배우담 캐스팅 수락 및 오디션 영상 직접 업로드 기능을 만들어줘.

1. src/app/(main)/casting/[id]/accept/page.tsx
캐스팅 제안 수락 화면:
제안 수락 후 오디션 영상 제출 화면으로 전환됨.

오디션 영상 제출 (2상태: default/enable):
- "← 캐스팅 제안 수락" 헤더
- 섹션: "오디션 영상 제출"
  - 영상 업로드 박스 (쇼릴 업로드와 동일 UI)
    - 점선 박스 + 업로드 아이콘
    - "파일을 업로드 해주세요" + "mp4, mov 파일 형식"
    - 업로드 후: 파일명 + 용량 표시 (여러 파일 가능)
- 섹션: "기타 정보"
  - Textarea: "추가로 전달하고 싶은 내용을 자유롭게 작성해 주세요"
    플레이스홀더 예시: "(ex. 스케줄 관련 참고 사항, 기기 관련 코멘트 등)"
  - 입력된 예시: "이시은은 배주셔도 괜찮아요"
- 파일 업로드 완료 시 "제출하기" 버튼 활성화 (다크)

2. src/app/api/casting/[id]/audition/route.ts
POST:
- 수신자 본인 + ACCEPTED 상태 확인
- multipart/form-data로 영상 파일 받기
- Supabase Storage 'auditions' 버킷 업로드
  경로: {offerId}/{timestamp}_{filename}
- auditionVideoUrl + auditionNote 저장
- status → AUDITION_SUBMITTED
- 발신자에게 알림 생성

3. 업로드 진행률 UI 컴포넌트:
src/components/shared/UploadProgress.tsx
- 파일명 + 파일 크기
- 진행률 바 (빨간색, 0~100%)
- 완료 시 체크 아이콘으로 전환
- XHR / fetch with ReadableStream으로 진행률 추적
```

---

## SCRIPT 16 — 설정 + 알림 + 프로필 편집

```
배우담 설정, 알림, 프로필 편집 화면을 만들어줘.

1. src/app/(mypage)/settings/page.tsx
계정 관리 화면:
- 상단: 프로필 사진(원형) + 이름 + 이메일
- "알림" 섹션:
  - 캐스팅 제안 알림 (토글 스위치, 기본 ON - 빨간색)
  - 댓글/좋아요 알림 (토글)
  - 서비스 공지 알림 (토글, 기본 ON)
- "기타" 섹션:
  - 이용약관 보기 →
  - 개인정보 처리방침 →
  - 앱 버전 v1.0.2
- 하단: "로그아웃" (빨간 텍스트) + "계정 삭제" (회색 텍스트)

2. src/app/(mypage)/profile-edit/page.tsx
프로필 편집:
- "← 프로필 편집" 헤더
- 프로필 사진 (원형, 우측 하단 카메라 아이콘)
- 이름 인풋 (언더라인, X 클리어 버튼)
- 한 줄 소개 Textarea
- 활동 지역 Select (드럼롤)
- 소속 Select (드럼롤: 프리랜서/회사명 입력)
- 나이대 Select (드럼롤)
- 연락 가능한 시간 인풋 (예: "평일 10:00 - 19:00")
- 메모 Textarea (캐스팅 디렉터에게 보내는 메모)
- "저장하기" 버튼 (다크, 하단)
→ PATCH /api/users/me

3. src/app/(main)/notifications/page.tsx
알림 화면 (2상태: empty/있음):
- "알림" 타이틀 + "모두 읽기" 버튼(우측)
- 탭: 전체 | 캐스팅 | 피드 | 시스템
- 빈 상태: "등록된 알림이 없어요"
- 알림 있는 상태:
  - 캐스팅 알림: 빨간 하트 아이콘 + 제목 + 내용 미리보기 + 날짜
  - 시스템 공지: 퍼플 다이아 아이콘 + 내용
  - 읽은 알림: 텍스트 회색 처리
  - 안 읽은 알림: 텍스트 진하게

공지(Notice) 영역:
- 우측에 별도 패널 (데스크탑에서만 보임)
- 캐스팅 제안 알림 목록 + 공지사항 표시

4. src/app/api/notifications/route.ts
GET: 내 알림 목록 (type 필터, cursor 페이지네이션)
PATCH /api/notifications/read-all: 모두 읽음 처리

src/app/api/notifications/[id]/read/route.ts
PATCH: 단건 읽음 처리

5. src/app/api/users/me/settings/route.ts
PATCH: 알림 설정 토글 저장
```

---

## SCRIPT 17 — PWA + 마무리

```
배우담 PWA 설정과 최종 마무리를 해줘.

1. next.config.ts — withPWA 래퍼 추가

2. public/manifest.json:
{
  "name": "배우담",
  "short_name": "배우담",
  "description": "배우와 에이전시를 잇는 캐스팅 플랫폼",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#1A1A2E",
  "background_color": "#FFFFFF",
  "orientation": "portrait"
}

아이콘: 다크 네이비 배경에 흰색 "배" 텍스트로 192x192, 512x512

3. src/app/layout.tsx 업데이트:
- Pretendard 폰트
- viewport: width=device-width, initial-scale=1, maximum-scale=1 (모바일 줌 방지)
- theme-color: #1A1A2E
- QueryClientProvider + SessionProvider + Toaster 래핑

4. 에러 페이지:
- not-found.tsx: 404 화면
- error.tsx: 전역 에러
- loading.tsx: 스켈레톤 UI (Skeleton 컴포넌트)

5. src/components/shared/Toast.tsx
커스텀 토스트 (shadcn Toast 기반):
- 성공: 초록 체크 아이콘
- 에러: 빨간 X 아이콘
- 하단 중앙에 등장

6. 최종 점검:
npx tsc --noEmit
npm run build
에러 있으면 모두 수정해줘.

7. README.md:
- 배우담 프로젝트 소개
- 기술 스택
- 로컬 개발 세팅 방법
- 환경변수 안내
- Phase 0/1/2 로드맵
```

---

## SCRIPT 18 — Supabase 연결 + DB 마이그레이션

```
Supabase PostgreSQL DB를 연결하고 마이그레이션을 실행해줘.

1. prisma/schema.prisma에 directUrl 추가:
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

2. Supabase Storage 버킷 4개 생성 스크립트 만들어줘:
src/scripts/create-buckets.ts
- profiles (공개, 최대 5MB, image/*)
- filmography-thumbnails (공개, 최대 10MB, image/*)
- showreels (비공개, 최대 500MB, video/*)
- auditions (비공개, 최대 500MB, video/*)

SUPABASE_SERVICE_ROLE_KEY 환경변수 사용.

3. 마이그레이션:
npx prisma migrate dev --name init

4. Prisma Studio 실행 확인:
npx prisma studio

5. package.json scripts에 추가:
"db:migrate": "prisma migrate dev",
"db:studio": "prisma studio",
"db:generate": "prisma generate",
"db:reset": "prisma migrate reset",
"setup:buckets": "ts-node src/scripts/create-buckets.ts"
```

---

## 실행 순서

```
01 → 02 → 03 → 04 → 18(Supabase 세팅) → 05 → 06 → 07 → 08 → 09 
→ 10 → 11 → 12 → 13 → 14 → 15 → 16 → 17
```

## 변경 내역 (v1 → v2)

| 항목 | v1 | v2 (디자인 반영) |
|---|---|---|
| 앱 이름 | CASTMATCH | 배우담 |
| 포인트 컬러 | 퍼플 #6B21A8 | 레드 #E53935 |
| 버튼 스타일 | shadcn 기본 | 완전 라운드 + 다크 #1A1A2E |
| 인풋 스타일 | 기본 보더박스 | 언더라인 스타일 |
| 필터 UI | 페이지 내 사이드바 | 바텀시트 + 드럼롤 피커 |
| 배우 목록 | 그리드 카드 | 세로 스와이프 카드 |
| 영상 등록 | YouTube URL | 직접 파일 업로드 (mp4/mov) |
| 사용자 유형 | 배우/감독/스태프 | 배우/에이전시 |
| 오디션 제출 | 외부 링크 | 직접 파일 업로드 |
| 알림 분류 | 단일 목록 | 캐스팅/피드/시스템 탭 |
| 모바일 피커 | 셀렉트박스 | 드럼롤 피커 바텀시트 |
| 추가된 기능 | - | 연락 가능 시간, 캐스팅 디렉터 메모 |
