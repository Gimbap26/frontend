/*
 * 앱 전체에서 쓰는 목업 데이터.
 * 백엔드가 붙기 전까지 화면 개발용으로 사용한다.
 * 기획서(9.2 스키마)와 피그마 시안을 기준으로 구성.
 */

// 계좌 목록 (은행명 / 용도 / 잔액)
export const accounts = [
  { id: 'acc-1', bank: '카카오뱅크', purpose: '주계좌', balance: 1_200_000 },
  { id: 'acc-2', bank: '국민은행', purpose: '저축계좌', balance: 850_000 },
  { id: 'acc-3', bank: '토스뱅크', purpose: '생활비', balance: 350_000 },
]

// 이번 달 확정 지출 (앞으로 빠져나갈, 확정된 금융 이벤트)
export const upcomingExpenses = [
  { id: 'up-1', title: '카드 결제', amount: 520_000, date: '2026-09-05', category: '카드', accountId: 'acc-1', recurring: true },
  { id: 'up-2', title: '구독 서비스', amount: 39_000, date: '2026-09-15', category: '구독', accountId: 'acc-3', recurring: true },
  { id: 'up-3', title: '보험료', amount: 95_000, date: '2026-09-18', category: '보험', accountId: 'acc-1', recurring: true },
]

// 거래 내역 (이미 발생한 수입/지출, 최신순)
export const transactions = [
  { id: 'tx-1', title: '이마트', amount: 45_000, type: 'expense', date: '2026-08-29', category: '식료품', accountId: 'acc-1' },
  { id: 'tx-2', title: '스타벅스', amount: 6_500, type: 'expense', date: '2026-08-28', category: '카페', accountId: 'acc-3' },
  { id: 'tx-3', title: 'GS25', amount: 8_200, type: 'expense', date: '2026-08-27', category: '편의점', accountId: 'acc-3' },
  { id: 'tx-4', title: '배달의민족', amount: 23_000, type: 'expense', date: '2026-08-26', category: '배달', accountId: 'acc-3' },
  { id: 'tx-5', title: '월급 입금', amount: 2_800_000, type: 'income', date: '2026-08-25', category: '급여', accountId: 'acc-2' },
  { id: 'tx-6', title: '올리브영', amount: 52_000, type: 'expense', date: '2026-08-24', category: '뷰티', accountId: 'acc-1' },
  { id: 'tx-7', title: 'CGV', amount: 15_000, type: 'expense', date: '2026-08-23', category: '문화', accountId: 'acc-1' },
]

// 일정(금융 이벤트): 날짜별 예정 지출/수입. 달력에 점으로 표시된다.
export const financialEvents = [
  { id: 'ev-1', title: '카드 결제', amount: 520_000, type: 'expense', date: '2026-09-05', category: '카드', accountId: 'acc-1' },
  { id: 'ev-2', title: '통신비', amount: 55_000, type: 'expense', date: '2026-09-10', category: '통신', accountId: 'acc-1' },
  { id: 'ev-3', title: '구독 서비스', amount: 39_000, type: 'expense', date: '2026-09-15', category: '구독', accountId: 'acc-3' },
  { id: 'ev-4', title: '보험료', amount: 95_000, type: 'expense', date: '2026-09-18', category: '보험', accountId: 'acc-1' },
  { id: 'ev-5', title: '대출 상환금', amount: 300_000, type: 'expense', date: '2026-09-25', category: '대출', accountId: 'acc-1' },
  { id: 'ev-6', title: '월급', amount: 2_800_000, type: 'income', date: '2026-09-25', category: '급여', accountId: 'acc-2' },
]

// 특정 날짜의 금융 주의 안내 (Financial Analysis Engine 판정 결과 자리표시).
// 백엔드 연결 시 분석 엔진 결과로 대체한다.
export const scheduleAlerts = {
  '2026-09-25': {
    title: '9월 25일 주의',
    lines: [
      '대출 상환금 차감 직후 잔액이 생활비 기준치를 하회합니다.',
      '월급 입금 전 추가 지출에 주의하세요.',
    ],
  },
}

// AI 에이전트 추천 질문 (화면 진입 시 보여줄 칩)
export const agentSuggestions = [
  '왜 이번 달은 흐림인가요?',
  '9월 25일까지 얼마나 쓸 수 있나요?',
  '지출에서 줄일 수 있는 항목은?',
]

// AI 에이전트 첫 인사 메시지 (대화 시작 시 화면에 기본으로 보여준다)
export const agentGreeting = {
  id: 'greeting',
  role: 'assistant',
  content:
    '안녕하세요! 돈의 날씨 AI입니다.\n이번 달 금융 현황을 기반으로 질문에 답해드립니다.\n상단의 추천 질문을 눌러보세요.',
  evidence: null,
}

// AI 답변 목업. 백엔드(rule-based/LLM)가 붙으면 실제 답변으로 대체된다.
// 질문에 따라 다른 답을 흉내 내되, 없으면 기본 답변을 준다.
export const agentMockAnswers = {
  '9월 25일까지 얼마나 쓸 수 있나요?': {
    answer:
      '9/25 월급 입금 전까지 예상 잔액은 ₩1,366,000입니다.\n\n기본 생활비(식비·교통) ₩600,000 제외 시 자유 소비 가능 금액은 약 ₩766,000으로 추정됩니다.\n\n큰 지출은 9/25 이후로 미루시길 권장합니다.',
    evidence: '9/25 월급 입금 후 예상 잔액: ₩4,166,000',
    sources: ['dashboard', 'financial-events', 'forecasts'],
  },
  '왜 이번 달은 흐림인가요?': {
    answer:
      '이번 달은 대출 상환금(₩300,000)과 카드 결제(₩520,000) 등 고정 지출이 몰려 있어 흐림으로 판정됐습니다.\n\n월급 입금 전 최저 잔액이 생활비 기준치에 근접해 여유가 크지 않습니다.',
    evidence: '최저 예상 잔액일: 9/25',
    sources: ['forecasts', 'financial-events'],
  },
}

export const agentDefaultAnswer = {
  answer:
    '현재 예정 지출을 반영해도 자금 상태는 대체로 안정적입니다.\n\n더 궁금한 점이 있으면 편하게 물어보세요.',
  evidence: null,
  sources: ['dashboard'],
}

/*
 * 참고: 총자산/확정지출 합계/계좌 조회 같은 파생 계산은
 * 데이터 훅(src/hooks)에서 처리한다. 이 파일은 순수 데이터만 둔다.
 * 백엔드 연결 후에는 이 파일을 삭제하고 api 레이어의 request() 만 사용하면 된다.
 */
