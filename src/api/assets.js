/*
 * 자산 도메인 API.
 * 계좌, 예정(확정) 지출을 가져온다.
 *
 * 백엔드 연결 방법:
 *  - .env 에 VITE_API_BASE_URL 을 채우면 USE_MOCK 이 false 가 되어 실제 API를 호출한다.
 *  - 아래 request() 경로(/accounts 등)를 실제 백엔드 스펙에 맞게 조정하면 된다.
 */

import { USE_MOCK, request, mockResponse } from './client.js'
import { accounts, upcomingExpenses } from '../data/mockData.js'

// 계좌 목록
export function fetchAccounts() {
  if (USE_MOCK) return mockResponse(accounts)
  return request('/accounts')
}

// 이번 달 확정(예정) 지출 목록
export function fetchUpcomingExpenses() {
  if (USE_MOCK) return mockResponse(upcomingExpenses)
  return request('/expenses/upcoming')
}
