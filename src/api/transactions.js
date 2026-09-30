/*
 * 거래 내역 도메인 API.
 *
 * 백엔드 연결:
 *  - GET /transactions?month=YYYY-MM (month 필수)
 *    응답이 페이지 단위라({ items[], page, size, totalElements }) 한 번 호출하면
 *    기본 20건만 온다. 화면은 그 달 내역을 전부 보여줘야 하므로 여기서 페이지를 이어 받아 합친다.
 *  - 응답 items[] 를 프론트(mock) 형태로 변환해 훅/화면은 그대로 둔다.
 */

import { request, withFallback, BASE_MONTH } from './client.js'
import { buildMonthTransactions } from '../data/mockMonth.js'

// 한 번에 요청할 건수. 왕복을 줄이려고 기본값(20)보다 크게 잡는다.
const PAGE_SIZE = 100
// 혹시 서버가 끝을 알려주지 않아도 무한히 돌지 않도록 상한을 둔다. (최대 2,000건)
const MAX_PAGES = 20

/*
 * 백엔드 거래 -> 프론트 거래 형태로 변환
 *  { transactionId, date, merchant, amount, transactionType, category }
 *  -> { id, title, amount, type, date, category }
 *
 * type 은 income / expense / transfer 세 가지다.
 * 계좌 간 이체(TRANSFER)는 자산이 줄어드는 게 아니라 옮겨지는 것이라,
 * 지출로 합치지 않고 따로 구분해 화면에서 부호 없이 보여준다.
 */
function mapTransaction(tx) {
  const transactionType = tx.transactionType
  return {
    id: String(tx.transactionId),
    title: tx.merchant,
    amount: tx.amount,
    type: transactionType === 'INCOME' ? 'income' : transactionType === 'TRANSFER' ? 'transfer' : 'expense',
    date: tx.date,
    category: tx.category ?? '',
  }
}

/*
 * 그 달의 모든 페이지를 순서대로 받아 합친다.
 * 명세에 정렬 규칙이 없어서(페이지마다 순서가 달라질 수 있다) 합친 뒤 최신순으로 정렬한다.
 */
async function fetchAllPages(month) {
  const items = []

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const data = await request(`/transactions?month=${month}&page=${page}&size=${PAGE_SIZE}`)
    const pageItems = data?.items ?? []
    items.push(...pageItems)

    // 빈 페이지가 오면 끝.
    if (pageItems.length === 0) break
    // 총 건수를 주면 그 기준으로, 안 주면 마지막 페이지(받은 개수 < 요청 개수)에서 멈춘다.
    const total = data?.totalElements
    if (typeof total === 'number' ? items.length >= total : pageItems.length < PAGE_SIZE) break
  }

  return items.map(mapTransaction).sort((a, b) => b.date.localeCompare(a.date))
}

// 거래 내역 목록 (기준월, 백엔드 우선 실패 시 목데이터)
export function fetchTransactions(baseMonth = BASE_MONTH) {
  return withFallback(() => fetchAllPages(baseMonth), buildMonthTransactions(baseMonth))
}
