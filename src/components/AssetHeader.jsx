import { NavLink } from 'react-router-dom'
import { useAccounts } from '../hooks/useAssets.js'
import { formatWon } from '../utils/format.js'

/*
 * 자산 화면 상단 공통 헤더. (피그마 dev mode 기준)
 * 화면 상단에 꽉 차는 흰색 바.
 * 구조: 총 자산 라벨 → 금액 → 구분선 → 탭 2개 → 구분선
 * 자산 페이지와 거래내역 페이지가 함께 사용한다.
 */

const tabs = [
  { to: '/accounts', label: '계좌 및 예정 지출' },
  { to: '/transactions', label: '거래내역' },
]

function AssetHeader() {
  const { totalAssets, loading } = useAccounts()

  return (
    <section className="bg-surface">
      {/* 총 자산 (패딩 48 / 20 / 20 / 20) */}
      <div className="flex flex-col items-start px-[20px] pt-[48px] pb-[20px]">
        <p className="text-[12px] font-normal leading-[16px] text-[#90A1B9]">총 자산</p>
        <p className="text-[24px] font-bold leading-[32px] text-[#0F172B]">
          {loading ? '—' : formatWon(totalAssets)}
        </p>
      </div>

      {/* 탭 (위아래 구분선 사이) */}
      <div className="flex border-t border-b border-hairline">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `relative flex-1 py-[14px] text-center text-[14px] font-medium leading-[20px] transition-colors ${
                isActive ? 'text-[#155DFC]' : 'text-[#90A1B9]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {tab.label}
                {isActive && <span className="absolute bottom-[-1px] left-0 h-[2px] w-full bg-[#155DFC]" />}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </section>
  )
}

export default AssetHeader
