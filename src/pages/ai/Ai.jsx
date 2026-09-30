import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AiIcon } from '../../assets/icons/index.jsx'
import { EvidenceIcon, PlusIcon } from './icons.jsx'
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
        {/* 화면 낭독기에는 상태를 글로 알린다. */}
        <span className="sr-only">답변을 작성하고 있어요</span>
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
  const { messages, suggestions, sending, send, reset } = useAgent()
  // 인사말만 있는 상태는 "아직 대화 전"으로 본다. (새 대화 버튼을 숨긴다)
  const hasConversation = messages.length > 1
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  // 다른 화면(일정의 빠른 질문 칩)에서 넘어온 질문. 진입 직후 한 번만 보낸다.
  const { pathname, state } = useLocation()
  const navigate = useNavigate()
  const pendingQuestion = useRef(state?.question ?? null)

  /*
   * 새 메시지가 오면 아래로 스크롤한다.
   * 단 사용자가 위쪽 과거 대화를 읽고 있을 때는 끌어내리지 않는다.
   * (내가 방금 질문을 보낸 경우에는 답을 봐야 하니 항상 내린다)
   */
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    if (nearBottom || sending) el.scrollTop = el.scrollHeight
  }, [messages, sending])

  useEffect(() => {
    const question = pendingQuestion.current
    if (!question) return
    // 먼저 비워서 같은 질문이 다시 전송되지 않게 한다.
    pendingQuestion.current = null
    // 새로고침하면 history 에 남은 state 로 같은 질문이 또 전송되므로 state 를 비운다.
    navigate(pathname, { replace: true, state: null })
    send(question)
  }, [send, navigate, pathname])

  /*
   * 답변이 끝나면 바로 이어서 물어볼 수 있게 입력창에 포커스를 돌려준다.
   * 화면에 들어온 직후에는 포커스를 주지 않는다. 모바일에서 키보드가 바로 올라오기 때문이다.
   * (전송 중 -> 완료로 바뀌는 순간에만 돌려준다)
   */
  const wasSending = useRef(false)
  useEffect(() => {
    if (wasSending.current && !sending) inputRef.current?.focus()
    wasSending.current = sending
  }, [sending])

  function handleSubmit(event) {
    event.preventDefault()
    if (!input.trim() || sending) return
    send(input)
    setInput('')
  }

  /*
   * 한글 입력 중(IME 조합 중) 엔터는 조합을 끝내는 키라서 전송하지 않는다.
   * 이 처리가 없으면 마지막 글자가 잘리거나 같은 질문이 두 번 나갈 수 있다.
   */
  function handleKeyDown(event) {
    if (event.key === 'Enter' && event.nativeEvent.isComposing) {
      event.preventDefault()
    }
  }

  function handleSuggestion(text) {
    if (sending) return
    send(text)
  }

  return (
    <div className="flex h-full flex-col bg-canvas">
      {/* 헤더 */}
      <header className="shrink-0 bg-surface px-[20px] pt-[48px] pb-[16px]">
        <div className="flex items-start justify-between gap-[10px]">
          <div className="min-w-0">
            <h1 className="text-[18px] font-bold leading-[24px] tracking-[-0.7px] text-[#0F172B]">
              AI 분석 에이전트
            </h1>
            <p className="mt-[2px] text-[12px] leading-[16px] tracking-[-0.7px] text-[#90A1B9]">
              금융 데이터 기반 맞춤 분석
            </p>
          </div>

          {/* 대화를 시작한 뒤에만 보인다. 누르면 지금 대화를 비우고 새로 시작한다. */}
          {hasConversation && (
            <button
              type="button"
              onClick={reset}
              disabled={sending}
              className="mt-[3px] flex shrink-0 items-center gap-[5px] rounded-full border-[0.791px] border-[#DBEAFE] bg-[#EFF6FF] px-[11px] py-[6px] text-[12px] font-semibold leading-[16px] tracking-[-0.7px] text-[#1447E6] transition-colors hover:border-[#BFDBFE] hover:bg-[#DBEAFE] active:scale-[0.97] disabled:opacity-45"
            >
              <PlusIcon size={12} />
              새 대화
            </button>
          )}
        </div>
      </header>

      {/* 대화 영역 (스크롤). 새 답변을 화면 낭독기가 읽을 수 있게 log 로 알린다. */}
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-label="AI 대화"
        className="no-scrollbar flex-1 overflow-y-auto px-[16px] py-[16px]"
      >
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
            ref={inputRef}
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
            aria-label="질문 입력"
            placeholder={sending ? '답변을 기다리고 있어요' : '이번 달 금융에 대해 물어보세요'}
            className="h-[44px] flex-1 rounded-full bg-[#F1F5F9] px-[18px] text-[14px] tracking-[-0.7px] text-ink placeholder:text-[#90A1B9] focus:outline-none disabled:text-[#90A1B9]"
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
