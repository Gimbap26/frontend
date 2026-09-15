import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BalanceForecastChart from "../components/BalanceForecastChart";
import WeatherGuideBottomSheet from "../components/WeatherGuideBottomSheet";
import styles from "../styles/WeatherDetail.module.css";
import arrow from "../assets/arrow2.svg";
import info from "../assets/info.svg";
import weather from "../assets/weather_overcast.svg";
import alert from "../assets/alert.svg";

const MOCK_FINANCE_SCHEDULE = [
  { id: 1, name: "카드 결제", date: "9/5", amount: 520000, type: "expense" },
  { id: 2, name: "통신비", date: "9/10", amount: 80000, type: "expense" },
  { id: 3, name: "구독 서비스", date: "9/15", amount: 39000, type: "expense" },
  { id: 4, name: "보험료", date: "9/18", amount: 95000, type: "expense" },
  { id: 5, name: "대출 상환금", date: "9/25", amount: 300000, type: "expense" },
  { id: 6, name: "월급", date: "9/25", amount: 2800000, type: "income" },
];

export default function WeatherDetail() {
  const navigate = useNavigate();
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.header__left}>
          <img
            className={styles.header__backArrow}
            src={arrow}
            alt="뒤로 가기"
            onClick={() => navigate("/")}
          />
          <div className={styles.header__title}>날씨 상세</div>
        </div>
        <button
          className={styles.header__right}
          onClick={() => setIsGuideOpen(true)}
          type="button"
        >
          <img src={info} alt="정보" />
          <div className={styles.header__guide}>날씨 안내</div>
        </button>
      </header>

      <div className={styles.container}>
        {/* 날씨 요약 */}
        <section className={styles.weatherCard}>
          <div className={styles.weatherCard__icon}>
            <img src={weather} alt="날씨" />
          </div>

          <div className={styles.weatherCard__content}>
            <div className={styles.weatherCard__date}>2026년 9월 금융 날씨</div>

            <div className={styles.weatherCard__status}>
              <div className={styles.weatherCard__statusDot}></div>
              <div className={styles.weatherCard__statusText}>흐림</div>
            </div>

            <div className={styles.weatherCard__description}>
              소비를 줄이거나 예정 지출 일정을 조정해 보세요.
            </div>
          </div>
        </section>

        {/* 자금 요약 */}
        <section className={styles.summaryCard}>
          <div className={styles.summaryCard__item}>
            <div className={styles.summaryCard__label}>현재 잔액</div>
            <div className={styles.summaryCard__value}>₩2,400,000</div>
          </div>

          <div className={styles.summaryCard__item}>
            <div className={styles.summaryCard__label}>예정 지출</div>
            <div
              className={`${styles.summaryCard__value} ${styles["summaryCard__value--danger"]}`}
            >
              ₩1,034,000
            </div>
          </div>

          <div className={styles.summaryCard__item}>
            <div className={styles.summaryCard__label}>예상 가용자금</div>
            <div
              className={`${styles.summaryCard__value} ${styles["summaryCard__value--available"]}`}
            >
              ₩1,366,000
            </div>
          </div>
        </section>

        {/* 잔액 변화 예측 */}
        <section className={styles.forecastCard}>
          <div className={styles.card__title}>잔액 변화 예측</div>

          <BalanceForecastChart />

          <div className={styles.forecastCard__legend}>
            <div className={styles.forecastCard__legendLine}></div>
            <div className={styles.forecastCard__legendText}>
              생활비 기준치 ₩1,500,000
            </div>
          </div>
        </section>

        {/* 날씨 판정 근거 */}
        <section className={styles.basisCard}>
          <div className={styles.card__title}>날씨 판정 근거</div>

          <div className={styles.basisCard__list}>
            <div className={styles.basisCard__item}>
              <div className={styles.basisCard__label}>현재 잔액</div>

              <div className={styles.basisCard__bar}>
                <div
                  className={`${styles.basisCard__barFill} ${styles["basisCard__barFill--balance"]}`}
                ></div>
              </div>

              <div className={styles.basisCard__value}>₩2,400,000</div>
            </div>

            <div className={styles.basisCard__item}>
              <div className={styles.basisCard__label}>확정 지출</div>

              <div className={styles.basisCard__bar}>
                <div
                  className={`${styles.basisCard__barFill} ${styles["basisCard__barFill--expense"]}`}
                ></div>
              </div>

              <div
                className={`${styles.basisCard__value} ${styles["basisCard__value--danger"]}`}
              >
                ₩1,034,000
              </div>
            </div>

            <div className={styles.basisCard__item}>
              <div className={styles.basisCard__label}>예상 가용자금</div>

              <div className={styles.basisCard__bar}>
                <div
                  className={`${styles.basisCard__barFill} ${styles["basisCard__barFill--available"]}`}
                ></div>
              </div>

              <div
                className={`${styles.basisCard__value} ${styles["basisCard__value--available"]}`}
              >
                ₩1,366,000
              </div>
            </div>
          </div>

          <div className={styles.basisCard__notice}>
            <img className={styles.basisCard__noticeIcon} src={alert} alt="경고" />
            <div className={styles.basisCard__noticeText}>
              9/25 월급 입금 전까지 잔액이 생활비 기준치를 하회할 수 있습니다.
            </div>
          </div>
        </section>

        {/* 이번 달 금융 일정 */}
        <section className={styles.scheduleCard}>
          <div className={styles.card__title}>이번 달 금융 일정</div>

          <div className={styles.scheduleCard__list}>
            {MOCK_FINANCE_SCHEDULE.map((item) => (
              <div className={styles.scheduleCard__item} key={item.id}>
                <div className={styles.scheduleCard__info}>
                  <div
                    className={`${styles.scheduleCard__dot} ${
                      styles[`scheduleCard__dot--${item.type}`]
                    }`}
                  />

                  <div className={styles.scheduleCard__name}>{item.name}</div>

                  <div className={styles.scheduleCard__date}>{item.date}</div>
                </div>

                <div
                  className={`${styles.scheduleCard__amount} ${
                    styles[`scheduleCard__amount--${item.type}`]
                  }`}
                >
                  {item.type === "income" ? "+" : "-"}₩
                  {item.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <WeatherGuideBottomSheet
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </>
  );
}
