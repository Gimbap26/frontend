import { ScheduleIcon } from '../../assets/icons/index.jsx'
import { PreviousMonthButton, NextMonthButton } from './icons.jsx'
import { WEATHER, WEATHER_LEGEND, WEEKDAYS } from './scheduleModel.js'
import { formatManwon, formatSignedManwon, formatSlashDate } from '../../utils/format.js'

/*
 * 달력 카드.
 * 구조: 카드 헤더(연월 + 급여 D-day + 월 이동) → 요일 → 날짜 격자 → 날씨 범례 → 이번 달 주요 지점
 *
 * 날짜 격자는 일요일 시작이고, 각 칸은 "날짜 + 이벤트 점 + 자금 날씨 이모지"로 구성된다.
 * 칸 배경 우선순위: 선택 > 오늘 > 최저 잔액일 > 지출 집중일 > 기본
 */

// 날짜 칸 배경/글자 스타일. 위에서부터 우선순위가 높다.
function cellClass({ inMonth, isSelected, isToday, weather, weekday }) {
  if (!inMonth) return 'text-[#CAD5E2] hover:bg-canvas'
  if (isSelected) return 'bg-[#DBEAFE] ring-2 ring-[#155DFC] font-extrabold text-[#1447E6]'
  if (isToday) return 'bg-[#E0F2FE] font-bold text-[#0284C7]'
  if (weather === 'STORM') return 'bg-[#FFFBEB] font-bold text-[#B45309]'
  if (weather === 'RAINY') return 'bg-[#FEF2F2] font-bold text-[#E7000B]'
  if (weather === 'PAYDAY') return 'bg-[#F0FDF4] font-bold text-[#16A34A] hover:bg-[#DCFCE7]'
  if (weather === 'SUNNY') return 'font-medium text-[#314158] hover:bg-canvas'
  // CLOUDY 및 기본
  if (weekday === 0) return 'font-medium text-[#FB2C36] hover:bg-canvas'
  if (weekday === 6) return 'font-medium text-[#155DFC] hover:bg-canvas'
  return 'font-medium text-[#314158] hover:bg-canvas'
}

// 주요 지점 미니카드의 톤별 색
const MILESTONE_TONE = {
  expense: { box: 'bg-[#FEF2F2] border-[#FFE2E2]', date: 'text-[#E7000B]', value: 'text-[#FB2C36]', ring: 'ring-[#FB2C36]' },
  warning: { box: 'bg-[#FFFBEB] border-[#FDE68A]', date: 'text-[#B45309]', value: 'text-[#B45309]', ring: 'ring-[#F59E0B]' },
  income:  { box: 'bg-[#F0FDF4] border-[#BBF7D0]', date: 'text-[#16A34A]', value: 'text-[#16A34A]', ring: 'ring-[#22C55E]' },
}

// "2026-09-05" -> "9/5 (토)"
function dateWithWeekday(iso) {
  const weekday = WEEKDAYS[new Date(`${iso}T00:00:00`).getDay()]
  return `${formatSlashDate(iso)} (${weekday})`
}

