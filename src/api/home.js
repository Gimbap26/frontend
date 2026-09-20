import { fallbackMoneyWeatherData } from "../data/fallbackData";
import { normalizeBaseData, toMonthRange } from "./normalizers";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1";
const DEFAULT_USER_ID = import.meta.env.VITE_DEV_USER_ID ?? "1";

const logState = (scope, message, detail) => {
  console.log(`[MoneyWeather API:${scope}] ${message}`, detail ?? "");
};

const requestJson = async (path, params = {}) => {
  const url = new URL(`${API_BASE_URL}${path}`);
  url.searchParams.set("userId", DEFAULT_USER_ID);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json; charset=UTF-8",
      "X-User-Id": DEFAULT_USER_ID,
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.json();
};

const withFallback = async (scope, request, fallbackData) => {
  logState(scope, "loading", {
    baseUrl: API_BASE_URL,
    fallbackReady: true,
  });

  try {
    const data = await request();
    logState(scope, "api success", data);
    return data;
  } catch (error) {
    logState(scope, "fallback active", {
      reason: error.message,
      data: fallbackData,
    });
    return fallbackData;
  }
};

export const getHome = async () => {
  const range = toMonthRange();

  return withFallback(
    "home",
    async () => {
      const [dashboard, events, weatherStatuses] = await Promise.all([
        requestJson("/dashboard", {
          baseDate: range.from,
          targetDate: range.to,
        }),
        requestJson("/financial-events", { from: range.from, to: range.to }),
        requestJson("/weather-statuses"),
      ]);

      return normalizeBaseData({
        dashboard,
        events,
        weatherStatuses,
        baseDate: range.from,
      });
    },
    fallbackMoneyWeatherData,
  );
};
