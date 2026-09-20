import { fallbackMoneyWeatherData } from "../data/fallbackData";

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const toMonthRange = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  return {
    from: formatDate(new Date(year, month, 1)),
    to: formatDate(new Date(year, month + 1, 0)),
  };
};

const formatMonthLabel = (dateString) => {
  if (!dateString) {
    return fallbackMoneyWeatherData.baseMonthLabel;
  }

  const [year, month] = dateString.split("-");
  return `${Number(year)}년 ${Number(month)}월`;
};

const formatEventDate = (dateString, withDayText = false) => {
  if (!dateString) {
    return "";
  }

  const [, month, day] = dateString.split("-");
  return withDayText
    ? `${Number(month)}월 ${Number(day)}일`
    : `${Number(month)}/${Number(day)}`;
};

const normalizeEvent = (event) => {
  const isIncome = event.direction === "INFLOW";

  return {
    id: event.eventId,
    name: event.title,
    date: formatEventDate(event.eventDate, true),
    shortDate: formatEventDate(event.eventDate),
    amount: event.amount,
    type: isIncome ? "income" : "expense",
  };
};

const findWeatherStatus = (statuses, weather) =>
  statuses?.find((item) => item.status === weather);

const valueOrFallback = (value, fallback) =>
  typeof value === "string" && value.trim() === "" ? fallback : value ?? fallback;

export const normalizeBaseData = ({
  dashboard,
  events,
  weatherStatuses,
  baseDate,
}) => {
  const weather = dashboard?.weather ?? fallbackMoneyWeatherData.weather;
  const weatherStatus =
    findWeatherStatus(weatherStatuses?.statuses, weather) ??
    findWeatherStatus(fallbackMoneyWeatherData.weatherStatuses, weather);
  const monthlySchedule =
    events?.events?.map(normalizeEvent) ?? fallbackMoneyWeatherData.monthlySchedule;
  const nextEvents =
    dashboard?.nextEvents?.length > 0
      ? dashboard.nextEvents.map(normalizeEvent)
      : monthlySchedule.filter((event) => event.type === "expense").slice(0, 3);

  return {
    source: "api",
    baseMonthLabel: formatMonthLabel(baseDate),
    currentBalance:
      dashboard?.currentBalance ?? fallbackMoneyWeatherData.currentBalance,
    fixedOutflows:
      dashboard?.fixedOutflows ?? fallbackMoneyWeatherData.fixedOutflows,
    availableFunds:
      dashboard?.availableFunds ?? fallbackMoneyWeatherData.availableFunds,
    weather,
    weatherLabel: valueOrFallback(
      weatherStatus?.label,
      fallbackMoneyWeatherData.weatherLabel,
    ),
    weatherDescription: valueOrFallback(
      weatherStatus?.description,
      fallbackMoneyWeatherData.weatherDescription,
    ),
    weatherGuide: valueOrFallback(
      weatherStatus?.guide,
      fallbackMoneyWeatherData.weatherGuide,
    ),
    dashboardRiskSummary: valueOrFallback(
      dashboard?.riskSummary,
      fallbackMoneyWeatherData.dashboardRiskSummary,
    ),
    nextEvents,
    monthlySchedule,
    weatherStatuses:
      weatherStatuses?.statuses ?? fallbackMoneyWeatherData.weatherStatuses,
  };
};
