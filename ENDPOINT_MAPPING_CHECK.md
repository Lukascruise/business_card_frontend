# 백엔드–프론트 엔드포인트 매핑 점검

## 1. 백엔드 실제 라우트 (config/urls.py + v1_urls + 앱 urls)

| 메서드 | 백엔드 경로 | 뷰 |
|--------|-------------|-----|
| POST | `/v1/auth/signup` | SignupView |
| GET | `/v1/user/profile` | UserProfileView (RetrieveUpdateAPIView) |
| PUT | `/v1/user/profile` | UserProfileView |
| GET | `/v1/media/presigned-url` | PresignedUrlView |
| POST | `/v1/collections` | CollectionCreateView |
| POST | `/v1/cards/<uuid:card_id>/tokens` | CardTokenCreateView |
| PATCH | `/v1/tokens/<uuid:token_id>/deactivate` | ShareTokenDeactivateView |
| GET | `/v1/s/<str:access_key>` | SharedCardView |
| GET | `/v1/cards/` | CardViewSet.list (DRF router → **trailing slash**) |
| POST | `/v1/cards/` | CardViewSet.create |
| GET | `/v1/cards/<pk>/` | CardViewSet.retrieve |
| PUT | `/v1/cards/<pk>/` | CardViewSet.update |
| PATCH | `/v1/cards/<pk>/` | CardViewSet.partial_update |
| DELETE | `/v1/cards/<pk>/` | CardViewSet.destroy |

## 2. 프론트엔드 ENDPOINTS (lib/constants.ts)

| 상수 | 값 | 메서드/용도 |
|------|-----|-------------|
| AUTH_SIGNUP | `/v1/auth/signup` | POST |
| USER_PROFILE | `/v1/user/profile` | GET, PUT |
| CARDS | `/v1/cards` | GET, POST |
| CARD_DETAIL(id) | `/v1/cards/${id}` | GET, PUT |
| CARD_TOKENS(id) | `/v1/cards/${id}/tokens` | POST |
| TOKEN_DEACTIVATE(id) | `/v1/tokens/${id}/deactivate` | PATCH |
| COLLECTIONS | `/v1/collections` | POST |
| PRESIGNED_URL | `/v1/media/presigned-url` | GET |
| SHARED_CARD(token) | `/v1/s/${token}` | GET |

## 3. 프론트엔드 실제 호출 위치

| 페이지/파일 | 호출 | 백엔드 경로와 일치 |
|-------------|------|---------------------|
| auth/signup | POST ENDPOINTS.AUTH_SIGNUP | ✅ `/v1/auth/signup` |
| auth/login | POST ENDPOINTS.AUTH_SIGNUP | ✅ (동일 엔드포인트 사용) |
| profile | GET/PUT ENDPOINTS.USER_PROFILE | ✅ `/v1/user/profile` |
| cards (목록) | GET ENDPOINTS.CARDS | ⚠️ `/v1/cards` → 백엔드는 `/v1/cards/` |
| cards/new | GET PRESIGNED_URL, POST ENDPOINTS.CARDS | ⚠️ 동일 (trailing slash) |
| cards/[id] | GET/PUT ENDPOINTS.CARD_DETAIL(id) | ⚠️ `/v1/cards/${id}` → 백엔드는 `/v1/cards/<pk>/` |
| cards/[id]/share | POST `/v1/cards/${cardId}/tokens` (리터럴) | ✅ 경로 일치, 상수는 ENDPOINTS.CARD_TOKENS 권장 |
| s/[token] | GET ENDPOINTS.SHARED_CARD(token), POST COLLECTIONS | ✅ `/v1/s/${token}`, `/v1/collections` |

## 4. 불일치·권장 사항

### 4.1 Trailing slash (DRF ViewSet)

- **백엔드**: DefaultRouter 기본값으로 `cards/`, `cards/<pk>/` 처럼 **끝에 `/`** 있음.
- **프론트**: 현재 `CARDS` = `/v1/cards`, `CARD_DETAIL(id)` = `/v1/cards/${id}` (slash 없음).
- **영향**: Django/DRF 설정에 따라 `/v1/cards` 요청이 `/v1/cards/`로 리다이렉트될 수 있음. 동작할 수 있으나, 리다이렉트·CORS 이슈 방지를 위해 **프론트에서 slash 맞추는 것을 권장**.
- **권장**: `CARDS: '/v1/cards/'`, `CARD_DETAIL: (id) => \`/v1/cards/${id}/\`` 로 변경.

### 4.2 share 페이지 리터럴 경로

- `app/cards/[id]/share/page.tsx`에서 `\`/v1/cards/${cardId}/tokens\`` 를 직접 사용 중.
- **권장**: `ENDPOINTS.CARD_TOKENS(cardId)` 사용으로 통일.

### 4.3 공유 명함 응답 구조

- **백엔드**: `GET /v1/s/<access_key>` → CardSnapshotSerializer → `{ id, card_id, schema_version, data, created_at }`, `data` 안에 name/company/email 등.
- **프론트**: `SharedCard`를 `card_id`, `name`, `company` 등 **평면**으로 가정 → 실제 응답과 불일치. `data` 필드로 접근하도록 타입/표시 로직 수정 필요 (별도 체크 문서 참고).

## 5. 요약

| 항목 | 상태 |
|------|------|
| Auth, User profile, Presigned, Collections, Token create/deactivate, Shared URL 경로 | ✅ 일치 |
| Card list/create/detail/update **경로** | ⚠️ trailing slash만 맞추면 완전 일치 |
| share 페이지 | ✅ 경로 일치, ENDPOINTS 상수 사용 권장 |
| 공유 명함 응답 타입/사용처 | ❌ 백엔드 `data` 구조와 불일치 (별도 수정 필요) |
