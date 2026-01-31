# 명함 관리 프론트엔드 (MVP)

Next.js App Router 기반 프론트엔드 애플리케이션

## 구조

```
frontend/
├── app/                    # Next.js App Router
│   ├── auth/              # 인증 페이지
│   │   ├── login/
│   │   └── signup/
│   ├── cards/             # 명함 관리
│   │   ├── page.tsx       # 목록
│   │   ├── new/           # 생성
│   │   └── [id]/          # 상세/수정
│   │       └── share/     # 공유 설정
│   ├── collections/       # 수집한 명함
│   ├── profile/           # 프로필
│   └── s/                 # 공유 링크 조회 (비로그인)
│       └── [token]/
├── components/            # 공통 컴포넌트
│   └── ProtectedRoute.tsx
├── lib/                   # 유틸리티
│   ├── api.ts             # API 클라이언트 (fetch 래퍼)
│   ├── auth.ts            # 인증 유틸 (localStorage 토큰)
│   └── constants.ts       # API 엔드포인트·응답키·인증 상수
├── types/                 # TypeScript 타입
│   └── api.ts             # API 요청/응답 타입
└── middleware.ts          # Next.js 미들웨어 (MVP: 통과만)
```

## 설정

### 환경 변수

`.env.local` 생성 (선택):

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

미설정 시 `lib/constants.ts`에서 `http://localhost:8000`을 기본값으로 사용합니다.

### 설치 및 실행

```bash
cd frontend
npm install
npm run dev
```

## 주요 기능

### 인증
- `/auth/login` — 로그인 (현재 `POST /v1/auth/signup` 임시 사용, 전용 로그인 API 없음)
- `/auth/signup` — 회원가입 (`POST /v1/auth/signup`)

### 명함 관리
- `/cards` — 명함 목록 (`GET /v1/cards`, 응답 항목 `id` 사용)
- `/cards/new` — 명함 생성 (`GET /v1/media/presigned-url`, `POST /v1/cards`)
- `/cards/[id]` — 명함 상세/수정 (`GET` / `PUT /v1/cards/:id`)
- `/cards/[id]/share` — 공유 링크 생성 (`POST /v1/cards/:id/tokens`)

### 기타
- `/collections` — 수집한 명함 (목록 조회 API 미구현, placeholder)
- `/profile` — 프로필 조회/수정 (`GET` / `PUT /v1/user/profile`)
- `/s/[token]` — 공유 링크 조회·수집 (`GET /v1/s/:token`, `POST /v1/collections`, 비로그인 가능)

## 인증 보호

- 인증 필요 페이지는 `ProtectedRoute`로 감싸져 있으며, 토큰 없으면 `/auth/login`으로 리다이렉트됩니다.
- 토큰은 `localStorage` 키 `access_token`에 저장됩니다 (`lib/constants.ts` `AUTH_TOKEN_KEY`).

## API 클라이언트

- `lib/api.ts`: fetch 기반 래퍼. 인증 필요 요청에는 `Authorization: Token {token}` 헤더를 자동 추가합니다 (DRF TokenAuthentication).
- 엔드포인트·응답 키는 `lib/constants.ts`의 `ENDPOINTS`, `API_KEYS`를 사용합니다.

## TODO

1. 전용 로그인 API 도입 시 `/auth/login` 연동 변경
2. 수집 목록 조회 API 도입 후 `/collections` 목록 연동
3. 에러 처리·로딩 UI 개선
# business_card_frontend
