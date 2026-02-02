# 명함 관리 프론트엔드 (MVP)

Next.js App Router 기반 명함 관리 프론트엔드. 로그인·회원가입, 명함 CRUD, 공유 링크·QR, 공유 명함 조회·수집, 프로필을 지원합니다.

## 구조

```
├── app/                    # Next.js App Router
│   ├── auth/
│   │   ├── login/          # 로그인
│   │   └── signup/         # 회원가입
│   ├── cards/
│   │   ├── page.tsx        # 명함 목록 (+ 로그아웃)
│   │   ├── new/            # 명함 생성 (이미지 업로드 + presigned URL)
│   │   └── [id]/
│   │       ├── page.tsx    # 명함 상세/수정/삭제 (카드 레이아웃, 직함, 소개 더보기)
│   │       └── share/      # 공유 링크 생성·복사·QR 보기·링크 무효화
│   ├── collections/        # 수집한 명함 (placeholder)
│   ├── profile/            # 프로필 조회/수정 (+ 로그아웃)
│   └── s/
│       └── [token]/        # 공유 링크 조회·명함 저장 (비로그인 가능, 카드 레이아웃)
├── components/
│   └── ProtectedRoute.tsx   # 인증 필요 페이지 보호
├── lib/
│   ├── api.ts              # API 클라이언트 (fetch, Authorization: Token)
│   ├── auth.ts             # 인증 유틸 (localStorage 토큰)
│   └── constants.ts        # ENDPOINTS, API_KEYS
├── types/
│   └── api.ts              # API 요청/응답 타입
└── middleware.ts           # Next.js 미들웨어
```

## 설정

### 환경 변수

프로젝트 루트에 `.env.local` 생성 (선택):

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

미설정 시 `http://localhost:8000`을 기본값으로 사용합니다. 배포 시(Vercel 등) 동일 키로 백엔드 API 주소를 설정하세요.

### 설치 및 실행

```bash
npm install
npm run dev
```

개발 서버는 기본적으로 http://localhost:3000 에서 실행됩니다.

## 주요 기능

### 인증
- **`/auth/login`** — 로그인 (`POST /v1/auth/login`, 이메일/비밀번호). 성공 시 토큰 저장 후 `/cards`로 이동.
- **`/auth/signup`** — 회원가입 (`POST /v1/auth/signup`). 성공 시 토큰 저장 후 `/cards`로 이동.
- **로그아웃** — 명함 목록(`/cards`)·프로필(`/profile`) 페이지에 로그아웃 버튼. `auth.removeToken()` 후 `/auth/login`으로 이동.

### 명함 관리
- **`/cards`** — 명함 목록 (`GET /v1/cards/`). 새 명함 만들기·프로필·로그아웃 버튼.
- **`/cards/new`** — 명함 생성. 이미지 업로드(presigned URL), 이름·회사·직함·이메일·전화·소개 입력. `GET /v1/media/presigned-url`, `POST /v1/cards`.
- **`/cards/[id]`** — 명함 상세/수정/삭제.
  - **보기 모드**: 카드 레이아웃(헤더 + 수정/공유하기/삭제), 이미지(16:9), 이름·회사·직함, 전화/이메일 액션(tel:/mailto:), 소개(120자 초과 시 더보기/접기), 수정일.
  - **수정 모드**: 이름·회사·직함·이메일·전화·소개 편집. `GET` / `PUT /v1/cards/:id/`, `DELETE /v1/cards/:id/`.
- **`/cards/[id]/share`** — 공유 링크 생성. 만료(1시간/1일/1주일) 선택 → `POST /v1/cards/:id/tokens` → 링크 표시·복사·**QR 보기**(qrcode.react), **링크 무효화**(`DELETE /v1/tokens/:id/deactivate`).

### 공유 명함 (비로그인)
- **`/s/[token]`** — 공유 링크로 명함 조회. 백엔드 응답이 flat/nested(`data` 안에 필드) 모두 대응(`flattenSharedCard`). 카드 레이아웃(이름·회사·직함, 전화/이메일 액션, 소개 더보기/접기). "명함 저장하기" → 로그인 필요 시 리다이렉트 후 `POST /v1/collections` (body `card_id`).

### 기타
- **`/collections`** — 수집한 명함. 목록 조회 API 미구현 시 placeholder.
- **`/profile`** — 프로필 조회/수정 (`GET` / `PUT /v1/user/profile`). 로그아웃 버튼.

## 인증 보호

- 인증 필요 페이지는 `ProtectedRoute`로 감싸져 있으며, 토큰 없으면 `/auth/login`으로 리다이렉트됩니다.
- 토큰은 `localStorage` 키 `access_token`에 저장됩니다 (`lib/constants.ts` `AUTH_TOKEN_KEY`).
- API 요청 시 `lib/api.ts`에서 `Authorization: Token {token}` 헤더를 자동 추가합니다(DRF TokenAuthentication).

## API·백엔드 연동

- 엔드포인트·응답 키: `lib/constants.ts`의 `ENDPOINTS`, `API_KEYS`.
- 백엔드–프론트 격차·공유 명함 응답 형식: `BACKEND_FRONTEND_GAP.md` 참고.
- 명함 이미지 미표시 시: `IMAGE_DISPLAY.md` 참고(R2 CORS, presigned URL 등).

## 문서

- **ROUTING_DESIGN.md** — 라우팅·페이지별 기능 설계.
- **BACKEND_FRONTEND_GAP.md** — API 사용 현황·공유 명함 응답 flatten·토큰 무효화 메서드 등.
- **IMAGE_DISPLAY.md** — 명함 이미지가 안 보일 때 점검 항목.
- **ENDPOINT_MAPPING_CHECK.md** — 엔드포인트 매핑 점검(필요 시 참고).

## 빌드·배포

```bash
npm run build   # 프로덕션 빌드
npm run start   # 빌드 결과 실행
```

Vercel 등에 배포 시 Framework Preset은 **Next.js**로 선택하고, 환경 변수 `NEXT_PUBLIC_API_BASE_URL`에 백엔드 API 주소를 설정하세요. 백엔드에서 프론트 도메인을 CORS 허용해야 합니다.
