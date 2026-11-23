import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import "./FitnessManagement.css";

const emptyFitness = { sitUps: "", pushUps: "", mileTime: "" };

export default function FitnessManagement() {
  const { user } = useAuth();
  const canEdit = ["Instructor", "Cadet Leader"].includes(user?.role);
  const canView = canEdit || user?.role === "Cadet";

  const [cadets, setCadets] = useState([]);
  const [selectedID, setSelectedID] = useState(null);
  const [fitness, setFitness] = useState(emptyFitness);
  const [formData, setFormData] = useState(emptyFitness);
  const [loadingCadets, setLoadingCadets] = useState(true);
  const [loadingFitness, setLoadingFitness] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchCadets() {
      try {
        const response = await fetch("/api/cadets", { credentials: "include" });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(result.error || `Unable to load cadets (${response.status})`);
        }
        if (!Array.isArray(result)) {
          throw new Error("The server returned an invalid cadets response.");
        }
        if (active) {
          setCadets(result);
          setSelectedID(result[0]?.cadetID ?? null);
        }
      } catch (err) {
        if (active) setError(err.message || "Unable to load cadets.");
      } finally {
        if (active) setLoadingCadets(false);
      }
    }

    if (canView) fetchCadets();
    else setLoadingCadets(false);

    return () => {
      active = false;
    };
  }, [canView]);

  useEffect(() => {
    if (!selectedID) {
      setFitness(emptyFitness);
      return undefined;
    }

    let active = true;
    setLoadingFitness(true);
    setError("");

    async function fetchFitness() {
      try {
        const response = await fetch(`/api/records/${selectedID}`, {
          credentials: "include",
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(result.error || `Unable to load fitness records (${response.status})`);
        }
        if (active) {
          setFitness(result.fitness || emptyFitness);
          setFormData(result.fitness || emptyFitness);
        }
      } catch (err) {
        if (active) setError(err.message || "Unable to load fitness records.");
      } finally {
        if (active) setLoadingFitness(false);
      }
    }

    fetchFitness();
    return () => {
      active = false;
    };
  }, [selectedID]);

  const selectedCadet = cadets.find((cadet) => cadet.cadetID === selectedID);

  function selectCadet(id) {
    setSelectedID(Number(id));
    setEditing(false);
    setMessage("");
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/records/${selectedID}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fitness: formData }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || `Unable to save fitness scores (${response.status})`);
      }
      setFitness(result.fitness);
      setFormData(result.fitness);
      setEditing(false);
      setMessage("Fitness scores saved to the database.");
    } catch (err) {
      setError(err.message || "Unable to save fitness scores.");
    } finally {
      setSaving(false);
    }
  }

  if (!canView) {
    return <p>You do not have permission to view fitness records.</p>;
  }

  return (
    <div className="fitness-page">
      <aside className="fitness-sidebar">
        <div className="fitness-sidebar-logo">✈</div>
        <a href="/" title="Profile">👤</a>
        <a href="/" title="Home">⌂</a>
        <a href="/" title="Settings">⚙</a>
        <a href="/" title="History">◷</a>
        <a href="/" title="Help">?</a>
      </aside>

      <main className="fitness-main">
        <header className="fitness-header">
          <div className="fitness-brand">
            <h1>JET <span>✈</span></h1>
            <h2>TRACK</h2>
          </div>
          <h1 className="fitness-title">FITNESS SCORES TRACKING</h1>
          <div className="fitness-management-icon">
            <span>🏋️</span>
            <h3>FITNESS<br />MANAGEMENT</h3>
          </div>
        </header>

        <section className="fitness-controls">
          {canEdit ? (
            <select
              aria-label="Select cadet"
              value={selectedID ?? ""}
              onChange={(e) => selectCadet(e.target.value)}
              disabled={loadingCadets || cadets.length === 0 || editing}
            >
              {cadets.length === 0 ? (
                <option value="">No cadets found</option>
              ) : cadets.map((cadet) => (
                <option key={cadet.cadetID} value={cadet.cadetID}>
                  {cadet.last_name}, {cadet.first_name}
                </option>
              ))}
            </select>
          ) : selectedCadet ? (
            <p>{selectedCadet.last_name}, {selectedCadet.first_name}</p>
          ) : null}
        </section>

        {error && <p className="fitness-message" role="alert">{error}</p>}
        {message && <p className="fitness-message" role="status">{message}</p>}

        <section className="fitness-content">
          {loadingCadets || loadingFitness ? (
            <p>Loading fitness scores...</p>
          ) : !selectedCadet ? (
            <p>No cadet profile is available.</p>
          ) : (
            <>
              <div className="fitness-inputs">
                {[
                  ["SIT-UPS:", "sitUps", "number"],
                  ["PUSH-UPS:", "pushUps", "number"],
                  ["MILE TIME:", "mileTime", "text"],
                ].map(([label, name, type]) => (
                  <div className={`fitness-field ${name}-field`} key={name}>
                    <label htmlFor={`fitness-${name}`}>{label}</label>
                    <input
                      id={`fitness-${name}`}
                      type={type}
                      min={type === "number" ? "0" : undefined}
                      placeholder={name === "mileTime" ? "MM:SS" : ""}
                      value={(editing ? formData : fitness)[name]}
                      onChange={(e) => setFormData((previous) => ({
                        ...previous,
                        [name]: e.target.value,
                      }))}
                      readOnly={!editing}
                    />
                  </div>
                ))}
              </div>

              {canEdit && (
                <div className="fitness-actions">
                  {editing ? (
                    <>
                      <button className="save-btn" onClick={handleSave} disabled={saving}>
                        {saving ? "SAVING..." : "SAVE"}
                      </button>
                      <button
                        className="update-btn"
                        onClick={() => {
                          setFormData(fitness);
                          setEditing(false);
                          setError("");
                        }}
                        disabled={saving}
                      >
                        CANCEL
                      </button>
                    </>
                  ) : (
                    <button className="update-btn" onClick={() => setEditing(true)}>
                      Update Info
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
