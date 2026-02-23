import { useState, useEffect } from "react";
import { COLORS } from "../constants/colors";
import * as api from "../services/api";

export default function ShoppingListPanel({ userId, weekStart, onClose }) {
  const [items, setItems] = useState([]);
  const [totalDishes, setTotalDishes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getShoppingList(userId, weekStart).then(data => {
      setItems(data.items);
      setTotalDishes(data.totalDishes);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [userId, weekStart]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "flex-end" }}
      onClick={onClose}>
      <div style={{
        background: COLORS.bg, borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 500, maxHeight: "85vh", overflow: "auto", padding: 24,
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: COLORS.navy, margin: 0 }}>🛒 Shopping List</h2>
            <p style={{ color: COLORS.gray, fontSize: 13, margin: "4px 0 0 0" }}>{totalDishes} dish{totalDishes !== 1 ? "es" : ""} planned this week</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, color: COLORS.gray, cursor: "pointer" }}>×</button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: COLORS.gray }}>Loading...</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: COLORS.gray }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🛒</div>
            Plan some meals first to generate your shopping list.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {items.map((item, i) => (
              <div key={item.name} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 14px", background: i % 2 === 0 ? COLORS.card : "transparent", borderRadius: 10,
              }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy, textTransform: "capitalize" }}>{item.name}</span>
                <span style={{ fontSize: 14, color: COLORS.gray, fontWeight: 600 }}>
                  {item.grams >= 1000 ? `${(item.grams / 1000).toFixed(1)} kg` : `${item.grams}g`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
