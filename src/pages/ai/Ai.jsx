import { useEffect, useRef, useState } from 'react'
import { AiIcon } from '../../assets/icons/index.jsx'
import { EvidenceIcon } from './icons.jsx'
import sendIcon from '../../assets/icons/send.svg'
import { useAgent } from '../../hooks/useAgent.js'

/*
 * AI 분석 에이전트 화면. (피그마 시안 기준)
 * 구조: 헤더(고정) → 대화 영역(스크롤) → 추천 질문 칩 + 입력창(하단 고정)
 *
 * AI 답변은 매번 유동적이라(길이/근거/출처가 다름) 아래를 전제로 렌더한다.
 *  - content 는 빈 줄(\n\n) 기준으로 문단을 나눠 표시 → 길이에 관계없이 안전
 *  - evidence(근거 한 줄)는 있을 때만 표시
 *  - 답변 대기 중에는 로딩 점을 보여준다
 */

// AI 봇 아바타 (파란 원 + 봇 아이콘). 시안: 28px 원, #155DFC
function BotAvatar() {
  return (
    <div className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full bg-[#155DFC] text-white">
      <AiIcon size={16} />
    </div>
  )
}

// 한 개의 메시지 말풍선
// 사용자: 오른쪽 파란 말풍선 (우하단 4px)
// AI: 왼쪽 흰 말풍선 (좌하단 4px) + 근거 줄은 말풍선 "밖 아래"에 따로 표시
function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  // 문단 분리: 빈 줄 기준. 단일 줄바꿈은 문단 안에서 유지한다.
  const paragraphs = message.content.split(/\n{2,}/)

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%] rounded-[16px] rounded-br-[4px] bg-[#155DFC] px-[16px] py-[12px] text-[14px] leading-[20px] tracking-[-0.7px] text-white">
          {paragraphs.map((p, i) => (
            <p key={i} className={i > 0 ? 'mt-[8px] whitespace-pre-line' : 'whitespace-pre-line'}>
              {p}
            </p>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-[8px]">
      <BotAvatar />
      {/* 말풍선 + 근거 줄을 세로로 묶는다 (근거는 말풍선 밖 아래) */}
      <div className="flex max-w-[82%] flex-col">
        <div className="rounded-[16px] rounded-bl-[4px] bg-surface px-[16px] py-[12px] shadow-[0_2px_12px_rgba(29,43,68,0.05)]">
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className={`text-[14px] leading-[20px] tracking-[-0.7px] text-[#1D293D] ${
                i > 0 ? 'mt-[10px] whitespace-pre-line' : 'whitespace-pre-line'
              }`}
            >
              {p}
            </p>
          ))}
        </div>

        {/* 근거 줄 (있을 때만) - 말풍선 밖 아래, padding 0 12 8 12 / gap 6 */}
        {message.evidence && (
          <div className="flex items-center gap-[6px] px-[12px] pt-[8px] text-[12px] leading-[20px] tracking-[-0.7px] text-[#62748E]">
            <EvidenceIcon size={13} />
            <span>{message.evidence}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// AI 답변 대기 중 로딩 점
function TypingBubble() {
  return (
    <div className="flex items-start gap-[8px]">
      <BotAvatar />
      <div className="flex items-center gap-[4px] rounded-[16px] rounded-bl-[4px] bg-surface px-[16px] py-[14px] shadow-[0_2px_12px_rgba(29,43,68,0.05)]">
        <span className="h-[6px] w-[6px] animate-bounce rounded-full bg-[#90A1B9] [animation-delay:-0.2s]" />
        <span className="h-[6px] w-[6px] animate-bounce rounded-full bg-[#90A1B9] [animation-delay:-0.1s]" />
        <span className="h-[6px] w-[6px] animate-bounce rounded-full bg-[#90A1B9]" />
      </div>
    </div>
  )
}

// 추천 질문 칩 가로 줄.
// 터치에서는 기본 스크롤, 데스크톱(윈도우)에서는 마우스 드래그로도 좌우 스크롤 가능하게 한다.
function SuggestionRow({ suggestions, disabled, onPick }) {
  const rowRef = useRef(null)
  const drag = useRef({ active: false, moved: false, startX: 0, startScroll: 0 })

  function onPointerDown(event) {
    const el = rowRef.current
    if (!el) return
    drag.current = { active: true, moved: false, startX: event.clientX, startScroll: el.scrollLeft }
  }

  function onPointerMove(event) {
    const el = rowRef.current
    if (!el || !drag.current.active) return
    const dx = event.clientX - drag.current.startX
    if (Math.abs(dx) > 3) drag.current.moved = true
    el.scrollLeft = drag.current.startScroll - dx
  }

  function endDrag() {
    drag.current.active = false
  }

  // 세로 휠을 가로 스크롤로 변환 (데스크톱 편의)
  function onWheel(event) {
    const el = rowRef.current
    if (!el) return
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      el.scrollLeft += event.deltaY
    }
  }

  return (
    <div className="shrink-0 border-b border-[#F1F5F9] bg-white px-[16px] py-[10px]">
      <div
        ref={rowRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onWheel={onWheel}
        className="no-scrollbar flex gap-[8px] overflow-x-auto overscroll-x-contain [touch-action:pan-x] [cursor:grab] active:[cursor:grabbing]"
      >
        {suggestions.map((text) => (
          <button
            key={text}
            type="button"
            // 드래그로 이동한 경우엔 클릭(질문 전송)을 막는다.
            onClick={() => {
              if (drag.current.moved) return
              onPick(text)
            }}
            disabled={disabled}
            className="shrink-0 whitespace-nowrap rounded-full border-[0.791px] border-[#DBEAFE] bg-[#EFF6FF] px-[12px] py-[6px] text-[12px] font-medium leading-[16px] tracking-[-0.7px] text-[#1447E6] select-none disabled:opacity-50"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  )
}

function Ai() {
  const { messages, suggestions, sending, send } = useAgent()
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)

  // 새 메시지/로딩 상태 변화 시 맨 아래로 스크롤
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, sending])

  function handleSubmit(event) {
    event.preventDefault()
    if (!input.trim() || sending) return
    send(input)
    setInput('')
  }

  function handleSuggestion(text) {
    if (sending) return
    send(text)
  }

  return (
    <div className="flex h-full flex-col bg-canvas">
      {/* 헤더 */}
      <header className="shrink-0 bg-surface px-[20px] pt-[48px] pb-[16px]">
        <h1 className="text-[18px] font-bold leading-[24px] tracking-[-0.7px] text-[#0F172B]">
          AI 분석 에이전트
        </h1>
        <p className="mt-[2px] text-[12px] leading-[16px] tracking-[-0.7px] text-[#90A1B9]">
          금융 데이터 기반 맞춤 분석
        </p>
      </header>

      {/* 대화 영역 (스크롤) */}
      <div ref={scrollRef} className="no-scrollbar flex-1 overflow-y-auto px-[16px] py-[16px]">
        <div className="flex flex-col gap-[16px]">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {sending && <TypingBubble />}
        </div>
      </div>

      {/* 추천 질문 칩 (흰 배경 + 하단 구분선) */}
      {suggestions.length > 0 && (
        <SuggestionRow suggestions={suggestions} disabled={sending} onPick={handleSuggestion} />
      )}

      {/* 입력창 (흰 배경 + 상단 구분선, padding 12 16) */}
      <div className="shrink-0 border-t border-[#F1F5F9] bg-white px-[16px] py-[12px]">
        <form onSubmit={handleSubmit} className="flex items-center gap-[8px]">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="이번 달 금융에 대해 물어보세요"
            className="h-[44px] flex-1 rounded-full bg-[#F1F5F9] px-[18px] text-[14px] tracking-[-0.7px] text-ink placeholder:text-[#90A1B9] focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            aria-label="전송"
            className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-[#155DFC] transition-colors disabled:bg-[#E2E8F0]"
          >
            <img src={sendIcon} alt="" width={16} height={16} />
          </button>
        </form>
      </div>
    </div>
  )
}

export default Ai
