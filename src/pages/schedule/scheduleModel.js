/*
 * 일정 화면의 계산/판정 로직 모음 (화면 렌더와 분리된 순수 함수들).
 *
 * 하는 일
 *  - 날짜 문자열 유틸 (ISO <-> 연·월·일)
 *  - 자금 날씨 등급 정의와 판정 (잔액 + 그날의 금융 이벤트 기준)
 *  - 달력 그리드용 날짜 셀 목록 생성
 *  - 이번 달 주요 지점(큰 지출일 / 최저 잔액일 / 급여일) 추출
 *
 * 금액 포맷은 여기서 하지 않는다. 화면이 utils/format.js 로 처리한다.
 */

/*
 * 자금 날씨 등급.
 * 백엔드(ForecastService)는 SUNNY / CLOUDY / RAINY / STORM 4단계를 주고,
 * FAIR(양호)는 프론트가 잔액 여유도로 한 단계 더 나눈 표시용 등급이다.
 * PAYDAY 는 등급이 아니라 "급여 입금일" 표시용이라 사다리에서 제외한다.
 */
export const WEATHER = {
  SUNNY: { emoji: '☀️', label: '여유' },
  FAIR: { emoji: '🌤️', label: '양호' },
  CLOUDY: { emoji: '☁️', label: '주의' },
  RAINY: { emoji: '🌧️', label: '지출집중' },
  STORM: { emoji: '⛈️', label: '최저수위' },
  PAYDAY: { emoji: '🌟', label: '입금' },
}

// 나쁨 -> 좋음 순서. 시뮬레이터가 단계를 올릴 때 이 순서를 따른다.
const WEATHER_LADDER = ['STORM', 'RAINY', 'CLOUDY', 'FAIR', 'SUNNY']

/*
 * 달력 아래 범례에 보여줄 항목. 잔액 여유도 3단계만 둔다.
 * 지출 집중(🌧️) / 최저수위(⛈️) / 입금(🌟)은 바로 아래 주요 지점 카드가
 * 날짜·금액과 함께 설명하므로 범례에서는 빼서 중복을 없앤다.
 */
export const WEATHER_LEGEND = ['SUNNY', 'FAIR', 'CLOUDY']

// 종합 판정 문구. 시뮬레이터 결과 박스와 카드 부제에서 쓴다.
export const WEATHER_SUMMARY = {
  SUNNY: '쾌청 맑음',
  FAIR: '구름 조금 (양호)',
  CLOUDY: '구름 많음 (흐림)',
  RAINY: '비 (지출 집중)',
  STORM: '폭풍 (잔액 위험)',
}

// 하루 지출 합계가 이 금액을 넘으면 "지출 집중일"로 본다.
const HEAVY_SPENDING = 200_000

/*
 * 잔액 여유도 임계값. 백엔드가 날짜별 weather 를 주기 시작하면 그 값으로 대체하면 된다.
 * 이 기준이 낮으면 달력이 온통 맑음이 되므로, 고정 지출을 다 빼고도 여유가 있는
 * 구간만 맑음/양호로 보고 나머지는 흐림으로 둔다.
 */
const BALANCE_FAIR = 1_700_000
const BALANCE_SUNNY = 2_300_000

// 일요일 시작 요일 라벨 (참고 시안 기준)
export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

// "2026-09-01" -> { year, month(0기준) }
export function parseMonth(iso) {
  const [year, month] = iso.split('-').map(Number)
  return { year, month: month - 1 }
}

