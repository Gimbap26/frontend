import { useCallback, useEffect, useMemo } from 'react'
import { useAsync } from './useAsync.js'
import { fetchAccounts, fetchUpcomingExpenses, invalidateAccounts, subscribeAccounts } from '../api/assets.js'

/*
 * 계좌 목록 훅.
 * 총자산(totalAssets)까지 함께 돌려준다.
 * 서버가 계산한 총 잔액이 오면 그 값을 쓰고, 없으면 계좌 잔액을 합산한다.
 */
export function useAccounts() {
  const { data, loading, error, refetch } = useAsync(fetchAccounts)
  const accounts = useMemo(() => data?.accounts ?? [], [data])
  const totalAssets = useMemo(
    () => data?.totalBalance ?? accounts.reduce((sum, account) => sum + account.balance, 0),
    [data, accounts],
  )

  /*
   * 다른 화면에서 계좌를 다시 불러오면 여기도 같이 따라간다.
   * (헤더의 총자산과 본문의 계좌 목록이 서로 다른 값을 들고 있지 않게)
   */
  useEffect(() => subscribeAccounts(refetch), [refetch])

  /*
   * 다시 불러오기.
   * 캐시를 버리면 구독 중인 화면들이 모두 다시 조회하므로 여기서 refetch 를 따로 부르지 않는다.
   *
   * 지금은 화면에 잔액을 바꾸는 조작이 없어서 호출하는 곳이 없다.
   * 거래 등록이나 당겨서 새로고침을 붙일 때 이 함수를 연결하면 헤더와 본문이 함께 갱신된다.
   */
  const refresh = useCallback(() => {
    invalidateAccounts()
  }, [])

  return { accounts, totalAssets, loading, error, refresh }
}

/*
 * 이번 달 확정 지출 훅.
 * 합계(total)까지 파생 계산해서 함께 돌려준다.
 */
export function useUpcomingExpenses() {
  const { data, loading, error } = useAsync(fetchUpcomingExpenses)
  const expenses = useMemo(() => data ?? [], [data])
  const total = useMemo(
    () => expenses.reduce((sum, item) => sum + item.amount, 0),
    [expenses],
  )
  return { expenses, total, loading, error }
}
