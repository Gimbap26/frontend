import { DiningIcon, SlidersIcon, SubscriptionIcon } from './icons.jsx'
import { WEATHER, WEATHER_SUMMARY, improveWeather } from './scheduleModel.js'
import { formatWon } from '../../utils/format.js'

/*
 * 스마트 지출 최적화 시뮬레이터.
 * 절감 옵션을 켜면 하루 권장 지출이 얼마나 늘고 자금 날씨가 몇 단계 좋아지는지 보여준다.
 *
 * 켠 옵션 상태와 금액 계산은 Schedule 이 갖고 있다.
 * 같은 값을 위쪽 AI 리포트도 쓰기 때문에, 토글을 켜면 리포트 금액도 함께 바뀐다.
 * 날씨는 켠 개수만큼 등급 사다리를 올린다. (STORM → RAINY → CLOUDY → SUNNY)
 *
 * 백엔드 연결 시 POST /available-funds/simulations 결과로 대체할 수 있다.
 */

// 옵션 아이콘 (mockData 의 icon 값과 연결)
const OPTION_ICON = {
  subscription: SubscriptionIcon,
  dining: DiningIcon,
}

// 결과 박스 색: 개선 단계가 올라갈수록 파랑이 진해진다.
const RESULT_TONE = [
  { box: 'border-[#E2E8F0] bg-[#F8FAFC]', badge: 'border-[0.791px] border-[#E2E8F0] bg-surface text-[#62748E]' },
  { box: 'border-[#DBEAFE] bg-[#EFF6FF]', badge: 'bg-[#155DFC] text-white' },
  { box: 'border-[#BAE6FD] bg-[#E0F2FE]', badge: 'bg-[#1447E6] text-white' },
]

function Toggle({ on, label, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className={`relative h-[24px] w-[44px] shrink-0 rounded-full transition-colors ${on ? 'bg-[#155DFC]' : 'bg-[#CAD5E2]'}`}
    >
      <span
        className={`absolute top-[2px] left-0 h-[20px] w-[20px] rounded-full bg-white shadow-[0_1px_3px_rgba(29,43,68,0.2)] transition-transform ${
          on ? 'translate-x-[22px]' : 'translate-x-[2px]'
        }`}
      />
    </button>
  )
}

function SpendingSimulator({ options, picked, onToggle, dailyBudget, baseDailyBudget, baseWeather }) {
  const gain = dailyBudget - baseDailyBudget
  const steps = picked.length
  const weather = steps === 0 ? baseWeather : improveWeather(baseWeather, steps)
  const tone = RESULT_TONE[Math.min(steps, RESULT_TONE.length - 1)]

  return (
    <section className="rounded-[18px] bg-surface px-[16px] py-[18px] shadow-[0_2px_12px_rgba(29,43,68,0.05)]">
      {/* 헤더 */}
      <div className="flex items-center gap-[8px]">
        <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[8px] bg-[#EFF6FF] text-[#155DFC]">
          <SlidersIcon size={15} />
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-[14px] font-bold leading-[20px] text-[#0F172B]">스마트 지출 최적화 시뮬레이터</h2>
          <p className="truncate text-[11px] font-medium leading-[16px] text-[#90A1B9]">
            소비를 조율하면 금융 날씨가 어떻게 바뀌는지 볼 수 있어요
          </p>
        </div>
      </div>

      {/* 절감 옵션 토글 */}
      <div className="mt-[12px] flex flex-col gap-[8px]">
        {options.map((option) => {
          const Icon = OPTION_ICON[option.icon] ?? SubscriptionIcon
          const on = picked.includes(option.id)
          return (
            <div
              key={option.id}
              className="flex items-center justify-between gap-[10px] rounded-[14px] border-[0.791px] border-hairline bg-[#F8FAFC] px-[14px] py-[12px]"
            >
              <div className="flex min-w-0 items-center gap-[10px]">
                <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-surface text-[#155DFC] shadow-[0_1px_4px_rgba(29,43,68,0.06)]">
                  <Icon size={18} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-bold leading-[16px] text-[#1D293D]">{option.title}</p>
                  <p className="mt-[2px] text-[11px] font-semibold leading-[16px] text-[#155DFC]">
                    +{option.saving.toLocaleString('ko-KR')}원 {option.effect}
                  </p>
                </div>
              </div>
              <Toggle on={on} label={option.title} onChange={() => onToggle(option.id)} />
            </div>
          )
        })}
      </div>

      {/* 결과 */}
      <div
        className={`mt-[10px] flex items-center justify-between gap-[10px] rounded-[14px] border-[0.791px] px-[14px] py-[11px] transition-colors ${tone.box}`}
      >
        <div className="flex min-w-0 items-center gap-[10px]">
          <span className="text-[20px] leading-none">{WEATHER[weather]?.emoji ?? '☁️'}</span>
          <div className="min-w-0">
            <p className="truncate text-[12px] font-bold leading-[16px] text-[#1D293D]">
              {steps === 0 ? '현재' : '예상 날씨'}: {WEATHER_SUMMARY[weather] ?? '구름'}
            </p>
            <p className="truncate text-[11px] font-medium leading-[16px] text-[#62748E]">
              {steps === 0
                ? '토글을 켜서 지출을 아껴보세요'
                : `하루 자유 지출 ${formatWon(dailyBudget)} (+${gain.toLocaleString('ko-KR')}원)`}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-[10px] py-[4px] text-[11px] font-semibold leading-[16px] whitespace-nowrap transition-colors ${tone.badge}`}
        >
          {steps === 0 ? '기본 상태' : `${steps}단계 상향`}
        </span>
      </div>
    </section>
  )
}

export default SpendingSimulator
