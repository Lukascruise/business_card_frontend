# 백엔드–프론트엔드 격차 점검 결과

## 1. API 사용 현황

| 메서드 | 경로 | 용도 | 프론트 사용 |
|--------|------|------|-------------|
| POST | `/v1/cards/<id>/tokens` | 공유 토큰 생성 | ✅ 사용 (cards/[id]/share) |
| PATCH | `/v1/tokens/<id>/deactivate` | 공유 토큰 무효화 | ✅ 사용 (cards/[id]/share) — 프론트는 `api.delete` 호출 중. 백엔드가 PATCH만 허용하면 `api.patch`로 변경 필요 |
| GET | `/v1/s/<token>` | 공유 명함 조회 | ✅ 사용 (s/[token]) — **응답 형식 불일치**는 프론트에서 flatten으로 처리 (아래 §4) |

## 2. 정리 (미사용·대체 사용)

### 2.1 명함 삭제 (DELETE /v1/cards/<id>/)

- **백엔드**: `CardViewSet.destroy` — 구현됨.
- **프론트**: 삭제 버튼 + `api.delete(ENDPOINTS.CARD_DETAIL(id))` 사용 (cards/[id]).

### 2.2 공유 토큰 무효화 (PATCH /v1/tokens/<id>/deactivate)

- **백엔드**: 구현됨.
- **프론트**: 공유 페이지에서 `api.delete(ENDPOINTS.TOKEN_DEACTIVATE(id))` 사용. 백엔드가 PATCH만 받을 경우 `api.patch`로 변경 필요.

### 2.3 명함 부분 수정 (PATCH /v1/cards/<id>/)

- **백엔드**: 구현됨.
- **프론트**: PUT으로 동일 기능 사용. 필요 시 PATCH로 전환 가능.

## 3. 결론

백엔드에서 구현됐는데 프론트에서 **전혀 사용하지 않던** 기능은  
1) 명함 삭제 (DELETE), 2) 공유 토큰 무효화 (PATCH)  
였으나, 현재는 **둘 다 프론트에서 사용 중**입니다.  
(토큰 무효화는 HTTP 메서드만 DELETE vs PATCH 확인 필요.)

## 4. 공유 명함 응답 형식 불일치 (해결됨)

- **백엔드**: `GET /v1/s/<token>` 응답에 `name`, `company`, `email`, `phone`, `bio`를 **`data` 객체 안에** 넣어 반환할 수 있음.
- **프론트**: 최상위에 `name`, `company` 등을 기대하는 `SharedCard` 타입으로 표시.
- **처리**: `app/s/[token]/page.tsx`에서 `flattenSharedCard(res)`로 raw 응답을 정규화.
  - `res.data`가 있으면: `{ card_id: res.card_id, ...res.data }` 형태로 flatten.
  - 없으면 (flat 응답): `{ card_id, name ?? '', company, ... }` 형태로 그대로 사용.
- **결과**: 백엔드가 nested(`{ card_id, data: { name, ... } }`) 또는 flat(`{ card_id, name, ... }`) 어느 쪽이든 프론트에서 동일한 `SharedCard`로 사용 가능.
