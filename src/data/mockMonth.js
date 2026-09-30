/*
 * 월별 목데이터 생성기. (백엔드가 해 줄 일을 목 모드에서 흉내 내는 자리)
 *
 * 일정 화면은 달력에서 월을 앞뒤로 넘길 수 있고, 오늘 날짜도 실시간으로 바뀐다.
 * 그래서 특정 달(2026-09)만 손으로 적어 두면 다른 달은 화면이 텅 비게 된다.
 * 여기서는 mockData 의 반복 규칙(recurringRules)을 받아 요청한 달의
 * 예정 이벤트 / 잔액 예측 / 주의 안내 / 지출 계획을 그때그때 만들어 준다.
 *
 * 백엔드가 붙으면 이 파일은 쓰이지 않는다. (api 레이어의 폴백 경로에서만 호출된다)
 */

import { monthStartBalance, recurringRules, spendingPlanBase, transactions } from './mockData.js'

function pad(value) {
  return String(value).padStart(2, '0')
}

// "2026-09" -> { year: 2026, month: 9 } (month 는 1부터)
function parseMonthKey(baseMonth) {
  const [year, month] = baseMonth.split('-').map(Number)
  return { year, month }
}

// 그 달의 마지막 날 (2026-09 -> 30)
function lastDayOf(year, month) {
  return new Date(year, month, 0).getDate()
}

// Date -> "2026-09" (로컬 기준)
export function monthKeyOf(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
}

/*
 * 요청한 달의 예정 이벤트 목록.
 * 규칙의 day 가 그 달에 없으면(2월 30일 등) 말일로 맞춘다.
 */
export function buildMonthEvents(baseMonth) {
  const { year, month } = parseMonthKey(baseMonth)
  const lastDay = lastDayOf(year, month)

  return recurringRules.map((rule) => ({
    // 달마다 고유한 id 가 되도록 기준월을 붙인다.
    id: `${baseMonth}-${rule.id}`,
    title: rule.title,
    amount: rule.amount,
    type: rule.type,
    date: `${year}-${pad(month)}-${pad(Math.min(rule.day, lastDay))}`,
    category: rule.category,
    accountId: rule.accountId,
  }))
}

/*
 * 이번 달 종합 날씨. 급여 입금 전 최저 잔액이 얼마나 얇은지로 판단한다.
 * 백엔드(ForecastService)가 자기 기준으로 판정할 값이라, 화면의 날짜별 판정 기준과는 별개다.
 */
function weatherForMinimum(balance) {
  if (balance >= 2_300_000) return 'SUNNY'
  if (balance >= 1_700_000) return 'FAIR'
  if (balance >= 1_000_000) return 'CLOUDY'
  return 'RAINY'
}

/*
 * 요청한 달의 잔액 예측. (GET /forecasts 응답 형태)
 * 달 시작 잔액에서 이벤트를 날짜순으로 반영해 일자별 마감 잔액을 만들고,
 * 급여 입금 전 구간에서 잔액이 가장 낮은 날을 최저 잔액일로 잡는다.
 */
export function buildMonthForecast(baseMonth) {
  const { year, month } = parseMonthKey(baseMonth)
  const lastDay = lastDayOf(year, month)
  const events = buildMonthEvents(baseMonth)

  // 날짜별 순변동 (같은 날 여러 건이면 합산)
  const deltaByDate = new Map()
  for (const event of events) {
    const delta = event.type === 'income' ? event.amount : -event.amount
    deltaByDate.set(event.date, (deltaByDate.get(event.date) ?? 0) + delta)
  }

  let balance = monthStartBalance
  const timeline = []
  for (let day = 1; day <= lastDay; day += 1) {
    const date = `${year}-${pad(month)}-${pad(day)}`
    balance += deltaByDate.get(date) ?? 0
    timeline.push({ date, balance })
  }

  // 급여(입금)일 전까지가 실제로 버텨야 하는 구간이다.
  const payday = events.find((event) => event.type === 'income')?.date ?? null
  const beforePayday = payday ? timeline.filter((day) => day.date < payday) : timeline
  const lowest = (beforePayday.length > 0 ? beforePayday : timeline).reduce(
    (min, day) => (day.balance < min.balance ? day : min),
    (beforePayday.length > 0 ? beforePayday : timeline)[0],
  )

  return {
    from: `${year}-${pad(month)}-01`,
    to: `${year}-${pad(month)}-${pad(lastDay)}`,
    currentBalance: monthStartBalance,
    minimumBalanceDate: lowest?.date ?? null,
    minimumBalance: lowest?.balance ?? 0,
    weather: weatherForMinimum(lowest?.balance ?? 0),
    timeline,
  }
}

