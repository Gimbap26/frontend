import { useNavigate } from 'react-router-dom'
import { BulbIcon } from './icons.jsx'

/*
 * AI 빠른 질문 칩.
 * 일정 화면에서 궁금한 걸 바로 물어볼 수 있게, 칩을 누르면 AI 화면으로 이동하면서
 * 그 질문을 함께 넘긴다. (AI 화면이 진입 직후 자동으로 질문을 보낸다)
 *
 * 질문 목록은 AI 추천 질문(agent/suggestions)을 그대로 쓴다.
 * 여기서는 상태 배지를 두지 않는다. 이 화면에서 AI가 돌고 있는 게 아니라
 * 칩을 눌러 AI 화면으로 넘어간 뒤에 질문이 처리되기 때문이다.
 */

// 칩 앞에 붙는 이모지. 질문 순서대로 돌려 쓴다.
const CHIP_EMOJI = ['💬', '☁️', '💡']

function QuickPrompts({ prompts }) {
  const navigate = useNavigate()

  if (prompts.length === 0) return null

  return (
    <section>
      <div className="flex min-w-0 items-center gap-[8px] px-[2px]">
        <span className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full bg-[#155DFC] text-white">
          <BulbIcon size={14} />
        </span>
        <h2 className="truncate text-[14px] font-bold leading-[20px] text-[#0F172B]">AI 금융 기상캐스터</h2>
      </div>

      <div className="no-scrollbar mt-[8px] flex gap-[8px] overflow-x-auto">
        {prompts.map((prompt, index) => (
          <button
            key={prompt}
            type="button"
            onClick={() => navigate('/ai', { state: { question: prompt } })}
            className="flex shrink-0 items-center gap-[6px] whitespace-nowrap rounded-[14px] border-[0.791px] border-[#E2E8F0] bg-surface px-[12px] py-[8px] text-[12px] font-medium leading-[16px] text-[#314158] shadow-[0_2px_8px_rgba(29,43,68,0.04)] transition-colors hover:border-[#DBEAFE]"
          >
            <span>{CHIP_EMOJI[index % CHIP_EMOJI.length]}</span>
            {prompt}
          </button>
        ))}
      </div>
    </section>
  )
}

export default QuickPrompts
