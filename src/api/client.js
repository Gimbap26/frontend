/*
 * HTTP 클라이언트 (백엔드 연결용 공통 래퍼).
 *
 * 현재는 목데이터 모드라 실제로 호출되지 않지만,
 * 백엔드가 붙으면 api 함수들이 이 request()를 사용하도록 바꾸면 된다.
 * API 주소는 .env 의 VITE_API_BASE_URL 로 설정한다.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

// 목데이터로 동작할지 여부. API 주소가 비어 있으면 목 모드로 본다.
export const USE_MOCK = BASE_URL === ''

// 공통 fetch 래퍼. JSON 응답을 파싱하고 에러를 표준화한다.
export async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
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
