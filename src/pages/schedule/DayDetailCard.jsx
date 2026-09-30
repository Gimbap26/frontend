import { ExpenseArrowUp, IncomeArrowDown, WarningIcon } from '../../assets/icons/index.jsx'
import { WEATHER } from './scheduleModel.js'
import { formatShortDate, formatSignedWon, formatWon } from '../../utils/format.js'

/*
 * 선택한 날짜의 상세 카드.
 * 구조: 제목(날짜) → 그날의 자금 기상 한 줄 → 일정 목록 → 주의 안내
 *
 * 일정이 없는 날도 자금 기상과 주의 안내는 그대로 보여준다.
 */
function DayDetailCard({ selected, items, alert, weather, balance }) {
  const weatherInfo = weather ? WEATHER[weather] : null

  return (
    <section className="rounded-[18px] bg-surface px-[16px] py-[18px] shadow-[0_2px_12px_rgba(29,43,68,0.05)]">
      <h2 className="flex min-w-0 items-center gap-[6px] text-[14px] font-bold leading-[20px] text-[#0F172B]">
        <span className="truncate">{formatShortDate(selected)} 일정 및 자금 기상</span>
        <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-[#155DFC]" aria-hidden="true" />
      </h2>

      {/* 그날의 자금 기상 (예측 잔액이 있는 날만) */}
      {weatherInfo && (
        <div className="mt-[12px] flex items-center gap-[8px] rounded-[14px] border-[0.791px] border-hairline bg-[#F8FAFC] px-[14px] py-[10px]">
          <span className="text-[15px] leading-none">{weatherInfo.emoji}</span>
          <p className="text-[12px] font-bold leading-[16px] text-[#314158]">{weatherInfo.label}</p>
          {balance != null && (
            <p className="text-[11px] font-medium leading-[16px] text-[#90A1B9]">예상 잔액 {formatWon(balance)}</p>
          )}
        </div>
      )}

      {/* 일정 목록 */}
      <div className="mt-[10px] flex flex-col gap-[8px]">
        {items.length === 0 ? (
          <p className="rounded-[14px] border-[0.791px] border-hairline bg-[#F8FAFC] py-[18px] text-center text-[12px] font-medium leading-[16px] text-[#90A1B9]">
            이 날은 예정된 일정이 없어요
          </p>
        ) : (
          items.map((item) => {
            const isIncome = item.type === 'income'
            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-[10px] rounded-[14px] border-[0.791px] border-hairline bg-[#F8FAFC] px-[14px] py-[12px]"
              >
                <div className="flex min-w-0 items-center gap-[10px]">
                  <div
                    className={`flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full ${
                      isIncome ? 'bg-[#ECFDF5] text-[#00BC7D]' : 'bg-[#FEF2F2] text-[#FB2C36]'
                    }`}
                  >
                    {isIncome ? <IncomeArrowDown size={15} /> : <ExpenseArrowUp size={15} />}
                  </div>
                  <p className="truncate text-[13px] font-semibold leading-[18px] text-[#1D293D]">{item.title}</p>
                </div>
                <p
                  className={`shrink-0 text-[13px] font-bold leading-[18px] ${
                    isIncome ? 'text-[#00BC7D]' : 'text-[#FB2C36]'
                  }`}
                >
                  {formatSignedWon(item.amount, item.type)}
                </p>
              </div>
            )
          })
        )}
      </div>

      {/* 금융 주의 안내 (해당 날짜에 안내가 있을 때만) */}
      {alert && (
        <div className="mt-[10px] flex items-start gap-[10px] rounded-[14px] border-[0.791px] border-[#FFCECC] bg-[#FFECEB] px-[14px] py-[12px]">
          <span className="mt-[1px] shrink-0 text-[#FF5750]">
            <WarningIcon size={14} />
          </span>
          <div>
            <p className="text-[12px] font-bold leading-[16px] text-[#FF5750]">{alert.title}</p>
            {alert.lines.map((line) => (
              <p key={line} className="mt-[2px] text-[12px] font-normal leading-[18px] text-[#FF5750]">
                {line}
              </p>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default DayDetailCard
