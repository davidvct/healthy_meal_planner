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

  // Persist caretaker to localStorage
  useEffect(() => {
    try {
      if (authUser) localStorage.setItem("mealwise_auth_user", JSON.stringify(authUser));
      else localStorage.removeItem("mealwise_auth_user");
    } catch (e) { /* ignore */ }
  }, [authUser]);

  useEffect(() => {
    try {
      if (caretaker) localStorage.setItem("mealwise_caretaker", JSON.stringify(caretaker));
      else localStorage.removeItem("mealwise_caretaker");
    } catch (e) { /* ignore */ }
  }, [caretaker]);

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
      const result = await api.createCaretaker(name);
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
    setCaretaker(null);
    setActiveDiner(null);
    setDiners([]);
    setView(VIEWS.SETUP);
    try {
      localStorage.removeItem("mealwise_auth_user");
      localStorage.removeItem("mealwise_caretaker");
    } catch (e) { /* ignore */ }
  };

  // -- Render --
  if (!authUser) {
    return <AuthScreen onAuthenticated={setAuthUser} />;
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

  if (view === VIEWS.DASHBOARD) {
    return (
      <DinerDashboard
        caretakerId={caretaker.caretakerId}
        caretakerName={caretaker.name}
        onSelectDiner={handleSelectDiner}
        onAddDiner={handleAddDiner}
        onLogout={handleLogout}
      />
    );
  }

  if (view === VIEWS.CALENDAR && activeDiner) {
    return (
      <CalendarScreen
        userProfile={activeDiner}
        userId={activeDiner.userId}
        diners={diners}
        onSwitchDiner={handleSwitchDiner}
        onEditProfile={() => handleEditDiner(activeDiner)}
        onBackToDashboard={handleBackToDashboard}
      />
    );
  }

  return null;
}
