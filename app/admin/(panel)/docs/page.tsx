import {
  COLLECTIONS,
  PRODUCT_LIMIT,
  VIDEO_PLACEMENTS,
  type CollectionType,
  type Field,
} from "@/lib/admin/collections";

export const dynamic = "force-dynamic";

/**
 * 사장님용 사용 설명서.
 *
 * 각 화면의 입력 항목은 lib/admin/collections.ts 의 정의에서 직접 뽑아 그린다.
 * 나중에 항목이 바뀌어도 이 문서가 따로 낡지 않도록 하기 위함이다.
 */

/** 항목별 쉬운 설명. 없는 항목은 라벨만 보여준다. */
const FIELD_NOTES: Record<string, string> = {
  // 추천 상품
  "products.name": "손님에게 보이는 상품 이름입니다. 스마트스토어와 똑같이 적으면 헷갈리지 않습니다.",
  "products.category": "카드 왼쪽 위에 작게 붙는 라벨입니다. 예: SPEED, POWER, CONTROL. 비워도 됩니다.",
  "products.image": "‘이미지 올리기’로 사진을 올리거나, 스마트스토어 상품 사진 주소를 붙여넣으면 됩니다.",
  "products.price": "숫자만 적으세요. 1000 단위 쉼표와 ‘원’은 자동으로 붙습니다.",
  "products.discountPercent": "할인율입니다. 22를 넣으면 22% 깎인 가격이 자동으로 계산돼 보입니다. 할인이 없으면 비워두세요.",
  "products.blurb": "상품 카드에 들어가는 한두 줄 설명입니다.",
  "products.specs": "라켓 무게, 밸런스 같은 짧은 정보입니다. 쉼표로 나눠 적으면 하나씩 조각으로 표시됩니다.",
  "products.badge": "‘NEW’처럼 눈에 띄는 표시가 필요할 때만 고르세요.",
  "products.url": "누르면 이동할 스마트스토어 상품 주소입니다.",
  "products.visible": "끄면 손님에게 안 보입니다. 지우지 않고 잠시 내릴 때 쓰세요.",

  // 유튜브
  "youtube.url": "유튜브 주소를 붙여넣으면 제목과 썸네일을 자동으로 가져옵니다. 쇼츠 주소도 됩니다.",
  "youtube.title": "자동으로 채워집니다. 더 좋은 제목이 있으면 고쳐도 됩니다.",
  "youtube.category": "영상 종류입니다. 예: 장비 리뷰, 경기 영상, 일상 브이로그.",
  "youtube.inHome": "체크하면 홈페이지 첫 화면의 영상 칸에 올라갑니다.",
  "youtube.inMatch": "체크하면 사장님 소개 페이지의 경기 영상 칸에 올라갑니다.",
  "youtube.inGear": "체크하면 사장님 소개 페이지의 장비 리뷰 칸에 올라갑니다.",
  "youtube.visible": "끄면 어느 화면에도 안 보입니다.",

  // 릴스
  "reels.url": "인스타그램 게시물 주소를 붙여넣으세요.",
  "reels.caption": "릴스 아래 붙는 짧은 설명입니다.",
  "reels.image": "썸네일 사진 경로입니다. 비워두면 색깔 카드로 대신 표시됩니다.",
  "reels.type": "릴스(영상)인지 일반 사진인지 고르세요.",
  "reels.tags": "분류용 꼬리표입니다. 비워도 됩니다.",
  "reels.featured": "체크하면 사장님 소개 페이지의 인스타 칸에 올라갑니다.",
  "reels.pinned": "위쪽에 고정하고 싶을 때 체크하세요.",
  "reels.visible": "끄면 손님에게 안 보입니다.",

  // 대회 이력
  "achievements.date": "대회가 열린 날짜입니다. 2025-10-26 처럼 적어주세요.",
  "achievements.title": "대회 이름입니다.",
  "achievements.category": "종목과 부수입니다. 예: 남복 준자강.",
  "achievements.partner": "함께 뛴 파트너 이름입니다.",
  "achievements.result": "우승, 준우승, 3위 처럼 적어주세요.",
  "achievements.source": "기사나 대회 결과 페이지 주소입니다. 없으면 비워도 됩니다.",
  "achievements.highlight": "체크하면 홈 화면 사장님 카드에 대표 기록으로 올라갑니다.",
  "achievements.visible": "끄면 기록 목록에서 안 보입니다.",

  // 배너
  "banners.image": "배너 이미지를 올리세요. 글씨와 버튼이 이미 그려진 이미지를 그대로 쓰면 됩니다.",
  "banners.href": "배너를 눌렀을 때 이동할 주소입니다. 비워두면 눌러도 아무 일이 없습니다.",
  "banners.title": "홈페이지에는 안 보입니다. 관리 목록에서 구분하기 위한 이름입니다.",
  "banners.startAt": "이 날짜부터 보이게 하고 싶을 때만 적으세요. 비우면 바로 보입니다.",
  "banners.endAt": "이 날짜까지만 보이게 하고 싶을 때만 적으세요. 비우면 계속 보입니다.",
  "banners.visible": "끄면 배너가 사라집니다.",
};

