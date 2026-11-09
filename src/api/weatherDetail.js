import { fallbackMoneyWeatherData } from "../data/fallbackData";
import { normalizeBaseData } from "./normalizers";
import { monthRange, request, withFallback } from "./client";

const buildTimeline = (forecastTimeline, monthStart, fallbackBalance) => {
  const points = Array.isArray(forecastTimeline)
    ? forecastTimeline.map((point) => ({
        date: point.date,
        balance: point.balance ?? point.expectedBalance ?? point.expectedAmount,
        eventAmount: point.eventAmount ?? 0,
      }))
    : [];

  if (points.length === 0) {
    return [{ date: monthStart, balance: fallbackBalance }];
  }

  const [first] = points;
  const timeline = points.map(({ date, balance }) => ({ date, balance }));

  if (first.date === monthStart) {
    return timeline;
  }

  return [
    { date: monthStart, balance: first.balance - first.eventAmount },
    ...timeline,
  ];
};

export const getWeatherDetail = async () => {
  const range = monthRange();

  return withFallback(
    async () => {
      const [dashboard, events, forecast, weatherStatuses] = await Promise.all([
        request("/dashboard", {
          params: { baseDate: range.from, targetDate: range.to },
        }),
        request("/financial-events", { params: range }),
        request("/forecasts", { params: range }),
        request("/weather-statuses"),
      ]);
      const weather =
        dashboard?.weather ??
        forecast?.weatherStatus ??
        fallbackMoneyWeatherData.weather;
      const baseData = normalizeBaseData({
        dashboard: { ...dashboard, weather },
        events,
        weatherStatuses,
        baseDate: forecast?.timeline?.[0]?.date ?? range.from,
      });

      return {
        ...baseData,
        currentBalance:
          dashboard?.currentBalance ??
          forecast?.currentBalance ??
          fallbackMoneyWeatherData.currentBalance,
        forecast: {
          minimumBalanceDate:
            forecast?.minimumBalanceDate ??
            fallbackMoneyWeatherData.forecast.minimumBalanceDate,
          minimumBalance:
            forecast?.minimumExpectedBalance ??
            fallbackMoneyWeatherData.forecast.minimumBalance,
          timeline: buildTimeline(
            forecast?.timeline,
            range.from,
            dashboard?.currentBalance ?? fallbackMoneyWeatherData.currentBalance,
          ),
        },
      };
    },
    fallbackMoneyWeatherData,
  );
};
