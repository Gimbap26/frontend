import { useMemo, useState } from 'react'
import AsyncBoundary from '../../components/AsyncBoundary.jsx'
import { ExpenseArrowUp, IncomeArrowDown, WarningIcon } from '../../assets/icons/index.jsx'
import { PreviousMonthButton, NextMonthButton } from './icons.jsx'
import { useFinancialEvents, useScheduleAlerts } from '../../hooks/useSchedule.js'
import { formatSignedWon } from '../../utils/format.js'

/*
 * 일정 화면. (피그마 시안 기준)
 * 월 단위 달력에 금융 이벤트가 있는 날을 점으로 표시한다.
 *  - 지출: 빨간 점, 수입: 초록 점 (한 날짜에 둘 다 있으면 점 2개)
 * 날짜를 선택하면 그 날의 일정과 금융 주의 안내를 아래에 보여준다.
 * 요일은 월요일부터 시작한다.
 */

// 월요일 시작 요일 라벨
const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일']
const TODAY = '2026-09-01'

// "2026-09-01" -> { year, month(0기준) }
function parseMonth(iso) {
  const [year, month] = iso.split('-').map(Number)
  return { year, month: month - 1 }
}

// year, month(0기준), day -> "2026-09-25"
function toIso(year, month, day) {
  const mm = String(month + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

// getDay()(일=0)를 월요일 시작 인덱스(월=0)로 변환
function toMondayIndex(weekday) {
  return (weekday + 6) % 7
}

// 금융 이벤트를 날짜별로 묶는다.
function groupEventsByDate(items) {
  const map = new Map()
  for (const item of items) {
    if (!map.has(item.date)) map.set(item.date, [])
    map.get(item.date).push(item)
  }
  return map
}

function Schedule() {
  const [view, setView] = useState(() => parseMonth(TODAY)) // 현재 보고 있는 월
  const [selected, setSelected] = useState('2026-09-25') // 선택된 날짜 (시안 기본값)

  const { events, loading, error } = useFinancialEvents()
  const { alerts } = useScheduleAlerts()

  const eventsByDate = useMemo(() => groupEventsByDate(events), [events])

  // 달력 그리드 (월요일 시작 기준 앞쪽 빈칸 + 날짜들)
  const cells = useMemo(() => {
    const firstWeekday = toMondayIndex(new Date(view.year, view.month, 1).getDay())
    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()
    const result = Array.from({ length: firstWeekday }, () => null)
    for (let day = 1; day <= daysInMonth; day += 1) result.push(day)
    return result
  }, [view])

  const selectedItems = eventsByDate.get(selected) ?? []
  const selectedAlert = alerts[selected]

  function moveMonth(delta) {
    setView((prev) => {
      const next = new Date(prev.year, prev.month + delta, 1)
      return { year: next.getFullYear(), month: next.getMonth() }
    })
  }

  // 해당 날짜에 어떤 타입의 이벤트가 있는지 (점 표시용)
  function eventDots(iso) {
    const items = eventsByDate.get(iso) ?? []
    return {
      hasExpense: items.some((item) => item.type === 'expense'),
      hasIncome: items.some((item) => item.type === 'income'),
    }
  }

  return (
    <div className="-mb-[88px] flex min-h-[calc(100svh-88px)] flex-col bg-[#F2F4F6] pb-[88px]">
      {/* 달력 (풀블리드 흰 배경) */}
      <section className="bg-surface px-[20px] pt-[48px] pb-[16px]">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => moveMonth(-1)}
            className="flex h-[32px] w-[32px] items-center justify-center rounded-[10px] text-[#90A1B9] hover:bg-canvas"
            aria-label="이전 달"
          >
            <PreviousMonthButton size={20} />
          </button>
          <p className="text-[16px] font-bold leading-[24px] tracking-[-0.7px] text-[#0F172B]">
            {view.year}년 {view.month + 1}월
          </p>
          <button
            type="button"
            onClick={() => moveMonth(1)}
            className="flex h-[32px] w-[32px] items-center justify-center rounded-[10px] text-[#90A1B9] hover:bg-canvas"
            aria-label="다음 달"
          >
            <NextMonthButton size={20} />
          </button>
        </div>

        {/* 요일 헤더 (월요일 시작) */}
        <div className="mt-[16px] grid grid-cols-7 gap-[2px]">
          {WEEKDAYS.map((weekday) => (
            <div key={weekday} className="text-center text-[12px] font-medium leading-[16px] tracking-normal text-[#90A1B9]">
              {weekday}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="mt-[8px] grid grid-cols-7 gap-y-[6px]">
          {cells.map((day, index) => {
            if (day === null) return <div key={`empty-${index}`} />
            const iso = toIso(view.year, view.month, day)
            const { hasExpense, hasIncome } = eventDots(iso)
            const isSelected = iso === selected
            const isToday = iso === TODAY
            return (
              <div key={iso} className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setSelected(iso)}
                  className={`relative flex h-[44px] w-[44px] flex-col items-center justify-center rounded-[8px] text-[14px] leading-[14px] transition-colors ${
                    isSelected
                      ? 'bg-[#155DFC] font-bold text-white'
                      : isToday
                        ? 'bg-[#EFF6FF] font-bold text-[#155DFC]'
                        : 'font-normal text-[#314158] hover:bg-canvas'
                  }`}
                >
                  <span>{day}</span>
                  {(hasExpense || hasIncome) && (
                    <span className="absolute bottom-[6px] flex items-center gap-[4px]">
                      {hasIncome && (
                        <span className={`h-[6px] w-[6px] rounded-full ${isSelected ? 'bg-[#5EE9B5]' : 'bg-[#00BC7D]'}`} />
                      )}
                      {hasExpense && (
                        <span className={`h-[6px] w-[6px] rounded-full ${isSelected ? 'bg-[#FFA2A2]' : 'bg-[#FF6467]'}`} />
                      )}
                    </span>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* 선택한 날짜의 일정 + 주의 안내 */}
      <div className="flex flex-col gap-[16px] px-[16px] pt-[20px]">
        <AsyncBoundary loading={loading} error={error}>
          <section>
            <h2 className="mb-[12px] text-[14px] font-bold leading-[20px] tracking-[-0.7px] text-[#314158]">
              {view.month + 1}월 {Number(selected.split('-')[2])}일 일정
            </h2>

            {selectedItems.length === 0 ? (
              <div className="rounded-[18px] bg-surface p-[24px] text-center text-[13px] text-muted shadow-[0_2px_12px_rgba(29,43,68,0.05)]">
                이 날은 예정된 일정이 없어요
              </div>
            ) : (
              <div className="rounded-[18px] bg-surface px-[20px] shadow-[0_2px_12px_rgba(29,43,68,0.05)]">
                {selectedItems.map((item, index) => {
                  const isIncome = item.type === 'income'
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between py-[16px] ${
                        index !== selectedItems.length - 1 ? 'border-b border-hairline' : ''
                      }`}
                    >
                      <div className="flex items-center gap-[12px]">
                        <div
                          className={`flex h-[36px] w-[36px] items-center justify-center rounded-full ${
                            isIncome ? 'bg-[#ECFDF5] text-[#00BC7D]' : 'bg-[#FEF2F2] text-[#FB2C36]'
                          }`}
                        >
                          {isIncome ? <IncomeArrowDown size={16} /> : <ExpenseArrowUp size={16} />}
                        </div>
                        <p className="text-[14px] font-medium leading-[20px] tracking-[-0.7px] text-[#1D293D]">{item.title}</p>
                      </div>
                      <p
                        className={`text-[14px] font-bold leading-[20px] tracking-[-0.7px] ${
                          isIncome ? 'text-[#00BC7D]' : 'text-[#FB2C36]'
                        }`}
                      >
                        {formatSignedWon(item.amount, item.type)}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </AsyncBoundary>

        {/* 금융 주의 안내 */}
        {selectedAlert && (
          <section className="flex items-start gap-[10px] rounded-[12px] border-[0.791px] border-[#FFCECC] bg-[#FFECEB] px-[16px] py-[12px]">
            <span className="mt-[1px] text-[#FF5750]">
              <WarningIcon size={14} />
            </span>
            <div>
              <p className="text-[12px] font-bold leading-[16px] tracking-[-0.7px] text-[#FF5750]">{selectedAlert.title}</p>
              {selectedAlert.lines.map((line) => (
                <p key={line} className="mt-[2px] text-[12px] font-normal leading-[19.5px] tracking-[-0.7px] text-[#FF5750]">
                  {line}
                </p>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default Schedule
