import { useCallback, useEffect, useState } from 'react'

/*
 * 비동기 데이터 요청을 표준화하는 범용 훅.
 * { data, loading, error, refetch } 형태로 상태를 돌려준다.
 *
 * asyncFn: () => Promise<T> 형태의 함수 (api 함수)
 *   - 호출부에서 값이 바뀔 여지가 있으면 useCallback 으로 감싸서 넘긴다.
 *
 * 마운트 시 데이터를 한 번 불러오고, refetch() 로 수동 재요청할 수 있다.
 * 언마운트 후 상태 갱신을 막아 경고/메모리 누수를 방지한다.
 */
export function useAsync(asyncFn) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // 재요청 트리거. 값을 증가시키면 아래 effect 가 다시 돈다.
  const [reloadKey, setReloadKey] = useState(0)

  const refetch = useCallback(() => setReloadKey((key) => key + 1), [])

  useEffect(() => {
    let active = true
    // 요청 시작 시 로딩/에러 상태 초기화 (데이터 페칭 훅에서 의도된 동작).
    // eslint-disable-next-line react/set-state-in-effect
    setLoading(true)
    setError(null)

    asyncFn()
      .then((result) => {
        if (active) setData(result)
      })
      .catch((err) => {
        if (active) setError(err)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [asyncFn, reloadKey])

  return { data, loading, error, refetch }
}
