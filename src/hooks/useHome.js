import { useEffect, useState } from "react";
import { getHome } from "../api/home";
import { fallbackMoneyWeatherData } from "../data/fallbackData";

export const useHomeMoneyWeather = () => {
  const [data, setData] = useState(fallbackMoneyWeatherData);
  const [status, setStatus] = useState("fallback");

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setStatus("loading");
      const nextData = await getHome();

      if (!isMounted) {
        return;
      }

      const nextStatus = nextData.source === "api" ? "api" : "fallback";
      setData(nextData);
      setStatus(nextStatus);
      console.log("[MoneyWeather API:home] render state", {
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
