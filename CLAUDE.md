# 요넥스 동탄점 — 운영 메모

이 저장소를 만지기 전에 반드시 읽을 것. 사고가 났거나 날 뻔한 것들만 적는다.

## 배포

```bash
# Node 22 가 필요하다(wrangler 4 요구사항). nvm use 는 프롬프트를 깨뜨린 적이 있어 PATH 지정을 권장.
export PATH="$HOME/.nvm/versions/node/v22.23.1/bin:$PATH"

mv .dev.vars .dev.vars.hold          # ← 아래 "함정 1" 참고. 빼먹지 말 것
npx opennextjs-cloudflare build
npx opennextjs-cloudflare deploy
mv .dev.vars.hold .dev.vars
```

- 배포는 **수동 CLI**다. GitHub 에 push 해도 Cloudflare 로 자동 배포되지 않는다.
- 배포 후 DNS/전파 때문에 몇십 초간 예전 응답이 나올 수 있다. 곧바로 검증해서
  실패로 판단하지 말 것(실제로 한 번 오진했다).

## 함정 1 — `.dev.vars` 가 운영 시크릿을 덮어쓴다

`opennextjs-cloudflare deploy` 는 `.dev.vars` 의 값을 **운영 워커 시크릿으로 업로드한다.**
그냥 배포하면 로컬 개발용 관리자 코드가 사장님이 설정한 운영 코드를 덮어쓴다.

→ 배포 중에는 위 절차대로 `.dev.vars` 를 잠시 빼둔다.
   (로그에 `Using secrets defined in .dev.vars` 가 보이면 덮어쓴 것이다.)

## 함정 2 — `wrangler.jsonc` 의 `name` 을 바꾸면 워커가 하나 더 생긴다

공개 주소는 `‹name›.‹계정 서브도메인›.workers.dev` 다.
`name` 을 바꾸면 새 주소에 **새 워커가 생기고, 기존 워커는 그대로 살아남는다.**
(실제로 `yonex-dongtan` → `www` 로 바꿨을 때 워커가 2개가 되어 옛것을 지웠다.)

- 현재 값: `name: "www"`, 계정 서브도메인 `yonex-dongtan`
- 즉 운영 주소는 `https://www.yonex-dongtan.workers.dev`
- 계정 서브도메인은 **대시보드에서만** 바꿀 수 있다. API 는 거부한다(code 10036).
- `name` 을 바꿨다면 옛 워커를 `npx wrangler delete --name ‹옛이름›` 으로 정리할 것.

## 함정 3 — 비밀값을 `.env.local` 에 두면 번들에 구워진다

Next 빌드가 `.env.local` 을 읽어 Workers 번들에 값을 박아 넣는다.
초기에 이 때문에 개발용 관리자 코드로 **운영 관리자 로그인이 뚫린 적이 있다.**

- 비밀값: 로컬은 `.dev.vars`, 운영은 `wrangler secret put`
- `.env.local` 에는 `NEXT_PUBLIC_*` 같은 공개 값만
- 관련 시크릿: `ADMIN_ACCESS_CODE`(로그인 코드), `ADMIN_SESSION_SECRET`(세션 서명 키)

## 함정 4 — `database_id` 를 바꾸면 로컬 D1 이 빈 DB 가 된다

로컬 시뮬레이션 DB 는 `database_id` 기준으로 저장된다. 값이 바뀌면 테이블이 없다며
500 이 난다. 그때는 다시 깔면 된다.

```bash
npx wrangler d1 migrations apply yonex-dongtan-content --local
node scripts/seed-d1.mjs --local
```

## 구조 요약

- **저장소**: D1(`yonex-dongtan-content`). `lib/repository/content-repository.ts` 가
  D1 바인딩이 있으면 D1, 없으면 `data/content.json` 파일로 폴백한다.
  즉 `next dev` 도 로컬 D1 을 쓴다.
- **이미지**: R2(`yonex-dongtan-media`). 업로드는 `/api/admin/upload`,
  서빙은 `/media/‹key›`. 버킷은 공개로 열지 않고 워커를 통해서만 내보낸다.
- **관리 항목 정의**: `lib/admin/collections.ts` 한 곳. 여기 필드를 고치면
  관리 화면과 사용 설명서(`/admin/docs`)가 같이 따라 바뀐다.
- **페이지는 요청 시점 렌더**(`force-dynamic`). 관리자 수정이 재빌드 없이 반영된다.
  `lib/content-server.ts` 가 요청당 한 번만 저장소를 읽도록 묶고 있다.

## 관리자에서 못 바꾸는 것

콘텐츠(상품·영상·대회 기록·배너·매장 정보)는 관리 화면에서 수정 가능하지만,
아래는 코드에 있어 개발자가 고쳐야 한다. 사장님께 안내할 때 혼동하지 말 것.

- 홈: "직접 대회를 뛰는 사장님이 장비를 함께 고릅니다", "동탄에서, 직접 보고 고르세요", 섹션 제목
- 사장님 페이지: 01·02·03 카드(라켓 추천 / 네매듭 / 신발·웨어), 프로필 카드 3개
- 히어로 인트로(YONEX DONGTAN)
- 인스타 릴스: 관리 화면을 일부러 만들지 않았다(썸네일을 sync 스크립트가 받아옴).
  데이터와 사장님 페이지 노출은 살아 있다.

## 성능 메모

느리다는 이야기가 나오면 서버 캐시부터 넣지 말 것.
측정해보니 엣지 캐시된 정적 파일과 D1 을 읽는 동적 페이지의 응답 시간이 같았다.
원인은 서버가 아니라 내부 이동이 전체 새로고침이던 것이었고, `next/link` 로 해결했다.
사이트 안 이동은 `Link`, 외부 링크와 같은 페이지 앵커(`#videos`)는 `<a>` 로 유지한다.
