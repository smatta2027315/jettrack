import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import "./CadetRecords.css";

const emptyFitness = { sitUps: "", pushUps: "", mileTime: "" };

export default function CadetRecords() {
  const { user } = useAuth();
  const canEdit = ["Instructor", "Cadet Leader"].includes(user?.role);
  const canView = canEdit || user?.role === "Cadet";

  const [cadets, setCadets] = useState([]);
  const [cadetsLoading, setCadetsLoading] = useState(true);
  const [cadetsError, setCadetsError] = useState("");
  const [selectedID, setSelectedID] = useState(null);
  const [records, setRecords] = useState(null);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState("");
  const [mode, setMode] = useState("view");
  const [formData, setFormData] = useState({
    fitness: emptyFitness,
    eventsText: "",
    promotionsText: "",
    awardsText: "",
  });
  const [saving, setSaving] = useState(false);
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
        if (active) setCadetsError(err.message || "Unable to load cadets.");
      } finally {
        if (active) setCadetsLoading(false);
      }
    }

    if (canView) fetchCadets();
    else setCadetsLoading(false);

    return () => {
      active = false;
    };
  }, [canView]);

  useEffect(() => {
    if (!selectedID) {
      setRecords(null);
      return undefined;
    }

    let active = true;
    setRecordsLoading(true);
    setRecordsError("");

    async function fetchRecords() {
      try {
        const response = await fetch(`/api/records/${selectedID}`, {
          credentials: "include",
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(result.error || `Unable to load records (${response.status})`);
        }
        if (active) setRecords(result);
      } catch (err) {
        if (active) setRecordsError(err.message || "Unable to load cadet records.");
      } finally {
        if (active) setRecordsLoading(false);
      }
    }

    fetchRecords();
    return () => {
      active = false;
    };
  }, [selectedID]);

  const selectedCadet = cadets.find((cadet) => cadet.cadetID === selectedID);
  const currentRecords = records || {
    fitness: emptyFitness,
    events: [],
    promotions: [],
    awards: [],
  };
  const isEditing = mode === "edit";

  function selectCadet(id) {
    setSelectedID(Number(id));
    setMode("view");
    setMessage("");
  }

  function handleUpdate() {
    if (!records) return;
    setFormData({
      fitness: { ...records.fitness },
      eventsText: records.events.map((event) => `${event.event} | ${event.hours}`).join("\n"),
      promotionsText: records.promotions.map((promotion) => promotion.rank).join("\n"),
      awardsText: records.awards
        .map((award) => `${award.name}${award.description ? ` | ${award.description}` : ""}`)
        .join("\n"),
    });
    setMode("edit");
    setMessage("");
  }

  function lines(value) {
    return value.split("\n").map((line) => line.trim()).filter(Boolean);
  }

  async function handleSave() {
    setSaving(true);
    setRecordsError("");
    setMessage("");

    const events = lines(formData.eventsText).map((line) => {
      const [event, hours] = line.split("|");
      return { event: event?.trim() || "", hours: hours?.trim() || "" };
    });
    const promotions = lines(formData.promotionsText).map((rank) => ({ rank }));
    const awards = lines(formData.awardsText).map((line) => {
      const [name, ...description] = line.split("|");
      return { name: name.trim(), description: description.join("|").trim() };
    });

    try {
      const response = await fetch(`/api/records/${selectedID}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fitness: formData.fitness,
          events,
          promotions,
          awards,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || `Unable to save records (${response.status})`);
      }
      setRecords(result);
      setMode("view");
      setMessage("Records saved to the database.");
    } catch (err) {
      setRecordsError(err.message || "Unable to save cadet records.");
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setMode("view");
    setRecordsError("");
  }

  if (!canView) {
    return <p>You do not have permission to view cadet records.</p>;
  }

  return (
    <div className="cadet-records-page">
      <aside className="records-sidebar">
        <h2>JET TRACK</h2>
        <nav>
          <button title="Profile">👤</button>
          <button title="Home">🏠</button>
          <button title="Settings">⚙️</button>
          <button title="History">🕒</button>
          <button title="Help">❔</button>
        </nav>
      </aside>

      <main className="records-main">
        <h1>CADET RECORD &amp; TRACKING</h1>

        {cadetsError && <p className="error" role="alert">{cadetsError}</p>}
        {recordsError && <p className="error" role="alert">{recordsError}</p>}
        {message && <p className="records-message" role="status">{message}</p>}

        <div className="records-content">
          <section className="records-cadet-section">
            <div className="records-avatar">👤</div>
            {selectedCadet && (
              <h3>{selectedCadet.last_name}, {selectedCadet.first_name}</h3>
            )}

            {canEdit && (
              <select
                aria-label="Select cadet"
                value={selectedID ?? ""}
                onChange={(e) => selectCadet(e.target.value)}
                disabled={cadetsLoading || cadets.length === 0 || isEditing}
              >
                {cadets.length === 0 ? (
                  <option value="">No cadets found</option>
                ) : cadets.map((cadet) => (
                  <option key={cadet.cadetID} value={cadet.cadetID}>
                    {cadet.last_name}, {cadet.first_name}
                  </option>
                ))}
              </select>
            )}

            {canEdit && (
              <div className="records-actions">
                {mode === "view" ? (
                  <button
                    onClick={handleUpdate}
                    disabled={!records || recordsLoading}
                  >
                    Update Info
                  </button>
                ) : (
                  <>
                    <button
                      className="records-save-button"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? "SAVING..." : "SAVE"}
                    </button>
                    <button
                      className="records-cancel-button"
                      onClick={cancelEdit}
                      disabled={saving}
                    >
                      CANCEL
                    </button>
                  </>
                )}
              </div>
            )}
          </section>

          {cadetsLoading || recordsLoading ? (
            <div className="records-empty">Loading cadet records...</div>
          ) : !selectedCadet || !records ? (
            <div className="records-empty">No cadet records available.</div>
          ) : (
            <>
              <section className="records-card fitness-card">
                <h2>FITNESS SCORES</h2>
                <div className="records-table">
                  {[
                    ["Sit-Ups", "sitUps"],
                    ["Push-Ups", "pushUps"],
                    ["Mile Time", "mileTime"],
                  ].map(([label, name]) => (
                    <div className="records-row" key={name}>
                      <span>{label}</span>
                      {isEditing ? (
                        <input
                          type={name === "mileTime" ? "text" : "number"}
                          min={name === "mileTime" ? undefined : "0"}
                          name={name}
                          value={formData.fitness[name]}
                          onChange={(e) => setFormData((previous) => ({
                            ...previous,
                            fitness: { ...previous.fitness, [name]: e.target.value },
                          }))}
                          placeholder={name === "mileTime" ? "MM:SS" : ""}
                        />
                      ) : (
                        <span>{currentRecords.fitness[name] || "—"}</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section className="records-card events-card">
                <h2>EVENTS &amp; SERVICE HOURS</h2>
                <div className="records-table events-table">
                  <div className="records-row records-header-row">
                    <span>Event</span>
                    <span>Hours</span>
                  </div>
                  {isEditing ? (
                    <textarea
                      name="eventsText"
                      value={formData.eventsText}
                      onChange={(e) => setFormData((previous) => ({
                        ...previous, eventsText: e.target.value,
                      }))}
                      placeholder={"Enter each event on a new line:\nEvent Name | Hours"}
                    />
                  ) : currentRecords.events.length > 0 ? (
                    currentRecords.events.map((event) => (
                      <div className="records-row" key={event.servicehoursID}>
                        <span>{event.event}</span>
                        <span>{event.hours}</span>
                      </div>
                    ))
                  ) : (
                    <p className="records-no-data">No events recorded.</p>
                  )}
                </div>
                {isEditing && <small>Format: Event Name | Hours (one per line)</small>}
              </section>

              <section className="records-card awards-card">
                <h2>AWARDS &amp; PROMOTIONS</h2>
                <div className="records-award-section">
                  <h3>Promotions</h3>
                  {isEditing ? (
                    <textarea
                      name="promotionsText"
                      value={formData.promotionsText}
                      onChange={(e) => setFormData((previous) => ({
                        ...previous, promotionsText: e.target.value,
                      }))}
                      placeholder="Enter each promotion rank on a new line"
                    />
                  ) : currentRecords.promotions.length > 0 ? (
                    currentRecords.promotions.map((promotion) => (
                      <div className="records-award-item" key={promotion.promotionID}>
                        {promotion.rank}
                      </div>
                    ))
                  ) : (
                    <div className="records-award-item">No promotions recorded.</div>
                  )}
                </div>

                <div className="records-award-section">
                  <h3>Awards</h3>
                  {isEditing ? (
                    <textarea
                      name="awardsText"
                      value={formData.awardsText}
                      onChange={(e) => setFormData((previous) => ({
                        ...previous, awardsText: e.target.value,
                      }))}
                      placeholder="Enter each award on a new line; use Name | Description"
                    />
                  ) : currentRecords.awards.length > 0 ? (
                    currentRecords.awards.map((award) => (
                      <div className="records-award-item" key={award.awardID}>
                        {award.name}{award.description ? ` — ${award.description}` : ""}
                      </div>
                    ))
                  ) : (
                    <div className="records-award-item">No awards recorded.</div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
