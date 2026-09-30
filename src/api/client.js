/*
 * HTTP 클라이언트 (백엔드 연결용 공통 래퍼).
 *
 * 현재는 목데이터 모드라 실제로 호출되지 않지만,
 * 백엔드가 붙으면 api 함수들이 이 request()를 사용하도록 바꾸면 된다.
 * API 주소는 .env 의 VITE_API_BASE_URL 로 설정한다.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

// 개발용 사용자 컨텍스트. Bearer 토큰이 붙기 전까지 X-User-Id 헤더로 사용자를 지정한다.
// (백엔드 인증 우선순위: Bearer > X-User-Id > userId query > 기본 사용자 1)
const DEV_USER_ID = import.meta.env.VITE_DEV_USER_ID ?? ''

// 목데이터로 동작할지 여부. API 주소가 비어 있으면 목 모드로 본다.
export const USE_MOCK = BASE_URL === ''

/*
 * 응답 대기 상한. 서버가 응답하지 않을 때 화면이 로딩 상태로 멈춰 있는 걸 막는다.
 * 시간이 지나면 요청을 중단하고 에러로 처리하며, 호출부의 폴백(목데이터)이 동작한다.
 * AI 답변처럼 오래 걸리는 요청은 호출부에서 timeoutMs 를 늘려 쓴다.
 */
const DEFAULT_TIMEOUT = 15_000

// 공통 fetch 래퍼. JSON 응답을 파싱하고 에러를 표준화한다.
export async function request(path, options = {}) {
  const { timeoutMs = DEFAULT_TIMEOUT, ...fetchOptions } = options

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        // 개발용 사용자 헤더. 값이 있을 때만 붙인다.
        ...(DEV_USER_ID ? { 'X-User-Id': DEV_USER_ID } : {}),
        ...fetchOptions.headers,
      },
      ...fetchOptions,
    })
  } catch (error) {
    // 중단된 요청은 사유를 분명히 남긴다. (네트워크 오류와 구분)
    if (error?.name === 'AbortError') {
      throw new Error(`요청 시간 초과 (${timeoutMs}ms) ${path}`)
    }
    throw error
  } finally {
    clearTimeout(timer)
  }

  if (!response.ok) {
    throw new Error(`요청 실패 (${response.status}) ${path}`)
  }

  // 204 No Content 등 본문이 없는 경우 대비
  const text = await response.text()
  return text ? JSON.parse(text) : null
}

// 목데이터를 실제 API 호출처럼 Promise 로 감싸는 헬퍼.
// 네트워크 지연을 흉내 내 로딩 상태도 테스트할 수 있게 약간의 딜레이를 준다.
export function mockResponse(data, delay = 150) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(data)), delay)
  })
}

/*
 * 백엔드 우선 + 목데이터 폴백 헬퍼.
 *  - USE_MOCK(주소 미설정)이면 바로 목데이터를 돌려준다.
 *  - 주소가 있으면 실제 호출을 시도하고, 실패(연결 불가/에러)하면 목데이터로 폴백한다.
 *    => 백엔드가 켜져 있으면 실제 데이터, 아니면 화면이 깨지지 않고 목데이터가 보인다.
 *
 * apiCall: () => Promise<T>  실제 API 호출(+매핑) 함수
 * fallbackData: T           폴백으로 쓸 목데이터
 */
export async function withFallback(apiCall, fallbackData) {
  if (USE_MOCK) return mockResponse(fallbackData)
  try {
    return await apiCall()
  } catch (error) {
    // 개발 편의를 위해 폴백 사유를 콘솔에 남긴다.
    console.warn('[api] 백엔드 요청 실패, 목데이터로 대체합니다.', error)
    return mockResponse(fallbackData)
  }
}

// 오늘이 속한 달을 "YYYY-MM" 으로. (로컬 기준)
function currentMonthKey() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

/*
 * 조회 기준월. 기본은 오늘이 속한 달이라, 달이 바뀌면 자산·거래·일정 화면이 함께 넘어간다.
 *
 * VITE_BASE_MONTH 로 특정 달에 고정할 수 있다. (형식: "YYYY-MM")
 * 백엔드 시드 데이터가 특정 달(예: 2026-09)에만 있어서 그 달을 봐야 할 때 쓴다.
 * 고정해 두면 오늘이 다른 달이어도 화면은 계속 그 달을 보여주니, 시연이 끝나면 지우는 게 좋다.
 *
 * 앱을 켜 둔 상태로 자정이 지나는 경우는 새로고침할 때 반영된다.
 * (일정 화면의 달력·오늘 표시는 useToday() 로 실시간 갱신된다)
 */
export const BASE_MONTH = import.meta.env.VITE_BASE_MONTH || currentMonthKey()

// 기준월의 시작일/종료일을 ISO 문자열로 돌려준다.
//  "2026-09" -> { from: "2026-09-01", to: "2026-09-30" }
export function monthRange(baseMonth = BASE_MONTH) {
  const [year, month] = baseMonth.split('-').map(Number)
  const lastDay = new Date(year, month, 0).getDate()
  const mm = String(month).padStart(2, '0')
  return {
    from: `${year}-${mm}-01`,
    to: `${year}-${mm}-${String(lastDay).padStart(2, '0')}`,
  }
}
