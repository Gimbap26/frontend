import { useState } from 'react'
import AssetHeader from '../../components/AssetHeader.jsx'
import AsyncBoundary from '../../components/AsyncBoundary.jsx'
import { ExpenseArrowUp, IncomeArrowDown, TransferIcon } from '../../assets/icons/index.jsx'
import { useTransactions } from '../../hooks/useTransactions.js'
import { formatSignedWon, formatWon, formatDotDate } from '../../utils/format.js'

/*
 * 자산 - 거래 내역 화면. (피그마 시안 기준)
 * 자산 화면과 같은 총자산+탭 헤더를 공유한다.
 * 구조: 총자산+탭 헤더 → 하나의 흰 카드에 거래를 구분선으로 나열
 * 각 항목: 원형 아이콘(지출 ↗ / 수입 ↙ / 이체 ⇄) + 제목 + "MM.DD · 카테고리" + 우측 금액
 *
 * 계좌 간 이체는 자산이 줄어드는 게 아니라 옮겨지는 것이라,
 * 지출처럼 마이너스로 보이지 않게 부호 없이 표시한다.
 *
 * 한 달 거래가 수백 건이 될 수 있어서 목록을 두 가지로 방어한다.
 *  1) 한 번에 STEP 건씩만 DOM 에 올리고 나머지는 "더 보기"로 이어 붙인다.
 *     (STEP 보다 적으면 버튼이 아예 보이지 않아 평소 화면은 그대로다)
 *  2) 각 행에 content-visibility 를 줘서 화면 밖 항목은 브라우저가 렌더를 건너뛴다.
 */

// 한 번에 보여줄 건수
const STEP = 50

// 거래 유형별 아이콘 원 색과 금액 색
const TYPE_STYLE = {
  income: { circle: 'bg-[#ECFDF5] text-[#00BC7D]', amount: 'text-[#009966]' },
  transfer: { circle: 'bg-[#EFF6FF] text-[#155DFC]', amount: 'text-[#62748E]' },
  expense: { circle: 'bg-[#F8FAFC] text-[#90A1B9]', amount: 'text-[#45556C]' },
}

function TypeIcon({ type }) {
  if (type === 'income') return <IncomeArrowDown size={16} />
  if (type === 'transfer') return <TransferIcon size={16} />
  return <ExpenseArrowUp size={16} />
}

function Transactions() {
  const { transactions, month, loading, error } = useTransactions()
  const [visibleCount, setVisibleCount] = useState(STEP)

  // "2026-10" -> "10월"
  const monthLabel = month ? `${Number(month.split('-')[1])}월` : ''

  const visible = transactions.slice(0, visibleCount)
  const restCount = transactions.length - visible.length

  return (
    <div className="flex flex-col">
      <AssetHeader />

      <div className="px-[16px] pt-[16px]">
        {/* 어느 달 내역인지 밝혀 준다. (조회 기준월) */}
        <h2 className="mb-[10px] px-[4px] text-[13px] font-bold leading-[18px] text-[#314158]">
          {monthLabel} 거래내역
        </h2>

        <AsyncBoundary loading={loading} error={error}>
          {transactions.length === 0 ? (
            <p className="py-[40px] text-center text-[13px] text-muted">거래 내역이 없어요</p>
          ) : (
            <section className="rounded-[18px] bg-surface px-[20px] shadow-[0_2px_12px_rgba(29,43,68,0.05)]">
              {visible.map((tx, index) => {
                const style = TYPE_STYLE[tx.type] ?? TYPE_STYLE.expense
                return (
                  <div
                    key={tx.id}
                    // 화면 밖 항목은 렌더를 건너뛴다. (스크롤 높이는 아래 값으로 추정)
                    className={`flex items-center justify-between gap-[12px] py-[16px] [contain-intrinsic-size:auto_70px] [content-visibility:auto] ${
                      index !== visible.length - 1 ? 'border-b border-hairline' : ''
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-[12px]">
                      <div
                        className={`flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full ${style.circle}`}
                      >
                        <TypeIcon type={tx.type} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-bold leading-[20px] text-[#1D293D]">{tx.title}</p>
                        <p className="mt-[2px] truncate text-[12px] font-normal leading-[16px] text-[#90A1B9]">
                          {/* 카테고리가 없으면 가운뎃점만 남지 않게 날짜만 보여준다. */}
                          {tx.category ? `${formatDotDate(tx.date)} · ${tx.category}` : formatDotDate(tx.date)}
                        </p>
                      </div>
                    </div>
                    <p className={`shrink-0 text-[14px] font-bold leading-[20px] ${style.amount}`}>
                      {/* 이체는 자산 증감이 아니라 이동이라 부호를 붙이지 않는다. */}
                      {tx.type === 'transfer' ? formatWon(tx.amount) : formatSignedWon(tx.amount, tx.type)}
                    </p>
                  </div>
                )
              })}
            </section>
          )}

          {/* 남은 내역이 있을 때만 보인다. (한 달 거래가 적으면 나타나지 않는다) */}
          {restCount > 0 && (
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + STEP)}
              className="mt-[12px] w-full rounded-[14px] border-[0.791px] border-[#E2E8F0] bg-surface py-[12px] text-[13px] font-bold leading-[18px] text-[#155DFC] transition-colors hover:bg-canvas"
            >
              {restCount.toLocaleString('ko-KR')}건 더 보기
            </button>
          )}
        </AsyncBoundary>
      </div>
    </div>
  )
}

export default Transactions
