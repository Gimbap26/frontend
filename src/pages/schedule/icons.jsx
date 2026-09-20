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
