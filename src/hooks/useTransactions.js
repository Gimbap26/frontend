import { useCallback, useMemo } from 'react'
import { useAsync } from './useAsync.js'
import { fetchTransactions } from '../api/transactions.js'
import { BASE_MONTH } from '../api/client.js'

/*
 * 거래 내역 훅.
 * baseMonth("YYYY-MM")를 넘기면 그 달을, 없으면 기준월을 조회한다.
 * 화면이 "어느 달 내역인지" 표시할 수 있도록 조회한 월도 함께 돌려준다.
 */
export function useTransactions(baseMonth = BASE_MONTH) {
  const fetcher = useCallback(() => fetchTransactions(baseMonth), [baseMonth])
  const { data, loading, error } = useAsync(fetcher)
  const transactions = useMemo(() => data ?? [], [data])
  return { transactions, month: baseMonth, loading, error }
}
