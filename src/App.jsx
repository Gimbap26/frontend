import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import HomePage from "./pages/HomePage";
import WeatherDetail from "./pages/WeatherDetail";
import Accounts from "./pages/accounts/Accounts.jsx";
import Transactions from "./pages/transactions/Transactions.jsx";
import Ai from "./pages/ai/Ai.jsx";
import Schedule from "./pages/schedule/Schedule.jsx";

function App() {
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
