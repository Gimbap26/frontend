import { useMemo } from 'react'
import { useAsync } from './useAsync.js'
import { fetchAccounts, fetchUpcomingExpenses } from '../api/assets.js'

/*
 * 계좌 목록 훅.
 * 총자산(totalAssets)까지 파생 계산해서 함께 돌려준다.
 */
export function useAccounts() {
  const { data, loading, error } = useAsync(fetchAccounts)
  const accounts = useMemo(() => data ?? [], [data])
  const totalAssets = useMemo(
    () => accounts.reduce((sum, account) => sum + account.balance, 0),
    [accounts],
  )
  return { accounts, totalAssets, loading, error }
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
