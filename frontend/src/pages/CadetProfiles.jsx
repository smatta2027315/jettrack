

import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { cadetRanks } from "../cadetOptions";
import "./CadetProfiles.css";

const cadetPositions = ["Cadet", "Cadet Leader"];
const cadetFlights = ["Alpha", "Bravo", "Charlie"];
const cadetGrades = [8, 9, 10, 11, 12];

export default function CadetProfiles() {
  const { user } = useAuth();
  const isInstructor = user?.role === "Instructor";
  const isCadetLeader = user?.role === "Cadet Leader";
  const canViewProfiles = isInstructor || isCadetLeader || user?.role === "Cadet";
  const canSelectCadet = isInstructor || isCadetLeader;

  const [cadets, setCadets] = useState([]);
  const [cadetsLoading, setCadetsLoading] = useState(false);
  const [cadetsError, setCadetsError] = useState("");
  const [selectedID, setSelectedID] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserID, setSelectedUserID] = useState("");
  const [loadingAvailableUsers, setLoadingAvailableUsers] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const [mode, setMode] = useState("view");

  useEffect(() => {
    if (!canViewProfiles) return;

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
  }, [canViewProfiles]);

  const selectedCadet = cadets.find((cadet) => cadet.cadetID === selectedID);
  const selectedUser = availableUsers.find((availableUser) => (
    availableUser.userID === Number(selectedUserID)
  ));

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
    setSaveError("");
    setSaveMessage("");
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
    setSaveMessage("");
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

  async function handleAdd() {
    setSaveError("");
    setSaveMessage("");
    setCadetsError("");
    setSelectedUserID("");
    setFormData(emptyProfile);
    setMode("add");
    setLoadingAvailableUsers(true);

    try {
      const response = await fetch("/api/cadets/available-users", {
        credentials: "include",
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || `Unable to load available cadets (${response.status})`);
      }

      const result = await response.json();
      if (!Array.isArray(result)) {
        throw new Error("The server returned an invalid available cadets response.");
      }
      setAvailableUsers(result);
    } catch (err) {
      setSaveError(err.message || "Unable to load available cadets.");
      setMode("view");
    } finally {
      setLoadingAvailableUsers(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveError("");

    try {
      const isAdding = mode === "add";
      const response = await fetch(
        isAdding ? "/api/cadets" : `/api/cadets/${selectedID}`,
        {
        method: isAdding ? "POST" : "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isAdding
          ? { ...formData, userID: Number(selectedUserID) }
          : formData),
        }
      );
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || `Unable to ${isAdding ? "create" : "save"} cadet (${response.status})`);
      }

      const savedCadet = await response.json();
      if (isAdding) {
        setCadets((prev) => [...prev, savedCadet]);
        setSelectedID(savedCadet.cadetID);
        if (savedCadet.position === "Cadet Leader") {
          setSaveMessage("Cadet Leader dashboard access will be available after the user refreshes or signs in again.");
        }
        setAvailableUsers((prev) => prev.filter((availableUser) => (
          availableUser.userID !== savedCadet.userID
        )));
      } else {
        if (savedCadet.position !== selectedCadet?.position) {
          setSaveMessage(savedCadet.position === "Cadet Leader"
            ? "Cadet Leader dashboard access will be available after the user refreshes or signs in again."
            : "Cadet dashboard access will be available after the user refreshes or signs in again.");
        }
        setCadets((prev) =>
          prev.map((cadet) => cadet.cadetID === selectedID ? savedCadet : cadet)
        );
      }
      setMode("view");
    } catch (err) {
      setSaveError(err.message || "Unable to save cadet profile.");
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setMode("view");
    setSaveError("");
    setSaveMessage("");
    setFormData(emptyProfile);
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

  if (!canViewProfiles) {
    return <p>You do not have permission to view cadet profiles.</p>;
  }

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

          {canSelectCadet && mode !== "add" && (
            <select
              value={selectedID ?? ""}
              onChange={(e) => selectCadet(e.target.value)}
              disabled={cadetsLoading}
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
          {isInstructor && mode === "add" && (
            <select
              value={selectedUserID}
              onChange={(e) => {
                const nextUserID = e.target.value;
                const nextUser = availableUsers.find((availableUser) => (
                  availableUser.userID === Number(nextUserID)
                ));
                setSelectedUserID(nextUserID);
                setFormData({
                  ...emptyProfile,
                  first_name: nextUser?.first_name || "",
                  last_name: nextUser?.last_name || "",
                });
              }}
              disabled={loadingAvailableUsers || availableUsers.length === 0}
            >
              <option value="">
                {loadingAvailableUsers
                  ? "Loading accounts..."
                  : availableUsers.length === 0
                  ? "No accounts available"
                  : "Select Cadet Account"}
              </option>
              {availableUsers.map((availableUser) => (
                <option key={availableUser.userID} value={availableUser.userID}>
                  {availableUser.last_name}, {availableUser.first_name}
                </option>
              ))}
            </select>
          )}
          {cadetsError && (
            <p className="error" role="alert">{cadetsError}</p>
          )}
        </section>

        {/* PROFILE INFORMATION */}
        <section className="profile-table">

          {mode === "view" && !selectedCadet ? (
            <p className="profile-empty-message">
              {cadetsLoading
                ? "Loading cadet profile..."
                : user?.role === "Cadet"
                ? "No cadet profile has been added to your account yet."
                : "No cadet profiles found."}
            </p>
          ) : fields.map((field) => {
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
                    mode === "add" ? (
                      selectedUser
                        ? `${selectedUser.last_name}, ${selectedUser.first_name}`
                        : "Select a cadet account"
                    ) : (
                      <div className="name-inputs">
                        <input
                          name="last_name"
                          placeholder="Last Name"
                          value={formData.last_name}
                          onChange={handleChange}
                          required
                        />

                        <input
                          name="first_name"
                          placeholder="First Name"
                          value={formData.first_name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    )
                  ) : (
                    field.name === "rank" ? (
                      <select name="rank" value={formData.rank} onChange={handleChange} required>
                        <option value="">Select rank</option>
                        <optgroup label="Enlisted">
                          {cadetRanks.enlisted.map((rank) => (
                            <option key={rank} value={rank}>{rank}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Officer">
                          {cadetRanks.officer.map((rank) => (
                            <option key={rank} value={rank}>{rank}</option>
                          ))}
                        </optgroup>
                      </select>
                    ) : field.name === "position" ? (
                      <select name="position" value={formData.position} onChange={handleChange} required>
                        <option value="">Select position</option>
                        {cadetPositions.map((position) => (
                          <option key={position} value={position}>{position}</option>
                        ))}
                      </select>
                    ) : field.name === "flight" ? (
                      <select name="flight" value={formData.flight} onChange={handleChange} required>
                        <option value="">Select flight</option>
                        {cadetFlights.map((flight) => (
                          <option key={flight} value={flight}>{flight}</option>
                        ))}
                      </select>
                    ) : field.name === "grade_level" ? (
                      <select name="grade_level" value={formData.grade_level} onChange={handleChange} required>
                        <option value="">Select grade</option>
                        {cadetGrades.map((grade) => (
                          <option key={grade} value={grade}>{grade}</option>
                        ))}
                      </select>
                    ) : null
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
            {saveMessage && <p className="profile-save-message" role="status">{saveMessage}</p>}

            <button
              onClick={handleAdd}
              disabled={mode !== "view" || loadingAvailableUsers}
            >
              Add Cadet Profile
            </button>

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
                disabled={saving || (mode === "add" && !selectedUserID)}
              >
                {saving ? "SAVING..." : "SAVE"}
              </button>
            )}

            {mode !== "view" && (
              <button
                onClick={cancelEdit}
                disabled={saving}
              >
                CANCEL
              </button>
            )}

          </section>
        )}

      </main>
    </div>
  );
}
