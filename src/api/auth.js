const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const AUTO_LOGIN_EMAIL = import.meta.env.VITE_AUTO_LOGIN_EMAIL ?? "";
const AUTO_LOGIN_PASSWORD = import.meta.env.VITE_AUTO_LOGIN_PASSWORD ?? "";
const TOKEN_STORAGE_KEY = "money-weather-access-token";

let loginPromise = null;

export const getAccessToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

const saveAccessToken = (token) => {
  try {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // sessionStorage를 사용할 수 없는 환경에서는 메모리 내 로그인 흐름만 유지한다.
  }
};

export const clearAccessToken = (expectedToken) => {
  try {
    if (!expectedToken || sessionStorage.getItem(TOKEN_STORAGE_KEY) === expectedToken) {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // 저장소 접근 실패는 다음 로그인 요청에서 처리한다.
  }
};

const login = async () => {
  if (!API_BASE_URL) {
    return null;
  }

  if (!AUTO_LOGIN_EMAIL || !AUTO_LOGIN_PASSWORD) {
    throw new Error("자동 로그인 계정 정보가 설정되지 않았습니다.");
  }

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: AUTO_LOGIN_EMAIL,
      password: AUTO_LOGIN_PASSWORD,
    }),
  });

  if (!response.ok) {
    throw new Error(`자동 로그인 실패 (${response.status})`);
  }

  const data = await response.json();

  if (!data.accessToken) {
    throw new Error("로그인 응답에 accessToken이 없습니다.");
  }

  saveAccessToken(data.accessToken);
  return data.accessToken;
};

export const ensureAuthenticated = ({ force = false } = {}) => {
  const storedToken = getAccessToken();

  if (!force && storedToken) {
    return Promise.resolve(storedToken);
  }

  if (!loginPromise) {
    loginPromise = login().finally(() => {
      loginPromise = null;
    });
  }

  return loginPromise;
};
