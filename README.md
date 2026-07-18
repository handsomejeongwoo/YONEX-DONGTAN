# 요넥스 동탄점 웹 (Next.js)

요넥스 동탄점 홈 + 홍승인 대표 소개, 2페이지 정적 사이트입니다.
모든 콘텐츠는 **`data/content.json` 하나**에서 나옵니다. 디자인/레이아웃은 기존 시안을
유지했고, 이번 단계의 목표는 **콘텐츠 데이터 구조와 연동 경계**입니다.

- 프레임워크: Next.js 14 (App Router) + TypeScript, 정적 export (`output: "export"`)
- 페이지: `/` (매장 홈), `/owner` (홍승인 대표)
- 콘텐츠 단일 소스: [`data/content.json`](data/content.json)

## 빠른 시작

```bash
cd web
npm install
npm run dev        # http://localhost:3000
```

정적 파일로 빌드/미리보기:

```bash
npm run build      # out/ 폴더에 정적 HTML 생성
npm run preview    # out/ 을 로컬 서버로 서빙
```

`out/` 폴더를 아무 정적 호스팅(예: Netlify, GitHub Pages, S3, Nginx)에 올리면 됩니다.

---

## 1. 콘텐츠를 수정하는 방법

모든 텍스트/링크/카드는 `data/content.json` 에서 바꿉니다. 파일을 저장하면
`npm run dev` 는 즉시, 배포본은 `npm run build` 후 반영됩니다.

| 섹션 | 위치 | 설명 |
|---|---|---|
| 매장 기본정보 | `store` | 이름·주소·스마트스토어/인스타/유튜브/지도 URL |
| 대표 소개 | `owner` | 이름·직함·소개문·플레이 특성(+출처) |
| 대회 기록 | `records[]` | 공개 확인된 이력만. `highlight:true` 면 홈 대표 카드에 노출 |
| 유튜브 | `youtube[]` | 제목·발행일·유형(`video`/`short`)·URL·썸네일·`tags` |
| 인스타그램 | `instagram[]` | 게시일·유형(`image`/`reel`)·캡션·URL·`featured`/`order` |
| 스토어 추천 | `shopPicks[]` | 상품명·소개·이미지경로·URL·`visible` |

### 노출 규칙(태그 기반)

- **홈 최신 영상 3개**: `youtube[].tags` 에 `"home-latest"` 가 붙은 항목(없으면 최신순 폴백).
- **대표 페이지 경기 영상 4개**: `"owner-match"` 태그.
- **대표 페이지 장비 리뷰 2개**: `"owner-gear"` 태그.
- **인스타 6칸**: `instagram[].featured: true` + `order` 순.
- **스토어 카드**: `shopPicks[].visible: true` 인 것만.

데이터가 비어도 페이지는 깨지지 않고, 해당 섹션은 폴백 문구를 보이거나 숨겨집니다.

> 원칙: `records` 에는 `yonex-dongtan-research.md` 로 **공개 확인된 이력만** 넣습니다.
> `전국 1위`·`최고` 같은 단정 표현, 미확인 조회수·가격·재고는 넣지 않습니다.

---

## 2. YouTube 갱신하는 방법

공식 RSS(최신 15개)를 읽어 `content.json` 의 `youtube` 배열을 갱신합니다.
브라우저가 아니라 **서버/CLI에서만** 실행합니다(CORS 회피).

```bash
npm run sync:youtube
```

- RSS 주소: `https://www.youtube.com/feeds/videos.xml?channel_id=UCZ9iNela2zq6MKuvkh7iFpQ`
  (값은 `meta.youtube.rssUrl` / `channelId` 에서 읽습니다.)
- 기존 항목의 **`type`/`tags`/`category`/`badge`** 는 영상 id로 매칭해 **보존**합니다.
- RSS는 쇼츠/일반을 구분하지 못하므로, **신규 영상**의 `type` 은 기본 `video` 로 들어옵니다.
  스크립트가 신규 id를 출력하니, 쇼츠면 `content.json` 에서 `type`/`tags` 를 손봅니다.
- 네트워크 실패 시 `content.json` 을 건드리지 않고 기존 데이터로 계속 동작합니다.
- 갱신 시각은 `meta.youtube.lastSyncedAt` 에 기록됩니다.

자동화하려면 배포 파이프라인에서 `npm run sync:youtube && npm run build` 순으로 돌리세요.
(정적 export이므로 갱신 = 재빌드/재배포입니다.)

---

## 3. Instagram / Smart Store 현재 방식과 향후 조건

이번 단계는 **정적 링크 카드**만 씁니다. 런타임 스크래핑/무단 크롤링은 하지 않습니다.

