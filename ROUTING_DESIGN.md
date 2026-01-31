# 프론트엔드 라우팅 설계 (MVP)

## 1. 전체 페이지 구조

### 1.1 라우트 계층 구조

```
/ (Root)
├── /auth
│   ├── /login          # 로그인 페이지
│   └── /signup         # 회원가입 페이지
├── /cards              # 명함 관리 (인증 필요)
│   ├── /               # 명함 목록
│   ├── /new            # 명함 생성
│   ├── /:id            # 명함 상세/수정
│   └── /:id/share      # 명함 공유 설정
├── /collections        # 수집한 명함 목록 (인증 필요)
├── /profile            # 프로필 설정 (인증 필요)
└── /s/:token           # 공유 링크 조회 (인증 불필요)
```

## 2. MVP 페이지 목록

### 2.1 인증 페이지 (Auth)

#### `/auth/login`
- **목적**: 기존 사용자 로그인
- **인증**: 불필요
- **기능**:
  - 이메일/비밀번호 입력
  - 로그인 성공 시 토큰 저장 후 `/cards`로 리다이렉트
- **API**: 전용 로그인 API 없음. **현재** `POST /v1/auth/signup` 임시 사용 (동일 이메일 시 기존 유저 처리 방식은 백엔드 의존). 추후 `POST /v1/auth/login` 등 전용 엔드포인트 연동 권장.

#### `/auth/signup`
- **목적**: 신규 사용자 회원가입
- **인증**: 불필요
- **기능**:
  - 이메일/비밀번호 입력
  - 회원가입 성공 시 토큰 저장 후 `/cards`로 리다이렉트
- **API**: `POST /v1/auth/signup`

### 2.2 명함 관리 페이지 (Cards)

#### `/cards` (또는 `/`)
- **목적**: 내 명함 목록 조회
- **인증**: 필요
- **기능**:
  - 명함 목록 표시 (최신순)
  - 명함 클릭 시 상세 페이지로 이동
  - "새 명함 만들기", "프로필" 버튼
- **API**: `GET /v1/cards`. 응답 항목 `id` 사용 (상세 라우트 `/cards/:id`).

#### `/cards/new`
- **목적**: 새 명함 생성
- **인증**: 필요
- **기능**:
  - 이미지 업로드 (파일 선택), 미리보기 (OCR 결과는 MVP 미구현)
  - 명함 정보 입력 폼 (name 필수, image_url 선택)
  - 저장 버튼
- **API**: 
  - `GET /v1/media/presigned-url?filename=...&file_type=...` → `upload_url`, `image_url` 응답. `PUT upload_url`로 직접 업로드.
  - `POST /v1/cards` (명함 생성). 응답 `id`로 `/cards/:id` 이동.

#### `/cards/:id`
- **목적**: 명함 상세 조회 및 수정
- **인증**: 필요
- **기능**:
  - 명함 정보 표시 (읽기 모드)
  - "수정" 버튼 클릭 시 편집 모드 전환
  - 편집 모드: 필드 수정 후 저장
  - "공유하기" 버튼
  - "삭제" 버튼 (선택적, MVP에서는 숨김 가능)
- **API**: 
  - `GET /v1/cards/:id` (조회)
  - `PUT /v1/cards/:id` (수정)

#### `/cards/:id/share`
- **목적**: 명함 공유 링크 생성 및 관리
- **인증**: 필요
- **기능**:
  - 만료 시간 설정 (1시간 / 1일 / 1주일)
  - 공유 토큰 생성 → `share_token`, `expires_at` 응답
  - 생성된 링크 표시 및 복사 버튼
  - **MVP 현재**: 링크 생성·복사만 구현. QR 코드, 활성 토큰 목록·무효화는 미구현.
- **API**: 
  - `POST /v1/cards/:id/tokens` (토큰 생성) — 사용 중
  - `PATCH /v1/tokens/:id/deactivate` (토큰 무효화) — 추후 토큰 목록 UI 연동 시 사용

### 2.3 수집 페이지 (Collections)

#### `/collections`
- **목적**: 수집한 명함 목록 조회
- **인증**: 필요
- **기능**:
  - 수집한 명함 목록 표시 (구현 시)
  - 명함 클릭 시 상세 조회 (읽기 전용)
