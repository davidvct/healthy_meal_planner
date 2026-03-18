import { useState } from "react";

const conditionOptions = [
  { value: "High Blood Sugar",  label: "High blood sugar",    sub: "Diabetes",       emoji: "🩸" },
  { value: "Hypertension",      label: "High blood pressure", sub: "Hypertension",   emoji: "❤️" },
  { value: "High Cholesterol",  label: "High cholesterol",    sub: "Hyperlipidemia", emoji: "🫀" },
];

const dietOptions = [
  { value: "none",        label: "No restriction" },
  { value: "Vegetarian",  label: "Vegetarian" },
  { value: "Vegan",       label: "Vegan" },
  { value: "Halal",       label: "Halal" },
  { value: "Pescatarian", label: "Pescatarian" },
];

const allergyOptions = [
  { value: "gluten",   label: "Gluten",   emoji: "🌾" },
  { value: "dairy",    label: "Dairy",    emoji: "🥛" },
  { value: "nut",      label: "Nuts",     emoji: "🥜" },
  { value: "egg",      label: "Egg",      emoji: "🥚" },
  { value: "seafood",  label: "Seafood",  emoji: "🦐" },
  { value: "meat",     label: "Meat",     emoji: "🥩" },
  { value: "soy",      label: "Soy",      emoji: "🫘" },
];

const SEX_OPTIONS = [
  { value: "Male",   label: "Male" },
  { value: "Female", label: "Female" },
];

const GRADIENTS = [
  "linear-gradient(135deg,#069B8E,#07B5A5)",
  "linear-gradient(135deg,#6D3FA0,#9B59B6)",
  "linear-gradient(135deg,#1560A0,#1E72B8)",
  "linear-gradient(135deg,#D95F3B,#E8734A)",
  "linear-gradient(135deg,#18A55A,#22C55E)",
];

