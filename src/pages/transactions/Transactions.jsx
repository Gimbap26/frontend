import AssetHeader from '../../components/AssetHeader.jsx'
import AsyncBoundary from '../../components/AsyncBoundary.jsx'
import { ExpenseArrowUp, IncomeArrowDown } from '../../assets/icons/index.jsx'
import { useTransactions } from '../../hooks/useTransactions.js'
import { formatSignedWon, formatDotDate } from '../../utils/format.js'

/*
 * 자산 - 거래 내역 화면. (피그마 시안 기준)
 * 자산 화면과 같은 총자산+탭 헤더를 공유한다.
 * 구조: 총자산+탭 헤더 → 하나의 흰 카드에 거래를 구분선으로 나열
 * 각 항목: 원형 아이콘(지출 ↗ / 수입 ↙) + 제목 + "MM.DD · 카테고리" + 우측 금액
 */

function Transactions() {
  const { transactions, loading, error } = useTransactions()

  return (
    <div className="flex flex-col">
      <AssetHeader />

      <div className="px-[16px] pt-[16px]">
        <AsyncBoundary loading={loading} error={error}>
          {transactions.length === 0 ? (
            <p className="py-[40px] text-center text-[13px] text-muted">거래 내역이 없어요</p>
          ) : (
            <section className="rounded-[18px] bg-surface px-[20px] shadow-[0_2px_12px_rgba(29,43,68,0.05)]">
              {transactions.map((tx, index) => {
                const isIncome = tx.type === 'income'
                return (
                  <div
                    key={tx.id}
                    className={`flex items-center justify-between py-[16px] ${
                      index !== transactions.length - 1 ? 'border-b border-hairline' : ''
                    }`}
                  >
                    <div className="flex items-center gap-[12px]">
                      <div
                        className={`flex h-[36px] w-[36px] items-center justify-center rounded-full ${
                          isIncome ? 'bg-[#ECFDF5] text-[#00BC7D]' : 'bg-[#F8FAFC] text-[#90A1B9]'
                        }`}
                      >
                        {isIncome ? <IncomeArrowDown size={16} /> : <ExpenseArrowUp size={16} />}
                      </div>
                      <div>
                        <p className="text-[14px] font-bold leading-[20px] text-[#1D293D]">{tx.title}</p>
                        <p className="mt-[2px] text-[12px] font-normal leading-[16px] text-[#90A1B9]">
                          {formatDotDate(tx.date)} · {tx.category}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-[14px] font-bold leading-[20px] ${
                        isIncome ? 'text-[#009966]' : 'text-[#45556C]'
                      }`}
                    >
                      {formatSignedWon(tx.amount, tx.type)}
                    </p>
                  </div>
                )
              })}
            </section>
          )}
        </AsyncBoundary>
      </div>
    </div>
  )
}

export default Transactions
