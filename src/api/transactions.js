/*
 * 거래 내역 도메인 API.
 *
 * 백엔드 연결 시 request() 경로를 실제 스펙에 맞추면 된다.
 * 필터(type)는 서버 쿼리 파라미터로 넘기는 방식으로 확장할 수 있다.
 */

import { USE_MOCK, request, mockResponse } from './client.js'
import { transactions } from '../data/mockData.js'

// 거래 내역 목록
export function fetchTransactions() {
  if (USE_MOCK) return mockResponse(transactions)
  return request('/transactions')
}
