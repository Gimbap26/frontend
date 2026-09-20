import { useEffect, useState } from "react";
import { getWeatherDetail } from "../api/weatherDetail";
import { fallbackMoneyWeatherData } from "../data/fallbackData";

export const useWeatherDetailMoneyWeather = () => {
  const [data, setData] = useState(fallbackMoneyWeatherData);
  const [status, setStatus] = useState("fallback");

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setStatus("loading");
      const nextData = await getWeatherDetail();

      if (!isMounted) {
        return;
      }

      const nextStatus = nextData.source === "api" ? "api" : "fallback";
      setData(nextData);
      setStatus(nextStatus);
      console.log("[MoneyWeather API:weather-detail] render state", {
        status: nextStatus,
      });
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, status };
};
