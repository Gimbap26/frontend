import { getHome } from "../api/home";
import { useAsync } from "./useAsync";

export const useHomeMoneyWeather = () => {
  const { data, loading, error, refetch } = useAsync(getHome);
  const status = loading
    ? "loading"
    : data?.source === "api"
      ? "api"
      : "fallback";

  return { data, loading, error, refetch, status };
};
