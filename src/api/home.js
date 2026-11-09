import { fallbackMoneyWeatherData } from "../data/fallbackData";
import { normalizeBaseData } from "./normalizers";
import { monthRange, request, withFallback } from "./client";

export const getHome = async () => {
  const range = monthRange();

  return withFallback(
    async () => {
      const [dashboard, events, weatherStatuses] = await Promise.all([
        request("/dashboard", {
          params: {
            baseDate: range.from,
            targetDate: range.to,
          },
        }),
        request("/financial-events", { params: range }),
        request("/weather-statuses"),
      ]);

      return normalizeBaseData({
        dashboard,
        events,
        weatherStatuses,
        baseDate: range.from,
        useScheduleForNextEvents: true,
      });
    },
    fallbackMoneyWeatherData,
  );
};
