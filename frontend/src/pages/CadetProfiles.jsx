

import { useState } from "react";
import { useAuth } from "../AuthContext";
import "./CadetProfiles.css";

export default function CadetProfiles() {
  const { user } = useAuth();

  // Determine user permissions
  const isInstructor = user?.role === "Instructor";

  // Temporary sample cadet data
  const [cadets, setCadets] = useState([
    {
      cadetID: 1,
      first_name: "John",
      last_name: "Smith",
      rank: "Cadet Staff Sergeant",
      position: "Flight Sergeant",
      grade_level: 11,
      years_in_program: 2,
      birthday: "2009-04-15",
    },
    {
      cadetID: 2,
      first_name: "Jane",
      last_name: "Doe",
      rank: "Cadet Airman",
      position: "Cadet",
      grade_level: 10,
      years_in_program: 1,
      birthday: "2010-08-20",
    },
  ]);

  const [selectedID, setSelectedID] = useState(
    isInstructor ? 1 : null
  );

  const [mode, setMode] = useState("view");

  const selectedCadet = isInstructor
    ? cadets.find((c) => c.cadetID === selectedID)
    : {
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        rank: "",
        position: "",
        grade_level: "",
        years_in_program: "",
        birthday: "",
      };

  const emptyProfile = {
    first_name: "",
    last_name: "",
    rank: "",
    position: "",
    grade_level: "",
    years_in_program: "",
    birthday: "",
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

    setFormData({
      first_name: selectedCadet.first_name,
      last_name: selectedCadet.last_name,
      rank: selectedCadet.rank,
      position: selectedCadet.position,
      grade_level: selectedCadet.grade_level,
      years_in_program: selectedCadet.years_in_program,
      birthday: selectedCadet.birthday,
    });

    setMode("edit");
  }

  // Start adding a new profile
  function handleAdd() {
    setSelectedID(null);
    setFormData(emptyProfile);
    setMode("add");
  }

  // Save new or updated information locally
  function handleSave() {
    if (mode === "add") {
      const newCadet = {
        ...formData,
        cadetID: Date.now(),
      };

      setCadets((prev) => [...prev, newCadet]);
      setSelectedID(newCadet.cadetID);
    } else {
      setCadets((prev) =>
        prev.map((cadet) =>
          cadet.cadetID === selectedID
            ? { ...cadet, ...formData }
            : cadet
        )
      );
    }

    setMode("view");
  }

  // Delete selected profile
  function handleDelete() {
    if (!selectedCadet) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this cadet profile?"
    );

    if (!confirmDelete) return;

    setCadets((prev) =>
      prev.filter((cadet) => cadet.cadetID !== selectedID)
    );

    setSelectedID(null);
    setMode("view");
  }

  // Display the selected profile or editing form
  const profile = mode === "view" ? selectedCadet : formData;

  const fields = [
    { label: "Name (Last, First)", name: "name" },
    { label: "Rank", name: "rank" },
    { label: "Position", name: "position" },
    { label: "Grade", name: "grade_level" },
    { label: "Num Year in Program", name: "years_in_program" },
    { label: "Birthday", name: "birthday" },
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
              <option value="">Select Cadet</option>

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
                      type={
                        field.name === "birthday"
                          ? "date"
                          : ["grade_level", "years_in_program"].includes(
                              field.name
                            )
                          ? "number"
                          : "text"
                      }
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

            <button onClick={handleAdd}>
              Add Info
            </button>

            <button
              onClick={handleUpdate}
              disabled={!selectedCadet || mode !== "view"}
            >
              Update Info
            </button>

            <button
              onClick={handleDelete}
              disabled={!selectedCadet || mode !== "view"}
            >
              Delete Info
            </button>

            {mode !== "view" && (
              <button
                className="profile-save-button"
                onClick={handleSave}
              >
                SAVE
              </button>
            )}

          </section>
        )}

      </main>
    </div>
  );
}