function CalendarCard({ view, days, selected, today, milestones, paydayInDays, summary, onSelect, onMoveMonth }) {
  return (
    <section className="rounded-[18px] bg-surface px-[16px] pt-[18px] pb-[16px] shadow-[0_2px_12px_rgba(29,43,68,0.05)]">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-[8px]">
        <div className="flex min-w-0 items-center gap-[10px]">
          <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-[#EFF6FF] text-[#155DFC]">
            <ScheduleIcon size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-[6px]">
              <h1 className="text-[17px] font-bold leading-[24px] text-[#0F172B]">
                {view.year}년 {view.month + 1}월
              </h1>
              {/* 급여일까지 남은 일수. 이미 지난 달을 보고 있으면 표시하지 않는다. */}
              {paydayInDays != null && paydayInDays >= 0 && (
                <span className="shrink-0 rounded-full border-[0.791px] border-[#DBEAFE] bg-[#EFF6FF] px-[7px] py-[1px] text-[11px] font-bold leading-[16px] text-[#1447E6]">
                  {paydayInDays === 0 ? 'D-day 급여' : `D-${paydayInDays} 급여`}
                </span>
              )}
            </div>
            <p className="truncate text-[11px] font-medium leading-[16px] text-[#90A1B9]">{summary}</p>
          </div>
        </div>

        {/* 월 이동 */}
        <div className="flex shrink-0 items-center gap-[2px] rounded-full bg-[#F1F5F9] px-[4px] py-[3px] text-[#62748E]">
          <button
            type="button"
            onClick={() => onMoveMonth(-1)}
            aria-label="이전 달"
            className="flex h-[22px] w-[22px] items-center justify-center rounded-full transition-colors hover:text-[#0F172B]"
          >
            <PreviousMonthButton size={16} />
          </button>
          <span className="text-[11px] font-bold leading-[16px] text-[#314158]">
            {String(view.month + 1).padStart(2, '0')}월
          </span>
          <button
            type="button"
            onClick={() => onMoveMonth(1)}
            aria-label="다음 달"
            className="flex h-[22px] w-[22px] items-center justify-center rounded-full transition-colors hover:text-[#0F172B]"
          >
            <NextMonthButton size={16} />
          </button>
        </div>
      </div>

      {/* 요일 (일요일 시작) */}
      <div className="mt-[14px] grid grid-cols-7 border-t border-hairline pt-[12px] text-center text-[11px] font-semibold leading-[16px]">
        {WEEKDAYS.map((weekday, index) => (
          <span
            key={weekday}
            className={index === 0 ? 'text-[#FB2C36]' : index === 6 ? 'text-[#155DFC]' : 'text-[#90A1B9]'}
          >
            {weekday}
          </span>
        ))}
      </div>

      {/* 날짜 격자 */}
      <div className="mt-[4px] grid grid-cols-7 gap-x-[2px] gap-y-[2px]">
        {days.map((cell) => {
          const isSelected = cell.inMonth && cell.iso === selected
          const isToday = cell.inMonth && cell.iso === today
          const weatherInfo = cell.weather ? WEATHER[cell.weather] : null

          return (
            <button
              key={cell.iso}
              type="button"
              // 이전/다음 달 칸을 눌러도 그 달로 이동하며 선택된다.
              onClick={() => onSelect(cell.iso)}
              aria-current={isToday ? 'date' : undefined}
              aria-pressed={isSelected}
              className={`flex h-[46px] flex-col items-center justify-center rounded-[10px] transition-colors ${cellClass({
                inMonth: cell.inMonth,
                isSelected,
                isToday,
                weather: cell.weather,
                weekday: cell.weekday,
              })}`}
            >
              <span className="flex items-center gap-[3px]">
                <span className="text-[13px] leading-[16px]">{cell.day}</span>
                {/* 예정 이벤트 점: 수입(초록) / 지출(빨강) */}
                {cell.hasIncome && <span className="h-[4px] w-[4px] rounded-full bg-[#00BC7D]" />}
                {cell.hasExpense && <span className="h-[4px] w-[4px] rounded-full bg-[#FF6467]" />}
              </span>
              {weatherInfo && (
                <span className="mt-[2px] text-[11px] leading-[14px]" aria-label={weatherInfo.label}>
                  {weatherInfo.emoji}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* 잔액 여유도 범례. 날씨 탭의 4단계(맑음/구름/비/폭풍)와 동일하게 표시한다. */}
      <div className="mt-[14px] flex flex-wrap items-center gap-[6px] border-t border-hairline pt-[12px]">
        {WEATHER_LEGEND.map((code) => (
          <span
            key={code}
            className="flex items-center gap-[4px] whitespace-nowrap rounded-full border-[0.791px] border-[#E2E8F0] bg-[#F8FAFC] px-[8px] py-[3px] text-[11px] font-medium leading-[16px] text-[#62748E]"
          >
            {WEATHER[code].emoji} {WEATHER[code].label}
          </span>
        ))}
      </div>

      {/* 이번 달 주요 지점. 누르면 그 날짜가 선택된다. */}
      {milestones.length > 0 && (
        <div className="mt-[12px] grid grid-cols-3 gap-[6px]">
          {milestones.map((item) => {
            const tone = MILESTONE_TONE[item.tone]
            const isSelected = item.date === selected
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelect(item.date)}
                aria-pressed={isSelected}
                className={`rounded-[12px] border-[0.791px] px-[8px] py-[9px] text-center transition-shadow ${tone.box} ${
                  isSelected ? `ring-1 ${tone.ring}` : 'hover:shadow-[0_2px_8px_rgba(29,43,68,0.08)]'
                }`}
              >
                <p className={`text-[11px] font-bold leading-[14px] ${tone.date}`}>{dateWithWeekday(item.date)}</p>
                <p className="mt-[3px] text-[11px] font-medium leading-[15px] text-[#314158]">{item.title}</p>
                <p className={`mt-[3px] text-[11px] font-bold leading-[14px] ${tone.value}`}>
                  {item.kind === 'balance'
                    ? `잔고 ${formatManwon(item.amount)}`
                    : formatSignedManwon(item.amount, item.kind)}
                </p>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default CalendarCard
