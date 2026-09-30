/*
 * AI 분석 에이전트 화면 전용 아이콘.
 *  - SendIcon: 입력창 전송 버튼 (종이비행기)
 *  - EvidenceIcon: AI 답변 근거 줄 앞의 정보(ⓘ) 아이콘
 *  - PlusIcon: 헤더의 새 대화 버튼 (+)
 * currentColor 기반이라 부모 text 색을 따른다.
 */

// 전송 (종이비행기)
export function SendIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M21.5 12L3.5 4.5l3 7.5-3 7.5z" />
      <path d="M6.5 12H21.5" />
    </svg>
  )
}

// 근거 정보 (ⓘ)
export function EvidenceIcon({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 7.2V11" />
      <path d="M8 5.2h.01" />
    </svg>
  )
}

/*
 * 새 대화 (+).
 * 작은 크기에서 말풍선 아이콘은 형태가 뭉개져서, 선 두 개짜리 플러스만 쓴다.
 */
export function PlusIcon({ size = 13 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8 3.5v9" />
      <path d="M3.5 8h9" />
    </svg>
  )
}
