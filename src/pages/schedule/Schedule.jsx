import { useMemo, useState } from 'react'
import AsyncBoundary from '../../components/AsyncBoundary.jsx'
import CalendarCard from './CalendarCard.jsx'
import DayDetailCard from './DayDetailCard.jsx'
import QuickPrompts from './QuickPrompts.jsx'
import WeatherReportCard from './WeatherReportCard.jsx'
import SpendingSimulator from './SpendingSimulator.jsx'
import {
  buildCalendarDays,
  buildMilestones,
  daysBetween,
  findNextPayday,
  groupEventsByDate,
  parseMonth,
  toIso,
  weatherForDay,
  WEATHER_SUMMARY,
} from './scheduleModel.js'
import {
  useFinancialEvents,
  useMonthlyForecast,
  useScheduleAlerts,
  useSpendingOptimizations,
  useSpendingPlan,
} from '../../hooks/useSchedule.js'
import { useAgentSuggestions } from '../../hooks/useAgent.js'
import { useToday } from '../../hooks/useToday.js'
import { formatShortDate } from '../../utils/format.js'

/*
 * 일정 화면. (자금 기상도 시안 기준)
 *
 * 별도 화면 제목(헤더) 없이 달력 카드부터 시작한다.
 *
 * 구성
 *  1) 달력 카드 - 날짜별 자금 날씨 이모지 + 예정 이벤트 점 + 이번 달 주요 지점
 *  2) 선택한 날짜 상세 - 그날의 자금 기상, 일정, 주의 안내
 *  3) AI 빠른 질문 - 누르면 AI 화면으로 질문을 넘긴다
 *  4) 기상청 AI 리포트 - 급여일까지 하루 권장 자유 지출 (갱신 가능)
 *  5) 지출 최적화 시뮬레이터 - 절감 옵션을 켜면 리포트 금액과 날씨가 함께 바뀐다
 *
 * 날짜 기준
 *  - 오늘은 useToday() 로 받아 자정이 지나면 자동으로 넘어간다.
 *  - 사용자가 직접 고르지 않은 동안 선택 날짜와 표시 월은 오늘을 따라간다.
 *  - 달력에서 월을 넘기면 그 달의 이벤트/예측을 다시 조회한다.
 */

