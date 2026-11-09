import {
  clearAccessToken,
  ensureAuthenticated,
} from './auth.js'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

// 목데이터로 동작할지 여부. API 주소가 비어 있으면 목 모드로 본다.
export const USE_MOCK = BASE_URL === ''

const buildUrl = (path, params = {}) => {
  const url = new URL(`${BASE_URL}${path}`)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value)
    }
  })

  return url
}

const sendRequest = async (path, options, token, canRetry) => {
  const { params, headers, ...fetchOptions } = options
  const response = await fetch(buildUrl(path, params), {
    ...fetchOptions,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })

  if (response.status === 401 && canRetry) {
    clearAccessToken(token)
    const refreshedToken = await ensureAuthenticated({ force: true })
    return sendRequest(path, options, refreshedToken, false)
  }

  if (!response.ok) {
    throw new Error(`요청 실패 (${response.status}) ${path}`)
  }

  // 204 No Content 등 본문이 없는 경우 대비
  const text = await response.text()
  return text ? JSON.parse(text) : null
}

// 인증이 필요한 JSON API를 호출하고, 만료된 토큰은 한 번 재발급한다.
export async function request(path, options = {}) {
  const token = await ensureAuthenticated()
  return sendRequest(path, options, token, true)
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

// 현재 날짜의 연-월을 "YYYY-MM" 형식으로 돌려준다.
const currentMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

/*
 * 조회 기준월. 기본은 현재 월이다.
 * VITE_BASE_MONTH 로 특정 월을 지정할 수 있다. (형식: "YYYY-MM", 예: 시연 데이터 "2026-09")
 * 값이 없거나 비어 있으면 현재 월을 사용한다.
 */
const ENV_BASE_MONTH = (import.meta.env.VITE_BASE_MONTH ?? '').trim()
export const BASE_MONTH = ENV_BASE_MONTH || currentMonth()

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
