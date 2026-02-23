import { useState, useEffect } from "react";
import OnboardingScreen from "./OnboardingScreen";
import CalendarScreen from "./CalendarScreen";
import * as api from "../services/api";

export default function App() {
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("mealwise_profile");
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return null;
  });

  // Persist profile to localStorage as a cache
  useEffect(() => {
    try {
      if (userProfile) localStorage.setItem("mealwise_profile", JSON.stringify(userProfile));
      else localStorage.removeItem("mealwise_profile");
    } catch (e) { /* ignore */ }
  }, [userProfile]);

  const handleOnboardingComplete = async (profile) => {
    try {
      // Save profile to backend, get back userId
      const existingId = userProfile?.userId || undefined;
      const result = await api.createOrUpdateProfile({
        userId: existingId,
        conditions: profile.conditions,
        diet: profile.diet,
        allergies: profile.allergies,
      });
      setUserProfile(result);
    } catch (err) {
      console.error("Failed to save profile:", err);
      // Fallback: use profile locally with a temporary id
      setUserProfile({ ...profile, userId: "local-" + Date.now() });
    }
  };

  if (!userProfile) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <CalendarScreen
      userProfile={userProfile}
      userId={userProfile.userId}
      onEditProfile={() => setUserProfile(null)}
    />
  );
}
