import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../hooks/useAuth.js";
import { toast } from "sonner";
import Spinner from "../../../shared/components/Spinner.jsx";

const Register = () => {
  const navigate = useNavigate();

  const { loading, handleRegister } = useAuth();

  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleRegister({ username, email, password });
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      toast.error(error?.message || "Registration failed. Please try again.");
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
        <h1>Register</h1>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              onChange={(e) => {
                setUserName(e.target.value);
              }}
              value={username}
              type="text"
              name="username"
              id="username"
              placeholder="Enter username"
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              value={email}
              type="email"
              name="email"
              id="email"
              placeholder="Enter email"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              value={password}
              type="password"
              name="password"
              id="password"
              placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
            />
          </div>
          <button className="button primary-button">Register</button>
        </form>

        <p>
          Already have an account? <Link to={"/login"}>Login</Link>
        </p>
      </div>
    </main>
  );
};

export default Register;
