import { useCallback, useEffect, useRef, useState } from 'react'
import { agentGreeting } from '../data/mockData.js'
import {
  createConversation,
  fetchMessages,
  fetchSuggestions,
  sendChat,
} from '../api/agent.js'

/*
 * AI 분석 에이전트 대화 훅.
 *
 * - messages: 화면에 표시할 메시지 목록 { id, role, content, evidence, sources }
 * - suggestions: 추천 질문 목록
 * - sending: AI 답변 대기 중 여부 (로딩 표시용)
 * - send(text): 사용자 메시지를 낙관적으로 추가하고 AI 답변을 이어붙인다.
 *
 * 대화 유지:
 *  - conversationId 를 localStorage 에 저장해, 새로고침해도 이어진다.
 *  - 진입 시 저장된 id 가 있으면 이전 대화를 불러오고(fetchMessages),
 *    없으면 새 세션을 만들고 인사 메시지를 보여준다.
 *  - (목 모드에서는 저장된 대화가 없어 항상 인사말부터 시작한다.)
 */

const STORAGE_KEY = 'mw.agent.conversationId'

function loadStoredId() {
  try {
    return localStorage.getItem(STORAGE_KEY) || null
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

export function useAgent() {
  const [messages, setMessages] = useState([agentGreeting])
  const [suggestions, setSuggestions] = useState([])
  const [sending, setSending] = useState(false)
  const conversationIdRef = useRef(null)

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
    const userMessage = {
      id: `user-${Date.now()}`,
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
          id: `err-${Date.now()}`,
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

  return { messages, suggestions, sending, send }
}
