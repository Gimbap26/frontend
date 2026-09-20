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

// 공통 fetch 래퍼. JSON 응답을 파싱하고 에러를 표준화한다.
export async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      // 개발용 사용자 헤더. 값이 있을 때만 붙인다.
      ...(DEV_USER_ID ? { 'X-User-Id': DEV_USER_ID } : {}),
      ...options.headers,
    },
    ...options,
  })

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

/*
 * 조회 기준월. 백엔드 시드/시연 데이터가 2026-09 기준이라 그 달을 본다.
 * 실서비스 전환 시 현재 월(new Date()) 기준으로 바꾸면 된다.
 * VITE_BASE_MONTH 로 재정의할 수 있다. (형식: "YYYY-MM")
 */
export const BASE_MONTH = import.meta.env.VITE_BASE_MONTH ?? '2026-09'

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
