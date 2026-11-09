import { fallbackMoneyWeatherData } from "../data/fallbackData";
import { normalizeBaseData } from "./normalizers";
import { monthRange, request, withFallback } from "./client";

const toBriefingMessages = (recommendation) =>
  Array.isArray(recommendation?.actions)
    ? recommendation.actions
        .map((action) => action?.message?.trim())
        .filter(Boolean)
    : [];

export const getHome = async () => {
  const range = monthRange();

  return withFallback(
    async () => {
      const [dashboard, events, weatherStatuses, recommendation] =
        await Promise.all([
          request("/dashboard", {
            params: {
              baseDate: range.from,
              targetDate: range.to,
            },
          }),
          request("/financial-events", { params: range }),
          request("/weather-statuses"),
          request("/agent/recommend-actions", { method: "POST" }).catch(
            (error) => {
              console.warn("[api] AI 행동 추천 요청 실패", error);
              return null;
            },
          ),
        ]);

      return {
        ...normalizeBaseData({
          dashboard,
          events,
          weatherStatuses,
          baseDate: range.from,
          useScheduleForNextEvents: true,
        }),
        briefingMessages: toBriefingMessages(recommendation),
      };
    },
    fallbackMoneyWeatherData,
  );
};
