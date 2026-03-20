import { useState, useEffect, useCallback } from "react";
import CaretakerSetup from "./CaretakerSetup";
import OnboardingScreen from "./OnboardingScreen";
import AuthScreen from "./AuthScreen";
import TodayScreen from "./TodayScreen";
import ShoppingScreen from "./ShoppingScreen";
import ProfilesScreen from "./ProfilesScreen";
import DiscoverScreen from "./DiscoverScreen";
import * as api from "../services/api";

const VIEWS = { AUTH: 'auth', SETUP: 'setup', APP: 'app' };
const TABS = { TODAY: 'today', SHOP: 'shop', PROFILES: 'profiles', DISCOVER: 'discover' };

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #069B8E, #07B5A5)',
  'linear-gradient(135deg, #6D3FA0, #9B59B6)',
  'linear-gradient(135deg, #1560A0, #1E72B8)',
  'linear-gradient(135deg, #D95F3B, #E8734A)',
  'linear-gradient(135deg, #18A55A, #22C55E)',
];

function avatarLabel(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

export default function App() {
  const [authUser, setAuthUser] = useState(() => {
    try { const s = localStorage.getItem("mealwise_auth_user"); if (s) return JSON.parse(s); } catch (e) {}
    return null;
  });
  const [authToken, setAuthToken] = useState(() => {
    try { return localStorage.getItem("mealwise_auth_token"); } catch (e) {}
    return null;
  });
  const [caretaker, setCaretaker] = useState(() => {
    try { const s = localStorage.getItem("mealwise_caretaker"); if (s) return JSON.parse(s); } catch (e) {}
    return null;
  });

  const [view, setView] = useState(VIEWS.AUTH);
  const [diners, setDiners] = useState([]);
  const [userTier, setUserTier] = useState("free");
  const [activeDiner, setActiveDiner] = useState(null);
  const [activeTab, setActiveTab] = useState(TABS.TODAY);
  const [discoverSlotCtx, setDiscoverSlotCtx] = useState(null);
  const [todayWeekOffset, setTodayWeekOffset] = useState(0);
  const [todayDayIndex, setTodayDayIndex] = useState(null); // null = use today's day
  // editingDiner: undefined = closed, null = new diner, object = editing existing
  const [editingDiner, setEditingDiner] = useState(undefined);

  // Persist auth state
  useEffect(() => {
    try {
      if (authUser) localStorage.setItem("mealwise_auth_user", JSON.stringify(authUser));
      else localStorage.removeItem("mealwise_auth_user");
    } catch (e) {}
  }, [authUser]);
  useEffect(() => {
    try {
      if (authToken) localStorage.setItem("mealwise_auth_token", authToken);
      else localStorage.removeItem("mealwise_auth_token");
    } catch (e) {}
  }, [authToken]);
  useEffect(() => {
    try {
      if (caretaker) localStorage.setItem("mealwise_caretaker", JSON.stringify(caretaker));
      else localStorage.removeItem("mealwise_caretaker");
    } catch (e) {}
  }, [caretaker]);

  // Restore caretaker on login
  useEffect(() => {
    let cancelled = false;
    async function restore() {
      if (!authUser?.authUserId) return;
      try {
        const ct = await api.getCaretakerByAuth(authUser.authUserId);
        if (cancelled) return;
        setCaretaker(ct);
        setUserTier(ct.tier || "free");
        setView(VIEWS.APP);
      } catch (err) {
        if (cancelled) return;
        if (err.status === 401) {
          // Token expired/invalid — force re-login
          setAuthUser(null); setAuthToken(null); setCaretaker(null);
          setView(VIEWS.AUTH);
          return;
        }
        setCaretaker(null);
        setView(VIEWS.SETUP);
      }
    }
    if (authUser && authToken) restore();
    return () => { cancelled = true; };
  }, [authUser, authToken]);

  const loadDiners = useCallback(async () => {
    if (!caretaker) return;
    try {
      const list = await api.getDiners(caretaker.caretakerId);
      setDiners(list);
      setActiveDiner(prev => prev ? (list.find(d => d.userId === prev.userId) ?? list[0] ?? null) : (list[0] ?? null));
    } catch (err) {
      console.error("Failed to load diners:", err);
    }
  }, [caretaker]);
  useEffect(() => { loadDiners(); }, [loadDiners]);

  const handleCaretakerSetup = async (name) => {
    try {
      const result = await api.createCaretaker(name, authUser?.authUserId);
      setCaretaker(result);
      setView(VIEWS.APP);
    } catch (err) {
      console.error("Failed to create caretaker:", err);
    }
  };

  const handleOnboardingComplete = async (profile) => {
    try {
      const result = await api.createOrUpdateProfile({
        userId: editingDiner?.userId,
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
      if (!activeDiner) setActiveDiner(result);
      setEditingDiner(undefined);
    } catch (err) {
      console.error("Failed to save diner:", err);
    }
  };

  const handleLogout = () => {
    setAuthUser(null); setAuthToken(null); setCaretaker(null);
    setActiveDiner(null); setDiners([]); setView(VIEWS.AUTH);
    setActiveTab(TABS.TODAY); setEditingDiner(undefined);
    try {
      localStorage.removeItem("mealwise_auth_user");
      localStorage.removeItem("mealwise_auth_token");
      localStorage.removeItem("mealwise_caretaker");
    } catch (e) {}
  };

  const openDiscover = (slotCtx) => {
    setDiscoverSlotCtx(slotCtx);
    if (slotCtx?.dayIndex != null) setTodayDayIndex(slotCtx.dayIndex);
    setActiveTab(TABS.DISCOVER);
  };

  // --- Pre-app screens ---
  if (!authUser || !authToken) {
    return <AuthScreen onAuthenticated={(user, token) => { setAuthUser(user); setAuthToken(token); }} />;
  }
  if (view === VIEWS.SETUP) {
    return <CaretakerSetup onComplete={handleCaretakerSetup} onLogout={handleLogout} />;
  }
  if (view !== VIEWS.APP) return null;

  const visibleTab = activeTab === TABS.DISCOVER ? TABS.TODAY : activeTab;

  const handleTierToggle = async () => {
    const newTier = userTier === "paid" ? "free" : "paid";
    try {
      await api.updateTier(caretaker.caretakerId, newTier);
      setUserTier(newTier);
    } catch (err) {
      console.error("Failed to toggle tier:", err);
    }
  };

  const tabs = [
    { id: TABS.TODAY,    label: "Today's plan",  icon: <GridIcon /> },
    { id: TABS.SHOP,     label: "Shopping list", icon: <ListIcon /> },
    { id: TABS.PROFILES, label: "Profiles",      icon: <UserIcon /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)', fontFamily: 'var(--font)', overflow: 'hidden' }}>

      {/* ── App header ── */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', height: 50 }}>
          {/* Left: logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '0 0 auto' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1S4 4.5 4 7a2 2 0 004 0C8 4.5 6 1 6 1z" fill="white"/>
              </svg>
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--navy)' }}>MealVitals</span>
          </div>

          {/* Center: diner switcher */}
          {diners.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: 3, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 24 }}>
              {diners.map((d, i) => {
                const isOn = activeDiner?.userId === d.userId;
                return (
                  <button
                    key={d.userId}
                    onClick={() => setActiveDiner(d)}
                    title={d.name}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: isOn ? '3px 10px 3px 3px' : '3px',
                      borderRadius: 20,
                      background: isOn ? 'var(--white)' : 'transparent',
                      border: isOn ? '1.5px solid var(--teal)' : '1.5px solid transparent',
                      cursor: 'pointer', flexShrink: 0,
                      fontFamily: 'var(--font)', transition: 'all 0.15s',
                    }}
                  >
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, fontWeight: 800, color: '#fff', flexShrink: 0,
                    }}>
                      {avatarLabel(d.name)}
                    </div>
                    {isOn && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap' }}>
                        {d.name?.split(' ')[0]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Right: logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '0 0 auto' }}>
            <button
              onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border2)', background: 'var(--white)', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-l)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text2)'; e.currentTarget.style.background = 'var(--white)'; }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M5 2H2.5A1.5 1.5 0 001 3.5v6A1.5 1.5 0 002.5 11H5M8.5 9.5L12 6.5M12 6.5L8.5 3.5M12 6.5H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Log out
            </button>
          </div>
        </div>

        {/* Nav grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid var(--border)' }}>
          {tabs.map((tab, i) => {
            const isOn = visibleTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setDiscoverSlotCtx(null); }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  padding: '9px 8px 8px', cursor: 'pointer', position: 'relative',
                  background: isOn ? 'var(--white)' : 'transparent',
                  border: 'none',
                  borderRight: i < tabs.length - 1 ? '1px solid var(--border)' : 'none',
                  fontFamily: 'var(--font)', transition: 'background 0.15s',
                }}
                onMouseOver={e => { if (!isOn) e.currentTarget.style.background = 'var(--teal-xl)'; }}
                onMouseOut={e => { if (!isOn) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isOn ? 'var(--teal)' : 'var(--text3)' }}>
                  {tab.icon}
                </div>
                <div style={{ fontSize: 11, fontWeight: isOn ? 700 : 600, color: isOn ? 'var(--teal)' : 'var(--text3)', textAlign: 'center', lineHeight: 1.2 }}>
                  {tab.label}
                </div>
                {isOn && (
                  <div style={{ position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 2.5, background: 'var(--teal)', borderRadius: '2px 2px 0 0' }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Screen content ── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {activeTab === TABS.TODAY && activeDiner && (
          <TodayScreen activeDiner={activeDiner} userId={activeDiner.userId} onBrowse={openDiscover} weekOffset={todayWeekOffset} onWeekOffsetChange={setTodayWeekOffset} initialDayIndex={todayDayIndex} onDayIndexChange={setTodayDayIndex} userTier={userTier} />
        )}
        {activeTab === TABS.SHOP && (
          <ShoppingScreen diners={diners} activeDiner={activeDiner} onGoToPlan={() => setActiveTab(TABS.TODAY)} />
        )}
        {activeTab === TABS.PROFILES && (
          <ProfilesScreen
            diners={diners}
            caretakerId={caretaker?.caretakerId}
            activeDiner={activeDiner}
            onSelectDiner={setActiveDiner}
            onAddDiner={() => setEditingDiner(null)}
            onEditDiner={(d) => setEditingDiner(d)}
            onDinersChanged={loadDiners}
            onViewPlan={(d) => { setActiveDiner(d); setActiveTab(TABS.TODAY); }}
          />
        )}
        {activeTab === TABS.DISCOVER && activeDiner && (
          <DiscoverScreen
            slotCtx={discoverSlotCtx}
            activeDiner={activeDiner}
            userId={activeDiner.userId}
            onBack={() => { setActiveTab(TABS.TODAY); setDiscoverSlotCtx(null); }}
            onAdded={() => { setActiveTab(TABS.TODAY); setDiscoverSlotCtx(null); }}
          />
        )}

        {/* No diner yet */}
        {!activeDiner && activeTab !== TABS.PROFILES && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--text3)' }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>No diner selected</div>
            <button
              onClick={() => setActiveTab(TABS.PROFILES)}
              style={{ padding: '7px 16px', borderRadius: 'var(--r-sm)', background: 'var(--teal)', color: '#fff', border: 'none', fontFamily: 'var(--font)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              Go to Profiles →
            </button>
          </div>
        )}
      </div>

      {/* ── Onboarding overlay ── */}
      {editingDiner !== undefined && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,34,64,0.45)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <OnboardingScreen
            onComplete={handleOnboardingComplete}
            onCancel={() => setEditingDiner(undefined)}
            initialData={editingDiner}
            dinerIndex={diners.findIndex(d => d.userId === editingDiner?.userId)}
            onDelete={editingDiner?.userId && diners[0]?.userId !== editingDiner.userId ? async () => {
              try { await api.deleteDiner(editingDiner.userId); await loadDiners(); setEditingDiner(undefined); }
              catch (err) { console.error('Failed to delete diner:', err); }
            } : undefined}
          />
        </div>
      )}
    </div>
  );
}

function GridIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="1" y="1" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="9" y="1" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="1" y="9" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="9" y="9" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  );
}
function ListIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M2.5 5h10M2.5 8h7M2.5 11h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M2.5 13c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
