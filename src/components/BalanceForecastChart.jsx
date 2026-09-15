import { useState } from "react";
import styles from "../styles/BalanceForecastChart.module.css";

const yTicks = [
  { label: "500만", y: 12 },
  { label: "300만", y: 70.4 },
  { label: "150만", y: 114.2 },
  { label: "0만", y: 158 },
];

const xLabels = [
  { label: "9/1", x: 48 },
  { label: "9/5", x: 93 },
  { label: "9/10", x: 138 },
  { label: "9/15", x: 183 },
  { label: "9/18", x: 228 },
  { label: "9/25", x: 273 },
  { label: "9/30", x: 318 },
];

const points = [
  { date: "9/1", balance: 2400000, x: 48, y: 88 },
  { date: "9/5", balance: 1900000, x: 93, y: 103 },
  { date: "9/10", balance: 1800000, x: 138, y: 105 },
  { date: "9/15", balance: 1760000, x: 183, y: 106 },
  { date: "9/18", balance: 1640000, x: 228, y: 110 },
  { date: "9/25", balance: 4180000, x: 273, y: 36 },
  { date: "9/30", balance: 4050000, x: 318, y: 40 },
];

const linePath =
  "M48 88 C64 94 76 100 93 103 C107 105 123 105 138 105 C153 105 168 106 183 106 C198 107 213 110 228 110 C246 109 254 36 273 36 C289 36 303 38 318 40";

const areaPath = `${linePath} L318 158 L48 158 Z`;

const formatWon = (value) => `₩${value.toLocaleString()}`;

export default function BalanceForecastChart() {
  const [activePoint, setActivePoint] = useState(null);
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
        aria-label="9월 잔액 변화 예측 차트"
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

        {points.map((point) => (
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
            <circle className={styles.pointHitArea} cx={point.x} cy={point.y} r="12" />
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

        {xLabels.map((item) => (
          <text className={styles.xLabel} key={item.label} x={item.x} y="184">
            {item.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