// year, month(0기준), day -> "2026-09-25"
export function toIso(year, month, day) {
  const mm = String(month + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

// 두 ISO 날짜 사이의 일수. (to - from, 음수면 이미 지난 날짜)
export function daysBetween(fromIso, toIsoDate) {
  const from = new Date(`${fromIso}T00:00:00`)
  const to = new Date(`${toIsoDate}T00:00:00`)
  return Math.round((to - from) / 86_400_000)
}

// 금융 이벤트를 날짜별로 묶는다. (달력 셀에서 바로 꺼내 쓰기 위한 Map)
export function groupEventsByDate(items) {
  const map = new Map()
  for (const item of items) {
    if (!map.has(item.date)) map.set(item.date, [])
    map.get(item.date).push(item)
  }
  return map
}

/*
 * 하루의 자금 날씨 판정.
 * 우선순위: 급여 입금 > 최저 잔액일 > 지출 집중일 > 잔액 여유도
 * 잔액 정보가 없는 날(이전/다음 달 칸 등)은 null 을 돌려준다.
 */
export function weatherForDay({ items = [], balance, isMinimumDate = false }) {
  const hasIncome = items.some((item) => item.type === 'income')
  if (hasIncome) return 'PAYDAY'
  if (isMinimumDate) return 'STORM'

  const expenseTotal = items
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0)
  if (expenseTotal >= HEAVY_SPENDING) return 'RAINY'

  if (balance == null) return null
  if (balance >= BALANCE_SUNNY) return 'SUNNY'
  if (balance >= BALANCE_FAIR) return 'FAIR'
  return 'CLOUDY'
}

// 날씨 등급을 steps 단계만큼 좋은 쪽으로 올린다. (시뮬레이터용)
export function improveWeather(code, steps) {
  const current = WEATHER_LADDER.indexOf(code)
  // 사다리에 없는 값(PAYDAY 등)이면 흐림을 기준으로 삼는다.
  const start = current === -1 ? WEATHER_LADDER.indexOf('CLOUDY') : current
  const next = Math.min(start + steps, WEATHER_LADDER.length - 1)
  return WEATHER_LADDER[next]
}

/*
 * 달력 그리드용 날짜 셀 목록.
 * 일요일 시작이고, 앞뒤 빈칸은 이전/다음 달 날짜로 채워 6주 격자가 끊기지 않게 한다.
 *
 * 각 셀: { iso, day, inMonth, weekday, weather, hasIncome, hasExpense }
 */
export function buildCalendarDays({ year, month, eventsByDate, balanceByDate, minimumBalanceDate }) {
  const firstWeekday = new Date(year, month, 1).getDay() // 0 = 일요일
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevMonthDays = new Date(year, month, 0).getDate()

  const cells = []

  // 앞쪽: 이전 달 마지막 날짜들
  for (let i = firstWeekday - 1; i >= 0; i -= 1) {
    cells.push({ year, month: month - 1, day: prevMonthDays - i, inMonth: false })
  }
  // 이번 달
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ year, month, day, inMonth: true })
  }
  // 뒤쪽: 다음 달 시작 날짜들 (마지막 주를 7칸으로 맞춘다)
  const trailing = (7 - (cells.length % 7)) % 7
  for (let day = 1; day <= trailing; day += 1) {
    cells.push({ year, month: month + 1, day, inMonth: false })
  }

  return cells.map((cell) => {
    // month 가 -1 이나 12 여도 Date 가 연도를 알아서 넘겨준다.
    const date = new Date(cell.year, cell.month, cell.day)
    const iso = toIso(date.getFullYear(), date.getMonth(), date.getDate())
    const items = eventsByDate.get(iso) ?? []

    return {
      iso,
      day: cell.day,
      inMonth: cell.inMonth,
      weekday: date.getDay(),
      weather: cell.inMonth
        ? weatherForDay({
            items,
            balance: balanceByDate.get(iso),
            isMinimumDate: iso === minimumBalanceDate,
          })
        : null,
      hasIncome: items.some((item) => item.type === 'income'),
      hasExpense: items.some((item) => item.type === 'expense'),
    }
  })
}

/*
 * 이번 달 주요 지점 3개.
 *  - expense: 가장 큰 예정 지출일
 *  - minimum: 예상 잔액이 가장 낮은 날
 *  - income: 급여 등 가장 큰 예정 입금일
 * 해당 데이터가 없으면 그 항목은 빠진다. (카드 개수는 1~3개)
 */
export function buildMilestones({ events, forecast }) {
  const milestones = []

  const biggestExpense = events
    .filter((item) => item.type === 'expense')
    .sort((a, b) => b.amount - a.amount)[0]
  if (biggestExpense) {
    milestones.push({
      key: 'expense',
      tone: 'expense',
      date: biggestExpense.date,
      // 달력의 🌧️ 표시와 짝이 되는 카드라 항목명 대신 판정 이름을 쓴다.
      title: '지출 집중',
      amount: biggestExpense.amount,
      kind: 'expense',
    })
  }

  if (forecast.minimumBalanceDate) {
    milestones.push({
      key: 'minimum',
      tone: 'warning',
      date: forecast.minimumBalanceDate,
      title: '최저점 구간',
      amount: forecast.minimumBalance,
      kind: 'balance',
    })
  }

  const biggestIncome = events
    .filter((item) => item.type === 'income')
    .sort((a, b) => b.amount - a.amount)[0]
  if (biggestIncome) {
    milestones.push({
      key: 'income',
      tone: 'income',
      date: biggestIncome.date,
      title: `${biggestIncome.title} 입금일`,
      amount: biggestIncome.amount,
      kind: 'income',
    })
  }

  return milestones
}

/*
 * 다음 급여일. (오늘 이후의 가장 이른 입금 이벤트)
 * 이번 달 급여가 이미 지났으면 마지막 입금일을 돌려준다. (배지에서 지난 날짜로 처리)
 */
export function findNextPayday(events, todayIso) {
  const incomes = events
    .filter((item) => item.type === 'income')
    .map((item) => item.date)
    .sort()
  return incomes.find((date) => date >= todayIso) ?? incomes.at(-1) ?? null
}
