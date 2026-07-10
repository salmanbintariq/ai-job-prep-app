import axios from "axios";

// ─── Axios Instance ──────────────────────────────────────────
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

// ─── Request Interceptor ─────────────────────────────────────
// Har request se pehle accessToken attach karega
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ─── Generate Interview Report ───────────────────────────────
// @desc   Resume + JD + selfDescription bhejo — AI report lo
// @param  { resumeFile, jobDescription, selfDescription }
// @return { success, message, data: interviewReport }
