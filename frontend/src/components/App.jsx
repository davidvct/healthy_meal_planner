import { useState, useEffect, useCallback } from "react";
import CaretakerSetup from "./CaretakerSetup";
import DinerDashboard from "./DinerDashboard";
import OnboardingScreen from "./OnboardingScreen";
import CalendarScreen from "./CalendarScreen";
import AuthScreen from "./AuthScreen";
import * as api from "../services/api";

const VIEWS = { SETUP: "setup", DASHBOARD: "dashboard", ONBOARDING: "onboarding", CALENDAR: "calendar" };

export default function App() {
  const [authUser, setAuthUser] = useState(() => {
    try {
      const saved = localStorage.getItem("mealwise_auth_user");
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return null;
  });
  const [authToken, setAuthToken] = useState(() => {
    try {
      return localStorage.getItem("mealwise_auth_token");
    } catch (e) { /* ignore */ }
    return null;
  });

  const [caretaker, setCaretaker] = useState(() => {
    try {
      const saved = localStorage.getItem("mealwise_caretaker");
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return null;
  });

  const [activeDiner, setActiveDiner] = useState(null);
  const [editingDiner, setEditingDiner] = useState(null); // diner being edited, or null for new
  const [view, setView] = useState(caretaker ? VIEWS.DASHBOARD : VIEWS.SETUP);
  const [diners, setDiners] = useState([]);
  const [userTier, setUserTier] = useState("free");

  // Persist caretaker to localStorage
  useEffect(() => {
    try {
      if (authUser) localStorage.setItem("mealwise_auth_user", JSON.stringify(authUser));
      else localStorage.removeItem("mealwise_auth_user");
    } catch (e) { /* ignore */ }
  }, [authUser]);
  useEffect(() => {
    try {
      if (authToken) localStorage.setItem("mealwise_auth_token", authToken);
      else localStorage.removeItem("mealwise_auth_token");
    } catch (e) { /* ignore */ }
  }, [authToken]);

  useEffect(() => {
    try {
      if (caretaker) localStorage.setItem("mealwise_caretaker", JSON.stringify(caretaker));
      else localStorage.removeItem("mealwise_caretaker");
    } catch (e) { /* ignore */ }
  }, [caretaker]);

  // Restore caretaker by authenticated account so data persists across re-login.
  useEffect(() => {
    let cancelled = false;
    async function restoreCaretaker() {
      if (!authUser?.authUserId) return;
      try {
        const ct = await api.getCaretakerByAuth(authUser.authUserId);
        if (cancelled) return;
        setCaretaker(ct);
        setUserTier(ct.tier || "free");
        setView(VIEWS.DASHBOARD);
      } catch (err) {
        if (cancelled) return;
        setCaretaker(null);
        setView(VIEWS.SETUP);
      }
    }
    restoreCaretaker();
    return () => { cancelled = true; };
  }, [authUser]);

  // Load diners when caretaker is set
  const loadDiners = useCallback(async () => {
    if (!caretaker) return;
    try {
      const list = await api.getDiners(caretaker.caretakerId);
      setDiners(list);
    } catch (err) {
      console.error("Failed to load diners:", err);
    }
  }, [caretaker]);

  useEffect(() => { loadDiners(); }, [loadDiners]);

  // -- Handlers --

  const handleCaretakerSetup = async (name) => {
    try {
      const result = await api.createCaretaker(name, authUser?.authUserId);
      setCaretaker(result);
      setView(VIEWS.DASHBOARD);
    } catch (err) {
      console.error("Failed to create caretaker:", err);
    }
  };

  const handleSelectDiner = (diner) => {
    setActiveDiner(diner);
    setView(VIEWS.CALENDAR);
  };

  const handleAddDiner = () => {
    setEditingDiner(null);
    setView(VIEWS.ONBOARDING);
  };

  const handleEditDiner = (diner) => {
    setEditingDiner(diner);
    setView(VIEWS.ONBOARDING);
  };

  const handleOnboardingComplete = async (profile) => {
    try {
      const result = await api.createOrUpdateProfile({
        userId: editingDiner?.userId || undefined,
        name: profile.name,
        age: profile.age,
        sex: profile.sex,
        weightKg: profile.weightKg,
        caretakerId: caretaker.caretakerId,
        conditions: profile.conditions,
        diet: profile.diet,
        allergies: profile.allergies,
      });

      await loadDiners();

      if (editingDiner) {
        // If editing, go back to calendar with updated profile
        setActiveDiner(result);
        setView(VIEWS.CALENDAR);
      } else {
        // New diner — go to their calendar
        setActiveDiner(result);
        setView(VIEWS.CALENDAR);
      }
      setEditingDiner(null);
    } catch (err) {
      console.error("Failed to save diner profile:", err);
    }
  };

  const handleOnboardingCancel = () => {
    setEditingDiner(null);
    setView(activeDiner ? VIEWS.CALENDAR : VIEWS.DASHBOARD);
  };

  const handleBackToDashboard = () => {
    setActiveDiner(null);
    setView(VIEWS.DASHBOARD);
  };

  const handleSwitchDiner = (diner) => {
    setActiveDiner(diner);
  };

  const handleLogout = () => {
    setAuthUser(null);
    setAuthToken(null);
    setCaretaker(null);
    setActiveDiner(null);
    setDiners([]);
    setView(VIEWS.SETUP);
    try {
      localStorage.removeItem("mealwise_auth_user");
      localStorage.removeItem("mealwise_auth_token");
      localStorage.removeItem("mealwise_caretaker");
    } catch (e) { /* ignore */ }
  };

  // -- Render --
  if (!authUser || !authToken) {
    return <AuthScreen onAuthenticated={(user, token) => { setAuthUser(user); setAuthToken(token); }} />;
  }

  if (view === VIEWS.SETUP) {
    return <CaretakerSetup onComplete={handleCaretakerSetup} onLogout={handleLogout} />;
  }

  if (view === VIEWS.ONBOARDING) {
    return (
      <OnboardingScreen
        onComplete={handleOnboardingComplete}
        onCancel={handleOnboardingCancel}
        initialData={editingDiner}
      />
    );
  }

  const handleTierToggle = async () => {
    const newTier = userTier === "paid" ? "free" : "paid";
    try {
      await api.updateTier(caretaker.caretakerId, newTier);
      setUserTier(newTier);
    } catch (err) {
      console.error("Failed to toggle tier:", err);
    }
  };

  const globalTopBar = (
    <div style={{
      display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8,
      padding: "10px 20px", background: "#fff", borderBottom: "1px solid #e8e8e8",
      position: "sticky", top: 0, zIndex: 200,
    }}>
      <button
        onClick={handleTierToggle}
        style={{
          padding: "6px 12px",
          borderRadius: 8,
          border: `1px solid ${userTier === "paid" ? "#22c55e" : "#6C63FF"}`,
          background: "#fff",
          color: userTier === "paid" ? "#22c55e" : "#6C63FF",
          fontSize: 11,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {userTier === "paid" ? "Paid Plan" : "Free Plan"} (Demo Toggle)
      </button>
      <button
        onClick={handleLogout}
        style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #e0e0e0", background: "#fff", color: "#888", fontSize: 13, cursor: "pointer" }}
      >
        Logout
      </button>
    </div>
  );

  if (view === VIEWS.DASHBOARD) {
    if (!caretaker) return null;
    return (
      <>
        {globalTopBar}
        <DinerDashboard
          caretakerId={caretaker.caretakerId}
          caretakerName={caretaker.name}
          userTier={userTier}
          onSelectDiner={handleSelectDiner}
          onAddDiner={handleAddDiner}
        />
      </>
    );
  }

  if (view === VIEWS.CALENDAR && activeDiner) {
    return (
      <>
        {globalTopBar}
        <CalendarScreen
          userProfile={activeDiner}
          userId={activeDiner.userId}
          diners={diners}
          userTier={userTier}
          caretakerId={caretaker.caretakerId}
          onSwitchDiner={handleSwitchDiner}
          onEditProfile={() => handleEditDiner(activeDiner)}
          onBackToDashboard={handleBackToDashboard}
        />
      </>
    );
  }

  return null;
}
