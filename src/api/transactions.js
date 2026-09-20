/*
 * 거래 내역 도메인 API.
 *
 * 백엔드 연결:
 *  - GET /transactions?month=YYYY-MM (month 필수)
 *  - 응답 items[] 를 프론트(mock) 형태로 변환해 훅/화면은 그대로 둔다.
 */

import { request, withFallback, BASE_MONTH } from './client.js'
import { transactions } from '../data/mockData.js'

// 백엔드 거래 -> 프론트 거래 형태로 변환
//  { transactionId, date, merchant, amount, transactionType, category }
//  -> { id, title, amount, type, date, category }
function mapTransaction(tx) {
  return {
    id: String(tx.transactionId),
    title: tx.merchant,
    amount: tx.amount,
    // INCOME 만 수입, 그 외(EXPENSE/TRANSFER)는 지출로 취급
    type: tx.transactionType === 'INCOME' ? 'income' : 'expense',
    date: tx.date,
    category: tx.category ?? '',
  }
}

// 거래 내역 목록 (기준월, 백엔드 우선 실패 시 목데이터)
export function fetchTransactions() {
  return withFallback(
    () => request(`/transactions?month=${BASE_MONTH}`).then((data) => (data?.items ?? []).map(mapTransaction)),
    transactions,
  )
}
