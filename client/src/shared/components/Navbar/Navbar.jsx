import { useNavigate } from "react-router";
import { useAuth } from "../../../features/auth/hooks/useAuth.js";
import { toast } from "sonner";
import "./Navbar.scss";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, handleLogout } = useAuth();

  const onLogout = async () => {
    try {
      await handleLogout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar__inner">

        {/* ── Logo ── */}
        <div className="navbar__logo" onClick={() => navigate("/")}>
          <div className="logo-icon">✨</div>
          <p className="logo-text">
            Prep<span>AI</span>
          </p>
        </div>

        {/* ── Actions ── */}
        <div className="navbar__actions">

          {user ? (
            // ── Logged In ──
            <>
              <span className="navbar__user">
                Hey, <span>{user.username}</span>!
              </span>

              <button
                className="navbar__btn navbar__btn--ghost"
                onClick={() => navigate("/")}
              >
                + New Report
              </button>

              <button
                className="navbar__btn navbar__btn--danger"
                onClick={onLogout}
              >
                Logout
              </button>
            </>
          ) : (
            // ── Guest ──
            <>
              <button
                className="navbar__btn navbar__btn--ghost"
                onClick={() => navigate("/login")}
              >
                Login
              </button>

              <button
                className="navbar__btn navbar__btn--primary"
                onClick={() => navigate("/register")}
              >
                Get Started
              </button>
            </>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;