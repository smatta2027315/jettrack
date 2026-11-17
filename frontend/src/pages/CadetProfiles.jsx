

import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import "./CadetProfiles.css";

export default function CadetProfiles() {
  const { user } = useAuth();
  
  // Determine user permissions
  const isInstructor = user?.role === "Instructor";

  const [cadets, setCadets] = useState([]);
  const [cadetsLoading, setCadetsLoading] = useState(false);
  const [cadetsError, setCadetsError] = useState("");
  const [selectedID, setSelectedID] = useState(null);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  const [mode, setMode] = useState("view");

  useEffect(() => {
    if (!isInstructor) return;

    let active = true;

    async function fetchCadets() {
      setCadetsLoading(true);
      setCadetsError("");

      try {
        const response = await fetch("/api/cadets", { credentials: "include" });
        if (!response.ok) {
          const result = await response.json().catch(() => ({}));
          throw new Error(result.error || `Unable to load cadets (${response.status})`);
        }

        const result = await response.json();
        if (!Array.isArray(result)) {
          throw new Error("The server returned an invalid cadets response.");
        }

        if (active) {
          setCadets(result);
          setSelectedID(result[0]?.cadetID ?? null);
        }
      } catch (err) {
        if (active) setCadetsError(err.message || "Unable to load cadets.");
      } finally {
        if (active) setCadetsLoading(false);
      }
    }

    fetchCadets();
    return () => {
      active = false;
    };
  }, [isInstructor]);

  const selectedCadet = isInstructor
    ? cadets.find((c) => c.cadetID === selectedID)
    : {
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        rank: "",
        position: "",
        flight: "",
        grade_level: "",
      };

  const emptyProfile = {
    first_name: "",
    last_name: "",
    rank: "",
    position: "",
    flight: "",
    grade_level: "",
  };

  const [formData, setFormData] = useState(emptyProfile);

  // Update displayed form when selecting a cadet
  function selectCadet(id) {
    setSelectedID(Number(id));
    setMode("view");
    setFormData(emptyProfile);
  }

  // Update an individual field
  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // Start editing an existing profile
  function handleUpdate() {
    if (!selectedCadet) return;

    setSaveError("");
    setFormData({
      first_name: selectedCadet.first_name,
      last_name: selectedCadet.last_name,
      rank: selectedCadet.rank,
      position: selectedCadet.position,
      flight: selectedCadet.flight,
      grade_level: selectedCadet.grade_level,
    });

    setMode("edit");
  }

  async function handleSave() {
    setSaving(true);
    setSaveError("");

    try {
      const response = await fetch(`/api/cadets/${selectedID}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || `Unable to save cadet (${response.status})`);
      }

      const updatedCadet = await response.json();
      setCadets((prev) =>
        prev.map((cadet) => cadet.cadetID === selectedID ? updatedCadet : cadet)
      );
      setMode("view");
    } catch (err) {
      setSaveError(err.message || "Unable to save cadet.");
    } finally {
      setSaving(false);
    }
  }

  // Display the selected profile or editing form
  const profile = mode === "view" ? selectedCadet : formData;

  const fields = [
    { label: "Name (Last, First)", name: "name" },
    { label: "Rank", name: "rank" },
    { label: "Position", name: "position" },
    { label: "Flight", name: "flight" },
    { label: "Grade", name: "grade_level" },
  ];

  return (
    <div className="cadet-profile-page">

      {/* LEFT SIDEBAR */}
      <aside className="profile-sidebar">
        <h2>JET TRACK</h2>

        <nav>
          <button title="Profile">👤</button>
          <button title="Home">🏠</button>
          <button title="Settings">⚙️</button>
          <button title="Help">❔</button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="profile-main">

        <h1>CADET PROFILE & TRACKING</h1>

        {/* PROFILE AVATAR */}
        <section className="profile-avatar-section">
          <div className="profile-avatar">👤</div>

          {isInstructor && (
            <select
              value={selectedID ?? ""}
              onChange={(e) => selectCadet(e.target.value)}
            >
              <option value="">
                {cadetsLoading
                  ? "Loading cadets..."
                  : cadets.length === 0
                  ? "No cadets found"
                  : "Select Cadet"}
              </option>

              {cadets.map((cadet) => (
                <option
                  key={cadet.cadetID}
                  value={cadet.cadetID}
                >
                  {cadet.last_name}, {cadet.first_name}
                </option>
              ))}
            </select>
          )}
          {isInstructor && cadetsError && (
            <p className="error" role="alert">{cadetsError}</p>
          )}
        </section>

        {/* PROFILE INFORMATION */}
        <section className="profile-table">

          {fields.map((field) => {
            let value = profile?.[field.name] ?? "";

            if (field.name === "name") {
              value = profile
                ? `${profile.last_name}, ${profile.first_name}`
                : "";
            }

            return (
              <div className="profile-table-row" key={field.name}>

                <div className="profile-table-label">
                  {field.label}
                </div>

                <div className="profile-table-value">

                  {mode === "view" ? (
                    value || "Not provided"
                  ) : field.name === "name" ? (
                    <div className="name-inputs">
                      <input
                        name="last_name"
                        placeholder="Last Name"
                        value={formData.last_name}
                        onChange={handleChange}
                      />

                      <input
                        name="first_name"
                        placeholder="First Name"
                        value={formData.first_name}
                        onChange={handleChange}
                      />
                    </div>
                  ) : (
                    <input
                      name={field.name}
                      type={field.name === "grade_level" ? "number" : "text"}
                      value={formData[field.name]}
                      onChange={handleChange}
                    />
                  )}

                </div>
              </div>
            );
          })}

        </section>

        {/* INSTRUCTOR CONTROLS */}
        {isInstructor && (
          <section className="profile-actions">
            {saveError && <p className="error" role="alert">{saveError}</p>}

            <button
              onClick={handleUpdate}
              disabled={!selectedCadet || mode !== "view"}
            >
              Update Info
            </button>

            {mode !== "view" && (
              <button
                className="profile-save-button"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "SAVING..." : "SAVE"}
              </button>
            )}

          </section>
        )}

      </main>
    </div>
  );
}
