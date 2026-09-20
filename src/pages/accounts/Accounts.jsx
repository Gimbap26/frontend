import AssetHeader from '../../components/AssetHeader.jsx'
import AsyncBoundary from '../../components/AsyncBoundary.jsx'
import { AssetsIcon, WarningIcon } from '../../assets/icons/index.jsx'
import { WalletIcon } from './icons.jsx'
import { useAccounts, useRiskSummary, useUpcomingExpenses } from '../../hooks/useAssets.js'
import { formatShortDate, formatWon } from '../../utils/format.js'

const fixedExpenseTitle = '\uC774\uBC88 \uB2EC \uD655\uC815 \uC9C0\uCD9C'
const totalLabel = '\uD569\uACC4'
const riskSummaryLoadingText = '\uBD84\uC11D \uB0B4\uC6A9\uC744 \uBD88\uB7EC\uC624\uB294 \uC911...'

function Accounts() {
  const { accounts, loading: accountsLoading, error: accountsError } = useAccounts()
  const { expenses, total, loading: expensesLoading, error: expensesError } = useUpcomingExpenses()
  const { riskSummary, loading: riskSummaryLoading } = useRiskSummary()

  return (
    <div className="flex flex-col">
      <AssetHeader />

      <div className="flex flex-col gap-[16px] px-[16px] pt-[16px] pb-[24px]">
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
                    <p className="truncate text-[15px] font-bold leading-[20px] text-[#1D293D]">{account.bank}</p>
                    <p className="truncate text-[12px] font-normal leading-[16px] text-[#90A1B9]">{account.purpose}</p>
                  </div>
                </div>
                <p className="shrink-0 text-[16px] font-bold leading-[24px] text-[#1D293D]">
                  {formatWon(account.balance)}
                </p>
              </div>
            ))}
          </section>
        </AsyncBoundary>

        <AsyncBoundary loading={expensesLoading} error={expensesError}>
          <section className="rounded-[18px] bg-surface px-[20px] py-[18px] shadow-[0_2px_12px_rgba(29,43,68,0.05)]">
            <div className="mb-[16px] flex items-center gap-[8px]">
              <span className="text-[#62748E]">
                <WalletIcon size={20} />
              </span>
              <h2 className="text-[15px] font-bold leading-[20px] text-[#314158]">{fixedExpenseTitle}</h2>
            </div>

            <div className="flex flex-col gap-[16px]">
              {expenses.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-[12px]">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-normal leading-[20px] text-[#314158]">{item.title}</p>
                    <p className="mt-[2px] text-[13px] font-normal leading-[16px] text-[#90A1B9]">
                      {formatShortDate(item.date)}
                    </p>
                  </div>
                  <p className="shrink-0 text-[15px] font-bold leading-[20px] text-[#FB2C36]">
                    {formatWon(-item.amount)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-[16px] flex items-center justify-between border-t border-hairline pt-[16px]">
              <p className="text-[15px] font-bold leading-[20px] text-[#45556C]">{totalLabel}</p>
              <p className="text-[15px] font-bold leading-[20px] text-[#FB2C36]">{formatWon(-total)}</p>
            </div>
          </section>
        </AsyncBoundary>

        <section className="flex items-center gap-[10px] rounded-[12px] border-[0.791px] border-[#C9E4FF] bg-[#F1F8FF] p-[12px]">
          <span className="flex h-[16px] w-[16px] shrink-0 items-center justify-center text-[#6BB5FF]">
            <WarningIcon size={16} />
          </span>
          <p className="text-[13px] leading-[19.5px] text-[#6BB5FF]">
            {riskSummaryLoading ? riskSummaryLoadingText : riskSummary}
          </p>
        </section>
      </div>
    </div>
  )
}

export default Accounts
