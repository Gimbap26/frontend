/*
 * 일정(금융 이벤트) 도메인 API.
 * 날짜별 예정 지출/수입과 금융 주의 안내를 가져온다.
 *
 * 백엔드 연결 시 request() 경로를 실제 스펙에 맞추면 된다.
 * 주의 안내(alerts)는 Financial Analysis Engine 판정 결과에 해당한다.
 */

import { USE_MOCK, request, mockResponse } from './client.js'
import { financialEvents, scheduleAlerts } from '../data/mockData.js'

// 금융 이벤트 목록 (지출/수입)
export function fetchFinancialEvents() {
  if (USE_MOCK) return mockResponse(financialEvents)
  return request('/schedule/events')
}

// 날짜별 금융 주의 안내
export function fetchScheduleAlerts() {
  if (USE_MOCK) return mockResponse(scheduleAlerts)
  return request('/schedule/alerts')
}
