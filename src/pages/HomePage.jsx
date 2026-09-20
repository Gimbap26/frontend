import { useNavigate } from "react-router-dom";
import { useHomeMoneyWeather } from "../hooks/useHome";
import styles from "../styles/HomePage.module.css";
import arrow from "../assets/arrow.svg";
import chat from "../assets/chat.svg";
import sunny from "../assets/weather_sunny.svg";
import cloudy from "../assets/weather_cloudy.svg";
import overcast from "../assets/weather_overcast.svg";
import rainy from "../assets/weather_rainy.svg";

const WEATHER_ICONS = {
  SUNNY: sunny,
  CLOUDY: cloudy,
  OVERCAST: overcast,
  RAINY: rainy,
};

const WEATHER_TONES = {
  SUNNY: "sunny",
  CLOUDY: "cloudy",
  OVERCAST: "overcast",
  RAINY: "rainy",
};

const formatWon = (value) => `₩${value.toLocaleString()}`;

export default function HomePage() {
  const navigate = useNavigate();
  const { data } = useHomeMoneyWeather();
  const weatherIcon = WEATHER_ICONS[data.weather] ?? overcast;
  const weatherToneClass =
    styles[`weatherTone--${WEATHER_TONES[data.weather] ?? "overcast"}`];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.header__date}>{data.baseMonthLabel}</div>
        <div className={styles.header__title}>MoneyWeather</div>
      </header>

      <section className={styles.mainCard}>
        <div className={styles.mainCard__hero}>
          <div className={styles.mainCard__heroText}>
            <div className={styles.mainCard__status}>
              <div
                className={`${styles.mainCard__statusDot} ${weatherToneClass}`}
              ></div>
              <div className={`${styles.mainCard__statusText} ${weatherToneClass}`}>
                {data.weatherLabel}
              </div>
            </div>
            <div className={styles.mainCard__message}>
              <div className={styles.mainCard__title}>
                {data.weatherDescription}
              </div>
            </div>
          </div>

          {/* 날씨 아이콘 */}
          <div className={styles.mainCard__weatherIcon}>
            <img src={weatherIcon} alt="날씨" />
          </div>
        </div>

        <div className={`${styles.mainCard__description} ${weatherToneClass}`}>
          {data.weatherGuide}
        </div>

        {/* 자금 정보 */}
        <div className={styles.mainCard__summary}>
          <div className={styles.mainCard__summaryItem}>
            <div className={styles.mainCard__summaryLabel}>현재 잔액</div>
            <div className={styles.mainCard__summaryValue}>
              {formatWon(data.currentBalance)}
            </div>
          </div>

          <div className={styles.mainCard__summaryItem}>
            <div className={styles.mainCard__summaryLabel}>예상 가용자금</div>
            <div
              className={`${styles.mainCard__summaryValue} ${styles["mainCard__summaryValue--available"]}`}
            >
              {formatWon(data.availableFunds)}
            </div>
          </div>
        </div>

        {/* 하단 */}
        <div className={styles.mainCard__footer}>
          <div className={styles.mainCard__scheduledExpense}>
            예정 지출 {formatWon(data.fixedOutflows)} 반영됨
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
          {data.nextEvents.map((expense) => (
            <div className={styles.expenseItem} key={expense.id}>
              <div className={styles.expenseItem__info}>
                <div className={styles.expenseItem__name}>{expense.name}</div>

                <div className={styles.expenseItem__date}>{expense.date}</div>
              </div>

              <div className={styles.expenseItem__amount}>
                -{formatWon(expense.amount)}
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
