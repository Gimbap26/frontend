/*
 * 로딩 / 에러 상태를 일관되게 보여주는 래퍼.
 * 데이터 로딩이 끝나면 children 을 렌더한다.
 *
 * 사용 예)
 *   <AsyncBoundary loading={loading} error={error}>
 *     ...실제 화면...
 *   </AsyncBoundary>
 */
function AsyncBoundary({ loading, error, children }) {
  if (loading) {
    return <p className="py-[40px] text-center text-[13px] text-muted">불러오는 중...</p>
  }
  if (error) {
    return (
      <p className="py-[40px] text-center text-[13px] text-danger">
        데이터를 불러오지 못했어요
      </p>
    )
  }
  return children
}

export default AsyncBoundary
