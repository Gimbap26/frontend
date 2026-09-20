import AssetHeader from '../../components/AssetHeader.jsx'
import AsyncBoundary from '../../components/AsyncBoundary.jsx'
import { AssetsIcon, WarningIcon } from '../../assets/icons/index.jsx'
import { WalletIcon } from './icons.jsx'
import { useAccounts, useUpcomingExpenses } from '../../hooks/useAssets.js'
import { formatWon, formatShortDate } from '../../utils/format.js'

/*
 * 자산 - 계좌 및 예정 지출 화면. (피그마 시안 기준)
 * 구조: 총자산+탭 헤더(풀블리드) → 계좌 카드들 → 이번 달 확정 지출 → 안내 박스
 * 데이터는 useAccounts / useUpcomingExpenses 훅을 통해 받는다. (백엔드 연결 시 훅만 유지)
 */

function Accounts() {
  const { accounts, loading: accountsLoading, error: accountsError } = useAccounts()
  const { expenses, total, loading: expensesLoading, error: expensesError } = useUpcomingExpenses()

  return (
    <div className="flex flex-col">
      <AssetHeader />

      <div className="flex flex-col gap-[16px] px-[16px] pt-[16px]">
        {/* 계좌 목록 */}
        <AsyncBoundary loading={accountsLoading} error={accountsError}>
          <section className="flex flex-col gap-[12px]">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between gap-[12px] rounded-[18px] bg-surface px-[20px] py-[18px] shadow-[0_2px_12px_rgba(29,43,68,0.05)]"
              >
                <div className="flex min-w-0 items-center gap-[14px]">
                  <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-[#155DFC]">
                    <AssetsIcon size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-bold leading-[20px] text-[#1D293D]">{account.bank}</p>
                    <p className="truncate text-[12px] font-normal leading-[16px] text-[#90A1B9]">{account.purpose}</p>
                  </div>
                </div>
                <p className="shrink-0 text-[16px] font-bold leading-[24px] text-[#1D293D]">{formatWon(account.balance)}</p>
              </div>
            ))}
          </section>
        </AsyncBoundary>

        {/* 이번 달 확정 지출 */}
        <AsyncBoundary loading={expensesLoading} error={expensesError}>
          <section className="rounded-[18px] bg-surface px-[20px] py-[18px] shadow-[0_2px_12px_rgba(29,43,68,0.05)]">
            <div className="mb-[16px] flex items-center gap-[8px]">
              <span className="text-[#62748E]">
                <WalletIcon size={18} />
              </span>
              <h2 className="text-[14px] font-bold leading-[20px] text-[#314158]">이번 달 확정 지출</h2>
            </div>

            <div className="flex flex-col gap-[16px]">
              {expenses.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-[12px]">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-normal leading-[20px] text-[#314158]">{item.title}</p>
                    <p className="mt-[2px] text-[12px] font-normal leading-[16px] text-[#90A1B9]">
                      {formatShortDate(item.date)}
                    </p>
                  </div>
                  <p className="shrink-0 text-[14px] font-bold leading-[20px] text-[#FB2C36]">{formatWon(-item.amount)}</p>
                </div>
              ))}
            </div>

            <div className="mt-[16px] flex items-center justify-between border-t border-hairline pt-[16px]">
              <p className="text-[14px] font-bold leading-[20px] text-[#45556C]">합계</p>
              <p className="text-[14px] font-bold leading-[20px] text-[#FB2C36]">{formatWon(-total)}</p>
            </div>
          </section>
        </AsyncBoundary>

        {/* AI 안내 박스 (자리표시 - 추후 문구 확정 예정) */}
        <section className="flex items-start gap-[8px] rounded-[12px] border-[0.791px] border-[#C9E4FF] bg-[#F1F8FF] p-[12px]">
          <span className="text-[#6BB5FF]">
            <WarningIcon size={13} />
          </span>
          <p className="text-[12px] text-[#6BB5FF]">← 아이콘 바꿔야되고... AI 안내? 부분입니다</p>
        </section>
      </div>
    </div>
  )
}

export default Accounts
