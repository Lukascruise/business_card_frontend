# 명함 이미지가 페이지에 안 뜨는 이유

## 1. 프론트에서 한 처리

- **카드 상세 페이지** (`app/cards/[id]/page.tsx`)에서 API 응답의 `image_url`이 있으면 `<img>`로 표시합니다.
- 이미지 로드 실패 시 `onError`로 `<img>`를 숨겨서 깨진 아이콘이 보이지 않도록 했습니다.

## 2. 이미지가 안 보일 때 확인할 것

| 원인 | 확인 방법 |
|------|-----------|
| **백엔드가 `image_url`을 안 줌** | `GET /v1/cards/:id` 응답에 `image_url` 필드가 있는지 확인 |
| **R2 CORS** | 이미지 URL이 `r2.cloudflarestorage.com`이면, R2 버킷 CORS에 프론트 도메인(`https://businesscardfrontend-flame.vercel.app` 등) 허용 여부 확인 |
| **Presigned URL 만료** | Presigned URL은 만료 시간이 있음. 만료되면 새 URL 발급 필요 |
| **403/404** | 브라우저 개발자 도구 Network 탭에서 이미지 요청 상태 코드 확인 |

## 3. 정리

- 프론트: `image_url` 있으면 표시, 로드 실패 시 숨김 처리 완료.
- 이미지가 안 보이면: 백엔드 응답에 `image_url` 포함 여부, R2 CORS, URL 만료/권한을 순서대로 확인하면 됩니다.
