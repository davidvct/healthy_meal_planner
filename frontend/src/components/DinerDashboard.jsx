import { useState, useEffect } from "react";
import { COLORS } from "../constants/colors";
import * as api from "../services/api";

export default function DinerDashboard({ caretakerId, caretakerName, onSelectDiner, onAddDiner, onLogout }) {
  const [diners, setDiners] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDiners = async () => {
    try {
      const list = await api.getDiners(caretakerId);
      setDiners(list);
    } catch (err) {
      console.error("Failed to load diners:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDiners(); }, [caretakerId]);

  const handleDelete = async (e, diner) => {
    e.stopPropagation();
    if (!confirm(`Remove ${diner.name}? This will delete all their meal plans.`)) return;
    try {
      await api.deleteDiner(diner.userId);
      setDiners(diners.filter(d => d.userId !== diner.userId));
    } catch (err) {
      console.error("Failed to delete diner:", err);
    }
  };

  const profileTags = (diner) => {
    const tags = [];
    if (diner.age) tags.push({ label: `${diner.age}y`, color: COLORS.accent, bg: COLORS.accentLight });
    if (diner.sex) tags.push({ label: diner.sex, color: COLORS.accent, bg: COLORS.accentLight });
    if (diner.weightKg) tags.push({ label: `${diner.weightKg}kg`, color: COLORS.accent, bg: COLORS.accentLight });
    if (diner.diet && diner.diet !== "none") tags.push({ label: diner.diet, color: COLORS.green, bg: COLORS.greenLight });
    diner.conditions.forEach(c => tags.push({ label: c, color: COLORS.warn, bg: COLORS.warnBg }));
    diner.allergies.forEach(a => tags.push({ label: `✗ ${a}`, color: COLORS.gold, bg: COLORS.goldLight }));
    return tags;
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, padding: 20 }}>
      <div style={{ maxWidth: 540, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <span style={{ fontSize: 24, fontWeight: 800, color: COLORS.accent }}>🥘 MealWise</span>
            <p style={{ color: COLORS.gray, fontSize: 13, marginTop: 4 }}>Hi, {caretakerName}</p>
          </div>
          <button
            onClick={onLogout}
            style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${COLORS.grayLight}`, background: COLORS.card, color: COLORS.gray, fontSize: 13, cursor: "pointer" }}
          >
            Logout
          </button>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: COLORS.navy, marginBottom: 16 }}>Your Diners</h2>

        {loading && <p style={{ color: COLORS.gray }}>Loading...</p>}

        {!loading && diners.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: COLORS.gray }}>
            <p style={{ fontSize: 16, marginBottom: 8 }}>No diners yet</p>
            <p style={{ fontSize: 14 }}>Add your first diner to start planning meals.</p>
          </div>
        )}

        {/* Diner Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {diners.map(diner => (
            <div
              key={diner.userId}
              onClick={() => onSelectDiner(diner)}
              style={{
                background: COLORS.card,
                borderRadius: 16,
                padding: "16px 18px",
                cursor: "pointer",
                border: `1px solid ${COLORS.grayLight}`,
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                transition: "box-shadow 0.2s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 17, fontWeight: 700, color: COLORS.navy }}>{diner.name}</span>
                <button
                  onClick={(e) => handleDelete(e, diner)}
                  style={{ background: "none", border: "none", color: COLORS.warn, fontSize: 18, cursor: "pointer", padding: "2px 6px" }}
                  title="Remove diner"
                >
                  ✕
                </button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {profileTags(diner).map((tag, i) => (
                  <span key={i} style={{
                    padding: "3px 10px",
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 600,
                    color: tag.color,
                    background: tag.bg,
                  }}>
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Add Diner Button */}
        <button
          onClick={onAddDiner}
          style={{
            marginTop: 20,
            width: "100%",
            padding: "14px",
            borderRadius: 14,
            border: `2px dashed ${COLORS.grayLight}`,
            background: "transparent",
            color: COLORS.accent,
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          + Add Diner
        </button>
      </div>
    </div>
  );
}