// { year, month(0기준) } -> "2026-09" (조회용 기준월 문자열)
function toMonthKey({ year, month }) {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

function Schedule() {
  const today = useToday()

  const [pickedDate, setPickedDate] = useState(null)
  const [pickedMonth, setPickedMonth] = useState(null)
  // 시뮬레이터에서 켠 절감 옵션. 리포트 금액도 이 값을 함께 반영한다.
  const [pickedOptions, setPickedOptions] = useState([])

  const selected = pickedDate ?? today
  const view = pickedMonth ?? parseMonth(today)
  const viewMonth = toMonthKey(view)

  // 달력에 보이는 달의 데이터를 조회한다. (월을 넘기면 그 달로 다시 조회)
  const { events, loading: eventsLoading, error: eventsError } = useFinancialEvents(viewMonth)
  const { forecast, balanceByDate, loading: forecastLoading, error: forecastError } = useMonthlyForecast(viewMonth)
  const { alerts } = useScheduleAlerts(viewMonth)
  // 리포트/시뮬레이터는 보고 있는 달과 무관하게 "현재 기준" 계획을 쓴다.
  const { plan, spendablePool, loading: planLoading, error: planError, refetch: refetchPlan } = useSpendingPlan()
  const { options } = useSpendingOptimizations()
  const { suggestions } = useAgentSuggestions()

  const loading = eventsLoading || forecastLoading || planLoading
  const error = eventsError ?? forecastError ?? planError

  /*
   * 첫 진입에만 전체 로딩 화면을 보여준다.
   * 계획 데이터는 조회될 때마다 갱신 시각이 채워지므로, 그 값이 아직 없으면 첫 로딩으로 본다.
   * 덕분에 월을 넘기거나 리포트를 갱신할 때 화면이 통째로 사라지지 않고 조용히 바뀐다.
   */
  const firstLoad = loading && !plan.updatedAt

  const eventsByDate = useMemo(() => groupEventsByDate(events), [events])

  const days = useMemo(
    () =>
      buildCalendarDays({
        year: view.year,
        month: view.month,
        eventsByDate,
        balanceByDate,
        minimumBalanceDate: forecast.minimumBalanceDate,
      }),
    [view.year, view.month, eventsByDate, balanceByDate, forecast.minimumBalanceDate],
  )

  const milestones = useMemo(() => buildMilestones({ events, forecast }), [events, forecast])

  /*
   * 급여일까지 남은 일수. D-day 배지와 하루 권장 지출이 같은 값을 쓴다.
   * 목 모드에서는 시안 기준(23일)이 계획 데이터에 들어 있어 그 값을 그대로 쓰고,
   * 백엔드가 붙으면 daysUntilPayday 가 비어 있으므로 (급여일 - 오늘)로 계산한다.
   */
  const payday = useMemo(() => findNextPayday(events, today), [events, today])
  const daysLeft = plan.daysUntilPayday ?? (payday ? daysBetween(today, payday) : 0)

  // 절감 옵션을 켠 만큼 하루 권장 지출이 올라간다. (리포트와 시뮬레이터가 같은 값을 본다)
  const savings = options
    .filter((option) => pickedOptions.includes(option.id))
    .reduce((sum, option) => sum + option.saving, 0)
  const baseDailyBudget = Math.round(spendablePool / Math.max(daysLeft, 1))
  const dailyBudget = Math.round((spendablePool + savings) / Math.max(daysLeft, 1))

  // 선택한 날짜 정보
  const selectedItems = eventsByDate.get(selected) ?? []
  const selectedBalance = balanceByDate.get(selected)
  const selectedWeather = weatherForDay({
    items: selectedItems,
    balance: selectedBalance,
    isMinimumDate: selected === forecast.minimumBalanceDate,
  })

  // 카드 헤더 부제: 이번 달 종합 판정 + 최저 수위 날짜
  const summary = forecast.weather
    ? [
        `자금 기상도 • ${WEATHER_SUMMARY[forecast.weather]}`,
        forecast.minimumBalanceDate ? `최저 수위 ${formatShortDate(forecast.minimumBalanceDate)}` : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : '이 달의 예측 데이터가 아직 없어요'

  // 날짜를 고르면 그 날짜가 속한 달로 함께 이동한다. (이전/다음 달 칸, 주요 지점 카드 클릭)
  function selectDate(iso) {
    const target = parseMonth(iso)
    const todayMonth = parseMonth(today)
    const isTodayMonth = target.year === todayMonth.year && target.month === todayMonth.month
    setPickedMonth(isTodayMonth ? null : target)
    // 오늘을 고른 경우엔 "오늘 따라가기" 상태로 되돌린다.
    setPickedDate(iso === today ? null : iso)
  }

  // 월 이동. 선택 날짜도 같은 달로 옮겨서 상세 카드가 달력과 어긋나지 않게 한다.
  function moveMonth(delta) {
    const base = pickedMonth ?? parseMonth(today)
    const next = new Date(base.year, base.month + delta, 1)
    const target = { year: next.getFullYear(), month: next.getMonth() }
    const todayMonth = parseMonth(today)

    if (target.year === todayMonth.year && target.month === todayMonth.month) {
      // 오늘이 있는 달로 돌아오면 오늘을 다시 선택한다.
      setPickedMonth(null)
      setPickedDate(null)
      return
    }

    // 같은 "일"을 유지하되, 그 달에 없는 날짜(31일 등)면 말일로 맞춘다.
    const lastDay = new Date(target.year, target.month + 1, 0).getDate()
    const day = Math.min(Number(selected.split('-')[2]), lastDay)
    setPickedMonth(target)
    setPickedDate(toIso(target.year, target.month, day))
  }

  function toggleOption(id) {
    setPickedOptions((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  return (
    <div className="flex min-h-full flex-col gap-[12px] bg-[#F2F4F6] px-[16px] pt-[24px] pb-[20px]">
      {/* 첫 진입만 로딩/에러 화면으로 대체하고, 이후 재조회는 조용히 반영한다. */}
      <AsyncBoundary loading={firstLoad} error={error}>
        <>
          <CalendarCard
            view={view}
            days={days}
            selected={selected}
            today={today}
            milestones={milestones}
            paydayInDays={payday ? daysLeft : null}
            summary={summary}
            onSelect={selectDate}
            onMoveMonth={moveMonth}
          />

          <DayDetailCard
            selected={selected}
            items={selectedItems}
            alert={alerts[selected]}
            weather={selectedWeather}
            balance={selectedBalance}
          />

          <QuickPrompts prompts={suggestions} />

          <WeatherReportCard
            plan={plan}
            dailyBudget={dailyBudget}
            baseDailyBudget={baseDailyBudget}
            daysLeft={daysLeft}
            refreshing={planLoading}
            onRefresh={refetchPlan}
          />

          {options.length > 0 && (
            <SpendingSimulator
              options={options}
              picked={pickedOptions}
              onToggle={toggleOption}
              dailyBudget={dailyBudget}
              baseDailyBudget={baseDailyBudget}
              baseWeather={forecast.weather}
            />
          )}
        </>
      </AsyncBoundary>
    </div>
  )
}

export default Schedule
