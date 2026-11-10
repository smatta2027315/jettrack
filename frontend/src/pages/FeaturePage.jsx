
import { useNavigate } from "react-router-dom";

export default function FeaturePage({ title, description }) {
  const navigate = useNavigate();

  return (
    <div className="feature-page">

      <header className="feature-header">
        <h1>JET TRACK</h1>
        <p>INTEGRITY - SERVICE - EXCELLENCE</p>
      </header>

      <main className="feature-content">

        <button
          className="back-button"
          onClick={() => navigate("/leader-home")}
        >
          ← Back to Dashboard
        </button>

        <h2>{title}</h2>

        <p>{description}</p>

        <div className="development-box">
          <h3>Section Under Development</h3>

          <p>
            This section is currently being developed.
            Please check back later!
          </p>
        </div>

      </main>

    </div>
  );
}
