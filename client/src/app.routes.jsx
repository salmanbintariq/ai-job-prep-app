import { createBrowserRouter, Navigate } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Home from "./features/ai/pages/Home";
import Protected from "./features/auth/components/Protected";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Protected><Home /></Protected>,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
]);
