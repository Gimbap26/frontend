/*
 * 일정 화면 전용 아이콘.
 * 달력의 이전/다음 달 이동 버튼 (셰브론). 이 화면에서만 사용.
 * currentColor 기반이라 부모 text 색을 따른다.
 */

const chevronProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.66618,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

// 이전 달 (‹) — 다음 달 버튼과 동일한 좌표계/형태로 맞춰 크기를 통일한다.
export function PreviousMonthButton({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" {...chevronProps} xmlns="http://www.w3.org/2000/svg">
      <path d="M12.4963 14.9956L7.4978 9.99706L12.4963 4.99854" />
    </svg>
  )
}

// 다음 달 (›)
export function NextMonthButton({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" {...chevronProps} xmlns="http://www.w3.org/2000/svg">
      <path d="M7.4978 14.9956L12.4963 9.99706L7.4978 4.99854" />
    </svg>
  )
}

/*
 * 일정 화면의 카드 헤더·토글에서 쓰는 선 아이콘들.
 * 위 셰브론과 같은 규칙(currentColor / round cap)으로 맞췄다.
 */
const lineProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

// AI 리포트 헤더 (번개)
export function BoltIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...lineProps} xmlns="http://www.w3.org/2000/svg">
      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
}

// 시뮬레이터 헤더 (슬라이더)
export function SlidersIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...lineProps} xmlns="http://www.w3.org/2000/svg">
      <path d="M4 8h9" />
      <path d="M17 8h3" />
      <circle cx="15" cy="8" r="2" />
      <path d="M4 16h4" />
      <path d="M12 16h8" />
      <circle cx="10" cy="16" r="2" />
    </svg>
  )
}

// AI 퀵 질문 배지 (전구)
export function BulbIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...lineProps} xmlns="http://www.w3.org/2000/svg">
      <path d="M9.5 18h5" />
      <path d="M10.5 21h3" />
      <path d="M12 3a6 6 0 00-3.4 10.9c.6.4.9 1 .9 1.7v.4h5v-.4c0-.7.3-1.3.9-1.7A6 6 0 0012 3z" />
    </svg>
  )
}

// 최적화 옵션: 구독 서비스 (영상)
export function SubscriptionIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...lineProps} xmlns="http://www.w3.org/2000/svg">
      <path d="M15 10l4.6-2.3a1 1 0 011.4.9v6.8a1 1 0 01-1.4.9L15 14" />
      <path d="M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )
}

// 최적화 옵션: 외식 (식기)
export function DiningIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...lineProps} xmlns="http://www.w3.org/2000/svg">
      <path d="M7 3v6a2 2 0 002 2 2 2 0 002-2V3" />
      <path d="M9 11v10" />
      <path d="M16 3c1.7 1.2 2.5 3 2.5 5.2 0 1.8-.8 3.4-2.5 4.3v8.5" />
    </svg>
  )
}
