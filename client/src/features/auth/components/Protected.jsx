import Spinner from "../../../shared/components/Spinner.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { Navigate, Outlet } from "react-router";

const Protected = () => { 
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <main>
        <Spinner />
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />; 
};

export default Protected;