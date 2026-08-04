import { createBrowserRouter, Navigate, Outlet } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Home from "./features/ai/pages/Home";
import Protected from "./features/auth/components/Protected";
import Interview from "./features/ai/pages/Interview";
import Navbar from "./shared/components/Navbar/Navbar.jsx";


const Layout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
)


export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,  
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        element: <Protected />,
        children: [
          {
            path: "/interview/:interviewId",
            element: <Interview />,
          },
        ],
      },
      {
        path: "*",
        element: <Navigate to="/" replace />, 
      },
    ],
  },
]);