### Instagram
- 지금: `data/content.json` 의 `instagram[]` 정적 카드 → 새 탭으로 게시물 이동.
- 썸네일: **런타임 스크래핑은 하지 않습니다.** 대신 빌드/CLI에서 `npm run sync:instagram`
  을 돌리면 각 게시물의 공개 `og:image` 를 **로컬로 내려받아** `public/assets/instagram/{id}.jpg`
  에 저장하고 `image` 필드를 채웁니다. 카드에 `image` 가 있으면 사진 카드로, 없으면
  그라디언트 링크 카드로 표시됩니다(둘 다 정상 동작).
  - `npm run sync:instagram -- --featured` 로 대표 페이지 6개만 갱신할 수도 있습니다.
  - 주의: 인스타 `og:image` URL은 서명·만료되므로 **핫링크하지 않고 로컬 저장**합니다.
    인스타 마크업 변경/로그인 벽/레이트리밋으로 일부 실패할 수 있고, 실패분은 그라디언트로 폴백합니다.
  - 저작권: 대상은 스토어 자기 계정(@yonex_dongtan)의 게시물입니다.
  - **커버 직접 지정(override):** 특정 카드의 커버를 손으로 고르고 싶으면, `/reels/` 페이지를
    개발자도구로 열어 릴스 커버 이미지(`scontent…cdninstagram.com/…jpg`) URL을 복사한 뒤
    해당 항목의 `thumbnailSource` 에 붙여넣고 **즉시** `npm run sync:instagram` 을 실행합니다.
    이 URL은 서명·만료(보통 몇 시간)되므로 붙여넣자마자 받아야 합니다. 만료/실패 시 자동으로
    og:image 로 폴백합니다(로그의 `[override]` / `[og:image]` 로 어느 경로였는지 확인 가능).
- 경계: [`lib/providers/instagram.ts`](lib/providers/instagram.ts) 의 `InstagramProvider`.
  현재는 `staticInstagramProvider` 를 반환합니다.
- 향후(공식 API): **Meta Instagram Graph API**. 필요 조건 —
  Business/Creator 계정, Facebook Page 연결, 장기 Access Token.
  준비되면 `graphInstagramProvider` 를 구현하고 `getInstagramProvider()` 분기를 켭니다.
  자격 증명은 코드에 넣지 말고 `.env` 로만 주입합니다(`.env.example` 참고).

### Smart Store
- 지금: `data/content.json` 의 `shopPicks[]` 수동 큐레이션 카드 → 새 탭으로 스토어 이동.
  가격·재고·조회수는 표기하지 않습니다.
- 경계: [`lib/providers/shop.ts`](lib/providers/shop.ts) 의 `ShopProvider`(현재 `staticShopProvider`).
- 향후(공식 API): 네이버 커머스/공식 제휴 상품 API. `commerceShopProvider` 구현 +
  `.env` 자격 증명(`NAVER_COMMERCE_*`).

`.env` 는 절대 커밋하지 않습니다. 변수명은 [`.env.example`](.env.example) 에만 둡니다.

---

## 4. 검증 방법

```bash
npm run build      # 타입체크 + 정적 export 통과 확인
npm run preview    # out/ 서빙 후 브라우저에서 /, /owner 확인
```

체크리스트:
- [ ] 홈: 최신 유튜브 3개 / 스토어 추천 카드 / 매장 정보 노출
- [ ] 대표: 대회 기록 타임라인 / 경기·리뷰 영상 / 인스타 6카드 노출
- [ ] 모든 외부 링크가 새 탭(`target="_blank" rel="noopener noreferrer"`)으로 열림
- [ ] `data/content.json` 의 값을 바꾸면 두 페이지에 반영됨
- [ ] 빈 배열/누락 데이터에도 레이아웃이 깨지지 않음

---

## 폴더 구조

```
web/
├── data/content.json            # ★ 콘텐츠 단일 소스
├── lib/
│   ├── types.ts                 # content.json 타입
│   ├── content.ts               # 로더 + 선택 헬퍼
│   └── providers/
│       ├── instagram.ts         # Instagram 추상화 경계
│       └── shop.ts              # Smart Store 추상화 경계
├── scripts/
│   ├── sync-youtube.mjs         # 유튜브 RSS → content.json 갱신
│   └── sync-instagram.mjs       # 인스타 og:image → public/assets/instagram 로컬 저장
├── app/
│   ├── page.tsx                 # 홈
│   ├── owner/page.tsx           # 홍승인 대표
│   ├── layout.tsx, globals.css
├── components/                  # Header/Footer/VideoCard/ShopCard/InstagramCard/ClientEffects
├── public/assets/               # 로고 등 (사진 에셋을 넣으면 자동 노출)
└── .env.example                 # 향후 공식 API 변수명만
```

> 참고: 프로젝트 상위 폴더의 `요넥스 동탄 초기 랜딩페이지/` 는 기존 정적 시안으로 남겨둔
> 참고본입니다. 실제 사이트는 이 `web/` 앱입니다.
