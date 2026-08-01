import "../auth.form.scss";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../hooks/useAuth.js";
import { useState } from "react";
import { toast } from "sonner";
import Spinner from "../../../shared/components/Spinner.jsx";

const Login = () => {
  const navigate = useNavigate();
  const { loading, handleLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleLogin({ email, password });
      toast.success("Welcome back!");
      navigate("/");
    } catch (error) {
      toast.error(error?.message || "Login failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <main>
        <Spinner size="inline" />
      </main>
    );
  }

  return (
    <main>
      <div className="form-container">
        <h1>Login</h1>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email"
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Password</label>
            <input
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              type="password"
              name="password"
              id="password"
              placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
            />
          </div>
          <button className="button primary-button">Login</button>
        </form>

        <p>
          Don't have an account? <Link to={"/register"}>Register</Link>
        </p>
      </div>
    </main>
  );
};

export default Login;
