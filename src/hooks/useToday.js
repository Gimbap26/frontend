import { useEffect, useState } from 'react'
import { toIsoDate } from '../utils/format.js'

/*
 * 오늘 날짜를 "YYYY-MM-DD" 로 돌려주는 훅.
 * 화면을 계속 띄워둬도 자정이 지나면 자동으로 다음 날짜로 갱신된다.
 *
 * 갱신 시점:
 *  1) 다음 자정까지 남은 시간만큼 타이머를 걸고, 발화하면 다시 타이머를 건다.
 *  2) 탭이 백그라운드거나 기기가 절전이면 타이머가 밀릴 수 있어서,
 *     화면 복귀(visibilitychange) / 창 포커스 시점에도 한 번 확인한다.
 *
 * 날짜가 실제로 바뀌지 않았으면 같은 문자열을 유지해서 불필요한 리렌더를 막는다.
 */
export function useToday() {
  const [today, setToday] = useState(() => toIsoDate(new Date()))

  useEffect(() => {
    let timerId

    // 현재 시각으로 다시 계산해서 날짜가 바뀐 경우에만 상태를 교체한다.
    function sync() {
      const next = toIsoDate(new Date())
      setToday((prev) => (prev === next ? prev : next))
    }

    // 다음 자정 + 1초에 깨어나도록 예약한다. (경계에서 날짜가 덜 넘어가는 경우 방지)
    function scheduleNextMidnight() {
      const now = new Date()
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      timerId = setTimeout(() => {
        sync()
        scheduleNextMidnight()
      }, nextMidnight.getTime() - now.getTime() + 1000)
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') sync()
    }

    scheduleNextMidnight()
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', sync)

    return () => {
      clearTimeout(timerId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', sync)
    }
  }, [])

  return today
}
