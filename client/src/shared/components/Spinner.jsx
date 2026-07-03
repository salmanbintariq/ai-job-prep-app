import "./Spinner.scss";

// size: "fullscreen" | "inline"
const Spinner = ({ size = "fullscreen" }) => {
  return (
    <div className={`spinner-overlay ${size === "inline" ? "inline" : ""}`}>
      <div className="spinner" />
    </div>
  );
};

export default Spinner;