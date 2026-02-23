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

export default function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(0);
  const [conditions, setConditions] = useState([]);
  const [diet, setDiet] = useState("none");
  const [allergies, setAllergies] = useState([]);

  const toggleItem = (arr, setArr, item) => {
    setArr(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]);
  };

  const pages = [
    // Step 0: Health conditions
    <div key="s0">
      <h2 style={{ fontSize: 22, fontWeight: 700, color: COLORS.navy, marginBottom: 6 }}>Any health conditions?</h2>
      <p style={{ color: COLORS.gray, fontSize: 14, marginBottom: 20 }}>Select all that apply. We'll tailor recommendations for you.</p>
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
        <button onClick={() => { setConditions([]); setStep(1); }}
          style={{ padding: "10px", background: "none", border: "none", color: COLORS.gray, cursor: "pointer", fontSize: 14, marginTop: 4 }}>
          None of the above →
        </button>
      </div>
    </div>,

    // Step 1: Diet
    <div key="s1">
      <h2 style={{ fontSize: 22, fontWeight: 700, color: COLORS.navy, marginBottom: 6 }}>Dietary preference?</h2>
      <p style={{ color: COLORS.gray, fontSize: 14, marginBottom: 20 }}>Choose what fits your lifestyle.</p>
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

    // Step 2: Allergies
    <div key="s2">
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
      <button onClick={() => { setAllergies([]); onComplete({ conditions, diet, allergies: [] }); }}
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
          {[0, 1, 2].map(i => (
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
          ) : <div />}
          {step < 2 ? (
            <button onClick={() => setStep(step + 1)}
              style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: COLORS.accent, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(212,113,59,0.3)" }}>
              Next →
            </button>
          ) : (
            <button onClick={() => onComplete({ conditions, diet, allergies })}
              style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: COLORS.green, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(91,154,111,0.3)" }}>
              Start Planning ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
