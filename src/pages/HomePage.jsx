import { useNavigate } from "react-router-dom";
import styles from "../styles/HomePage.module.css";
import arrow from "../assets/arrow.svg";
import weather from "../assets/weather_overcast.svg";
import chat from "../assets/chat.svg";

const MOCK_UPCOMING_EXPENSES = [
  {
    id: 1,
    name: "카드 결제",
    date: "9월 5일",
    amount: 520000,
  },
  {
    id: 2,
    name: "통신비",
    date: "9월 10일",
    amount: 80000,
  },
  {
    id: 3,
    name: "구독 서비스",
    date: "9월 15일",
    amount: 39000,
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.header__date}>2026년 9월</div>
        <div className={styles.header__title}>MoneyWeather</div>
      </header>

      <section className={styles.mainCard}>
        <div className={styles.mainCard__hero}>
          <div className={styles.mainCard__heroText}>
            <div className={styles.mainCard__status}>
              <div className={styles.mainCard__statusDot}></div>
              <div className={styles.mainCard__statusText}>흐림</div>
            </div>
            <div className={styles.mainCard__message}>
              <div className={styles.mainCard__title}>
                이번 달 자금 관리가
                <br />
                필요합니다
              </div>
            </div>
          </div>

          {/* 날씨 아이콘 */}
          <div className={styles.mainCard__weatherIcon}>
            <img src={weather} alt="날씨" />
          </div>
        </div>

        <div className={styles.mainCard__description}>
          소비를 줄이거나 예정 지출 일정을 조정해 보세요.
        </div>

        {/* 자금 정보 */}
        <div className={styles.mainCard__summary}>
          <div className={styles.mainCard__summaryItem}>
            <div className={styles.mainCard__summaryLabel}>현재 잔액</div>
            <div className={styles.mainCard__summaryValue}>₩2,400,000</div>
          </div>

          <div className={styles.mainCard__summaryItem}>
            <div className={styles.mainCard__summaryLabel}>예상 가용자금</div>
            <div
              className={`${styles.mainCard__summaryValue} ${styles["mainCard__summaryValue--available"]}`}
            >
              ₩1,366,000
            </div>
          </div>
        </div>

        {/* 하단 */}
        <div className={styles.mainCard__footer}>
          <div className={styles.mainCard__scheduledExpense}>
            예정 지출 ₩1,034,000 반영됨
          </div>

          <button
            className={styles.mainCard__detailBtn}
            onClick={() => navigate("/weather")}
          >
            상세 보기
            <img
              className={styles.mainCard__detailArrow}
              src={arrow}
              alt="화살표"
            />
          </button>
        </div>
      </section>

      <section className={styles.expenseContainer}>
        {/* 섹션 헤더 */}
        <div className={styles.expenseContainer__header}>
          <div className={styles.expenseContainer__title}>
            다가오는 예정 지출
          </div>

          <button className={styles.expenseContainer__viewAll}>
            전체 보기
          </button>
        </div>

        {/* 예정 지출 목록 */}
        <div className={styles.expenseContainer__list}>
          {MOCK_UPCOMING_EXPENSES.map((expense) => (
            <div className={styles.expenseItem} key={expense.id}>
              <div className={styles.expenseItem__info}>
                <div className={styles.expenseItem__name}>{expense.name}</div>

                <div className={styles.expenseItem__date}>{expense.date}</div>
              </div>

              <div className={styles.expenseItem__amount}>
                -₩{expense.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </section>

      <button className={styles.chatBtn}>
        <img src={chat} alt="채팅" />
        AI에게 이번 달 분석 물어보기
      </button>
    </div>
  );
}
