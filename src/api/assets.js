/*
 * 자산 도메인 API.
 * 계좌, 예정(확정) 지출을 가져온다.
 *
 * 백엔드 연결:
 *  - .env 의 VITE_API_BASE_URL 이 채워지면 USE_MOCK 이 false 가 되어 실제 API를 호출한다.
 *  - 백엔드 응답 필드명이 프론트(mock)와 달라서, 여기서 mock 형태로 변환해
 *    훅/화면 코드는 그대로 두고 데이터만 맞춘다.
 */

import { request, withFallback, monthRange } from './client.js'
import { accounts, upcomingExpenses } from '../data/mockData.js'

// 백엔드 계좌 -> 프론트 계좌 형태로 변환
//  { accountId, bankName, accountName, balance, purpose, includedInAssets }
//  -> { id, bank, purpose, balance }
function mapAccount(account) {
  return {
    id: String(account.accountId),
    bank: account.bankName,
    // 화면은 은행명 아래 보조 문구로 purpose 를 쓴다. 없으면 계좌명으로 대체.
    purpose: account.purpose ?? account.accountName ?? '',
    balance: account.balance,
  }
}

// 백엔드 예정 이벤트(지출) -> 프론트 예정지출 형태로 변환
//  { eventId, eventDate, title, amount, direction, eventType, status, fixed }
//  -> { id, title, amount, date, category, recurring }
function mapUpcomingExpense(event) {
  return {
    id: String(event.eventId),
    title: event.title,
    amount: event.amount,
    date: event.eventDate,
    category: event.eventType ?? '',
    recurring: Boolean(event.fixed),
  }
}

// 계좌 목록 (백엔드 우선, 실패 시 목데이터)
export function fetchAccounts() {
  return withFallback(
    // 자산 계산에 포함되는 계좌만 조회
    () => request('/accounts?includedOnly=true').then((data) => (data?.accounts ?? []).map(mapAccount)),
    accounts,
  )
}

// 이번 달 확정(예정) 지출 목록
// 별도 엔드포인트가 없어 financial-events 에서 OUTFLOW + 취소 아님 이벤트를 사용한다.
export function fetchUpcomingExpenses() {
  const { from, to } = monthRange()
  return withFallback(
    () =>
      request(`/financial-events?from=${from}&to=${to}&direction=OUTFLOW`).then((data) =>
        (data?.events ?? [])
          .filter((event) => event.status !== 'CANCELED')
          .map(mapUpcomingExpense),
      ),
    upcomingExpenses,
  )
}