const SECTIONS: {
  type: CollectionType;
  where: string;
  what: string;
  limit?: string;
  tips?: string[];
}[] = [
  {
    type: "products",
    where: "홈페이지 ‘SMART STORE PICKS’ 칸",
    what: "손님에게 먼저 보여주고 싶은 상품을 골라 놓는 곳입니다. 카드를 누르면 스마트스토어로 넘어갑니다.",
    limit: `공개된 상품 중 위에서 ${PRODUCT_LIMIT}개까지만 홈에 나옵니다.`,
    tips: [
      "가격은 숫자만 적으세요. 100,000 이라고 적어도 알아서 정리됩니다.",
      "할인율을 넣으면 원래 가격에 줄이 그어지고 할인된 가격이 크게 표시됩니다.",
      "저장하기 전에 ‘카드에 표시될 가격’ 미리보기로 확인할 수 있습니다.",
    ],
  },
  {
    type: "youtube",
    where: "홈페이지 영상 칸, 사장님 소개 페이지의 경기 영상·장비 리뷰 칸",
    what: "유튜브 영상을 홈페이지에 걸어두는 곳입니다. 주소만 붙여넣으면 나머지는 거의 자동입니다.",
    limit: VIDEO_PLACEMENTS.map((p) => `${p.section} ${p.limit}개`).join(" · ") + "까지 나옵니다.",
    tips: [
      "유튜브 주소를 넣고 다른 칸을 클릭하면 제목이 자동으로 채워집니다.",
      "한 영상을 여러 칸에 동시에 올릴 수 있습니다. 체크를 여러 개 하면 됩니다.",
      "정해진 개수를 넘으면 ‘대기’로 표시됩니다. 위로 올리면 그 영상이 대신 올라갑니다.",
    ],
  },
  {
    type: "reels",
    where: "사장님 소개 페이지 인스타그램 칸",
    what: "인스타그램에 올린 릴스를 홈페이지에도 보여주는 곳입니다.",
    tips: [
      "썸네일 사진은 따로 받아오는 방식이라, 사진 칸이 비어 있으면 색깔 카드로 대신 표시됩니다.",
    ],
  },
  {
    type: "achievements",
    where: "사장님 소개 페이지 대회 기록, 홈 사장님 카드",
    what: "대회 성적을 쌓아두는 곳입니다.",
    tips: [
      "‘상단 강조’를 체크한 기록만 홈 화면 사장님 카드에 요약으로 올라갑니다.",
      "날짜를 정확히 적으면 최신 순으로 알아서 정렬됩니다.",
    ],
  },
  {
    type: "banners",
    where: "홈페이지 첫 화면 아래 (인트로 다음)",
    what: "행사나 신상품을 알리는 큰 이미지입니다. 여러 장을 넣으면 자동으로 넘어갑니다.",
    tips: [
      "글씨와 버튼이 이미 그려진 완성 이미지를 올리면 됩니다. 홈페이지에서 글씨를 따로 얹지 않습니다.",
      "가로로 긴 이미지는 휴대폰에서 작아 보일 수 있으니, 글씨를 큼직하게 만든 이미지가 좋습니다.",
      "행사 기간이 정해져 있으면 게시 시작·종료 날짜를 넣어두세요. 기간이 지나면 알아서 사라집니다.",
    ],
  },
];

const CARD: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e4e9ee",
  borderRadius: 8,
  padding: "22px 20px",
};