/*
 * 요청한 달의 날짜별 주의 안내. (날짜 -> { title, lines[] })
 * 대출 상환일에 안내를 붙인다. 그날 잔액이 가장 얇아진 뒤 급여가 들어오는 구조라
 * "급여 입금 전 추가 지출 주의"를 알려 줄 자리다.
 */
export function buildMonthAlerts(baseMonth) {
  const events = buildMonthEvents(baseMonth)
  const loan = events.find((event) => event.category === '대출')
  if (!loan) return {}

  const [, month, day] = loan.date.split('-').map(Number)
  return {
    [loan.date]: {
      title: `${month}월 ${day}일 주의`,
      lines: [
        '대출 상환금 차감 직후 잔액이 생활비 기준치를 하회합니다.',
        '월급 입금 전 추가 지출에 주의하세요.',
      ],
    },
  }
}

/*
 * 지출 계획 요약. (GET /dashboard 응답 형태)
 * 위험 요약 문장에 들어가는 날짜/금액을 그 달 규칙에서 뽑아 만든다.
 * baseMonth 를 주지 않으면 오늘이 속한 달을 기준으로 한다.
 */
export function buildSpendingPlan(baseMonth = monthKeyOf()) {
  const events = buildMonthEvents(baseMonth)
  const card = events.find((event) => event.category === '카드')
  const payday = events.find((event) => event.type === 'income')

  const riskSummary =
    card && payday
      ? `${Number(card.date.split('-')[1])}월 ${Number(card.date.split('-')[2])}일 카드대금(${
          card.amount / 10_000
        }만원) 출금 직후가 이번 달 가장 취약한 저기압 전선입니다. 30만원 이상의 고액 소비는 ${Number(
          payday.date.split('-')[1],
        )}월 ${Number(payday.date.split('-')[2])}일 급여일 이후로 연기하는 것을 권장합니다.`
      : '이번 달은 예정된 고정 지출이 없어 잔액 여유가 있습니다.'

  return {
    ...spendingPlanBase,
    riskSummary,
    updatedAt: new Date().toISOString(),
  }
}

/*
 * 요청한 달의 확정(예정) 지출 목록. (자산 화면의 "이번 달 확정 지출")
 * 백엔드도 이 목록을 financial-events 의 OUTFLOW 로 내려주므로,
 * 일정 화면의 지출 이벤트와 같은 소스에서 뽑아 두 화면이 어긋나지 않게 한다.
 */
export function buildMonthUpcomingExpenses(baseMonth = monthKeyOf()) {
  return buildMonthEvents(baseMonth)
    .filter((event) => event.type === 'expense')
    .map((event) => ({
      id: event.id,
      title: event.title,
      amount: event.amount,
      date: event.date,
      category: event.category,
      accountId: event.accountId,
      // 반복 규칙에서 만든 항목이라 항상 고정 지출이다.
      recurring: true,
    }))
}

/*
 * 요청한 달의 거래 내역. (거래내역 화면)
 *
 * 백엔드는 GET /transactions?month= 으로 그 달 내역만 주므로 목데이터도 같은 규칙을 지킨다.
 *  - 조회월을 벗어나는 날짜는 만들지 않는다. (화면 제목이 "N월 거래내역" 이라 섞이면 어긋난다)
 *  - 거래는 이미 발생한 기록이라 미래 날짜도 만들지 않는다.
 *    그래서 이번 달이면 오늘부터, 지난달이면 말일부터 하루씩 거슬러 올라가며 붙인다.
 *  - 아직 오지 않은 달은 빈 목록이다.
 */
