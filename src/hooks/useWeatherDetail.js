import { getWeatherDetail } from "../api/weatherDetail";
import { useAsync } from "./useAsync";

export const useWeatherDetailMoneyWeather = () => {
  const { data, loading, error, refetch } = useAsync(getWeatherDetail);
  const status = loading
    ? "loading"
    : data?.source === "api"
      ? "api"
      : "fallback";

  return { data, loading, error, refetch, status };
};
