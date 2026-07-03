import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

// Add access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function register({ username, email, password }) {
  try {
    const res = await api.post("/auth/register", {
      username,
      email,
      password,
    });

    // Store the access token after registration
    if (res.data.accessToken) {
      localStorage.setItem("accessToken", res.data.accessToken);
    }

    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function login({ email, password }) {
  try {
    const res = await api.post("/auth/login", {
      email,
      password,
    });

    // Store the access token after login
    if (res.data.accessToken) {
      localStorage.setItem("accessToken", res.data.accessToken);
    }

    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function logout() {
  try {
    const res = await api.post("/auth/logout");

    // Remove the access token after logout
    localStorage.removeItem("accessToken");

    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function getMe() {
  try {
    const res = await api.get("/auth/get-me");

    return res.data;
  } catch (error) {
    throw error;
  }
}
