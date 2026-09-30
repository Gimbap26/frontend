import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { agentGreeting } from '../data/mockData.js'
import { useAsync } from './useAsync.js'
import { USE_MOCK } from '../api/client.js'
import {
  createConversation,
  fetchMessages,
  fetchSuggestions,
  isMockConversationId,
  sendChat,
} from '../api/agent.js'

/*
 * AI 분석 에이전트 대화 훅.
 *
 * - messages: 화면에 표시할 메시지 목록 { id, role, content, evidence, sources }
 * - suggestions: 추천 질문 목록
 * - sending: AI 답변 대기 중 여부 (로딩 표시용)
 * - send(text): 사용자 메시지를 낙관적으로 추가하고 AI 답변을 이어붙인다.
 * - reset(): 대화를 비우고 새로 시작한다.
 *
 * 대화 유지:
 *  - conversationId 를 localStorage 에 저장해, 새로고침해도 이어진다.
 *  - 주고받은 메시지는 sessionStorage 에 함께 저장한다.
 *    다른 탭에 갔다 와도(컴포넌트가 사라져도) 대화가 그대로 남아야 하기 때문이다.
 *    백엔드가 붙으면 저장된 대화를 서버에서 다시 받아 덮어쓴다.
 *  - 목 모드에서 만든 id("mock-")는 서버에 없는 값이라, 백엔드가 붙으면 버리고 새로 시작한다.
 */

const STORAGE_KEY = 'mw.agent.conversationId'
const MESSAGES_KEY = 'mw.agent.messages'
// sessionStorage 가 무한히 커지지 않게 최근 대화만 남긴다.
const MESSAGES_LIMIT = 60

function loadStoredId() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) || null
    // 목 모드에서 만든 id 를 실제 서버에 보내면 "없는 대화"로 거부된다. 미리 버린다.
    if (stored && !USE_MOCK && isMockConversationId(stored)) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return stored
  } catch {
    return null
  }
}

function saveStoredId(id) {
  try {
    if (id) localStorage.setItem(STORAGE_KEY, String(id))
  } catch {
    // localStorage 사용 불가 환경은 무시 (대화 유지만 안 될 뿐 동작엔 지장 없음)
  }
}

function loadStoredMessages() {
  try {
    const raw = sessionStorage.getItem(MESSAGES_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null
  } catch {
    return null
  }
}

function saveStoredMessages(messages) {
  try {
    sessionStorage.setItem(MESSAGES_KEY, JSON.stringify(messages.slice(-MESSAGES_LIMIT)))
  } catch {
    // 저장 실패는 무시한다. (대화는 화면에 그대로 남는다)
  }
}

function clearStored() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(MESSAGES_KEY)
  } catch {
    // 무시
  }
}

export function useAgent() {
  // 이전에 주고받은 대화가 있으면 그대로 이어서 보여준다. (탭 이동/새로고침 대비)
  const [messages, setMessages] = useState(() => loadStoredMessages() ?? [agentGreeting])
  const [suggestions, setSuggestions] = useState([])
  const [sending, setSending] = useState(false)
  const conversationIdRef = useRef(null)
  const messageSeq = useRef(0)

  // 대화가 바뀔 때마다 저장해 둔다. (인사말만 있는 상태는 저장하지 않는다)
  useEffect(() => {
    if (messages.length > 1) saveStoredMessages(messages)
  }, [messages])

  // 진입 시: 추천 질문 로드 + 이전 대화 복원 or 새 세션 생성
  useEffect(() => {
    let active = true

    fetchSuggestions().then((list) => {
      if (active) setSuggestions(list)
    })

    const storedId = loadStoredId()

    if (storedId) {
      // 저장된 대화가 있으면 복원 시도
      conversationIdRef.current = storedId
      fetchMessages(storedId)
        .then((history) => {
          if (!active) return
          // 이전 대화가 있으면 그걸 보여주고, 비어 있으면 인사말 유지
          if (Array.isArray(history) && history.length > 0) {
            setMessages(history)
          }
        })
        .catch(() => {
          // 복원 실패 시 인사말 그대로 둔다.
        })
    } else {
      // 새 세션 생성
      createConversation()
        .then((data) => {
          if (!active) return
          const id = data?.conversationId ?? null
          conversationIdRef.current = id
          saveStoredId(id)
        })
        .catch(() => {
          if (active) conversationIdRef.current = null
        })
    }

    return () => {
      active = false
    }
  }, [])

  const send = useCallback(async (text) => {
    const trimmed = text?.trim()
    if (!trimmed || sending) return

    // 1) 사용자 메시지 낙관적 추가
    //    같은 밀리초에 두 건이 생겨도 key 가 겹치지 않게 순번을 붙인다.
    messageSeq.current += 1
    const userMessage = {
      id: `user-${Date.now()}-${messageSeq.current}`,
      role: 'user',
      content: trimmed,
      evidence: null,
      sources: [],
    }
    setMessages((prev) => [...prev, userMessage])
    setSending(true)

    // 2) AI 답변 요청
    try {
      const aiMessage = await sendChat(conversationIdRef.current, trimmed)
      // 응답에 conversationId 가 새로 왔으면 갱신 + 저장
      if (aiMessage?.conversationId) {
        conversationIdRef.current = aiMessage.conversationId
        saveStoredId(aiMessage.conversationId)
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch {
      // withFallback 이 목데이터로 막아주지만, 그래도 실패하면 안내 메시지를 남긴다.
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}-${messageSeq.current}`,
          role: 'assistant',
          content: '답변을 불러오지 못했어요. 잠시 후 다시 시도해주세요.',
          evidence: null,
          sources: [],
        },
      ])
    } finally {
      setSending(false)
    }
  }, [sending])

  /*
   * 대화 초기화. 저장된 대화와 id 를 지우고 새 세션을 만든다.
   * (같은 대화에 계속 쌓이는 것 말고 처음부터 다시 물어보고 싶을 때)
   */
  const reset = useCallback(() => {
    if (sending) return
    clearStored()
    conversationIdRef.current = null
    setMessages([agentGreeting])

    createConversation()
      .then((data) => {
        const id = data?.conversationId ?? null
        conversationIdRef.current = id
        saveStoredId(id)
      })
      .catch(() => {
        conversationIdRef.current = null
      })
  }, [sending])

  return { messages, suggestions, sending, send, reset }
}

/*
 * 추천 질문만 필요한 화면용 훅. (일정 화면의 AI 빠른 질문 칩)
 * 대화 세션은 만들지 않고 질문 목록만 가져온다.
 */
export function useAgentSuggestions() {
  const { data, loading, error } = useAsync(fetchSuggestions)
  const suggestions = useMemo(() => data ?? [], [data])
  return { suggestions, loading, error }
}
