import { useState } from "react";
import { fallbackMoneyWeatherData } from "../data/fallbackData";
import styles from "../styles/BalanceForecastChart.module.css";

const fallbackTimeline = fallbackMoneyWeatherData.forecast.timeline;

const CHART = {
  left: 48,
  right: 318,
  top: 12,
  bottom: 158,
};

const formatChartDate = (dateString) => {
  const [, month, day] = dateString.split("-");
  return `${Number(month)}/${Number(day)}`;
};

const formatWon = (value) => `₩${value.toLocaleString()}`;

const formatTick = (value) => `${Math.round(value / 10000)}만`;

const pickVisibleTimeline = (timeline) => {
  if (timeline.length <= 7) {
    return timeline;
  }

  return timeline.filter((_, index) => {
    const step = (timeline.length - 1) / 6;
    return index === Math.round(step * Math.round(index / step));
  });
};

const buildChartPoints = (timeline = fallbackTimeline) => {
  const sourceTimeline = timeline.length > 0 ? timeline : fallbackTimeline;
  const visibleTimeline = pickVisibleTimeline(sourceTimeline);
  const balances = visibleTimeline.map((point) => point.balance);
  const maxBalance = Math.max(...balances, 5000000);
  const minBalance = Math.min(...balances, 0);
  const balanceRange = Math.max(maxBalance - minBalance, 1);
  const xRange = CHART.right - CHART.left;
  const yRange = CHART.bottom - CHART.top;

  return visibleTimeline.map((point, index) => {
    const x =
      visibleTimeline.length === 1
        ? CHART.left
        : CHART.left + (xRange * index) / (visibleTimeline.length - 1);
    const y =
      CHART.bottom - ((point.balance - minBalance) / balanceRange) * yRange;

    return {
      ...point,
      date: formatChartDate(point.date),
      x,
      y,
    };
  });
};

const buildLinePath = (chartPoints) =>
  chartPoints
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`)
    .join(" ");

export default function BalanceForecastChart({ timeline = fallbackTimeline }) {
  const [activePoint, setActivePoint] = useState(null);
  const chartPoints = buildChartPoints(timeline);
  const linePath = buildLinePath(chartPoints);
  const areaPath = `${linePath} L${CHART.right} ${CHART.bottom} L${CHART.left} ${CHART.bottom} Z`;
  const balances = timeline.map((point) => point.balance);
  const maxBalance = Math.max(...balances, 5000000);
  const yTicks = [
    { label: formatTick(maxBalance), y: CHART.top },
    { label: formatTick(maxBalance * 0.6), y: 70.4 },
    { label: formatTick(maxBalance * 0.3), y: 114.2 },
    { label: "0만", y: CHART.bottom },
  ];
  const tooltipX = activePoint
    ? Math.min(Math.max(activePoint.x - 39, 44), 250)
    : 0;
  const tooltipY = activePoint ? Math.max(activePoint.y - 48, 2) : 0;

  return (
    <div className={styles.chart}>
      <svg
        className={styles.svg}
        viewBox="0 0 340 212"
        role="img"
        aria-label="잔액 변화 예측 차트"
      >
        <defs>
          <linearGradient id="balanceAreaGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {yTicks.map((tick) => (
          <g key={tick.label}>
            <text className={styles.yLabel} x="36" y={tick.y + 4}>
              {tick.label}
            </text>
            <line
              className={styles.gridLine}
              x1="48"
              x2="318"
              y1={tick.y}
              y2={tick.y}
            />
          </g>
        ))}

        <path className={styles.area} d={areaPath} />
        <line
          className={styles.thresholdLine}
          x1="48"
          x2="318"
          y1="114.2"
          y2="114.2"
        />
        <path className={styles.balanceLine} d={linePath} />

        {chartPoints.map((point) => (
          <g
            className={styles.pointGroup}
            key={point.date}
            onBlur={() => setActivePoint(null)}
            onFocus={() => setActivePoint(point)}
            onMouseEnter={() => setActivePoint(point)}
            onMouseLeave={() => setActivePoint(null)}
            onTouchStart={() => setActivePoint(point)}
            tabIndex="0"
          >
            <circle
              className={styles.pointHitArea}
              cx={point.x}
              cy={point.y}
              r="12"
            />
            <circle className={styles.point} cx={point.x} cy={point.y} r="4.5" />
          </g>
        ))}

        {activePoint && (
          <g className={styles.tooltip}>
            <rect
              className={styles.tooltipBox}
              width="86"
              height="38"
              x={tooltipX}
              y={tooltipY}
              rx="8"
            />
            <text
              className={styles.tooltipDate}
              x={tooltipX + 43}
              y={tooltipY + 14}
            >
              {activePoint.date}
            </text>
            <text
              className={styles.tooltipValue}
              x={tooltipX + 43}
              y={tooltipY + 29}
            >
              {formatWon(activePoint.balance)}
            </text>
          </g>
        )}

        {chartPoints.map((item) => (
          <text className={styles.xLabel} key={item.date} x={item.x} y="184">
            {item.date}
          </text>
        ))}
      </svg>
    </div>
  );
}
