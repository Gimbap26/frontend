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

/*
 * 거래 내역 (이미 발생한 수입/지출, 최신순).
 * 날짜는 mockMonth.js 의 buildMonthTransactions() 가 조회월 안에서 다시 붙인다.
 * 여기 적힌 date 는 형태를 보여주기 위한 기본값이다.
 * (실데이터는 GET /transactions?month= 으로 조회월 내역이 그대로 온다)
 */
export const transactions = [
  { id: 'tx-1', title: '이마트', amount: 45_000, type: 'expense', date: '2026-08-29', category: '식료품', accountId: 'acc-1' },
  { id: 'tx-2', title: '스타벅스', amount: 6_500, type: 'expense', date: '2026-08-28', category: '카페', accountId: 'acc-3' },
  { id: 'tx-3', title: 'GS25', amount: 8_200, type: 'expense', date: '2026-08-27', category: '편의점', accountId: 'acc-3' },
  { id: 'tx-4', title: '배달의민족', amount: 23_000, type: 'expense', date: '2026-08-26', category: '배달', accountId: 'acc-3' },
  { id: 'tx-5', title: '월급 입금', amount: 2_800_000, type: 'income', date: '2026-08-25', category: '급여', accountId: 'acc-2' },
  { id: 'tx-6', title: '올리브영', amount: 52_000, type: 'expense', date: '2026-08-24', category: '뷰티', accountId: 'acc-1' },
  { id: 'tx-7', title: 'CGV', amount: 15_000, type: 'expense', date: '2026-08-23', category: '문화', accountId: 'acc-1' },
]

/*
 * 매달 반복되는 금융 일정 규칙. (백엔드 recurring-rules 자리표시)
 *
 * 일정 화면은 달력에서 월을 넘길 수 있어서, 특정 달 데이터를 그때그때 만들어야 한다.
 * 그래서 "9월 이벤트 목록"을 직접 두는 대신 이 규칙을 두고,
 * data/mockMonth.js 가 요청받은 달에 맞춰 이벤트와 잔액 예측을 생성한다.
 * (백엔드도 반복 규칙을 만들 때 해당 월의 예정 이벤트를 함께 생성한다)
 *
 *  day: 매달 며칠에 발생하는지. 그 달에 없는 날짜(31일 등)는 말일로 맞춘다.
 */
export const recurringRules = [
  { id: 'rr-rent', title: '관리비', day: 3, amount: 150_000, type: 'expense', category: '주거', accountId: 'acc-1' },
  { id: 'rr-card', title: '카드 결제', day: 5, amount: 520_000, type: 'expense', category: '카드', accountId: 'acc-1' },
  { id: 'rr-tel', title: '통신비', day: 10, amount: 55_000, type: 'expense', category: '통신', accountId: 'acc-1' },
  { id: 'rr-sub', title: '구독 서비스', day: 15, amount: 39_000, type: 'expense', category: '구독', accountId: 'acc-3' },
  { id: 'rr-ins', title: '보험료', day: 18, amount: 95_000, type: 'expense', category: '보험', accountId: 'acc-1' },
  { id: 'rr-loan', title: '대출 상환금', day: 25, amount: 300_000, type: 'expense', category: '대출', accountId: 'acc-1' },
  { id: 'rr-pay', title: '월급', day: 25, amount: 2_800_000, type: 'income', category: '급여', accountId: 'acc-2' },
]

/*
 * 달 시작 잔액. 계좌 합계(₩2,400,000)와 같은 값을 쓴다.
 * 매달 같은 흐름(월초 여유 → 고정비로 하락 → 급여일 회복)을 보여주기 위해,
 * 남은 잔액은 그달 생활비로 소비된다고 보고 달마다 이 값에서 다시 시작한다.
 */
export const monthStartBalance = 2_400_000

/*
 * 지출 계획 요약의 고정 부분. (백엔드 GET /dashboard 응답 자리표시)
 *  - availableFunds: 급여일 전까지 쓸 수 있다고 본 가용자금
 *  - essentialCost: 그중 보존해야 하는 필수 고정비 (식비·교통 등)
 *  - daysUntilPayday: 급여일까지 남은 일수.
 *      시연용 고정값이다. 시안이 "남은 23일" 기준이라 목 모드에서는 이 값을 쓰고,
 *      백엔드가 붙으면 null 이 되어 화면이 (급여일 - 오늘)로 직접 계산한다.
 * 하루 권장 지출은 (가용자금 - 필수 고정비) / 급여일까지 남은 일수로 화면에서 계산한다.
 *
 * 위험 요약 문장(riskSummary)과 갱신 시각(updatedAt)은 달마다 날짜가 달라지므로
 * data/mockMonth.js 의 buildSpendingPlan() 이 조회 시점에 채운다.
 */
export const spendingPlanBase = {
  availableFunds: 1_366_000,
  essentialCost: 320_000,
  essentialLabel: '식비·교통',
  daysUntilPayday: 23,
}

/*
 * 지출 최적화 시뮬레이터 옵션.
 * 토글을 켜면 그만큼 하루 권장 지출이 올라가고 자금 날씨 단계가 개선된다.
 * 백엔드 연결 시 POST /available-funds/simulations 결과로 대체할 수 있다.
 */
export const spendingOptimizations = [
  { id: 'opt-sub', title: '구독 서비스 1건 일시정지', saving: 39_000, effect: '절감 효과', icon: 'subscription' },
  { id: 'opt-dining', title: '주말 외식 예산 1회 축소', saving: 50_000, effect: '추가 확보', icon: 'dining' },
]

// AI 에이전트 첫 인사 메시지 (대화 시작 시 화면에 기본으로 보여준다)
export const agentGreeting = {
  id: 'greeting',
  role: 'assistant',
  content:
    '안녕하세요! 돈의 날씨 AI입니다.\n이번 달 금융 현황을 기반으로 질문에 답해드립니다.\n상단의 추천 질문을 눌러보세요.',
  evidence: null,
}

/*
 * 추천 질문과 목 답변은 날짜(급여일 등)가 문장에 들어가서 달마다 달라져야 한다.
 * 그래서 data/mockMonth.js 의 buildAgentSuggestions() / buildAgentAnswers() 가
 * 조회 시점의 달 기준으로 만들어 준다. 여기에는 날짜와 무관한 기본 답변만 둔다.
 */
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
