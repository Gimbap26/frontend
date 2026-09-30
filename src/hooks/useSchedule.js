import { useCallback, useMemo } from 'react'
import { useAsync } from './useAsync.js'
import {
  fetchFinancialEvents,
  fetchMonthlyForecast,
  fetchScheduleAlerts,
  fetchSpendingOptimizations,
  fetchSpendingPlan,
} from '../api/schedule.js'

/*
 * 일정(금융 이벤트) 훅.
 * baseMonth("YYYY-MM")를 넘기면 그 달을 조회한다. 달력에서 월을 넘길 때 다시 조회된다.
 */
export function useFinancialEvents(baseMonth) {
  const fetcher = useCallback(() => fetchFinancialEvents(baseMonth), [baseMonth])
  const { data, loading, error } = useAsync(fetcher)
  const events = useMemo(() => data ?? [], [data])
  return { events, loading, error }
}

/*
 * 날짜별 금융 주의 안내 훅.
 * baseMonth("YYYY-MM")를 넘기면 그 달의 안내를 조회한다.
 */
export function useScheduleAlerts(baseMonth) {
  const fetcher = useCallback(() => fetchScheduleAlerts(baseMonth), [baseMonth])
  const { data, loading, error } = useAsync(fetcher)
  const alerts = useMemo(() => data ?? {}, [data])
  return { alerts, loading, error }
}

/*
 * 잔액 예측 훅.
 * baseMonth("YYYY-MM")를 넘기면 그 달을 조회한다.
 * 달력의 자금 날씨 판정에 쓰도록 날짜 -> 잔액 맵(balanceByDate)까지 만들어 준다.
 */
export function useMonthlyForecast(baseMonth) {
  const fetcher = useCallback(() => fetchMonthlyForecast(baseMonth), [baseMonth])
  const { data, loading, error } = useAsync(fetcher)

  const forecast = useMemo(
    () => data ?? { currentBalance: 0, minimumBalanceDate: null, minimumBalance: 0, weather: null, timeline: [] },
    [data],
  )

  const balanceByDate = useMemo(() => {
    const map = new Map()
    for (const day of forecast.timeline) map.set(day.date, day.balance)
    return map
  }, [forecast])

  return { forecast, balanceByDate, loading, error }
}

/*
 * 지출 계획 훅.
 * 가용자금에서 필수 고정비를 뺀 "자유 지출 재원(spendablePool)"까지 계산해 돌려준다.
 * refetch() 로 다시 불러올 수 있다. (리포트 카드의 갱신 버튼)
 */
export function useSpendingPlan() {
  const { data, loading, error, refetch } = useAsync(fetchSpendingPlan)

  const plan = useMemo(
    () =>
      data ?? {
        availableFunds: 0,
        essentialCost: 0,
        essentialLabel: '',
        daysUntilPayday: null,
        riskSummary: '',
        updatedAt: null,
      },
    [data],
  )

  const spendablePool = Math.max(plan.availableFunds - plan.essentialCost, 0)

  return { plan, spendablePool, loading, error, refetch }
}

/*
 * 지출 최적화 옵션 훅 (시뮬레이터 토글 목록).
 */
export function useSpendingOptimizations() {
  const { data, loading, error } = useAsync(fetchSpendingOptimizations)
  const options = useMemo(() => data ?? [], [data])
  return { options, loading, error }
}
