/*
 * 일정(금융 이벤트) 도메인 API.
 * 날짜별 예정 지출/수입과 금융 주의 안내를 가져온다.
 *
 * 백엔드 연결:
 *  - 이벤트: GET /financial-events?from&to (from/to 필수)
 *    응답 events[] 를 프론트(mock) 형태로 변환한다.
 *  - 잔액 예측: GET /forecasts?from&to
 *    timeline[] 의 일자별 잔액과 최저 잔액일을 달력의 자금 날씨 판정에 쓴다.
 *  - 지출 계획: GET /dashboard
 *    가용자금과 위험 요약 문장을 가져온다. (필수 고정비는 백엔드에 항목이 없어 목값 유지)
 *  - 주의 안내: 백엔드의 /forecast-alerts 는 "현재 대시보드 기준 위험 요약"이라
 *    특정 날짜에 묶이지 않고 날짜 정보도 없다. 프론트는 날짜별 맵을 기대하므로
 *    현재는 목데이터를 유지한다. (날짜 기반 알림 API 준비 시 연결)
 */

import { request, withFallback, mockResponse, monthRange, BASE_MONTH } from './client.js'
import { eventTypeLabel } from './codes.js'
import { spendingOptimizations } from '../data/mockData.js'
import {
  buildMonthAlerts,
  buildMonthEvents,
  buildMonthForecast,
  buildSpendingPlan,
} from '../data/mockMonth.js'

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
    // eventType 은 영문 코드(CARD_PAYMENT 등)로 오므로 한글 라벨로 바꾼다.
    category: eventTypeLabel(event.eventType),
  }
}

/*
 * 금융 이벤트 목록 (지출/수입).
 * baseMonth("YYYY-MM")를 주면 그 달을, 없으면 기준월을 조회한다.
 * 달력에서 월을 넘기면 그 달 범위로 다시 조회된다.
 * 목 모드에서는 반복 규칙으로 그 달 이벤트를 만들어 주므로 어떤 달을 봐도 비지 않는다.
 */
export function fetchFinancialEvents(baseMonth = BASE_MONTH) {
  const { from, to } = monthRange(baseMonth)
  return withFallback(
    () =>
      request(`/financial-events?from=${from}&to=${to}`).then((data) =>
        (data?.events ?? [])
          // 취소된 이벤트는 달력에 표시하지 않는다.
          .filter((event) => event.status !== 'CANCELED')
          .map(mapFinancialEvent)
          // 명세에 정렬 규칙이 없어 날짜순으로 맞춘다.
          .sort((a, b) => a.date.localeCompare(b.date)),
      ),
    buildMonthEvents(baseMonth),
  )
}

/*
 * 날짜별 금융 주의 안내 (날짜 -> { title, lines[] }).
 * 백엔드에 날짜 기반 알림 API가 없어 목데이터만 사용한다.
 * (요청 중: docs/frontend-api-request.md 요청 1)
 * 달력에서 보고 있는 달의 안내를 만들어 준다.
 */
export function fetchScheduleAlerts(baseMonth = BASE_MONTH) {
  return mockResponse(buildMonthAlerts(baseMonth))
}

// 백엔드 예측 응답 -> 프론트 예측 형태로 변환
//  { from, to, currentBalance, minimumBalanceDate, minimumBalance, weather, timeline[{date, balance, events}] }
//  -> 같은 필드 + timeline 은 { date, balance } 만 남긴다. (달력은 잔액만 사용)
function mapForecast(data) {
  return {
    from: data.from,
    to: data.to,
    currentBalance: data.currentBalance ?? 0,
    minimumBalanceDate: data.minimumBalanceDate ?? null,
    minimumBalance: data.minimumBalance ?? 0,
    weather: data.weather ?? null,
    timeline: (data.timeline ?? []).map((day) => ({ date: day.date, balance: day.balance })),
  }
}

/*
 * 잔액 예측 (일자별 잔액 + 최저 잔액일).
 * baseMonth("YYYY-MM")를 주면 그 달을, 없으면 기준월을 조회한다.
 * 목 모드에서는 반복 규칙으로 그 달 예측을 만들어 준다.
 */
export function fetchMonthlyForecast(baseMonth = BASE_MONTH) {
  const { from, to } = monthRange(baseMonth)
  return withFallback(
    () => request(`/forecasts?from=${from}&to=${to}`).then(mapForecast),
    buildMonthForecast(baseMonth),
  )
}

/*
 * 지출 계획 요약 (가용자금 / 필수 고정비 / 위험 요약).
 * 백엔드 대시보드에는 필수 고정비 항목이 없어 목값을 유지하고, 있는 값만 덮어쓴다.
 * 갱신 시각은 응답을 만든 시점으로 채운다. 그래서 리포트의 "갱신" 버튼을 누르면
 * 목 모드에서도 시각이 실제로 바뀐다.
 */
export function fetchSpendingPlan() {
  // 목값도 "오늘이 속한 달" 기준으로 만들어, 달이 바뀌어도 문구의 날짜가 어긋나지 않게 한다.
  const fallback = buildSpendingPlan()
  return withFallback(
    () =>
      request('/dashboard').then((data) => ({
        ...fallback,
        availableFunds: data?.availableFunds ?? fallback.availableFunds,
        riskSummary: data?.riskSummary ?? fallback.riskSummary,
        // 실데이터에서는 남은 일수를 고정하지 않고 화면이 (급여일 - 오늘)로 계산한다.
        daysUntilPayday: null,
        updatedAt: new Date().toISOString(),
      })),
    fallback,
  )
}

// 지출 최적화 시뮬레이터 옵션 (백엔드에 목록 API가 없어 목데이터를 사용한다)
export function fetchSpendingOptimizations() {
  return mockResponse(spendingOptimizations)
}
