import { useCallback, useEffect, useRef, useState } from 'react'
import { agentGreeting } from '../data/mockData.js'
import {
  createConversation,
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
 * 첫 진입 시 인사 메시지를 기본으로 보여주고, 추천 질문과 대화 세션을 준비한다.
 * 답변은 매번 유동적이라 화면은 content/evidence/sources 유무에 맞춰 렌더한다.
 */
export function useAgent() {
  const [messages, setMessages] = useState([agentGreeting])
  const [suggestions, setSuggestions] = useState([])
  const [sending, setSending] = useState(false)
  const conversationIdRef = useRef(null)

  // 진입 시: 추천 질문 로드 + 대화 세션 생성
  useEffect(() => {
    let active = true

    fetchSuggestions().then((list) => {
      if (active) setSuggestions(list)
    })

    createConversation()
      .then((data) => {
        if (active) conversationIdRef.current = data?.conversationId ?? null
      })
      .catch(() => {
        // 세션 생성 실패해도 대화는 가능하게 둔다(백엔드가 conversationId 없이도 처리 가능하도록).
        if (active) conversationIdRef.current = null
      })

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
      // 응답에 conversationId 가 새로 왔으면 갱신
      if (aiMessage?.conversationId) conversationIdRef.current = aiMessage.conversationId
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