- **API**: 수집 목록 조회 엔드포인트 없음. **현재** placeholder 페이지만 구현.
  - `POST /v1/collections` (수집) — `/s/:token` "명함 저장하기"에서 사용. body `card_id`.

### 2.4 프로필 페이지 (Profile)

#### `/profile`
- **목적**: 사용자 프로필 조회 및 수정
- **인증**: 필요
- **기능**:
  - 프로필 정보 표시 (이메일, 이름, 소개)
  - "수정" 버튼 클릭 시 편집 모드
  - 편집 모드: 이름, 소개 수정
- **API**: 
  - `GET /v1/user/profile` (조회)
  - `PUT /v1/user/profile` (수정)

### 2.5 공유 링크 페이지 (Shared)

#### `/s/:token`
- **목적**: 공유 링크를 통한 명함 조회 (비로그인 사용자)
- **인증**: 불필요
- **기능**:
  - 명함 정보 표시 (읽기 전용). 응답 `card_id`, `name`, `company`, `email`, `phone`, `bio` 등.
  - "명함 저장하기" 버튼. 비로그인 시 `/auth/login?redirect=/s/:token` 리다이렉트 후 로그인 완료 시 수집 요청.
  - 만료/잘못된 링크 시 에러 메시지 표시
- **API**: 
  - `GET /v1/s/:token` (명함 조회, `requireAuth: false`)
  - `POST /v1/collections` (명함 수집, 로그인 필요). body `{ card_id }`.

## 3. 라우팅 구현 전략

### 3.1 Next.js App Router 사용 (현재)
- `app/` 디렉토리, 파일 기반 라우팅. MVP 페이지는 모두 `'use client'` 클라이언트 컴포넌트.

### 3.2 React Router (대안)
- `/src/pages` + `react-router-dom` 등. 현재 미사용.

## 4. 인증 처리

### 4.1 토큰 저장
- `localStorage` 사용. 키: `access_token` (`lib/constants.ts` `AUTH_TOKEN_KEY`).

### 4.2 인증 필요 페이지 보호
- `ProtectedRoute` 컴포넌트로 감싸기. 토큰 없을 시 `/auth/login` 리다이렉트.
- `middleware`는 MVP에서 통과만 (서버에서 `localStorage` 미사용).

### 4.3 API 요청 헤더
- 인증 필요 API에 `Authorization: Token {token}` 헤더 추가 (DRF TokenAuthentication).
- `lib/api.ts` fetch 래퍼에서 `AUTH_HEADER_PREFIX`(`Token`) + 토큰 조합하여 자동 첨부.

## 5. 상태 관리 (MVP 최소화)

### 5.1 전역 상태
- 인증 토큰: `localStorage` + `lib/auth.ts` (`getToken` / `setToken` / `removeToken`). Context API 미사용.

### 5.2 로컬 상태
- 각 페이지 `useState` + `useEffect`로 fetch. React Query/SWR 미사용.

## 6. 컴포넌트 구조 (현재)

```
frontend/
├── app/                    # Next.js App Router
│   ├── auth/login/, auth/signup/
│   ├── cards/page.tsx, cards/new/, cards/[id]/, cards/[id]/share/
│   ├── collections/
│   ├── profile/
│   └── s/[token]/
├── components/
│   └── ProtectedRoute.tsx
├── lib/
│   ├── api.ts              # API 클라이언트 (fetch)
│   ├── auth.ts             # 인증 유틸 (localStorage)
│   └── constants.ts        # ENDPOINTS, API_KEYS, AUTH_TOKEN_KEY, AUTH_HEADER_PREFIX
├── types/
│   └── api.ts              # API 요청/응답 타입
└── middleware.ts           # MVP: 통과만
```

## 7. 우선순위 (구현 순서)

1. **Phase 1**: 인증 + 명함 목록/상세
   - `/auth/signup`, `/auth/login`
   - `/cards` (목록)
   - `/cards/:id` (상세)

2. **Phase 2**: 명함 생성/수정
   - `/cards/new`
   - `/cards/:id` (수정 기능)

3. **Phase 3**: 공유 기능
   - `/cards/:id/share`
   - `/s/:token`

4. **Phase 4**: 수집 및 프로필
   - `/collections`
   - `/profile`
