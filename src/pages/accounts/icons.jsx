/*
 * 자산 화면 전용 아이콘.
 * "이번 달 확정 지출" 헤더의 지갑 아이콘. (이 화면에서만 사용)
 * currentColor 기반이라 부모 text 색을 따른다.
 */
export function WalletIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 15 15"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.24989}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12.4989 3.12473H2.49977C1.80947 3.12473 1.24988 3.68433 1.24988 4.37462V10.6241C1.24988 11.3144 1.80947 11.874 2.49977 11.874H12.4989C13.1892 11.874 13.7488 11.3144 13.7488 10.6241V4.37462C13.7488 3.68433 13.1892 3.12473 12.4989 3.12473Z" />
      <path d="M1.24988 6.24946H13.7488" />
    </svg>
  )
}
