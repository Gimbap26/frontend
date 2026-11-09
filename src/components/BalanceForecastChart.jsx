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

const TARGET_INTERVALS = 3;
const MIN_STEP = 10000;

const niceStep = (rough) => {
  const power = 10 ** Math.floor(Math.log10(rough));
  const fraction = rough / power;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return nice * power;
};

const buildYScale = (balances) => {
  let min = Math.min(...balances);
  let max = Math.max(...balances);

  if (min === max) {
    const padding = Math.max(Math.abs(max) * 0.1, 100000);
    min -= padding;
    max += padding;
  }

  const step = Math.max(niceStep((max - min) / TARGET_INTERVALS), MIN_STEP);
  const lower = Math.floor(min / step) * step;
  const upper = Math.ceil(max / step) * step;
  const ticks = [];

  for (let value = lower; value <= upper; value += step) {
    ticks.push(value);
  }

  return { lower, upper, ticks };
};

const pickVisibleTimeline = (timeline) => {
  if (timeline.length <= 7) {
    return timeline;
  }

  return timeline.filter((_, index) => {
    const step = (timeline.length - 1) / 6;
    return index === Math.round(step * Math.round(index / step));
  });
};

const toChartY = (value, scale) =>
  CHART.bottom -
  ((value - scale.lower) / (scale.upper - scale.lower)) *
    (CHART.bottom - CHART.top);

const buildChart = (timeline = fallbackTimeline) => {
  const sourceTimeline = timeline.length > 0 ? timeline : fallbackTimeline;
  const visibleTimeline = pickVisibleTimeline(sourceTimeline);
  const scale = buildYScale(visibleTimeline.map((point) => point.balance));
  const xRange = CHART.right - CHART.left;

  const points = visibleTimeline.map((point, index) => ({
    ...point,
    date: formatChartDate(point.date),
    x:
      visibleTimeline.length === 1
        ? CHART.left
        : CHART.left + (xRange * index) / (visibleTimeline.length - 1),
    y: toChartY(point.balance, scale),
  }));

  const yTicks = scale.ticks.map((value) => ({
    value,
    label: formatTick(value),
    y: toChartY(value, scale),
  }));

  return { points, yTicks };
};

const buildLinePath = (chartPoints) =>
  chartPoints
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`)
    .join(" ");

export default function BalanceForecastChart({ timeline = fallbackTimeline }) {
  const [activePoint, setActivePoint] = useState(null);
  const { points: chartPoints, yTicks } = buildChart(timeline);
  const linePath = buildLinePath(chartPoints);
  const lastPoint = chartPoints[chartPoints.length - 1];
  const areaPath = `${linePath} L${lastPoint.x} ${CHART.bottom} L${CHART.left} ${CHART.bottom} Z`;
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
          <g key={tick.value}>
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
