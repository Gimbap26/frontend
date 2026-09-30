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

// Date -> "2026-09-21" (로컬 시간 기준. toISOString() 은 UTC 라서 날짜가 밀릴 수 있다)
export function toIsoDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// "2026-09-05" -> "9/5"
export function formatSlashDate(isoDate) {
  const [, month, day] = isoDate.split('-').map(Number)
  return `${month}/${day}`
}

/*
 * 만원 단위 축약. 좁은 카드에 큰 금액을 넣을 때 사용한다.
 *  520000 -> "52만", 1691000 -> "169.1만", -300000 -> "-30만"
 * 소수가 남을 때만 첫째 자리까지 표기한다.
 */
export function formatManwon(amount) {
  const sign = amount < 0 ? '-' : ''
  const rounded = Math.round((Math.abs(amount) / 10_000) * 10) / 10
  return `${sign}${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}만`
}

// 수입/지출 부호를 붙인 만원 표기. income -> "+280만", expense -> "-52만"
export function formatSignedManwon(amount, type) {
  const sign = type === 'income' ? '+' : '-'
  return `${sign}${formatManwon(Math.abs(amount))}`
}

// "2026-09-21T10:42:00" -> "오전 10:42"
export function formatClockTime(isoDateTime) {
  const date = new Date(isoDateTime)
  const hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const meridiem = hours < 12 ? '오전' : '오후'
  const hour12 = hours % 12 === 0 ? 12 : hours % 12
  return `${meridiem} ${hour12}:${minutes}`
}
