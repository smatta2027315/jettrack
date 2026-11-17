

import { useState } from "react";
import "./AwardsPromotions.css";

const cadets = [
  { id: 1, name: "Cadet 1" },
  { id: 2, name: "Cadet 2" },
  { id: 3, name: "Cadet 3" },
  { id: 4, name: "Cadet 4" },
];

const promotionRanks = [
  "Airman",
  "Airman First Class",
  "Senior Airman",
  "Staff Sergeant",
  "Technical Sergeant",
  "Master Sergeant",
  "Senior Master Sergeant",
  "Chief Master Sergeant",
];

export default function AwardsPromotions() {
  const [selectedCadets, setSelectedCadets] = useState([]);
  const [promotionRank, setPromotionRank] = useState("");
  const [award, setAward] = useState("");
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState("");
  const [message, setMessage] = useState("");

  function handleCadetSelection(e) {
    const selected = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );

    setSelectedCadets(selected);
    setMessage("");
  }

  function handleAdd() {
    if (selectedCadets.length === 0) {
      setMessage("Please select at least one cadet.");
      return;
    }

    if (!promotionRank && !award.trim()) {
      setMessage("Please enter a promotion rank or an award.");
      return;
    }

    const newRecords = selectedCadets.map((cadetId) => ({
      id: Date.now() + Number(cadetId),
      cadetId,
      promotionRank,
      award,
    }));

    setRecords((prev) => [...prev, ...newRecords]);
    setMessage("Information added successfully!");

    setPromotionRank("");
    setAward("");
  }

  function handleUpdate() {
    if (!selectedRecord) {
      setMessage("Please select a record to update.");
      return;
    }

    setRecords((prev) =>
      prev.map((record) =>
        record.id === Number(selectedRecord)
          ? { ...record, promotionRank, award }
          : record
      )
    );

    setMessage("Information updated successfully!");
  }

  function handleDelete() {
    if (!selectedRecord) {
      setMessage("Please select a record to delete.");
      return;
    }

    setRecords((prev) =>
      prev.filter(
        (record) => record.id !== Number(selectedRecord)
      )
    );

    setSelectedRecord("");
    setPromotionRank("");
    setAward("");
    setMessage("Record deleted successfully!");
  }

  function handleRecordSelection(value) {
    setSelectedRecord(value);

    const record = records.find(
      (item) => item.id === Number(value)
    );

    if (record) {
      setSelectedCadets([record.cadetId]);
      setPromotionRank(record.promotionRank);
      setAward(record.award);
    }
  }

  function handleSave() {
    if (records.length === 0) {
      setMessage("Please add information before saving.");
      return;
    }

    setMessage("Awards and promotions saved successfully!");
  }

  return (
    <div className="awards-page">

      {/* LEFT NAVIGATION */}
      <aside className="awards-sidebar">
        <div className="awards-sidebar-logo">✈</div>

        <a href="/" title="Profile">👤</a>
        <a href="/" title="Home">⌂</a>
        <a href="/" title="Settings">⚙</a>
        <a href="/" title="History">◷</a>
        <a href="/" title="Help">?</a>
      </aside>

      {/* MAIN CONTENT */}
      <main className="awards-main">

        {/* HEADER */}
        <header className="awards-header">

          <div className="awards-brand">
            <h1>JET <span>✈</span></h1>
            <h2>TRACK</h2>
          </div>

          <h1 className="awards-title">
            AWARDS & PROMOTION TRACKING
          </h1>

          <div className="awards-icon">
            <span>🏅</span>
            <h3>AWARDS &<br />PROMOTIONS</h3>
          </div>

        </header>

        {/* CADET SELECTOR */}
        <section className="awards-controls">

          <select
            multiple
            value={selectedCadets}
            onChange={handleCadetSelection}
            className="cadet-multi-select"
            title="Hold Ctrl to select multiple cadets"
          >
            {cadets.map((cadet) => (
              <option key={cadet.id} value={String(cadet.id)}>
                {cadet.name}
              </option>
            ))}
          </select>

          <p>Hold Ctrl to select multiple cadets.</p>

        </section>

        {/* AWARDS AND PROMOTIONS PANELS */}
        <section className="awards-content">

          {/* PROMOTION PANEL */}
          <div className="awards-panel promotion-panel">

            <label htmlFor="promotion-rank">
              Select Promotion Rank:
            </label>

            <select
              id="promotion-rank"
              value={promotionRank}
              onChange={(e) => setPromotionRank(e.target.value)}
            >
              <option value="">Select Rank</option>

              {promotionRanks.map((rank) => (
                <option key={rank} value={rank}>
                  {rank}
                </option>
              ))}
            </select>

          </div>

          {/* AWARD PANEL */}
          <div className="awards-panel award-panel">

            <label htmlFor="award-input">
              Insert Award:
            </label>

            <textarea
              id="award-input"
              value={award}
              onChange={(e) => setAward(e.target.value)}
              placeholder="Enter award name and details..."
            />

          </div>

          {/* ACTION BUTTONS */}
          <div className="awards-actions">

            <button
              className="add-btn"
              onClick={handleAdd}
            >
              Add Info
            </button>

            <button
              className="update-btn"
              onClick={handleUpdate}
            >
              Update Info
            </button>

            <button
              className="delete-btn"
              onClick={handleDelete}
            >
              Delete Info
            </button>

            <button
              className="save-btn"
              onClick={handleSave}
            >
              SAVE
            </button>

          </div>

        </section>

        {/* EXISTING RECORDS */}
        <section className="awards-records">

          <label htmlFor="saved-records">
            Existing Records:
          </label>

          <select
            id="saved-records"
            value={selectedRecord}
            onChange={(e) => handleRecordSelection(e.target.value)}
          >
            <option value="">Select a record</option>

            {records.map((record) => {
              const cadetName = cadets.find(
                (cadet) => String(cadet.id) === record.cadetId
              )?.name;

              return (
                <option key={record.id} value={record.id}>
                  {cadetName} - {record.promotionRank || record.award}
                </option>
              );
            })}

          </select>

        </section>

        {message && (
          <p className="awards-message">{message}</p>
        )}

      </main>
    </div>
  );
}
