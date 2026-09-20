import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BalanceForecastChart from "../components/BalanceForecastChart";
import WeatherGuideBottomSheet from "../components/WeatherGuideBottomSheet";
import { useWeatherDetailMoneyWeather } from "../hooks/useWeatherDetail";
import styles from "../styles/WeatherDetail.module.css";
import arrow from "../assets/arrow2.svg";
import info from "../assets/info.svg";
import alert from "../assets/alert.svg";
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

export default function WeatherDetail() {
  const navigate = useNavigate();
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const { data } = useWeatherDetailMoneyWeather();
  const weatherIcon = WEATHER_ICONS[data.weather] ?? overcast;
  const weatherToneClass =
    styles[`weatherTone--${WEATHER_TONES[data.weather] ?? "overcast"}`];

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
            <img src={weatherIcon} alt="날씨" />
          </div>

          <div className={styles.weatherCard__content}>
            <div className={styles.weatherCard__date}>
              {data.baseMonthLabel} 금융 날씨
            </div>

            <div className={styles.weatherCard__status}>
              <div
                className={`${styles.weatherCard__statusDot} ${weatherToneClass}`}
              ></div>
              <div className={`${styles.weatherCard__statusText} ${weatherToneClass}`}>
                {data.weatherLabel}
              </div>
            </div>

            <div className={`${styles.weatherCard__description} ${weatherToneClass}`}>
              {data.weatherGuide}
            </div>
          </div>
        </section>

        {/* 자금 요약 */}
        <section className={styles.summaryCard}>
          <div className={styles.summaryCard__item}>
            <div className={styles.summaryCard__label}>현재 잔액</div>
            <div className={styles.summaryCard__value}>
              {formatWon(data.currentBalance)}
            </div>
          </div>

          <div className={styles.summaryCard__item}>
            <div className={styles.summaryCard__label}>예정 지출</div>
            <div
              className={`${styles.summaryCard__value} ${styles["summaryCard__value--danger"]}`}
            >
              {formatWon(data.fixedOutflows)}
            </div>
          </div>

          <div className={styles.summaryCard__item}>
            <div className={styles.summaryCard__label}>예상 가용자금</div>
            <div
              className={`${styles.summaryCard__value} ${styles["summaryCard__value--available"]}`}
            >
              {formatWon(data.availableFunds)}
            </div>
          </div>
        </section>

        {/* 잔액 변화 예측 */}
        <section className={styles.forecastCard}>
          <div className={styles.card__title}>잔액 변화 예측</div>

          <BalanceForecastChart timeline={data.forecast.timeline} />

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

              <div className={styles.basisCard__value}>
                {formatWon(data.currentBalance)}
              </div>
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
                {formatWon(data.fixedOutflows)}
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
                {formatWon(data.availableFunds)}
              </div>
            </div>
          </div>

          <div className={styles.basisCard__notice}>
            <img className={styles.basisCard__noticeIcon} src={alert} alt="경고" />
            <div className={styles.basisCard__noticeText}>
              {data.dashboardRiskSummary}
            </div>
          </div>
        </section>

        {/* 이번 달 금융 일정 */}
        <section className={styles.scheduleCard}>
          <div className={styles.card__title}>이번 달 금융 일정</div>

          <div className={styles.scheduleCard__list}>
            {data.monthlySchedule.map((item) => (
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
                  {item.type === "income" ? "+" : "-"}
                  {formatWon(item.amount)}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <WeatherGuideBottomSheet
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        currentWeather={data.weather}
      />
    </>
  );
}
