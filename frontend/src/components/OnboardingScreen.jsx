import { useState } from "react";
import { COLORS } from "../constants/colors";

const conditionOptions = ["High Blood Sugar", "High Cholesterol", "Hypertension"];
const dietOptions = [
  { value: "none", label: "No Restriction" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "halal", label: "Halal" },
  { value: "pescatarian", label: "Pescatarian" },
];
const allergyOptions = ["egg", "peanut", "shrimp", "fish", "soy sauce", "coconut milk"];
const sexOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export default function OnboardingScreen({ onComplete, onCancel, initialData }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(initialData?.name || "");
  const [age, setAge] = useState(initialData?.age || "");
  const [sex, setSex] = useState(initialData?.sex || "");
  const [weightKg, setWeightKg] = useState(initialData?.weightKg || "");
  const [conditions, setConditions] = useState(initialData?.conditions || []);
  const [diet, setDiet] = useState(initialData?.diet || "none");
  const [allergies, setAllergies] = useState(initialData?.allergies || []);

  const toggleItem = (arr, setArr, item) => {
    setArr(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]);
  };

  const totalSteps = 5;

  const handleFinish = () => {
    onComplete({
      name: name.trim() || "Diner",
      age: age ? Number(age) : null,
      sex: sex || null,
      weightKg: weightKg ? Number(weightKg) : null,
      conditions,
      diet,
      allergies,
    });
  };

  const pages = [
    // Step 0: Name
    <div key="s0">
      <h2 style={{ fontSize: 22, fontWeight: 700, color: COLORS.navy, marginBottom: 6 }}>Diner's name</h2>
      <p style={{ color: COLORS.gray, fontSize: 14, marginBottom: 20 }}>Who are you planning meals for?</p>
      <input
        type="text"
        placeholder="e.g. Grandma, Dad, Aimee"
        value={name}
        onChange={e => setName(e.target.value)}
        style={{
          width: "100%",
          padding: "14px 18px",
          borderRadius: 14,
          border: `2px solid ${COLORS.grayLight}`,
          background: COLORS.card,
          color: COLORS.navy,
          fontSize: 16,
          fontWeight: 600,
          outline: "none",
          boxSizing: "border-box",
        }}
      />
    </div>,

    // Step 1: Age, Sex, Weight
    <div key="s1">
      <h2 style={{ fontSize: 22, fontWeight: 700, color: COLORS.navy, marginBottom: 6 }}>About the diner</h2>
      <p style={{ color: COLORS.gray, fontSize: 14, marginBottom: 20 }}>This helps us tailor nutrition targets.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.gray, marginBottom: 6, display: "block" }}>Age</label>
          <input
            type="number"
            placeholder="e.g. 72"
            value={age}
            onChange={e => setAge(e.target.value)}
            min="1"
            max="120"
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 12,
              border: `2px solid ${COLORS.grayLight}`,
              background: COLORS.card,
              color: COLORS.navy,
              fontSize: 15,
              fontWeight: 600,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.gray, marginBottom: 8, display: "block" }}>Sex</label>
          <div style={{ display: "flex", gap: 10 }}>
            {sexOptions.map(s => (
              <button key={s.value} onClick={() => setSex(s.value)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 12,
                  border: `2px solid ${sex === s.value ? COLORS.accent : COLORS.grayLight}`,
                  background: sex === s.value ? COLORS.accentLight : COLORS.card,
                  color: COLORS.navy,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}>
                {sex === s.value ? "✓ " : ""}{s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.gray, marginBottom: 6, display: "block" }}>Weight (kg)</label>
          <input
            type="number"
            placeholder="e.g. 65"
            value={weightKg}
            onChange={e => setWeightKg(e.target.value)}
            min="1"
            max="300"
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 12,
              border: `2px solid ${COLORS.grayLight}`,
              background: COLORS.card,
              color: COLORS.navy,
              fontSize: 15,
              fontWeight: 600,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>
    </div>,

    // Step 2: Health conditions
    <div key="s2">
      <h2 style={{ fontSize: 22, fontWeight: 700, color: COLORS.navy, marginBottom: 6 }}>Any health conditions?</h2>
      <p style={{ color: COLORS.gray, fontSize: 14, marginBottom: 20 }}>Select all that apply. We'll tailor recommendations.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {conditionOptions.map(c => (
          <button key={c} onClick={() => toggleItem(conditions, setConditions, c)}
            style={{
              padding: "14px 18px", borderRadius: 14, border: `2px solid ${conditions.includes(c) ? COLORS.accent : COLORS.grayLight}`,
              background: conditions.includes(c) ? COLORS.accentLight : COLORS.card,
              color: COLORS.navy, fontSize: 15, fontWeight: 600, cursor: "pointer", textAlign: "left",
              transition: "all 0.2s",
            }}>
            {conditions.includes(c) ? "✓ " : ""}{c}
          </button>
        ))}
        <button onClick={() => { setConditions([]); setStep(step + 1); }}
          style={{ padding: "10px", background: "none", border: "none", color: COLORS.gray, cursor: "pointer", fontSize: 14, marginTop: 4 }}>
          None of the above →
        </button>
      </div>
    </div>,

    // Step 3: Diet
    <div key="s3">
      <h2 style={{ fontSize: 22, fontWeight: 700, color: COLORS.navy, marginBottom: 6 }}>Dietary preference?</h2>
      <p style={{ color: COLORS.gray, fontSize: 14, marginBottom: 20 }}>Choose what fits their lifestyle.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {dietOptions.map(d => (
          <button key={d.value} onClick={() => setDiet(d.value)}
            style={{
              padding: "14px 18px", borderRadius: 14, border: `2px solid ${diet === d.value ? COLORS.green : COLORS.grayLight}`,
              background: diet === d.value ? COLORS.greenLight : COLORS.card,
              color: COLORS.navy, fontSize: 15, fontWeight: 600, cursor: "pointer", textAlign: "left",
              transition: "all 0.2s",
            }}>
            {diet === d.value ? "✓ " : ""}{d.label}
          </button>
        ))}
      </div>
    </div>,

    // Step 4: Allergies
    <div key="s4">
      <h2 style={{ fontSize: 22, fontWeight: 700, color: COLORS.navy, marginBottom: 6 }}>Any food allergies?</h2>
      <p style={{ color: COLORS.gray, fontSize: 14, marginBottom: 20 }}>We'll exclude dishes with these ingredients.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {allergyOptions.map(a => (
          <button key={a} onClick={() => toggleItem(allergies, setAllergies, a)}
            style={{
              padding: "10px 18px", borderRadius: 24, border: `2px solid ${allergies.includes(a) ? COLORS.warn : COLORS.grayLight}`,
              background: allergies.includes(a) ? COLORS.warnBg : COLORS.card,
              color: allergies.includes(a) ? COLORS.warn : COLORS.navy, fontSize: 14, fontWeight: 600, cursor: "pointer",
              transition: "all 0.2s",
            }}>
            {allergies.includes(a) ? "✗ " : ""}{a}
          </button>
        ))}
      </div>
      <button onClick={() => { setAllergies([]); handleFinish(); }}
        style={{ padding: "10px", background: "none", border: "none", color: COLORS.gray, cursor: "pointer", fontSize: 14, marginTop: 16 }}>
        No allergies →
      </button>
    </div>,
  ];

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", justifyContent: "center", alignItems: "center", padding: 20 }}>
      <div style={{ maxWidth: 420, width: "100%" }}>
        {/* Progress */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i <= step ? COLORS.accent : COLORS.grayLight,
              transition: "background 0.3s",
            }} />
          ))}
        </div>

        {/* Logo */}
        <div style={{ marginBottom: 28 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: COLORS.accent }}>🥘 MealWise</span>
        </div>

        {pages[step]}

        {/* Nav */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)}
              style={{ padding: "12px 24px", borderRadius: 12, border: `1px solid ${COLORS.grayLight}`, background: COLORS.card, color: COLORS.navy, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
              ← Back
            </button>
          ) : onCancel ? (
            <button onClick={onCancel}
              style={{ padding: "12px 24px", borderRadius: 12, border: `1px solid ${COLORS.grayLight}`, background: COLORS.card, color: COLORS.navy, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
              Cancel
            </button>
          ) : <div />}
          {step < totalSteps - 1 ? (
            <button onClick={() => setStep(step + 1)}
              disabled={step === 0 && !name.trim()}
              style={{
                padding: "12px 28px", borderRadius: 12, border: "none",
                background: (step === 0 && !name.trim()) ? COLORS.grayLight : COLORS.accent,
                color: (step === 0 && !name.trim()) ? COLORS.gray : "#fff",
                fontSize: 15, fontWeight: 700,
                cursor: (step === 0 && !name.trim()) ? "default" : "pointer",
                boxShadow: (step === 0 && !name.trim()) ? "none" : "0 2px 8px rgba(212,113,59,0.3)",
              }}>
              Next →
            </button>
          ) : (
            <button onClick={handleFinish}
              style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: COLORS.green, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(91,154,111,0.3)" }}>
              {initialData ? "Save Changes ✓" : "Start Planning ✓"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