function FieldTable({ type, fields }: { type: CollectionType; fields: Field[] }) {
  return (
    <div style={{ overflowX: "auto", marginTop: 14 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 460 }}>
        <thead>
          <tr style={{ textAlign: "left", color: "#5b6d73" }}>
            <th style={{ padding: "8px 10px", borderBottom: "1px solid #e4e9ee", width: "30%" }}>
              항목
            </th>
            <th style={{ padding: "8px 10px", borderBottom: "1px solid #e4e9ee" }}>
              무엇을 적나요
            </th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f) => (
            <tr key={f.name}>
              <td
                style={{
                  padding: "10px",
                  borderBottom: "1px solid #f0f3f5",
                  fontWeight: 700,
                  color: "#10222c",
                  verticalAlign: "top",
                }}
              >
                {f.label}
                {f.required && <span style={{ color: "#c0392b" }}> *</span>}
              </td>
              <td
                style={{
                  padding: "10px",
                  borderBottom: "1px solid #f0f3f5",
                  color: "#3a4c54",
                  lineHeight: 1.6,
                }}
              >
                {FIELD_NOTES[`${type}.${f.name}`] ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminDocsPage() {
  return (
    <section style={{ maxWidth: 820 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: "4px 0 6px" }}>
        홈페이지 관리 설명서
      </h1>
      <p style={{ fontSize: 14.5, color: "#5b6d73", margin: "0 0 22px", lineHeight: 1.7 }}>
        각 화면에서 무엇을 할 수 있고, 어떤 값을 넣어야 하는지 정리한 문서입니다.
        <br />
        <b style={{ color: "#c0392b" }}>* 표시가 있는 항목은 반드시 채워야 저장됩니다.</b>
      </p>

      {/* 공통 사용법 */}
      <div style={{ ...CARD, marginBottom: 16 }}>
        <h2 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 12px" }}>
          먼저 알아두면 좋은 것
        </h2>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14.5, lineHeight: 1.9, color: "#3a4c54" }}>
          <li>
            <b>저장하면 바로 반영됩니다.</b> 홈페이지를 새로고침하면 손님에게도 바로 보입니다.
          </li>
          <li>
            <b>순서를 바꾸려면</b> 목록 왼쪽의 ▲ ▼ 버튼을 누르세요. 위에 있을수록 먼저 보입니다.
          </li>
          <li>
            <b>잠깐 내리고 싶을 때는</b> 지우지 말고 <b>공개</b> 버튼을 눌러 <b>숨김</b>으로 바꾸세요.
            나중에 다시 켜면 그대로 돌아옵니다.
          </li>
          <li>
            <b>삭제는 되돌릴 수 없습니다.</b> 확실할 때만 누르세요.
          </li>
          <li>
            <b>사진은 8MB까지</b> 올릴 수 있고, JPG·PNG·WEBP 형식을 지원합니다.
          </li>
        </ul>
      </div>

      {/* 섹션별 안내 */}
      {SECTIONS.map((s) => {
        const def = COLLECTIONS[s.type];
        return (
          <div key={s.type} style={{ ...CARD, marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 4px" }}>{def.label}</h2>
            <p style={{ fontSize: 14.5, color: "#3a4c54", margin: "0 0 10px", lineHeight: 1.7 }}>
              {s.what}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13.5 }}>
              <div style={{ color: "#5b6d73" }}>
                <b style={{ color: "#10222c" }}>어디에 보이나요 · </b>
                {s.where}
              </div>
              {s.limit && (
                <div style={{ color: "#0b50a1", fontWeight: 600 }}>
                  <b>노출 개수 · </b>
                  {s.limit}
                </div>
              )}
            </div>

            <FieldTable type={s.type} fields={def.fields} />

            {s.tips && s.tips.length > 0 && (
              <div
                style={{
                  marginTop: 14,
                  background: "#f4f6f8",
                  borderRadius: 6,
                  padding: "12px 14px",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, color: "#10222c", marginBottom: 6 }}>
                  알아두면 편한 것
                </div>
                <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13.5, lineHeight: 1.8, color: "#3a4c54" }}>
                  {s.tips.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}

      {/* 매장 정보 */}
      <div style={{ ...CARD, marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 4px" }}>매장 정보</h2>
        <p style={{ fontSize: 14.5, color: "#3a4c54", margin: "0 0 10px", lineHeight: 1.7 }}>
          매장 주소·연락처와 홈페이지 맨 위에 띄우는 공지를 관리합니다.
        </p>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14.5, lineHeight: 1.9, color: "#3a4c54" }}>
          <li>
            <b>전화번호·영업시간·휴무</b>는 채운 것만 ‘오시는 길’에 나옵니다. 비워두면 그 줄은 아예 안 보입니다.
          </li>
          <li>
            <b>전화번호</b>를 넣으면 휴대폰에서 눌렀을 때 바로 전화가 걸립니다.
          </li>
          <li>
            <b>공지 문구</b>를 적으면 홈페이지 맨 위에 초록색 띠로 표시됩니다. 팝업이 아니라 띠입니다.
          </li>
          <li>
            공지를 <b>내리고 싶으면 문구를 지우고 저장</b>하면 됩니다. 기간을 정해두면 그 기간에만 보입니다.
          </li>
        </ul>
      </div>

      {/* 자주 묻는 것 */}
      <div style={CARD}>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 12px" }}>이럴 땐 어떻게 하나요</h2>
        <dl style={{ margin: 0, fontSize: 14.5, lineHeight: 1.8, color: "#3a4c54" }}>
          {[
            ["상품을 잠깐만 내리고 싶어요", "‘공개’ 버튼을 눌러 ‘숨김’으로 바꾸세요. 정보는 그대로 남습니다."],
            ["다른 상품을 홈에 띄우고 싶어요", "보여주고 싶은 상품을 ▲ 버튼으로 위로 올리면 됩니다."],
            ["영상 제목이 안 채워져요", "유튜브 주소를 넣은 뒤 다른 칸을 한 번 클릭해 보세요. 비공개 영상은 가져올 수 없습니다."],
            ["행사가 끝나면 배너를 꺼야 하나요", "게시 종료 날짜를 미리 넣어두면 그날 이후 자동으로 사라집니다."],
            ["사진이 안 올라가요", "8MB가 넘거나 이미지 파일이 아닐 수 있습니다. 파일 형식과 크기를 확인해 주세요."],
          ].map(([q, a]) => (
            <div key={q} style={{ marginBottom: 12 }}>
              <dt style={{ fontWeight: 800, color: "#10222c" }}>{q}</dt>
              <dd style={{ margin: "2px 0 0" }}>{a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
