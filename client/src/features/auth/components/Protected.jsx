import Spinner from "../../../shared/components/Spinner.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { Navigate } from "react-router";

const Protected = ({ children }) => {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <main>
        <Spinner/>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default Protected;
