import { useEffect, useRef, useState } from "react";
import styles from "../styles/WeatherGuideBottomSheet.module.css";
import sunny from "../assets/weather_sunny.svg";
import cloudy from "../assets/weather_cloudy.svg";
import overcast from "../assets/weather_overcast.svg";
import rainy from "../assets/weather_rainy.svg";
import close from "../assets/close.svg";

const WEATHER_GUIDES = [
  {
    status: "맑음",
    tone: "sunny",
    icon: sunny,
    description: "여유 자금으로 저축이나 투자를 고려해 보세요.",
    condition: "예상 가용자금이 기준 생활비보다 충분함",
    meaning: "현재 소비 계획을 유지해도 안정적",
    advice: "여유 자금으로 저축이나 투자를 고려해 보세요.",
  },
  {
    status: "구름 조금",
    tone: "cloudy",
    icon: cloudy,
    description: "예정 지출을 확인하고 불필요한 소비를 줄여보세요.",
    condition: "예상 가용자금이 기준치에 근접",
    meaning: "지출 관리가 필요함",
    advice: "예정 지출을 확인하고 불필요한 소비를 줄여보세요.",
  },
  {
    status: "흐림",
    tone: "overcast",
    icon: overcast,
    isCurrent: true,
    description: "소비를 줄이거나 예정 지출 일정을 조정해 보세요.",
    condition: "예정 지출 이후 여유 자금이 부족",
    meaning: "소비 축소 또는 일정 조정 필요",
    advice: "소비를 줄이거나 예정 지출 일정을 조정해 보세요.",
  },
  {
    status: "비",
    tone: "rainy",
    icon: rainy,
    description: "즉시 지출 계획을 점검하고 조정하세요.",
    condition: "특정 날짜에 잔액 부족 가능성",
    meaning: "즉시 대응 필요",
    advice: "즉시 지출 계획을 점검하고 조정하세요.",
  },
];

const CLOSE_DRAG_DISTANCE = 300;
const MAX_DRAG_OFFSET = CLOSE_DRAG_DISTANCE + 80;

export default function WeatherGuideBottomSheet({ isOpen, onClose }) {
  const contentRef = useRef(null);
  const touchStartYRef = useRef(0);
  const dragStartYRef = useRef(0);
  const dragOffsetRef = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const appContainer = document.querySelector(".appContainer");

    if (!isOpen || !appContainer) {
      return undefined;
    }

    const previousOverflowY = appContainer.style.overflowY;
    const previousTouchAction = appContainer.style.touchAction;
    appContainer.style.overflowY = "hidden";
    appContainer.style.touchAction = "none";

    return () => {
      appContainer.style.overflowY = previousOverflowY;
      appContainer.style.touchAction = previousTouchAction;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleDragStart = (event) => {
    dragStartYRef.current = event.clientY;
    dragOffsetRef.current = 0;
    setIsDragging(true);
    setDragOffset(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleDragMove = (event) => {
    if (!isDragging) {
      return;
    }

    const nextOffset = Math.max(0, event.clientY - dragStartYRef.current);
    const limitedOffset = Math.min(nextOffset, MAX_DRAG_OFFSET);
    dragOffsetRef.current = limitedOffset;
    setDragOffset(limitedOffset);
  };

  const handleDragEnd = () => {
    if (dragOffsetRef.current > CLOSE_DRAG_DISTANCE) {
      onClose();
    }

    dragOffsetRef.current = 0;
    setIsDragging(false);
    setDragOffset(0);
  };

  return (
    <div
      className={styles.bottomSheetOverlay}
      onTouchStart={(event) => {
        touchStartYRef.current = event.touches[0].clientY;
      }}
      onTouchMove={(event) => {
        const content = contentRef.current;

        if (!content?.contains(event.target)) {
          event.preventDefault();
          return;
        }

        const currentY = event.touches[0].clientY;
        const deltaY = currentY - touchStartYRef.current;
        const isAtTop = content.scrollTop <= 0;
        const isAtBottom =
          content.scrollTop + content.clientHeight >= content.scrollHeight - 1;

        if ((isAtTop && deltaY > 0) || (isAtBottom && deltaY < 0)) {
          event.preventDefault();
        }
      }}
    >
      <div
        className={styles.bottomSheet}
        aria-modal="true"
        role="dialog"
        aria-labelledby="weather-guide-title"
        style={{
          transform: `translateY(${dragOffset}px)`,
          transition: isDragging ? "none" : "transform 180ms ease",
        }}
      >
        <div
          className={styles.bottomSheet__handleArea}
          onPointerCancel={handleDragEnd}
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
        >
          <div className={styles.bottomSheet__handle} />
        </div>

        <div className={styles.bottomSheet__header}>
          <div className={styles.bottomSheet__title} id="weather-guide-title">
            날씨 상태 안내
          </div>
          <img
            className={styles.bottomSheet__closeButton}
            src={close}
            alt="닫기"
            onClick={onClose}
          />
        </div>

        <div className={styles.bottomSheet__content} ref={contentRef}>
          <div className={styles.formulaCard}>
            <div className={styles.formulaCard__title}>
              예상 가용자금 계산 기준
            </div>
            <div className={styles.formulaCard__box}>
              현재 잔액 - 확정 지출 = 예상 가용자금
            </div>
            <div className={styles.formulaCard__caption}>
              확정 지출: 카드 결제, 통신비, 구독료, 대출 상환금 등 날짜가 확정된
              지출
            </div>
          </div>

          <div className={styles.guideList}>
            {WEATHER_GUIDES.map((guide) => (
              <div
                className={`${styles.guideCard} ${styles[`guideCard--${guide.tone}`]}`}
                key={guide.status}
              >
                <div className={styles.guideCard__header}>
                  <div className={styles.guideCard__iconBox}>
                    <img src={guide.icon} alt="" />
                  </div>
                  <div className={styles.guideCard__summary}>
                    <div className={styles.guideCard__statusLine}>
                      <div className={styles.guideCard__statusDot} />
                      <div className={styles.guideCard__statusText}>
                        {guide.status}
                      </div>
                      {guide.isCurrent && (
                        <div className={styles.guideCard__currentBadge}>
                          현재
                        </div>
                      )}
                    </div>
                    <div className={styles.guideCard__description}>
                      {guide.description}
                    </div>
                  </div>
                </div>

                <div className={styles.metaList}>
                  <div className={styles.metaList__row}>
                    <div className={styles.metaList__label}>조건</div>
                    <div className={styles.metaList__value}>
                      {guide.condition}
                    </div>
                  </div>
                  <div className={styles.metaList__row}>
                    <div className={styles.metaList__label}>의미</div>
                    <div className={styles.metaList__value}>
                      {guide.meaning}
                    </div>
                  </div>
                  <div className={styles.metaList__row}>
                    <div className={styles.metaList__label}>권장</div>
                    <div className={styles.metaList__value}>
                      {guide.advice}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