export function buildMonthTransactions(baseMonth = monthKeyOf(), today = new Date()) {
  const todayMonth = monthKeyOf(today)
  if (baseMonth > todayMonth) return []

  const { year, month } = parseMonthKey(baseMonth)
  // 이번 달은 오늘까지만, 지난달은 말일까지.
  const startDay = baseMonth === todayMonth ? today.getDate() : lastDayOf(year, month)

  return transactions
    .map((transaction, index) => ({ transaction, day: startDay - index }))
    // 그 달의 1일보다 앞서면 버린다. (월초를 조회하면 건수가 적어진다)
    .filter(({ day }) => day >= 1)
    .map(({ transaction, day }) => ({
      ...transaction,
      date: `${year}-${pad(month)}-${pad(day)}`,
    }))
}

// 금액을 화면 문구용으로 "₩1,541,000" 형태로 만든다.
function won(amount) {
  return `₩${amount.toLocaleString('ko-KR')}`
}

/*
 * AI 추천 질문. (AI 화면 칩, 일정 화면의 빠른 질문)
 * "9월 25일까지 ..." 처럼 날짜가 든 질문은 지난 날짜가 되면 어색하므로
 * 그 달의 급여일을 넣어 만든다.
 */
export function buildAgentSuggestions(baseMonth = monthKeyOf()) {
  const payday = buildMonthEvents(baseMonth).find((event) => event.type === 'income')
  const questions = ['왜 이번 달은 흐림인가요?']

  if (payday) {
    const [, month, day] = payday.date.split('-').map(Number)
    questions.push(`${month}월 ${day}일까지 얼마나 쓸 수 있나요?`)
  }

  questions.push('지출에서 줄일 수 있는 항목은?')
  return questions
}

/*
 * AI 목 답변. 질문 문구를 키로 쓴다. (백엔드가 붙으면 실제 답변으로 대체된다)
 * 답변 안의 날짜와 금액도 그 달 데이터에서 뽑아 쓰기 때문에,
 * 추천 질문을 눌렀을 때 화면의 다른 숫자와 어긋나지 않는다.
 */
export function buildAgentAnswers(baseMonth = monthKeyOf()) {
  const events = buildMonthEvents(baseMonth)
  const forecast = buildMonthForecast(baseMonth)
  const payday = events.find((event) => event.type === 'income')
  const card = events.find((event) => event.category === '카드')
  const loan = events.find((event) => event.category === '대출')

  const answers = {}

  if (payday) {
    const [, month, day] = payday.date.split('-').map(Number)
    const freeToSpend = Math.max(spendingPlanBase.availableFunds - spendingPlanBase.essentialCost, 0)
    // 급여 입금 후 잔액 = 그 달 마지막 날 잔액
    const afterPayday = forecast.timeline.at(-1)?.balance ?? 0

    answers[`${month}월 ${day}일까지 얼마나 쓸 수 있나요?`] = {
      answer:
        `${month}/${day} 월급 입금 전까지 예상 잔액은 ${won(forecast.minimumBalance)}입니다.\n\n` +
        `필수 고정비(${spendingPlanBase.essentialLabel}) ${won(spendingPlanBase.essentialCost)} 를 빼면 ` +
        `자유롭게 쓸 수 있는 금액은 약 ${won(freeToSpend)} 으로 추정됩니다.\n\n` +
        `큰 지출은 ${month}/${day} 이후로 미루시길 권장합니다.`,
      evidence: `${month}/${day} 월급 입금 후 예상 잔액: ${won(afterPayday)}`,
      sources: ['dashboard', 'financial-events', 'forecasts'],
    }
  }

  if (card && loan && forecast.minimumBalanceDate) {
    const [, minMonth, minDay] = forecast.minimumBalanceDate.split('-').map(Number)
    answers['왜 이번 달은 흐림인가요?'] = {
      answer:
        `이번 달은 카드 결제(${won(card.amount)})와 대출 상환금(${won(loan.amount)}) 등 고정 지출이 몰려 있어 흐림으로 판정됐습니다.\n\n` +
        `월급 입금 전 최저 잔액이 ${won(forecast.minimumBalance)} 까지 내려가 여유가 크지 않습니다.`,
      evidence: `최저 예상 잔액일: ${minMonth}/${minDay}`,
      sources: ['forecasts', 'financial-events'],
    }
  }

  return answers
}