export default function OnboardingScreen({ onComplete, onCancel, onDelete, initialData, dinerIndex = 0 }) {
  const [name, setName]               = useState(initialData?.name || "");
  const [age, setAge]                 = useState(initialData?.age ?? "");
  const [sex, setSex]                 = useState(initialData?.sex || "");
  const [weightKg, setWeightKg]       = useState(initialData?.weightKg ?? "");
  const [noneSelected, setNoneSelected] = useState(
    initialData ? (initialData.conditions || []).length === 0 : false
  );
  const [conditions, setConditions]   = useState(initialData?.conditions || []);
  const [diet, setDiet]               = useState(initialData?.diet || "none");
  const [allergies, setAllergies]     = useState(initialData?.allergies || []);

  const isEdit = !!initialData;
  const initials = (name || "?").slice(0, 2).toUpperCase();
  const avatarBg = GRADIENTS[dinerIndex % GRADIENTS.length];

  const toggleCondition = (val) => {
    setNoneSelected(false);
    setConditions(prev =>
      prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]
    );
  };

  const selectNone = () => {
    setNoneSelected(true);
    setConditions([]);
  };

  const toggleAllergy = (val) => {
    setAllergies(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
  };

  const handleSave = () => {
    onComplete({
      name: name.trim() || "Diner",
      age: age !== "" ? Number(age) : null,
      sex: sex || null,
      weightKg: weightKg !== "" ? Number(weightKg) : null,
      conditions,
      diet,
      allergies,
    });
  };

  return (
    <div style={{
      background: "var(--white)", borderRadius: "var(--r)",
      width: "100%", maxWidth: 600,
      maxHeight: "92vh", display: "flex", flexDirection: "column",
      boxShadow: "0 20px 60px rgba(11,34,64,.28)", overflow: "hidden",
    }}>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "10px 20px 0", flexShrink: 0 }}>
        <button
          onClick={onCancel}
          style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--text2)", fontFamily: "var(--font)", padding: "4px 6px", borderRadius: "var(--r-xs)" }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M8 2.5L4.5 6.5L8 10.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Profiles
        </button>
        <span style={{ fontSize: 11, color: "var(--text3)" }}>/</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)" }}>
          {isEdit ? "Edit profile" : "Add new diner"}
        </span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px 14px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: avatarBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text)" }}>
            {isEdit ? `Edit my profile` : "Add new diner"}
          </div>
          <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>
            {isEdit ? "Changes apply to all meal recommendations immediately" : "Fill in the details to get personalised meal plans"}
          </div>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid var(--border)", background: "var(--bg)", cursor: "pointer", fontSize: 16, color: "var(--text2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "var(--font)", lineHeight: 1 }}
          >
            ×
          </button>
        )}
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 8px", display: "flex", flexDirection: "column", gap: 22, minHeight: 0 }}>

        {/* Name / Age / Weight row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div className="field">
            <div className="field-lbl">Name</div>
            <input
              className="field-input"
              placeholder="e.g. Alice"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="field">
            <div className="field-lbl">Age</div>
            <div className="field-num">
              <input type="number" placeholder="30" min="1" max="120" value={age} onChange={e => setAge(e.target.value)} />
              <div className="field-num-unit">yrs</div>
            </div>
          </div>
          <div className="field">
            <div className="field-lbl">Weight</div>
            <div className="field-num">
              <input type="number" placeholder="65" min="1" max="300" value={weightKg} onChange={e => setWeightKg(e.target.value)} />
              <div className="field-num-unit">kg</div>
            </div>
          </div>
        </div>

        {/* Gender */}
        <div className="field">
          <div className="field-lbl">Gender</div>
          <div className="gpills">
            {SEX_OPTIONS.map(s => (
              <button
                key={s.value}
                className={`gpill${sex === s.value ? " sel" : ""}`}
                onClick={() => setSex(s.value)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Health conditions */}
        <div className="field">
          <div className="field-lbl">Health conditions</div>
          <div className="cond-grid">
            {conditionOptions.map(c => {
              const on = conditions.includes(c.value);
              const clsMap = { "High Blood Sugar": "on-o", "Hypertension": "on-r", "High Cholesterol": "on-p" };
              return (
                <div
                  key={c.value}
                  className={`cc${on ? ` ${clsMap[c.value]}` : ""}`}
                  onClick={() => toggleCondition(c.value)}
                >
                  <div className="cc-ic" style={{ background: on ? "rgba(255,255,255,.25)" : "var(--bg)", fontSize: 20 }}>
                    {c.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="cc-name">{c.label}</div>
                    <div className="cc-sub">{c.sub}</div>
                  </div>
                  <div className={`cc-chk${on ? " chk-on" : ""}`}>
                    {on && <span style={{ fontSize: 9, color: "#fff", fontWeight: 800 }}>✓</span>}
                  </div>
                </div>
              );
            })}
            {/* None of these */}
            <div className={`cc${noneSelected ? " on-t" : ""}`} onClick={selectNone}>
              <div className="cc-ic" style={{ background: noneSelected ? "var(--teal)" : "var(--bg)", fontSize: 20 }}>
                {noneSelected ? <span style={{ fontSize: 16 }}>✅</span> : <span style={{ fontSize: 16 }}>☑️</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div className="cc-name">None of these</div>
                <div className="cc-sub">No known conditions</div>
              </div>
              <div className={`cc-chk${noneSelected ? " chk-on" : ""}`}>
                {noneSelected && <span style={{ fontSize: 9, color: "#fff", fontWeight: 800 }}>✓</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Dietary preference */}
        <div className="field">
          <div className="field-lbl">Dietary preference</div>
          <div className="diet-pills">
            {dietOptions.map(d => (
              <button
                key={d.value}
                className={`dpill${diet === d.value ? " sel" : ""}`}
                onClick={() => setDiet(d.value)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Allergens */}
        <div className="field" style={{ marginBottom: 4 }}>
          <div className="field-lbl">Allergens to exclude</div>
          <div className="allerg-grid">
            {allergyOptions.map(a => (
              <div
                key={a.value}
                className={`ag${allergies.includes(a.value) ? " sel" : ""}`}
                onClick={() => toggleAllergy(a.value)}
              >
                <span className="ag-ic">{a.emoji}</span>
                <div className="ag-l">{a.label}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 20px", borderTop: "1px solid var(--border)", flexShrink: 0, background: "var(--white)" }}>
        {isEdit && onDelete ? (
          <button
            onClick={onDelete}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "var(--red)", fontFamily: "var(--font)", padding: 0 }}
          >
            Delete profile
          </button>
        ) : <div />}
        <div style={{ display: "flex", gap: 9 }}>
          {onCancel && (
            <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          )}
          <button
            className="btn btn-primary"
            disabled={!name.trim()}
            onClick={handleSave}
          >
            {isEdit ? "Save changes" : "Add diner ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}
