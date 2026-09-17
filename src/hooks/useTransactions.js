import { useMemo } from 'react'
import { useAsync } from './useAsync.js'
import { fetchTransactions } from '../api/transactions.js'

/*
 * 거래 내역 훅.
 */
export function useTransactions() {
  const { data, loading, error } = useAsync(fetchTransactions)
  const transactions = useMemo(() => data ?? [], [data])
  return { transactions, loading, error }
}
