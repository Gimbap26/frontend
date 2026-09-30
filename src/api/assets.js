/*
 * 자산 도메인 API.
 * 계좌, 예정(확정) 지출을 가져온다.
 *
 * 백엔드 연결:
 *  - .env 의 VITE_API_BASE_URL 이 채워지면 USE_MOCK 이 false 가 되어 실제 API를 호출한다.
 *  - 백엔드 응답 필드명이 프론트(mock)와 달라서, 여기서 mock 형태로 변환해
 *    훅/화면 코드는 그대로 두고 데이터만 맞춘다.
 *  - 백엔드가 정렬을 보장하지 않으므로(명세에 정렬 규칙 없음) 여기서 날짜순으로 맞춘다.
 */

import { request, withFallback, monthRange, BASE_MONTH } from './client.js'
import { eventTypeLabel } from './codes.js'
import { accounts } from '../data/mockData.js'
import { buildMonthUpcomingExpenses } from '../data/mockMonth.js'

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
    // eventType 은 영문 코드로 오므로 한글 라벨로 바꾼다.
    category: eventTypeLabel(event.eventType),
    recurring: Boolean(event.fixed),
  }
}

/*
 * 계좌 목록 + 총 잔액.
 *
 * 같은 화면에서 상단 헤더(총자산)와 본문(계좌 목록)이 각각 이 함수를 호출하기 때문에,
 * 짧은 시간 안의 중복 호출은 같은 요청을 재사용한다. (탭을 왕복할 때도 재사용된다)
 * 잔액이 바뀔 만한 조작이 화면에 없어서 이 정도 캐시로 충분하다.
 */
const ACCOUNTS_TTL = 15_000
let accountsCache = null

function requestAccounts() {
  return withFallback(
    // 자산 계산에 포함되는 계좌만 조회
    () =>
      request('/accounts?includedOnly=true').then((data) => ({
        accounts: (data?.accounts ?? []).map(mapAccount),
        // 서버가 계산한 총 잔액을 우선 쓴다. (계좌 합계와 기준이 다를 수 있다)
        totalBalance: typeof data?.totalBalance === 'number' ? data.totalBalance : null,
      })),
    { accounts, totalBalance: null },
  )
}

export function fetchAccounts() {
  const now = Date.now()
  if (accountsCache && now - accountsCache.at < ACCOUNTS_TTL) return accountsCache.promise

  const promise = requestAccounts()
  accountsCache = { at: now, promise }
  return promise
}

/*
 * 계좌 데이터가 바뀌었음을 알리는 구독자 목록.
 *
 * 계좌는 상단 헤더(총자산)와 본문(계좌 목록)이 각각 조회한다.
 * 한쪽에서만 다시 불러오면 위아래 숫자가 어긋나므로,
 * 캐시를 버릴 때 구독 중인 모든 화면에 알려 함께 다시 불러오게 한다.
 */
const accountListeners = new Set()

export function subscribeAccounts(listener) {
  accountListeners.add(listener)
  return () => accountListeners.delete(listener)
}

/*
 * 캐시를 버리고 구독자에게 알린다. 다음 조회는 서버에 다시 물어본다.
 * 잔액이 바뀔 만한 일(거래 등록, 사용자가 새로고침 요청)이 있을 때 호출한다.
 */
export function invalidateAccounts() {
  accountsCache = null
  for (const listener of accountListeners) listener()
}

/*
 * 이번 달 확정(예정) 지출 목록.
 * 별도 엔드포인트가 없어 financial-events 에서 OUTFLOW + 취소 아님 이벤트를 사용한다.
 * 목 모드에서도 일정 화면과 같은 반복 규칙에서 만들어, 두 화면의 지출 목록이 일치한다.
 */
export function fetchUpcomingExpenses(baseMonth = BASE_MONTH) {
  const { from, to } = monthRange(baseMonth)
  return withFallback(
    () =>
      request(`/financial-events?from=${from}&to=${to}&direction=OUTFLOW`).then((data) =>
        (data?.events ?? [])
          .filter((event) => event.status !== 'CANCELED')
          .map(mapUpcomingExpense)
          // 빠져나갈 순서대로 보여준다.
          .sort((a, b) => a.date.localeCompare(b.date)),
      ),
    buildMonthUpcomingExpenses(baseMonth),
  )
}
