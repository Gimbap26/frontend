import { fallbackMoneyWeatherData } from "../data/fallbackData";

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
  statuses?.find((item) => item.weather === weather);

const valueOrFallback = (value, fallback) =>
  typeof value === "string" && value.trim() === "" ? fallback : value ?? fallback;

export const normalizeBaseData = ({
  dashboard,
  events,
  weatherStatuses,
  baseDate,
  useScheduleForNextEvents = false,
}) => {
  const weather = dashboard?.weather ?? fallbackMoneyWeatherData.weather;
  const weatherStatus =
    findWeatherStatus(weatherStatuses?.statuses, weather) ??
    findWeatherStatus(fallbackMoneyWeatherData.weatherStatuses, weather);
  const monthlySchedule = Array.isArray(events?.events)
    ? events.events
        .filter((event) => event.status !== "CANCELED")
        .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
        .map(normalizeEvent)
    : [];
  const scheduleExpenses = monthlySchedule
    .filter((event) => event.type === "expense")
    .slice(0, 3);
  const nextEvents = useScheduleForNextEvents
    ? scheduleExpenses
    : Array.isArray(dashboard?.nextEvents)
      ? dashboard.nextEvents.map(normalizeEvent)
      : scheduleExpenses;

  return {
    source: "api",
    baseMonthLabel: formatMonthLabel(baseDate),
    currentBalance:
      dashboard?.currentBalance ?? fallbackMoneyWeatherData.currentBalance,
    fixedOutflows:
      dashboard?.fixedOutflows ?? fallbackMoneyWeatherData.fixedOutflows,
    availableFunds:
      dashboard?.availableAmount ?? fallbackMoneyWeatherData.availableFunds,
    weather,
    weatherLabel: valueOrFallback(
      weatherStatus?.label,
      fallbackMoneyWeatherData.weatherLabel,
    ),
    weatherDescription: valueOrFallback(
      weatherStatus?.description,
      fallbackMoneyWeatherData.weatherDescription,
    ),
    dashboardRiskSummary: valueOrFallback(
      dashboard?.riskSummary?.message,
      fallbackMoneyWeatherData.dashboardRiskSummary,
    ),
    nextEvents,
    monthlySchedule,
    weatherStatuses:
      weatherStatuses?.statuses ?? fallbackMoneyWeatherData.weatherStatuses,
  };
};
