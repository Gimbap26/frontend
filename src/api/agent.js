/*
 * AI 분석 에이전트 도메인 API.
 * 대화 세션 생성, 질문/답변, 대화 내역 조회, 추천 질문 조회.
 *
 * 백엔드(agent) 응답은 그때그때 유동적이라(답변 길이/근거/출처가 매번 다름),
 * 프론트에서 다루기 쉬운 공통 메시지 형태로 정규화한다.
 *   메시지: { id, role: 'user'|'assistant', content, evidence, sources }
 *
 * 백엔드 미연결/실패 시 목데이터로 폴백한다.
 */

import { USE_MOCK, request, withFallback, mockResponse } from './client.js'
import {
  agentSuggestions,
  agentMockAnswers,
  agentDefaultAnswer,
} from '../data/mockData.js'

// 백엔드 answer 응답 -> 프론트 assistant 메시지로 정규화
//  { conversationId, messageId, answer, provider, sources } 등
function mapAnswerToMessage(data) {
  return {
    id: data?.messageId != null ? String(data.messageId) : `ai-${Date.now()}`,
    role: 'assistant',
    content: data?.answer ?? '',
    // 근거 상세 문구는 응답 형태가 확정적이지 않아, 있으면 쓰고 없으면 null
    evidence: data?.evidence ?? null,
    sources: Array.isArray(data?.sources) ? data.sources : [],
    conversationId: data?.conversationId ?? null,
  }
}

// 백엔드 저장 메시지 -> 프론트 메시지로 정규화
//  { messageId, role: 'USER'|'ASSISTANT', content, sources, createdAt }
function mapStoredMessage(msg) {
  return {
    id: String(msg.messageId),
    role: (msg.role ?? '').toUpperCase() === 'USER' ? 'user' : 'assistant',
    content: msg.content ?? '',
    evidence: null,
    sources: Array.isArray(msg.sources) ? msg.sources : [],
  }
}

// 추천 질문 목록
export function fetchSuggestions() {
  return withFallback(
    () => request('/agent/suggestions').then((data) => data?.suggestions ?? []),
    agentSuggestions,
  )
}

// 대화 세션 생성. conversationId 를 돌려준다.
// 목 모드에서는 임시 id 를 준다.
export function createConversation(title = '금융 상담') {
  if (USE_MOCK) return mockResponse({ conversationId: `mock-${Date.now()}` })
  return request('/agent/conversations', {
    method: 'POST',
    body: JSON.stringify({ title }),
  })
}

// 대화 메시지 목록 조회
export function fetchMessages(conversationId) {
  return withFallback(
    () =>
      request(`/agent/conversations/${conversationId}/messages`).then((data) =>
        (data?.messages ?? []).map(mapStoredMessage),
      ),
    [],
  )
}

// 질문 전송 -> AI 답변 메시지(정규화) 반환
export function sendChat(conversationId, message) {
  // 목 답변: 질문 문구에 매칭되는 게 있으면 그걸, 없으면 기본 답변
  const mock = agentMockAnswers[message?.trim()] ?? agentDefaultAnswer
  const mockMessage = mapAnswerToMessage({ ...mock, conversationId })

  return withFallback(
    () =>
      request('/agent/chat', {
        method: 'POST',
        body: JSON.stringify({ conversationId, message }),
      }).then(mapAnswerToMessage),
    mockMessage,
  )
}
