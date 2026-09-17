/*
 * 일정(금융 이벤트) 도메인 API.
 * 날짜별 예정 지출/수입과 금융 주의 안내를 가져온다.
 *
 * 백엔드 연결:
 *  - 이벤트: GET /financial-events?from&to (from/to 필수)
 *    응답 events[] 를 프론트(mock) 형태로 변환한다.
 *  - 주의 안내: 백엔드의 /forecast-alerts 는 "현재 대시보드 기준 위험 요약"이라
 *    특정 날짜에 묶이지 않고 날짜 정보도 없다. 프론트는 날짜별 맵을 기대하므로
 *    현재는 목데이터를 유지한다. (날짜 기반 알림 API 준비 시 연결)
 */

import { request, withFallback, mockResponse, monthRange } from './client.js'
import { financialEvents, scheduleAlerts } from '../data/mockData.js'

// 백엔드 예정 이벤트 -> 프론트 이벤트 형태로 변환
//  { eventId, eventDate, title, amount, direction, eventType, status, fixed }
//  -> { id, title, amount, type, date, category }
function mapFinancialEvent(event) {
  return {
    id: String(event.eventId),
    title: event.title,
    amount: event.amount,
    // INFLOW = 수입, OUTFLOW = 지출
    type: event.direction === 'INFLOW' ? 'income' : 'expense',
    date: event.eventDate,
    category: event.eventType ?? '',
  }
}

// 금융 이벤트 목록 (지출/수입) - 기준월 범위 (백엔드 우선, 실패 시 목데이터)
export function fetchFinancialEvents() {
  const { from, to } = monthRange()
  return withFallback(
    () =>
      request(`/financial-events?from=${from}&to=${to}`).then((data) =>
        (data?.events ?? [])
          // 취소된 이벤트는 달력에 표시하지 않는다.
          .filter((event) => event.status !== 'CANCELED')
          .map(mapFinancialEvent),
      ),
    financialEvents,
  )
}

// 날짜별 금융 주의 안내
// 백엔드에 날짜 기반 알림 API가 없어 현재는 목데이터를 사용한다.
export function fetchScheduleAlerts() {
  return mockResponse(scheduleAlerts)
}
