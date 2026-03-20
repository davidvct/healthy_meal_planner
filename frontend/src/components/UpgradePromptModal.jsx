export default function UpgradePromptModal({ featureName, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        zIndex: 2000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#FEF0EB",
          borderRadius: 16,
          padding: "32px 28px",
          maxWidth: 380,
          width: "90%",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(6,155,142,0.25)",
          fontFamily: "var(--font)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>&#x1F512;</div>
        <h3
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "var(--navy)",
            margin: "0 0 8px 0",
            fontFamily: "var(--font)",
          }}
        >
          Premium Feature
        </h3>
        <p
          style={{
            fontSize: 14,
            color: "var(--navy)",
            margin: "0 0 20px 0",
            lineHeight: 1.5,
          }}
        >
          <strong>{featureName}</strong> is available on the paid plan. Upgrade
          to unlock this feature and more.
        </p>
        <button
          onClick={onClose}
          style={{
            padding: "10px 28px",
            borderRadius: 12,
            border: "none",
            background: "var(--teal)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            fontFamily: "var(--font)",
            cursor: "pointer",
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
