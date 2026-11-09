import { useNavigate } from "react-router-dom";
import { useHomeMoneyWeather } from "../hooks/useHome";
import AsyncBoundary from "../components/AsyncBoundary";
import styles from "../styles/HomePage.module.css";
import arrow from "../assets/arrow.svg";
import chat from "../assets/chat.svg";
import aiSparkle from "../assets/ai_sparkle.svg";
import chevronBlue from "../assets/chevron_blue.svg";
import sunny from "../assets/weather_sunny.svg";
import cloudy from "../assets/weather_cloudy.svg";
import storm from "../assets/weather_storm.svg";
import rainy from "../assets/weather_rainy.svg";

const WEATHER_ICONS = {
  SUNNY: sunny,
  CLOUDY: cloudy,
  RAINY: rainy,
  STORM: storm,
};

const WEATHER_TONES = {
  SUNNY: "sunny",
  CLOUDY: "cloudy",
  RAINY: "rainy",
  STORM: "storm",
};

const formatWon = (value) => `₩${value.toLocaleString()}`;

export default function HomePage() {
  const navigate = useNavigate();
  const { data, loading, error } = useHomeMoneyWeather();

  if (loading || error || !data) {
    return (
      <div className={styles.container}>
        <AsyncBoundary loading={loading || (!data && !error)} error={error}>
          {null}
        </AsyncBoundary>
      </div>
    );
  }

  const weatherIcon = WEATHER_ICONS[data.weather] ?? cloudy;
  const weatherToneClass =
    styles[`weatherTone--${WEATHER_TONES[data.weather] ?? "cloudy"}`];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.header__date}>{data.baseMonthLabel}</div>
        <div className={styles.header__title}>MoneyBridge</div>
      </header>

      <section className={styles.mainCard}>
        <div className={styles.mainCard__hero}>
          <div className={styles.mainCard__heroText}>
            <div className={styles.mainCard__status}>
              <div
                className={`${styles.mainCard__statusDot} ${weatherToneClass}`}
              ></div>
              <div
                className={`${styles.mainCard__statusText} ${weatherToneClass}`}
              >
                {data.weatherLabel}
              </div>
            </div>
            <div className={styles.mainCard__message}>
              <div className={styles.mainCard__title}>
                {data.dashboardRiskSummary}
              </div>
            </div>
          </div>

          {/* 날씨 아이콘 */}
          <div className={styles.mainCard__weatherIcon}>
            <img src={weatherIcon} alt="날씨" />
          </div>
        </div>

        <div className={`${styles.mainCard__description} ${weatherToneClass}`}>
          {data.weatherDescription}
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

      {/* AI 금융 기상 브리핑 */}
      <section className={styles.briefing}>
        <div className={styles.briefing__header}>
          <div className={styles.briefing__titleWrap}>
            <div className={styles.briefing__titleIcon}>
              <img src={aiSparkle} alt="" />
            </div>
            <div className={styles.briefing__title}>AI 금융 기상 브리핑</div>
          </div>

          <div className={styles.briefing__badge}>
            <div className={styles.briefing__badgeDot}></div>
            실시간 진단
          </div>
        </div>

        <article className={styles.briefing__card}>
          <div className={styles.briefing__alert}>
            <span className={styles.briefing__alertIcon}>⚠️</span>
            <span className={styles.briefing__alertText}>자금 저기압 주의보</span>
          </div>

          <p className={styles.briefing__message}>
            통장 잔액은 <strong>240만 원</strong>이지만, 9월 5일 카드 결제(52만
            원) 등 필수 지출이 다가오고 있어 실제 하루 권장 지출은{" "}
            <strong className={styles.briefing__highlight}>45,500원</strong>
            입니다.
          </p>

          <div className={styles.briefing__tip}>
            <span className={styles.briefing__tipIcon}>💡</span>
            <p className={styles.briefing__tipText}>
              날씨 개선 팁:
              <span className={styles.briefing__tipSub}>
                {" "}
                9월 15일 최저 잔고(18.2만 원) 구간 전까지 고액 소비를 미루면
                날씨가{" "}
              </span>
              <strong className={styles.briefing__tipAccent}>'맑음'</strong>
              <span className={styles.briefing__tipSub}>으로 회복돼요.</span>
            </p>
          </div>

          <div className={styles.briefing__footer}>
            <div className={styles.briefing__payday}>
              급여일(9/25)까지 23일 남음
            </div>

            <button
              className={styles.briefing__actionBtn}
              onClick={() => navigate("/weather")}
            >
              권장 지출 관리하기
              <img
                className={styles.briefing__actionArrow}
                src={chevronBlue}
                alt=""
              />
            </button>
          </div>
        </article>
      </section>

      <section className={styles.expenseContainer}>
        {/* 섹션 헤더 */}
        <div className={styles.expenseContainer__header}>
          <div className={styles.expenseContainer__title}>
            다가오는 예정 지출
          </div>

          <button
            className={styles.expenseContainer__viewAll}
            onClick={() => navigate("/accounts")}
          >
            전체 보기
          </button>
        </div>

        {/* 예정 지출 목록 */}
        <div className={styles.expenseContainer__list}>
          {data.nextEvents.length === 0 ? (
            <div className={styles.expenseEmpty}>
              다가오는 예정 지출이 없어요
            </div>
          ) : (
            data.nextEvents.map((expense) => (
              <div className={styles.expenseItem} key={expense.id}>
                <div className={styles.expenseItem__info}>
                  <div className={styles.expenseItem__name}>{expense.name}</div>

                  <div className={styles.expenseItem__date}>{expense.date}</div>
                </div>

                <div className={styles.expenseItem__amount}>
                  -{formatWon(expense.amount)}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <button className={styles.chatBtn} onClick={() => navigate("/ai")}>
        <img src={chat} alt="채팅" />
        AI에게 이번 달 분석 물어보기
      </button>
    </div>
  );
}
