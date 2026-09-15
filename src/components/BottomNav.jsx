import { useLocation, useNavigate } from "react-router-dom";
import styles from "../styles/BottomNav.module.css";
import home from "../assets/home.svg";
import weather from "../assets/weather.svg";
import asset from "../assets/asset.svg";
import ai from "../assets/ai.svg";
import schedule from "../assets/schedule.svg";
import home_active from "../assets/home-active.svg";
import weather_active from "../assets/weather-active.svg";
import asset_active from "../assets/asset-active.svg";
import ai_active from "../assets/ai-active.svg";
import schedule_active from "../assets/schedule-active.svg";

const NAV_ITEMS = [
  { id: "home", label: "홈", path: "/", icon: home, activeIcon: home_active },
  {
    id: "weather",
    label: "날씨",
    path: "/weather",
    icon: weather,
    activeIcon: weather_active,
  },
  {
    id: "asset",
    label: "자산",
    path: "/asset",
    icon: asset,
    activeIcon: asset_active,
  },
  { id: "ai", label: "AI", path: "/ai", icon: ai, activeIcon: ai_active },
  {
    id: "schedule",
    label: "일정",
    path: "/schedule",
    icon: schedule,
    activeIcon: schedule_active,
  },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className={styles.container} aria-label="하단 네비게이션">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.path === "/"
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

        return (
          <button
            className={`${styles.item} ${isActive ? styles["item--active"] : ""}`}
            key={item.id}
            onClick={() => navigate(item.path)}
            type="button"
          >
            <img
              className={styles.icon}
              src={isActive ? item.activeIcon : item.icon}
              alt=""
            />
            <span className={styles.label}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
