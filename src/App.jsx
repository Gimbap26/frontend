import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ensureAuthenticated } from "./api/auth";
import Layout from "./components/Layout.jsx";
import HomePage from "./pages/HomePage";
import WeatherDetail from "./pages/WeatherDetail";
import Accounts from "./pages/accounts/Accounts.jsx";
import Transactions from "./pages/transactions/Transactions.jsx";
import Ai from "./pages/ai/Ai.jsx";
import Schedule from "./pages/schedule/Schedule.jsx";

// 앱 진입 전(로그인 중/실패) 상태 문구.
// 페이지의 "불러오는 중..."(Layout + 페이지 여백 + AsyncBoundary)과 같은 위치·스타일로 표시한다.
function AppStatusScreen({ isError = false, children }) {
  return (
    <div className="appContainer">
      <div className="mx-auto h-full w-full max-w-[403px] bg-canvas px-[16px] py-[24px]">
        <p
          className={`py-[40px] text-center text-[13px] ${
            isError ? "text-danger" : "text-muted"
          }`}
          role={isError ? "alert" : "status"}
        >
          {children}
        </p>
      </div>
    </div>
  );
}

function App() {
  const [authState, setAuthState] = useState({ status: "loading", error: null });

  useEffect(() => {
    let isMounted = true;

    ensureAuthenticated()
      .then(() => {
        if (isMounted) {
          setAuthState({ status: "ready", error: null });
        }
      })
      .catch((error) => {
        if (isMounted) {
          setAuthState({ status: "error", error });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (authState.status === "loading") {
    return <AppStatusScreen>로그인 중...</AppStatusScreen>;
  }

  if (authState.status === "error") {
    return (
      <AppStatusScreen isError>
        서비스를 시작하지 못했습니다: {authState.error.message}
      </AppStatusScreen>
    );
  }

  return (
    <div className="appContainer">
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="home" element={<HomePage />} />
            <Route path="weather" element={<WeatherDetail />} />
            <Route path="accounts" element={<Accounts />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="ai" element={<Ai />} />
            <Route path="schedule" element={<Schedule />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
