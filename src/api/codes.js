/*
 * 백엔드 열거값 -> 화면 표기 변환.
 *
 * 백엔드는 예정 이벤트 종류를 영문 코드로 준다. (SALARY, CARD_PAYMENT ...)
 * 화면에 그대로 뿌리면 "CARD_PAYMENT" 가 노출되므로 한글 라벨로 바꿔 쓴다.
 * 명세에 "등"으로 열려 있는 값이라, 표에 없는 코드는 원문을 그대로 돌려준다.
 */

const EVENT_TYPE_LABEL = {
  SALARY: '급여',
  CARD_PAYMENT: '카드',
  SUBSCRIPTION: '구독',
  UTILITY: '공과금',
  INSURANCE: '보험',
  LOAN: '대출',
  RENT: '주거',
  COMMUNICATION: '통신',
  TRANSFER: '이체',
  ETC: '기타',
}

// "CARD_PAYMENT" -> "카드" / 모르는 코드나 이미 한글인 값은 그대로
export function eventTypeLabel(eventType) {
  if (!eventType) return ''
  return EVENT_TYPE_LABEL[eventType] ?? eventType
}
