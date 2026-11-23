import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { cadetRanks } from "../cadetOptions";
import "./AwardsPromotions.css";

const CUSTOM_AWARD = "__custom__";
const ribbonOptions = [
  "Academic Ribbon",
  "Achievement Ribbon",
  "Activities Ribbon",
  "Attendance Ribbon",
  "Cadet Humanitarian Award",
  "Color Guard Ribbon",
  "Community Service with Excellence Award",
  "Distinguished Unit Award",
  "Drill Competition Ribbon",
  "Good Conduct Ribbon",
  "Health and Wellness Ribbon",
  "Leadership Ribbon",
  "Leadership School Ribbon",
  "Marksmanship Ribbon",
  "Outstanding Flight Award",
  "Outstanding Organization Award",
  "Parades Ribbon",
  "Recruiting Ribbon",
  "Service Ribbon",
  "Special Teams Ribbon",
  "Superior Performance Ribbon",
];

export default function AwardsPromotions() {
  const { user } = useAuth();
  const canEdit = ["Instructor", "Cadet Leader"].includes(user?.role);
  const canView = canEdit || user?.role === "Cadet";

  const [cadets, setCadets] = useState([]);
  const [selectedID, setSelectedID] = useState("");
  const [records, setRecords] = useState(null);
  const [draftPromotions, setDraftPromotions] = useState([]);
  const [draftAwards, setDraftAwards] = useState([]);
  const [selectedRank, setSelectedRank] = useState("");
  const [currentRankDraft, setCurrentRankDraft] = useState("");
  const [selectedRibbon, setSelectedRibbon] = useState("");
  const [customAwardName, setCustomAwardName] = useState("");
  const [awardDescription, setAwardDescription] = useState("");
  const [loadingCadets, setLoadingCadets] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
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
          setSelectedID(result[0] ? String(result[0].cadetID) : "");
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
      setRecords(null);
      return undefined;
    }

    let active = true;
    setLoadingRecords(true);
    setError("");

    async function fetchRecords() {
      try {
        const response = await fetch(`/api/records/${selectedID}`, {
          credentials: "include",
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(result.error || `Unable to load awards and promotions (${response.status})`);
        }
        if (active) setRecords(result);
      } catch (err) {
        if (active) setError(err.message || "Unable to load awards and promotions.");
      } finally {
        if (active) setLoadingRecords(false);
      }
    }

    fetchRecords();
    return () => {
      active = false;
    };
  }, [selectedID]);

  const selectedCadet = cadets.find((cadet) => String(cadet.cadetID) === selectedID);

  function selectCadet(id) {
    setSelectedID(id);
    setRecords(null);
    setEditing(false);
    setMessage("");
  }

  function beginEdit() {
    setDraftPromotions(records.promotions.map(({ rank }) => rank));
    setDraftAwards(records.awards.map(({ name, description }) => ({
      name,
      description: description || "",
    })));
    setSelectedRank("");
    setCurrentRankDraft(selectedCadet.rank || records.currentRank || "");
    setSelectedRibbon("");
    setCustomAwardName("");
    setAwardDescription("");
    setEditing(true);
    setError("");
    setMessage("");
  }

  function addPromotion() {
    if (!selectedRank) {
      setError("Select a promotion rank first.");
      return;
    }
    setDraftPromotions((previous) => [...previous, selectedRank]);
    setCurrentRankDraft(selectedRank);
    setSelectedRank("");
    setError("");
  }

  function addAward() {
    const name = selectedRibbon === CUSTOM_AWARD
      ? customAwardName.trim()
      : selectedRibbon;
    if (!name) {
      setError("Select a ribbon or enter a custom award.");
      return;
    }
    if (name.length > 45) {
      setError("Award names must be 45 characters or fewer to fit the current database.");
      return;
    }
    setDraftAwards((previous) => [
      ...previous,
      { name, description: awardDescription.trim() },
    ]);
    setSelectedRibbon("");
    setCustomAwardName("");
    setAwardDescription("");
    setError("");
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
        body: JSON.stringify({
          promotions: draftPromotions.map((rank) => ({ rank })),
          awards: draftAwards,
          currentRank: currentRankDraft,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || `Unable to save awards and promotions (${response.status})`);
      }
      setRecords(result);
      setCadets((previous) => previous.map((cadet) => (
        cadet.cadetID === result.cadetID
          ? { ...cadet, rank: result.currentRank }
          : cadet
      )));
      setEditing(false);
      setMessage("Awards and promotions saved. The cadet profile now reflects the latest promotion rank.");
    } catch (err) {
      setError(err.message || "Unable to save awards and promotions.");
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setEditing(false);
    setError("");
  }

  if (!canView) {
    return <p>You do not have permission to view awards and promotions.</p>;
  }

  return (
    <div className="awards-page">
      <aside className="awards-sidebar">
        <div className="awards-sidebar-logo">✈</div>
        <a href="/" title="Dashboard">⌂</a>
        <a href="/cadet-profiles" title="Cadet Profiles">👤</a>
        <a href="/cadet-records" title="Cadet Records">▤</a>
      </aside>

      <main className="awards-main">
        <header className="awards-header">
          <div className="awards-brand">
            <h1>JET <span>✈</span></h1>
            <h2>TRACK</h2>
          </div>
          <h1 className="awards-title">AWARDS &amp; PROMOTION TRACKING</h1>
          <div className="awards-icon">
            <span>🏅</span>
            <h3>AWARDS &amp;<br />PROMOTIONS</h3>
          </div>
        </header>

        {error && <p className="awards-message error" role="alert">{error}</p>}
        {message && <p className="awards-message" role="status">{message}</p>}

        <section className="awards-controls">
          <label htmlFor="awards-cadet">Select cadet</label>
          <select
            id="awards-cadet"
            value={selectedID}
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
          {selectedCadet && (
            <p>Current rank: <strong>{selectedCadet.rank || "Not assigned"}</strong></p>
          )}
        </section>

        {loadingCadets || loadingRecords ? (
          <p>Loading cadet records...</p>
        ) : !selectedCadet || !records ? (
          <p>No cadet records available.</p>
        ) : (
          <>
            <section className="awards-content">
              <div className="awards-panel promotion-panel">
                <h2>Promotions</h2>
                {editing && (
                  <>
                    <label htmlFor="promotion-rank">Promote cadet to</label>
                    <select
                      id="promotion-rank"
                      value={selectedRank}
                      onChange={(e) => setSelectedRank(e.target.value)}
                    >
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
                    <button type="button" onClick={addPromotion}>Record Promotion</button>
                    <p className="current-rank-draft">
                      Rank after saving: <strong>{currentRankDraft || "No rank selected"}</strong>
                    </p>
                  </>
                )}
                <div className="awards-record-list">
                  {(editing ? draftPromotions : records.promotions.map(({ rank }) => rank)).length > 0 ? (
                    (editing ? draftPromotions : records.promotions.map(({ rank }) => rank)).map((rank, index) => (
                      <div className="awards-record-item" key={`${rank}-${index}`}>
                        <span>{rank}</span>
                        {editing && (
                          <button
                            type="button"
                            onClick={() => setDraftPromotions((previous) => previous.filter((_, itemIndex) => itemIndex !== index))}
                            aria-label={`Remove ${rank} promotion`}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))
                  ) : <p>No promotions recorded.</p>}
                </div>
              </div>

              <div className="awards-panel award-panel">
                <h2>Awards</h2>
                {editing && (
                  <>
                    <label htmlFor="award-ribbon">JROTC ribbon or custom award</label>
                    <select
                      id="award-ribbon"
                      value={selectedRibbon}
                      onChange={(e) => setSelectedRibbon(e.target.value)}
                    >
                      <option value="">Select award</option>
                      {ribbonOptions.map((ribbon) => (
                        <option key={ribbon} value={ribbon}>{ribbon}</option>
                      ))}
                      <option value={CUSTOM_AWARD}>Enter a custom award...</option>
                    </select>
                    {selectedRibbon === CUSTOM_AWARD && (
                      <input
                        aria-label="Custom award name"
                        value={customAwardName}
                        maxLength={45}
                        onChange={(e) => setCustomAwardName(e.target.value)}
                        placeholder="Award name (45 characters max)"
                      />
                    )}
                    <label htmlFor="award-description">Description (optional)</label>
                    <textarea
                      id="award-description"
                      value={awardDescription}
                      maxLength={500}
                      onChange={(e) => setAwardDescription(e.target.value)}
                      placeholder="Award details"
                    />
                    <button type="button" onClick={addAward}>Add Award</button>
                  </>
                )}
                <div className="awards-record-list">
                  {(editing ? draftAwards : records.awards).length > 0 ? (
                    (editing ? draftAwards : records.awards).map((award, index) => (
                      <div className="awards-record-item" key={`${award.name}-${index}`}>
                        <span>
                          {award.name}{award.description ? ` — ${award.description}` : ""}
                        </span>
                        {editing && (
                          <button
                            type="button"
                            onClick={() => setDraftAwards((previous) => previous.filter((_, itemIndex) => itemIndex !== index))}
                            aria-label={`Remove ${award.name}`}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))
                  ) : <p>No awards recorded.</p>}
                </div>
              </div>

              {canEdit && (
                <div className="awards-actions">
                  {editing ? (
                    <>
                      <button className="save-btn" onClick={handleSave} disabled={saving}>
                        {saving ? "SAVING..." : "SAVE CHANGES"}
                      </button>
                      <button
                        className="update-btn"
                        onClick={cancelEdit}
                        disabled={saving}
                      >
                        CANCEL
                      </button>
                    </>
                  ) : (
                    <button
                      className="update-btn"
                      onClick={beginEdit}
                      disabled={!records}
                    >
                      Update Info
                    </button>
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
