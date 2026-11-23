import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import "./EventsService.css";

const emptyEvent = {
  event_name: "",
  event_date: "",
  location: "",
  description: "",
};

export default function EventsService() {
  const { user } = useAuth();
  const isInstructor = user?.role === "Instructor";
  const canAwardHours = isInstructor || user?.role === "Cadet Leader";
  const canView = canAwardHours || user?.role === "Cadet";

  const [cadets, setCadets] = useState([]);
  const [selectedCadetIDs, setSelectedCadetIDs] = useState([]);
  const [events, setEvents] = useState([]);
  const [records, setRecords] = useState([]);
  const [eventID, setEventID] = useState("");
  const [hours, setHours] = useState("");
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [eventForm, setEventForm] = useState(emptyEvent);
  const [showEventForm, setShowEventForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);
  const [savingHours, setSavingHours] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPageData() {
      try {
        const requests = [
          fetch("/api/cadets", { credentials: "include" }),
        ];
        if (canAwardHours) {
          requests.push(fetch("/api/records/events", { credentials: "include" }));
        }
        const responses = await Promise.all(requests);
        const results = await Promise.all(responses.map((response) =>
          response.json().catch(() => ({}))
        ));
        const failedResponse = responses.find((response) => !response.ok);
        if (failedResponse) {
          const failedIndex = responses.indexOf(failedResponse);
          throw new Error(results[failedIndex].error || `Unable to load events data (${failedResponse.status})`);
        }
        if (!Array.isArray(results[0]) || (canAwardHours && !Array.isArray(results[1]))) {
          throw new Error("The server returned invalid events data.");
        }

        if (active) {
          setCadets(results[0]);
          setSelectedCadetIDs(results[0].length > 0 ? [results[0][0].cadetID] : []);
          if (canAwardHours) {
            setEvents(results[1]);
            setEventID(results[1][0] ? String(results[1][0].eventID) : "");
          }
        }
      } catch (err) {
        if (active) setError(err.message || "Unable to load events and cadets.");
      } finally {
        if (active) setLoading(false);
      }
    }

    if (canView) loadPageData();
    else setLoading(false);

    return () => {
      active = false;
    };
  }, [canAwardHours, canView]);

  const selectedIDsKey = selectedCadetIDs.join(",");
  useEffect(() => {
    if (!selectedIDsKey) {
      setRecords([]);
      return undefined;
    }

    let active = true;
    setLoadingRecords(true);
    setError("");

    async function loadSelectedRecords() {
      try {
        const selectedIDs = selectedIDsKey.split(",").map(Number);
        const results = await Promise.all(selectedIDs.map(async (cadetID) => {
          const response = await fetch(`/api/records/${cadetID}`, {
            credentials: "include",
          });
          const result = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(result.error || `Unable to load service hours (${response.status})`);
          }
          return { cadetID, events: result.events };
        }));
        if (active) setRecords(results);
      } catch (err) {
        if (active) setError(err.message || "Unable to load service hours.");
      } finally {
        if (active) setLoadingRecords(false);
      }
    }

    loadSelectedRecords();
    return () => {
      active = false;
    };
  }, [selectedIDsKey]);

  const selectedCadet = cadets.find((cadet) => cadet.cadetID === selectedCadetIDs[0]);
  const hasServiceHistory = records.some((record) => record.events.length > 0);

  async function handleCreateEvent(e) {
    e.preventDefault();
    setSavingEvent(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/records/events", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventForm),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || `Unable to create event (${response.status})`);
      }

      setEvents((previous) => [result, ...previous]);
      setEventID(String(result.eventID));
      setEventForm(emptyEvent);
      setShowEventForm(false);
      setMessage("Event created. You can now award service hours for it.");
    } catch (err) {
      setError(err.message || "Unable to create event.");
    } finally {
      setSavingEvent(false);
    }
  }

  async function handleAwardHours(e) {
    e.preventDefault();
    setSavingHours(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/records/service-hours", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cadetIDs: selectedCadetIDs,
          eventID: Number(eventID),
          hours: Number(hours),
          service_date: serviceDate,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || `Unable to award service hours (${response.status})`);
      }

      setMessage(`Service hours awarded to ${selectedCadetIDs.length} cadet${selectedCadetIDs.length === 1 ? "" : "s"}.`);
      setHours("");

      const refresh = await Promise.all(selectedCadetIDs.map(async (cadetID) => {
        const recordResponse = await fetch(`/api/records/${cadetID}`, {
          credentials: "include",
        });
        const record = await recordResponse.json().catch(() => ({}));
        if (!recordResponse.ok) {
          throw new Error(record.error || `Unable to refresh records (${recordResponse.status})`);
        }
        return { cadetID, events: record.events };
      }));
      setRecords(refresh);
    } catch (err) {
      setError(err.message || "Unable to award service hours.");
    } finally {
      setSavingHours(false);
    }
  }

  if (!canView) {
    return <p>You do not have permission to view service hours.</p>;
  }

  return (
    <div className="events-service-page">
      <aside className="events-sidebar">
        <h2>JET TRACK</h2>
        <nav aria-label="Events and service navigation">
          <a href="/" title="Dashboard">⌂</a>
          <a href="/cadet-profiles" title="Cadet Profiles">👤</a>
          <a href="/cadet-records" title="Cadet Records">▤</a>
        </nav>
      </aside>

      <main className="events-main">
        <header className="events-header">
          <div className="events-brand">
            <h1>JET TRACK</h1>
            <p>INTEGRITY - SERVICE - EXCELLENCE</p>
          </div>
          <h1>EVENTS &amp; SERVICE HOURS</h1>
        </header>

        {error && <p className="events-message error" role="alert">{error}</p>}
        {message && <p className="events-message" role="status">{message}</p>}

        {loading ? (
          <p>Loading events and cadets...</p>
        ) : (
          <>
            <section className="events-panel">
              <h2>Award Service Hours</h2>
              {canAwardHours ? (
                <form className="service-award-form" onSubmit={handleAwardHours}>
                  <label htmlFor="service-cadets">
                    Select cadets <span>(Ctrl+click to select multiple)</span>
                  </label>
                  <select
                    id="service-cadets"
                    multiple
                    required
                    value={selectedCadetIDs.map(String)}
                    onChange={(e) => {
                      setSelectedCadetIDs(Array.from(
                        e.target.selectedOptions,
                        (option) => Number(option.value)
                      ));
                    }}
                  >
                    {cadets.map((cadet) => (
                      <option key={cadet.cadetID} value={cadet.cadetID}>
                        {cadet.last_name}, {cadet.first_name}
                      </option>
                    ))}
                  </select>

                  <label htmlFor="service-event">Event</label>
                  <div className="events-select-row">
                    <select
                      id="service-event"
                      required
                      value={eventID}
                      onChange={(e) => setEventID(e.target.value)}
                    >
                      <option value="">Select event</option>
                      {events.map((event) => (
                        <option key={event.eventID} value={event.eventID}>
                          {event.event_name} ({event.event_date})
                        </option>
                      ))}
                    </select>
                    {isInstructor && (
                      <button
                        type="button"
                        onClick={() => setShowEventForm((show) => !show)}
                      >
                        {showEventForm ? "Cancel" : "Create Event"}
                      </button>
                    )}
                  </div>

                  <label htmlFor="service-hours">Hours awarded</label>
                  <input
                    id="service-hours"
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                  />

                  <label htmlFor="service-date">Service date</label>
                  <input
                    id="service-date"
                    type="date"
                    required
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                  />

                  <button
                    className="events-primary-button"
                    type="submit"
                    disabled={savingHours || selectedCadetIDs.length === 0 || !eventID}
                  >
                    {savingHours ? "Saving..." : "Award Hours"}
                  </button>
                </form>
              ) : (
                <div className="cadet-events-profile">
                  <h3>{selectedCadet ? `${selectedCadet.last_name}, ${selectedCadet.first_name}` : "My Service Hours"}</h3>
                </div>
              )}
            </section>

            {isInstructor && showEventForm && (
              <section className="events-panel">
                <h2>Create Event</h2>
                <form className="create-event-form" onSubmit={handleCreateEvent}>
                  <label htmlFor="event-name">Event name</label>
                  <input
                    id="event-name"
                    required
                    maxLength={50}
                    value={eventForm.event_name}
                    onChange={(e) => setEventForm({ ...eventForm, event_name: e.target.value })}
                  />
                  <label htmlFor="event-date">Event date</label>
                  <input
                    id="event-date"
                    type="date"
                    required
                    value={eventForm.event_date}
                    onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
                  />
                  <label htmlFor="event-location">Location</label>
                  <input
                    id="event-location"
                    required
                    maxLength={100}
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  />
                  <label htmlFor="event-description">Description</label>
                  <textarea
                    id="event-description"
                    required
                    maxLength={500}
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  />
                  <button className="events-primary-button" type="submit" disabled={savingEvent}>
                    {savingEvent ? "Creating..." : "Save Event"}
                  </button>
                </form>
              </section>
            )}

            <section className="events-panel service-history-panel">
              <h2>Service Hour History</h2>
              {loadingRecords ? (
                <p>Loading service history...</p>
              ) : !hasServiceHistory ? (
                <p>No service hours recorded for the selected cadets.</p>
              ) : (
                <div className="events-table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        {canAwardHours && <th scope="col">Cadet</th>}
                        <th scope="col">Event</th>
                        <th scope="col">Hours</th>
                        <th scope="col">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.flatMap((record) => {
                        const cadet = cadets.find((item) => item.cadetID === record.cadetID);
                        return record.events.map((serviceRecord) => (
                          <tr key={serviceRecord.servicehoursID}>
                            {canAwardHours && (
                              <td>{cadet ? `${cadet.last_name}, ${cadet.first_name}` : "Cadet"}</td>
                            )}
                            <td>{serviceRecord.event}</td>
                            <td>{serviceRecord.hours}</td>
                            <td>{serviceRecord.date}</td>
                          </tr>
                        ));
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
