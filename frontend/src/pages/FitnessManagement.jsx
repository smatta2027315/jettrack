

import { useState } from "react";
import "./FitnessManagement.css";

const cadets = [
  { id: 1, name: "Select Cadet" },
  { id: 2, name: "Cadet 1" },
  { id: 3, name: "Cadet 2" },
  { id: 4, name: "Cadet 3" },
];

export default function FitnessManagement() {
  const [selectedCadet, setSelectedCadet] = useState("");
  const [sitUps, setSitUps] = useState("");
  const [pushUps, setPushUps] = useState("");
  const [mileTime, setMileTime] = useState("");
  const [records, setRecords] = useState({});
  const [message, setMessage] = useState("");

  function handleSelectCadet(value) {
    setSelectedCadet(value);

    const record = records[value] || {};

    setSitUps(record.sitUps || "");
    setPushUps(record.pushUps || "");
    setMileTime(record.mileTime || "");
    setMessage("");
  }

  function handleAdd() {
    if (!selectedCadet) {
      setMessage("Please select a cadet first.");
      return;
    }

    if (records[selectedCadet]) {
      setMessage("A record already exists. Use Update Info instead.");
      return;
    }

    saveRecord();
    setMessage("Fitness information added successfully!");
  }

  function handleUpdate() {
    if (!selectedCadet || !records[selectedCadet]) {
      setMessage("Please select a cadet with an existing record.");
      return;
    }

    saveRecord();
    setMessage("Fitness information updated successfully!");
  }

  function handleDelete() {
    if (!selectedCadet || !records[selectedCadet]) {
      setMessage("No fitness record found to delete.");
      return;
    }

    setRecords((prev) => {
      const updated = { ...prev };
      delete updated[selectedCadet];
      return updated;
    });

    setSitUps("");
    setPushUps("");
    setMileTime("");
    setMessage("Fitness record deleted.");
  }

  function saveRecord() {
    setRecords((prev) => ({
      ...prev,
      [selectedCadet]: {
        sitUps,
        pushUps,
        mileTime,
      },
    }));
  }

  function handleSave() {
    if (!selectedCadet) {
      setMessage("Please select a cadet first.");
      return;
    }

    saveRecord();
    setMessage("Fitness scores saved successfully!");
  }

  return (
    <div className="fitness-page">

      {/* LEFT NAVIGATION */}
      <aside className="fitness-sidebar">
        <div className="fitness-sidebar-logo">✈</div>

        <a href="/" title="Profile">👤</a>
        <a href="/" title="Home">⌂</a>
        <a href="/" title="Settings">⚙</a>
        <a href="/" title="History">◷</a>
        <a href="/" title="Help">?</a>
      </aside>

      {/* MAIN CONTENT */}
      <main className="fitness-main">

        <header className="fitness-header">
          <div className="fitness-brand">
            <h1>JET <span>✈</span></h1>
            <h2>TRACK</h2>
          </div>

          <h1 className="fitness-title">
            FITNESS SCORES TRACKING
          </h1>

          <div className="fitness-management-icon">
            <span>🏋️</span>
            <h3>FITNESS<br />MANAGEMENT</h3>
          </div>
        </header>

        {/* SELECT CADET */}
        <section className="fitness-controls">
          <select
            value={selectedCadet}
            onChange={(e) => handleSelectCadet(e.target.value)}
          >
            <option value="">Select Cadet</option>
            {cadets.slice(1).map((cadet) => (
              <option key={cadet.id} value={cadet.id}>
                {cadet.name}
              </option>
            ))}
          </select>
        </section>

        {/* FITNESS INPUTS */}
        <section className="fitness-content">

          <div className="fitness-inputs">

            <div className="fitness-field situps-field">
              <label htmlFor="situps">SIT-UPS:</label>
              <input
                id="situps"
                type="number"
                min="0"
                value={sitUps}
                onChange={(e) => setSitUps(e.target.value)}
              />
            </div>

            <div className="fitness-field pushups-field">
              <label htmlFor="pushups">PUSH-UPS:</label>
              <input
                id="pushups"
                type="number"
                min="0"
                value={pushUps}
                onChange={(e) => setPushUps(e.target.value)}
              />
            </div>

            <div className="fitness-field mile-field">
              <label htmlFor="mile">MILE TIME:</label>
              <input
                id="mile"
                type="text"
                placeholder="Example: 8:45"
                value={mileTime}
                onChange={(e) => setMileTime(e.target.value)}
              />
            </div>

          </div>

          {/* ACTION BUTTONS */}
          <div className="fitness-actions">

            <button className="add-btn" onClick={handleAdd}>
              Add Info
            </button>

            <button className="update-btn" onClick={handleUpdate}>
              Update Info
            </button>

            <button className="delete-btn" onClick={handleDelete}>
              Delete Info
            </button>

            <button className="save-btn" onClick={handleSave}>
              SAVE
            </button>

          </div>

        </section>

        {message && (
          <p className="fitness-message">{message}</p>
        )}

      </main>
    </div>
  );
}
