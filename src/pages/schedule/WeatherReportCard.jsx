import { RefreshIcon, WarningIcon } from '../../assets/icons/index.jsx'
import { BoltIcon } from './icons.jsx'
import { formatClockTime, formatManwon } from '../../utils/format.js'

/*
 * 기상청 AI 리포트 카드.
 * 구조: 헤더(갱신 시각) → 하루 권장 자유 지출 → 자금 최저수위 구간 주의보
 *
 * 하루 권장 지출은 (가용자금 - 필수 고정비) / 급여일까지 남은 일수다.
 * 계산은 Schedule 에서 하고 이 컴포넌트는 표시만 담당한다.
 * 아래 시뮬레이터에서 절감 옵션을 켜면 그만큼 올라간 금액이 여기에 그대로 반영된다.
 *
 * 갱신 시각은 버튼이다. 누르면 계획 데이터를 다시 불러오고 시각도 새로 찍힌다.
 * 주의보 문장은 백엔드가 완성 문장(riskSummary)으로 주는 값을 그대로 보여준다.
 */
function WeatherReportCard({ plan, dailyBudget, baseDailyBudget, daysLeft, refreshing, onRefresh }) {
  const gain = dailyBudget - baseDailyBudget
  return (
    <section className="rounded-[18px] bg-surface px-[16px] py-[18px] shadow-[0_2px_12px_rgba(29,43,68,0.05)]">
      {/* 헤더 */}
      <div className="flex items-center justify-between gap-[8px]">
        <div className="flex min-w-0 items-center gap-[8px]">
          <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[8px] bg-[#155DFC] text-white">
            <BoltIcon size={15} />
          </span>
          <h2 className="truncate text-[14px] font-bold leading-[20px] text-[#0F172B]">기상청 AI 리포트</h2>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="리포트 다시 불러오기"
          className="flex shrink-0 items-center gap-[4px] rounded-full bg-[#F1F5F9] px-[8px] py-[3px] text-[11px] font-medium leading-[16px] text-[#62748E] transition-colors hover:text-[#314158] disabled:opacity-60"
        >
          <span className={refreshing ? 'animate-spin' : undefined}>
            <RefreshIcon size={12} />
          </span>
          {refreshing ? '갱신 중' : plan.updatedAt ? `${formatClockTime(plan.updatedAt)} 갱신` : '갱신'}
        </button>
      </div>

      {/* 하루 권장 자유 지출 */}
      <div className="mt-[12px] rounded-[14px] border-[0.791px] border-[#DBEAFE] bg-gradient-to-br from-[#F0F9FF] to-[#FFFFFF] px-[14px] py-[14px]">
        <p className="text-[12px] font-bold leading-[16px] text-[#1447E6]">급여일까지 하루 권장 자유 지출</p>
        <p className="mt-[2px] flex flex-wrap items-baseline gap-x-[4px] gap-y-[2px]">
          <span className="text-[28px] font-extrabold leading-[34px] text-[#0F172B]">
            {dailyBudget.toLocaleString('ko-KR')}
          </span>
          <span className="text-[14px] font-bold leading-[20px] text-[#314158]">원 / 일</span>
          {/* 아래 시뮬레이터에서 절감 옵션을 켠 만큼 늘어난 금액 */}
          {gain > 0 && (
            <span className="rounded-full bg-[#ECFDF5] px-[7px] py-[1px] text-[11px] font-bold leading-[16px] text-[#009966]">
              최적화 +{gain.toLocaleString('ko-KR')}원
            </span>
          )}
        </p>
        <p className="mt-[8px] text-[11px] font-normal leading-[17px] text-[#62748E]">
          현재 가용자금(<strong className="font-bold text-[#314158]">{formatManwon(plan.availableFunds)} 원</strong>)에서
          필수 고정비({plan.essentialLabel} {formatManwon(plan.essentialCost)})를 보존하고,{' '}
          {daysLeft > 0 ? `급여일까지 남은 ${daysLeft}일로` : '급여일인 오늘까지로'} 산정한 안전 지출 한도입니다.
        </p>
      </div>

      {/* 자금 최저수위 구간 주의보 */}
      {plan.riskSummary && (
        <div className="mt-[10px] flex items-start gap-[10px] rounded-[14px] border-[0.791px] border-[#FDE68A] bg-[#FFFBEB] px-[14px] py-[12px]">
          <span className="mt-[1px] shrink-0 text-[#B45309]">
            <WarningIcon size={14} />
          </span>
          <div>
            <p className="text-[12px] font-bold leading-[16px] text-[#B45309]">자금 최저수위 구간 주의보</p>
            <p className="mt-[2px] text-[11px] font-normal leading-[17px] text-[#8D5A0A]">{plan.riskSummary}</p>
          </div>
        </div>
      )}
    </section>
  )
}

export default WeatherReportCard
