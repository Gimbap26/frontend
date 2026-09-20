/*
 * 화면 표시용 포맷 유틸.
 * 통화 표기는 시안 기준으로 원화 기호(₩)를 금액 앞에 붙인다.
 */

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

// 숫자를 원화 문자열로. 예: 2400000 -> "₩2,400,000", -520000 -> "-₩520,000"
export function formatWon(amount) {
  const sign = amount < 0 ? '-' : ''
  return `${sign}₩${Math.abs(amount).toLocaleString('ko-KR')}`
}

// 수입/지출 부호를 명시한 금액. 예: income -> "+₩2,800,000", expense -> "-₩6,300"
export function formatSignedWon(amount, type) {
  const sign = type === 'income' ? '+' : '-'
  return `${sign}₩${Math.abs(amount).toLocaleString('ko-KR')}`
}

// "2026-09-25" -> "9월 25일"
export function formatShortDate(isoDate) {
  const [, month, day] = isoDate.split('-').map(Number)
  return `${month}월 ${day}일`
}

// "2026-08-29" -> "08.29"
export function formatDotDate(isoDate) {
  const [, month, day] = isoDate.split('-')
  return `${month}.${day}`
}

// "2026-09-25" -> "9월 25일 (금)"
export function formatDateWithWeekday(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`)
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS[date.getDay()]})`
}
