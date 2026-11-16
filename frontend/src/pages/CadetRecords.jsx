

import { useState } from "react";
import { useAuth } from "../AuthContext";
import "./CadetRecords.css";

export default function CadetRecords() {
  const { user } = useAuth();

  const isInstructor = user?.role === "Instructor";

  // Temporary sample cadet records
  const [cadets, setCadets] = useState([
    {
      cadetID: 1,
      first_name: "John",
      last_name: "Smith",

      fitness: {
        sitUps: "42",
        pushUps: "35",
        mileTime: "8:15",
      },

      events: [
        { event: "Veterans Day Ceremony", hours: "3" },
        { event: "Community Cleanup", hours: "4" },
        { event: "Color Guard", hours: "2" },
      ],

      promotions: [
        "Promoted to Cadet Staff Sergeant",
      ],

      awards: [
        "Physical Fitness Award",
        "Community Service Award",
      ],
    },

    {
      cadetID: 2,
      first_name: "Jane",
      last_name: "Doe",

      fitness: {
        sitUps: "38",
        pushUps: "28",
        mileTime: "9:02",
      },

      events: [
        { event: "Veterans Day Ceremony", hours: "3" },
        { event: "Food Drive", hours: "5" },
      ],

      promotions: [
        "Promoted to Cadet Airman",
      ],

      awards: [
        "Academic Achievement Award",
      ],
    },
  ]);

  const emptyRecords = {
    fitness: {
      sitUps: "",
      pushUps: "",
      mileTime: "",
    },
    events: [],
    eventsText: "",
    promotions: [],
    promotionsText: "",
    awards: [],
    awardsText: "",
  };

  const [selectedID, setSelectedID] = useState(
    isInstructor ? 1 : user?.cadetID ?? null
  );

  const [mode, setMode] = useState("view");

  const selectedCadet = cadets.find(
    (cadet) => cadet.cadetID === selectedID
  );

  // Convert saved records into editable form data
  function getFormData(cadet) {
    if (!cadet) return { ...emptyRecords };

    return {
      fitness: { ...cadet.fitness },

      events: cadet.events || [],
      eventsText: (cadet.events || [])
        .map((event) => `${event.event} | ${event.hours}`)
        .join("\n"),

      promotions: cadet.promotions || [],
      promotionsText: (cadet.promotions || []).join("\n"),

      awards: cadet.awards || [],
      awardsText: (cadet.awards || []).join("\n"),
    };
  }

  const [formData, setFormData] = useState(emptyRecords);

  // Select a cadet
  function selectCadet(id) {
    setSelectedID(Number(id));
    setMode("view");
    setFormData(emptyRecords);
  }

  // Handle fitness score changes
  function handleFitnessChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      fitness: {
        ...prev.fitness,
        [name]: value,
      },
    }));
  }

  // Handle event, promotion, and award changes
  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // Update existing records
  function handleUpdate() {
    if (!selectedCadet) return;

    setFormData(getFormData(selectedCadet));
    setMode("edit");
  }

  // Add new records for selected cadet
  function handleAdd() {
    if (!selectedCadet) return;

    setFormData({ ...emptyRecords });
    setMode("add");
  }

  // Save records
  function handleSave() {
    if (!selectedCadet) return;

    const updatedRecords = {
      fitness: { ...formData.fitness },

      events: formData.eventsText
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => {
          const [event, hours] = line.split("|");

          return {
            event: event?.trim() || "",
            hours: hours?.trim() || "",
          };
        }),

      promotions: formData.promotionsText
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),

      awards: formData.awardsText
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    setCadets((prev) =>
      prev.map((cadet) =>
        cadet.cadetID === selectedID
          ? { ...cadet, ...updatedRecords }
          : cadet
      )
    );

    setMode("view");
  }

  // Delete records without deleting the cadet profile
  function handleDelete() {
    if (!selectedCadet) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this cadet's records?"
    );

    if (!confirmDelete) return;

    setCadets((prev) =>
      prev.map((cadet) =>
        cadet.cadetID === selectedID
          ? {
              ...cadet,
              fitness: { ...emptyRecords.fitness },
              events: [],
              promotions: [],
              awards: [],
            }
          : cadet
      )
    );

    setMode("view");
  }

  const isEditing = mode !== "view";

  return (
    <div className="cadet-records-page">

      {/* LEFT SIDEBAR */}
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

      {/* MAIN CONTENT */}
      <main className="records-main">

        <h1>CADET RECORD & TRACKING</h1>

        <div className="records-content">

          {/* CADET PROFILE SECTION */}
          <section className="records-cadet-section">

            <div className="records-avatar">
              👤
            </div>

            {selectedCadet && (
              <h3>
                {selectedCadet.last_name}, {selectedCadet.first_name}
              </h3>
            )}

            {isInstructor && (
              <select
                value={selectedID ?? ""}
                onChange={(e) => selectCadet(e.target.value)}
              >
                <option value="" disabled>
                  Select Cadet
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

            {/* INSTRUCTOR CONTROLS */}
            {isInstructor && (
              <div className="records-actions">

                <button
                  onClick={handleAdd}
                  disabled={!selectedCadet || isEditing}
                >
                  Add Info
                </button>

                <button
                  onClick={handleUpdate}
                  disabled={!selectedCadet || isEditing}
                >
                  Update Info
                </button>

                <button
                  onClick={handleDelete}
                  disabled={!selectedCadet || isEditing}
                >
                  Delete Info
                </button>

                {isEditing && (
                  <button
                    className="records-save-button"
                    onClick={handleSave}
                  >
                    SAVE
                  </button>
                )}

                {isEditing && (
                  <button
                    className="records-cancel-button"
                    onClick={() => setMode("view")}
                  >
                    CANCEL
                  </button>
                )}

              </div>
            )}

          </section>

          {!selectedCadet ? (

            <div className="records-empty">
              No cadet records available.
            </div>

          ) : (

            <>

              {/* FITNESS SCORES */}
              <section className="records-card fitness-card">

                <h2>FITNESS SCORES</h2>

                <div className="records-table">

                  <div className="records-row">
                    <span>Sit-Ups</span>

                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        name="sitUps"
                        value={formData.fitness.sitUps}
                        onChange={handleFitnessChange}
                      />
                    ) : (
                      <span>
                        {selectedCadet.fitness.sitUps || "—"}
                      </span>
                    )}
                  </div>

                  <div className="records-row">
                    <span>Push-Ups</span>

                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        name="pushUps"
                        value={formData.fitness.pushUps}
                        onChange={handleFitnessChange}
                      />
                    ) : (
                      <span>
                        {selectedCadet.fitness.pushUps || "—"}
                      </span>
                    )}
                  </div>

                  <div className="records-row">
                    <span>Mile Time</span>

                    {isEditing ? (
                      <input
                        type="text"
                        name="mileTime"
                        placeholder="MM:SS"
                        value={formData.fitness.mileTime}
                        onChange={handleFitnessChange}
                      />
                    ) : (
                      <span>
                        {selectedCadet.fitness.mileTime || "—"}
                      </span>
                    )}
                  </div>

                </div>

              </section>

              {/* EVENTS AND SERVICE HOURS */}
              <section className="records-card events-card">

                <h2>EVENTS & SERVICE HOURS</h2>

                <div className="records-table events-table">

                  <div className="records-row records-header-row">
                    <span>Event</span>
                    <span>Hours</span>
                  </div>

                  {isEditing ? (

                    <textarea
                      name="eventsText"
                      value={formData.eventsText}
                      onChange={handleChange}
                      placeholder={
                        "Enter each event on a new line:\nEvent Name | Hours"
                      }
                    />

                  ) : selectedCadet.events?.length > 0 ? (

                    selectedCadet.events.map((event, index) => (
                      <div
                        className="records-row"
                        key={index}
                      >
                        <span>{event.event}</span>
                        <span>{event.hours}</span>
                      </div>
                    ))

                  ) : (
                    <p className="records-no-data">
                      No events recorded.
                    </p>
                  )}

                </div>

                {isEditing && (
                  <small>
                    Format: Event Name | Hours (one per line)
                  </small>
                )}

              </section>

              {/* AWARDS AND PROMOTIONS */}
              <section className="records-card awards-card">

                <h2>AWARDS & PROMOTIONS</h2>

                <div className="records-award-section">

                  <h3>Promotions</h3>

                  {isEditing ? (

                    <textarea
                      name="promotionsText"
                      value={formData.promotionsText}
                      onChange={handleChange}
                      placeholder="Enter each promotion on a new line"
                    />

                  ) : selectedCadet.promotions?.length > 0 ? (

                    selectedCadet.promotions.map((promotion, index) => (
                      <div
                        className="records-award-item"
                        key={index}
                      >
                        {promotion}
                      </div>
                    ))

                  ) : (
                    <div className="records-award-item">
                      No promotions recorded.
                    </div>
                  )}

                </div>

                <div className="records-award-section">

                  <h3>Awards</h3>

                  {isEditing ? (

                    <textarea
                      name="awardsText"
                      value={formData.awardsText}
                      onChange={handleChange}
                      placeholder="Enter each award on a new line"
                    />

                  ) : selectedCadet.awards?.length > 0 ? (

                    selectedCadet.awards.map((award, index) => (
                      <div
                        className="records-award-item"
                        key={index}
                      >
                        {award}
                      </div>
                    ))

                  ) : (
                    <div className="records-award-item">
                      No awards recorded.
                    </div>
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
