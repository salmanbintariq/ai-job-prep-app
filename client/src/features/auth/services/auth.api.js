import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

export async function register({ username, email, password }) {
  try {
    const res = await api.post("/auth/register", {
      username,
      email,
      password,
    });

    return res.data;
  } catch (error) {
    console.log(error);
  }
}

export async function login({ email, password }) {
  try {
    const res = await api.post("/auth/login", {
      email,
      password,
    });

    return res.data;
  } catch (error) {
    console.log(error);
  }
}

export async function logout() {
  try {
    const res = await api.post("/auth/logout");

    return res.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getMe() {
  try {
    const res = await api.get("/auth/get-me");

    return res.data;
  } catch (error) {
    console.log(error);
  }
}
