import { useMemo } from 'react'
import { useAsync } from './useAsync.js'
import { fetchFinancialEvents, fetchScheduleAlerts } from '../api/schedule.js'

/*
 * 일정(금융 이벤트) 훅.
 */
export function useFinancialEvents() {
  const { data, loading, error } = useAsync(fetchFinancialEvents)
  const events = useMemo(() => data ?? [], [data])
  return { events, loading, error }
}

/*
 * 날짜별 금융 주의 안내 훅.
 */
export function useScheduleAlerts() {
  const { data, loading, error } = useAsync(fetchScheduleAlerts)
  const alerts = useMemo(() => data ?? {}, [data])
  return { alerts, loading, error }
}
