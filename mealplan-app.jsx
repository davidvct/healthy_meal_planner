import { useState, useMemo, useCallback, useEffect } from "react";

// ============================================================
// DATA LAYER
// ============================================================

const INGREDIENTS_NUTRIENTS = {
  // per 100g: [calories, protein_g, carbs_g, fat_g, fiber_g, sodium_mg, cholesterol_mg, sugar_g]
  "chicken breast": [165, 31, 0, 3.6, 0, 74, 85, 0],
  "rice": [130, 2.7, 28, 0.3, 0.4, 1, 0, 0],
  "cucumber": [15, 0.7, 3.6, 0.1, 0.5, 2, 0, 1.7],
  "ginger": [80, 1.8, 18, 0.8, 2, 13, 0, 1.7],
  "kangkong": [19, 2.6, 3.1, 0.2, 2.1, 113, 0, 0],
  "garlic": [149, 6.4, 33, 0.5, 2.1, 17, 0, 1],
  "tofu": [76, 8, 1.9, 4.8, 0.3, 7, 0, 0.6],
  "egg": [155, 13, 1.1, 11, 0, 124, 373, 1.1],
  "coconut milk": [230, 2.3, 6, 24, 0, 15, 0, 3.3],
  "peanut": [567, 26, 16, 49, 8.5, 18, 0, 4],
  "anchovies": [210, 29, 0, 10, 0, 3668, 60, 0],
  "fish": [100, 20, 0, 1.7, 0, 75, 47, 0],
  "soy sauce": [53, 8, 5, 0, 0.8, 5637, 0, 0.4],
  "yellow noodles": [138, 4.5, 25, 2, 1, 234, 0, 0],
  "cabbage": [25, 1.3, 5.8, 0.1, 2.5, 18, 0, 3.2],
  "onion": [40, 1.1, 9.3, 0.1, 1.7, 4, 0, 4.2],
  "spring onion": [32, 1.8, 7.3, 0.2, 2.6, 16, 0, 2.3],
  "sesame oil": [884, 0, 0, 100, 0, 0, 0, 0],
  "cooking oil": [884, 0, 0, 100, 0, 0, 0, 0],
  "kaya": [300, 3, 50, 10, 0, 50, 30, 45],
  "bread": [265, 9, 49, 3.2, 2.7, 491, 0, 5],
  "butter": [717, 0.9, 0, 81, 0, 11, 215, 0],
  "carrot": [41, 0.9, 10, 0.2, 2.8, 69, 0, 4.7],
  "chili": [40, 2, 8.8, 0.4, 1.5, 7, 0, 5.3],
  "shrimp": [99, 24, 0.2, 0.3, 0, 111, 189, 0],
  "bean sprouts": [31, 3.1, 5.9, 0.2, 1.8, 6, 0, 4.1],
  "barley": [354, 12, 73, 2.3, 17, 12, 0, 0.8],
  "longan": [60, 1.3, 15, 0.1, 1.1, 0, 0, 0],
  "white fungus": [26, 1.6, 5, 0.2, 2.6, 6, 0, 0],
  "ginkgo nut": [182, 4.3, 38, 1.7, 0, 7, 0, 0],
  "rock sugar": [400, 0, 100, 0, 0, 0, 0, 100],
  "pandan leaf": [35, 1, 8, 0.1, 3, 5, 0, 0],
};

const NUTRIENT_KEYS = ["calories", "protein", "carbs", "fat", "fiber", "sodium", "cholesterol", "sugar"];

const DISHES = [
  {
    id: "d1", name: "Hainanese Chicken Rice", mealTypes: ["lunch", "dinner"],
    tags: ["singaporean", "classic"],
    ingredients: { "chicken breast": 200, "rice": 250, "cucumber": 50, "ginger": 15, "garlic": 10, "spring onion": 10, "sesame oil": 5, "soy sauce": 10 },
    recipeId: "r1", baseServings: 1,
  },
  {
    id: "d2", name: "Nasi Lemak", mealTypes: ["breakfast", "lunch"],
    tags: ["singaporean", "malay"],
    ingredients: { "rice": 200, "coconut milk": 50, "egg": 50, "anchovies": 20, "peanut": 15, "cucumber": 30, "chili": 20 },
    recipeId: "r2", baseServings: 1,
  },
  {
    id: "d3", name: "Chicken Congee", mealTypes: ["breakfast"],
    tags: ["chinese", "comfort"],
    ingredients: { "chicken breast": 80, "rice": 100, "ginger": 10, "spring onion": 10, "sesame oil": 3, "soy sauce": 5 },
    recipeId: "r3", baseServings: 1,
  },
  {
    id: "d4", name: "Stir Fry Kangkong", mealTypes: ["lunch", "dinner"],
    tags: ["singaporean", "vegetable", "vegetarian"],
    ingredients: { "kangkong": 200, "garlic": 15, "cooking oil": 10, "chili": 5, "soy sauce": 5 },
    recipeId: "r4", baseServings: 1,
  },
  {
    id: "d5", name: "Steamed Fish with Ginger & Soy", mealTypes: ["lunch", "dinner"],
    tags: ["chinese", "healthy", "steamed"],
    ingredients: { "fish": 200, "ginger": 20, "soy sauce": 15, "spring onion": 15, "sesame oil": 5 },
    recipeId: "r5", baseServings: 1,
  },
  {
    id: "d6", name: "Egg Fried Rice", mealTypes: ["lunch", "dinner"],
    tags: ["chinese", "quick"],
    ingredients: { "rice": 250, "egg": 100, "spring onion": 15, "cooking oil": 15, "soy sauce": 10, "carrot": 30 },
    recipeId: "r6", baseServings: 1,
  },
  {
    id: "d7", name: "Tofu Vegetable Soup", mealTypes: ["lunch", "dinner"],
    tags: ["chinese", "healthy", "vegetarian"],
    ingredients: { "tofu": 150, "cabbage": 100, "carrot": 50, "spring onion": 10, "ginger": 5 },
    recipeId: "r7", baseServings: 1,
  },
  {
    id: "d8", name: "Mee Goreng", mealTypes: ["lunch", "dinner"],
    tags: ["singaporean", "malay", "spicy"],
    ingredients: { "yellow noodles": 200, "egg": 50, "cabbage": 50, "bean sprouts": 50, "shrimp": 50, "soy sauce": 15, "chili": 10, "cooking oil": 15 },
    recipeId: "r8", baseServings: 1,
  },
  {
    id: "d9", name: "Kaya Toast & Soft-Boiled Eggs", mealTypes: ["breakfast", "snack"],
    tags: ["singaporean", "classic", "quick"],
    ingredients: { "bread": 60, "kaya": 20, "butter": 10, "egg": 100 },
    recipeId: "r9", baseServings: 1,
  },
  {
    id: "d10", name: "Cheng Tng", mealTypes: ["snack"],
    tags: ["singaporean", "chinese", "dessert"],
    ingredients: { "barley": 30, "longan": 30, "white fungus": 10, "ginkgo nut": 20, "rock sugar": 15, "pandan leaf": 2 },
    recipeId: "r10", baseServings: 1,
  },
];

const RECIPES = {
  r1: { name: "Hainanese Chicken Rice", prepTime: 15, cookTime: 45, steps: [
    "Rub chicken breast with salt and ginger. Bring a pot of water to boil.",
    "Poach chicken in gently simmering water for 20 minutes. Remove and plunge into ice water.",
    "Use the poaching liquid to cook rice with garlic and a pandan leaf if available.",
    "Slice cucumber. Chop spring onion finely.",
    "Slice chicken, arrange over rice with cucumber. Drizzle with sesame oil and soy sauce. Garnish with spring onion."
  ]},
  r2: { name: "Nasi Lemak", prepTime: 10, cookTime: 30, steps: [
    "Cook rice with coconut milk and a pinch of salt until fluffy.",
    "Hard-boil egg, peel and halve.",
    "Deep fry anchovies until crispy. Toast peanuts in a dry pan.",
    "Prepare sambal chili by blending and frying chili paste.",
    "Arrange coconut rice on plate with egg, anchovies, peanuts, cucumber slices, and sambal on the side."
  ]},
  r3: { name: "Chicken Congee", prepTime: 5, cookTime: 60, steps: [
    "Rinse rice and add to a large pot with 8 cups of water.",
    "Bring to a boil, then reduce heat to low. Simmer for 40 minutes, stirring occasionally.",
    "Add chicken breast pieces and ginger slices. Cook another 15 minutes until chicken is done.",
    "Shred the chicken. Season congee with sesame oil and soy sauce.",
    "Serve topped with spring onion."
  ]},
  r4: { name: "Stir Fry Kangkong", prepTime: 5, cookTime: 5, steps: [
    "Wash kangkong thoroughly. Cut into 3-inch lengths.",
    "Heat oil in a wok over high heat. Add minced garlic and chili, stir 15 seconds.",
    "Add kangkong and toss rapidly for 2-3 minutes until just wilted.",
    "Season with soy sauce. Serve immediately."
  ]},
  r5: { name: "Steamed Fish with Ginger & Soy", prepTime: 10, cookTime: 12, steps: [
    "Place fish fillet on a heatproof plate. Top with julienned ginger.",
    "Steam over high heat for 10-12 minutes until fish is just cooked through.",
    "Discard any liquid. Top with spring onion shreds.",
    "Heat sesame oil until smoking and pour over fish. Drizzle soy sauce and serve."
  ]},
  r6: { name: "Egg Fried Rice", prepTime: 5, cookTime: 10, steps: [
    "Use day-old cold rice for best results. Dice carrot finely.",
    "Beat eggs in a bowl. Heat oil in a wok over high heat.",
    "Scramble eggs until just set, break into pieces.",
    "Add carrot, stir fry 1 minute. Add rice and toss vigorously.",
    "Season with soy sauce, add spring onion, toss and serve."
  ]},
  r7: { name: "Tofu Vegetable Soup", prepTime: 10, cookTime: 15, steps: [
    "Cut tofu into cubes. Shred cabbage. Slice carrot thinly.",
    "Bring 4 cups of water to a boil with ginger slices.",
    "Add carrot and cook 3 minutes. Add cabbage and tofu.",
    "Simmer for 8 minutes. Season with a pinch of salt.",
    "Garnish with spring onion and serve hot."
  ]},
  r8: { name: "Mee Goreng", prepTime: 10, cookTime: 10, steps: [
    "Blanch yellow noodles briefly in hot water. Drain well.",
    "Heat oil in a wok. Stir fry shrimp until pink, set aside.",
    "Scramble egg in the same wok. Add cabbage and bean sprouts, toss 1 minute.",
    "Add noodles, soy sauce, and chili paste. Toss everything over high heat.",
    "Return shrimp to wok, toss to combine. Serve hot."
  ]},
  r9: { name: "Kaya Toast & Soft-Boiled Eggs", prepTime: 3, cookTime: 5, steps: [
    "Toast bread slices until golden and crispy.",
    "Spread kaya generously on one side, butter on the other. Sandwich together and cut diagonally.",
    "Bring water to a boil, turn off heat. Gently lower eggs in and cover for 6 minutes.",
    "Crack eggs into a small dish. Season with soy sauce and white pepper.",
    "Serve kaya toast alongside the soft-boiled eggs."
  ]},
  r10: { name: "Cheng Tng", prepTime: 10, cookTime: 40, steps: [
    "Soak barley and white fungus in water for 30 minutes. Drain.",
    "Boil 6 cups of water with pandan leaf (tied in a knot).",
    "Add barley and ginkgo nuts, simmer 20 minutes.",
    "Add white fungus and longan, simmer another 10 minutes.",
    "Add rock sugar to taste. Remove pandan leaf. Serve warm or chilled."
  ]},
};

const CONDITION_RULES = {
  "High Blood Sugar": { limit: { carbs: 60, sugar: 15 }, warnNutrient: "carbs", warnLabel: "High Carbohydrate" },
  "High Cholesterol": { limit: { cholesterol: 100, fat: 25 }, warnNutrient: "cholesterol", warnLabel: "High Cholesterol" },
  "Hypertension": { limit: { sodium: 700 }, warnNutrient: "sodium", warnLabel: "High Sodium" },
};

const RDA = { calories: 2000, protein: 50, carbs: 275, fat: 65, fiber: 28, sodium: 2300, cholesterol: 300, sugar: 50 };

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAYS_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function getDishNutrients(dish, servings = 1) {
  const n = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, cholesterol: 0, sugar: 0 };
  for (const [ing, amountG] of Object.entries(dish.ingredients)) {
    const nd = INGREDIENTS_NUTRIENTS[ing];
    if (!nd) continue;
    const scale = (amountG / 100) * servings;
    NUTRIENT_KEYS.forEach((k, i) => { n[k] += nd[i] * scale; });
  }
  Object.keys(n).forEach(k => n[k] = Math.round(n[k] * 10) / 10);
  return n;
}

function getDayNutrients(mealPlan, dayIndex) {
  const n = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, cholesterol: 0, sugar: 0 };
  MEAL_TYPES.forEach(mt => {
    const entry = mealPlan[dayIndex]?.[mt];
    if (entry) {
      const dn = getDishNutrients(DISHES.find(d => d.id === entry.dishId), entry.servings);
      NUTRIENT_KEYS.forEach(k => n[k] += dn[k]);
    }
  });
  Object.keys(n).forEach(k => n[k] = Math.round(n[k] * 10) / 10);
  return n;
}

function getWeekNutrients(mealPlan) {
  const n = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, cholesterol: 0, sugar: 0 };
  for (let d = 0; d < 7; d++) {
    const dn = getDayNutrients(mealPlan, d);
    NUTRIENT_KEYS.forEach(k => n[k] += dn[k]);
  }
  Object.keys(n).forEach(k => n[k] = Math.round(n[k] * 10) / 10);
  return n;
}

function getWarnings(dish, conditions) {
  const warnings = [];
  const n = getDishNutrients(dish);
  conditions.forEach(c => {
    const rule = CONDITION_RULES[c];
    if (!rule) return;
    for (const [nutrient, limit] of Object.entries(rule.limit)) {
      if (n[nutrient] > limit) {
        warnings.push(rule.warnLabel);
        break;
      }
    }
  });
  return [...new Set(warnings)];
}

function scoreDish(dish, userProfile, mealPlan, dayIndex, mealType) {
  const dn = getDishNutrients(dish);
  const dayN = getDayNutrients(mealPlan, dayIndex);

  // Health condition score (0-30)
  let healthScore = 30;
  userProfile.conditions.forEach(c => {
    const rule = CONDITION_RULES[c];
    if (!rule) return;
    for (const [nutrient, limit] of Object.entries(rule.limit)) {
      const ratio = dn[nutrient] / limit;
      if (ratio > 1.2) healthScore -= 12;
      else if (ratio > 0.8) healthScore -= 5;
    }
  });
  healthScore = Math.max(0, healthScore);

  // Nutrient gap score (0-40)
  const mealTarget = {};
  NUTRIENT_KEYS.forEach(k => mealTarget[k] = RDA[k] / 3);
  const remaining = {};
  NUTRIENT_KEYS.forEach(k => remaining[k] = Math.max(0, RDA[k] - dayN[k]));

  let gapScore = 0;
  const importantNutrients = ["protein", "fiber", "calories"];
  const limitNutrients = ["sodium", "cholesterol", "sugar"];

  importantNutrients.forEach(k => {
    if (remaining[k] > 0) {
      const fillRatio = Math.min(1, dn[k] / (remaining[k] * 0.4));
      gapScore += fillRatio * 10;
    }
  });

  limitNutrients.forEach(k => {
    const headroom = remaining[k];
    if (headroom > 0 && dn[k] <= headroom) {
      gapScore += 3.3;
    } else if (dn[k] > headroom * 1.2) {
      gapScore -= 2;
    }
  });
  gapScore = Math.max(0, Math.min(40, gapScore));

  // Variety score (0-15)
  let varietyScore = 15;
  const selectedDishIds = [];
  for (let d = 0; d < 7; d++) {
    MEAL_TYPES.forEach(mt => {
      if (mealPlan[d]?.[mt]) selectedDishIds.push(mealPlan[d][mt].dishId);
    });
  }
  const count = selectedDishIds.filter(id => id === dish.id).length;
  varietyScore = Math.max(0, 15 - count * 5);

  // Meal appropriateness (0-15)
  let mealScore = dish.mealTypes.includes(mealType) ? 15 : 5;

  const total = Math.round(Math.max(0, Math.min(100, healthScore + gapScore + varietyScore + mealScore)));
  return { total, healthScore: Math.round(healthScore), gapScore: Math.round(gapScore), varietyScore: Math.round(varietyScore), mealScore: Math.round(mealScore) };
}

function getShoppingList(mealPlan) {
  const list = {};
  for (let d = 0; d < 7; d++) {
    MEAL_TYPES.forEach(mt => {
      const entry = mealPlan[d]?.[mt];
      if (!entry) return;
      const dish = DISHES.find(di => di.id === entry.dishId);
      if (!dish) return;
      for (const [ing, amount] of Object.entries(dish.ingredients)) {
        list[ing] = (list[ing] || 0) + amount * entry.servings;
      }
    });
  }
  return Object.entries(list).sort((a, b) => a[0].localeCompare(b[0])).map(([name, grams]) => ({ name, grams: Math.round(grams) }));
}

// ============================================================
// COMPONENTS
// ============================================================

const COLORS = {
  bg: "#FDF6EE",
  card: "#FFFFFF",
  accent: "#D4713B",
  accentLight: "#F5DCC8",
  green: "#5B9A6F",
  greenLight: "#D4EDD9",
  navy: "#2D3748",
  gray: "#718096",
  grayLight: "#E8E0D8",
  warn: "#E53E3E",
  warnBg: "#FFF5F5",
  gold: "#D69E2E",
  goldLight: "#FEFCBF",
};

// ---- Onboarding ----
function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(0);
  const [conditions, setConditions] = useState([]);
  const [diet, setDiet] = useState("none");
  const [allergies, setAllergies] = useState([]);

  const conditionOptions = ["High Blood Sugar", "High Cholesterol", "Hypertension"];
  const dietOptions = [
    { value: "none", label: "No Restriction" },
    { value: "vegetarian", label: "Vegetarian" },
    { value: "vegan", label: "Vegan" },
    { value: "halal", label: "Halal" },
    { value: "pescatarian", label: "Pescatarian" },
  ];
  const allergyOptions = ["egg", "peanut", "shrimp", "fish", "soy sauce", "coconut milk"];

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

// ---- Nutrient Bar ----
function NutrientBar({ label, value, max, unit, color, warn }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: COLORS.gray, marginBottom: 3 }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
        <span style={{ color: warn && pct > 90 ? COLORS.warn : COLORS.gray }}>
          {Math.round(value)}{unit} / {max}{unit}
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: COLORS.grayLight }}>
        <div style={{
          height: "100%", borderRadius: 3, width: `${pct}%`,
          background: warn && pct > 90 ? COLORS.warn : pct > 75 ? COLORS.gold : color || COLORS.green,
          transition: "width 0.4s ease",
        }} />
      </div>
    </div>
  );
}

// ---- Score Badge ----
function ScoreBadge({ score }) {
  const color = score >= 80 ? COLORS.green : score >= 50 ? COLORS.gold : COLORS.warn;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 8px", borderRadius: 8,
      background: score >= 80 ? COLORS.greenLight : score >= 50 ? COLORS.goldLight : COLORS.warnBg,
      color, fontSize: 12, fontWeight: 700,
    }}>
      {score >= 80 ? "★" : score >= 50 ? "●" : "▼"} {score}%
    </div>
  );
}

// ---- Warning Tag ----
function WarningTag({ text }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 6, background: COLORS.warnBg,
      color: COLORS.warn, fontSize: 11, fontWeight: 700, marginRight: 4,
    }}>
      ⚠ {text}
    </span>
  );
}

// ---- Dish Card (for recommendation list) ----
function DishCard({ dish, score, warnings, onSelect, onDetail }) {
  const nutrients = getDishNutrients(dish);
  return (
    <div style={{
      background: COLORS.card, borderRadius: 16, padding: 16, cursor: "pointer",
      border: `1px solid ${COLORS.grayLight}`, transition: "all 0.2s",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy, marginBottom: 4 }}>{dish.name}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
            {warnings.map(w => <WarningTag key={w} text={w} />)}
            {dish.tags.slice(0, 2).map(t => (
              <span key={t} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: COLORS.accentLight, color: COLORS.accent, fontWeight: 600 }}>{t}</span>
            ))}
          </div>
        </div>
        <ScoreBadge score={score.total} />
      </div>

      <div style={{ display: "flex", gap: 12, fontSize: 12, color: COLORS.gray, marginBottom: 12 }}>
        <span>{Math.round(nutrients.calories)} cal</span>
        <span>P {Math.round(nutrients.protein)}g</span>
        <span>C {Math.round(nutrients.carbs)}g</span>
        <span>F {Math.round(nutrients.fat)}g</span>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={(e) => { e.stopPropagation(); onSelect(dish); }}
          style={{
            flex: 1, padding: "10px", borderRadius: 10, border: "none", background: COLORS.accent, color: "#fff",
            fontWeight: 700, fontSize: 13, cursor: "pointer",
          }}>
          + Add to Plan
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDetail(dish); }}
          style={{
            padding: "10px 14px", borderRadius: 10, border: `1px solid ${COLORS.grayLight}`, background: COLORS.card,
            color: COLORS.gray, fontWeight: 600, fontSize: 13, cursor: "pointer",
          }}>
          Details
        </button>
      </div>
    </div>
  );
}

// ---- Dish Detail Panel ----
function DishDetail({ dish, userProfile, onAdd, onClose }) {
  const [servings, setServings] = useState(dish.baseServings);
  const nutrients = getDishNutrients(dish, servings);
  const recipe = RECIPES[dish.recipeId];
  const warnings = getWarnings(dish, userProfile.conditions);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "flex-end" }}
      onClick={onClose}>
      <div style={{
        background: COLORS.bg, borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 500, maxHeight: "85vh", overflow: "auto", padding: 24,
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: COLORS.navy, margin: 0 }}>{dish.name}</h2>
            <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
              {warnings.map(w => <WarningTag key={w} text={w} />)}
              {dish.tags.map(t => (
                <span key={t} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: COLORS.accentLight, color: COLORS.accent, fontWeight: 600 }}>{t}</span>
              ))}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, color: COLORS.gray, cursor: "pointer", padding: 4 }}>×</button>
        </div>

        {/* Serving adjuster */}
        <div style={{
          display: "flex", alignItems: "center", gap: 16, padding: 14, background: COLORS.card, borderRadius: 14,
          border: `1px solid ${COLORS.grayLight}`, marginBottom: 16,
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy }}>Servings</span>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" }}>
            <button onClick={() => setServings(Math.max(0.5, servings - 0.5))}
              style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${COLORS.grayLight}`, background: COLORS.card, fontSize: 18, cursor: "pointer", color: COLORS.navy }}>-</button>
            <span style={{ fontSize: 18, fontWeight: 700, color: COLORS.accent, minWidth: 30, textAlign: "center" }}>{servings}</span>
            <button onClick={() => setServings(servings + 0.5)}
              style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${COLORS.grayLight}`, background: COLORS.card, fontSize: 18, cursor: "pointer", color: COLORS.navy }}>+</button>
          </div>
        </div>

        {/* Nutrients */}
        <div style={{ padding: 16, background: COLORS.card, borderRadius: 14, border: `1px solid ${COLORS.grayLight}`, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy, margin: "0 0 12px 0" }}>Nutrition (per {servings} serving{servings !== 1 ? "s" : ""})</h3>
          <NutrientBar label="Calories" value={nutrients.calories} max={RDA.calories / 3} unit=" kcal" color={COLORS.accent} />
          <NutrientBar label="Protein" value={nutrients.protein} max={RDA.protein / 3} unit="g" color={COLORS.green} />
          <NutrientBar label="Carbs" value={nutrients.carbs} max={RDA.carbs / 3} unit="g" color={COLORS.gold} />
          <NutrientBar label="Fat" value={nutrients.fat} max={RDA.fat / 3} unit="g" color={COLORS.accent} />
          <NutrientBar label="Fiber" value={nutrients.fiber} max={RDA.fiber / 3} unit="g" color={COLORS.green} />
          <NutrientBar label="Sodium" value={nutrients.sodium} max={RDA.sodium / 3} unit="mg" color={COLORS.gray} warn />
          <NutrientBar label="Cholesterol" value={nutrients.cholesterol} max={RDA.cholesterol / 3} unit="mg" color={COLORS.gray} warn />
        </div>

        {/* Ingredients */}
        <div style={{ padding: 16, background: COLORS.card, borderRadius: 14, border: `1px solid ${COLORS.grayLight}`, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy, margin: "0 0 10px 0" }}>Ingredients</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {Object.entries(dish.ingredients).map(([ing, amt]) => (
              <span key={ing} style={{ fontSize: 13, padding: "4px 10px", borderRadius: 8, background: COLORS.accentLight, color: COLORS.navy }}>
                {ing} <b>{Math.round(amt * servings)}g</b>
              </span>
            ))}
          </div>
        </div>

        {/* Recipe */}
        {recipe && (
          <div style={{ padding: 16, background: COLORS.card, borderRadius: 14, border: `1px solid ${COLORS.grayLight}`, marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy, margin: "0 0 4px 0" }}>Recipe</h3>
            <div style={{ fontSize: 12, color: COLORS.gray, marginBottom: 12 }}>
              Prep: {recipe.prepTime} min · Cook: {recipe.cookTime} min
            </div>
            {recipe.steps.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <div style={{
                  minWidth: 24, height: 24, borderRadius: 12, background: COLORS.accentLight, color: COLORS.accent,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700,
                }}>{i + 1}</div>
                <p style={{ margin: 0, fontSize: 13, color: COLORS.navy, lineHeight: 1.5 }}>{s}</p>
              </div>
            ))}
          </div>
        )}

        <button onClick={() => onAdd(dish, servings)}
          style={{
            width: "100%", padding: "14px", borderRadius: 14, border: "none", background: COLORS.accent, color: "#fff",
            fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "0 2px 8px rgba(212,113,59,0.3)",
          }}>
          + Add to Plan ({servings} serving{servings !== 1 ? "s" : ""})
        </button>
      </div>
    </div>
  );
}

// ---- Add Dish Modal ----
function AddDishModal({ dayIndex, mealType, userProfile, mealPlan, onAdd, onClose }) {
  const [search, setSearch] = useState("");
  const [detailDish, setDetailDish] = useState(null);

  const { filtered, scored } = useMemo(() => {
    let available = DISHES.filter(d => {
      // Hard filter: allergies
      for (const allergy of userProfile.allergies) {
        if (d.ingredients[allergy] !== undefined) return false;
      }
      // Hard filter: dietary
      if (userProfile.diet === "vegetarian" && !d.tags.includes("vegetarian") && (
        d.ingredients["chicken breast"] || d.ingredients["fish"] || d.ingredients["shrimp"] || d.ingredients["anchovies"]
      )) return false;
      if (userProfile.diet === "vegan" && (
        d.ingredients["chicken breast"] || d.ingredients["fish"] || d.ingredients["shrimp"] || d.ingredients["anchovies"] || d.ingredients["egg"] || d.ingredients["butter"]
      )) return false;
      if (userProfile.diet === "pescatarian" && (d.ingredients["chicken breast"])) return false;
      return true;
    });

    if (search.trim()) {
      const q = search.toLowerCase();
      available = available.filter(d => d.name.toLowerCase().includes(q) || d.tags.some(t => t.includes(q)));
    }

    const scored = available.map(d => ({
      dish: d,
      score: scoreDish(d, userProfile, mealPlan, dayIndex, mealType),
      warnings: getWarnings(d, userProfile.conditions),
    })).sort((a, b) => b.score.total - a.score.total);

    return { filtered: available, scored };
  }, [search, userProfile, mealPlan, dayIndex, mealType]);

  const dayNutrients = getDayNutrients(mealPlan, dayIndex);

  if (detailDish) {
    return <DishDetail dish={detailDish} userProfile={userProfile} onAdd={(d, s) => { onAdd(d, s); }} onClose={() => setDetailDish(null)} />;
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "flex-end" }}
      onClick={onClose}>
      <div style={{
        background: COLORS.bg, borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 500, maxHeight: "85vh", overflow: "auto", padding: 24,
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.navy, margin: 0 }}>
              {DAYS_FULL[dayIndex]} · {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, color: COLORS.gray, cursor: "pointer" }}>×</button>
        </div>

        {/* Day nutrient progress */}
        <div style={{ padding: 12, background: COLORS.card, borderRadius: 12, border: `1px solid ${COLORS.grayLight}`, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.gray, marginBottom: 8 }}>Today's intake so far</div>
          <div style={{ display: "flex", gap: 14, fontSize: 12 }}>
            <span style={{ color: COLORS.accent }}>🔥 {Math.round(dayNutrients.calories)} cal</span>
            <span style={{ color: COLORS.green }}>💪 {Math.round(dayNutrients.protein)}g protein</span>
            <span style={{ color: COLORS.gold }}>🌾 {Math.round(dayNutrients.carbs)}g carbs</span>
          </div>
        </div>

        {/* Search */}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search dishes..."
          style={{
            width: "100%", padding: "12px 16px", borderRadius: 12, border: `1px solid ${COLORS.grayLight}`,
            background: COLORS.card, fontSize: 14, marginBottom: 16, outline: "none", boxSizing: "border-box",
            color: COLORS.navy,
          }} />

        {/* Recommended label */}
        <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.gray, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
          Recommended for you
        </div>

        {/* Dish list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {scored.length === 0 && (
            <div style={{ textAlign: "center", padding: 30, color: COLORS.gray }}>No dishes match your filters.</div>
          )}
          {scored.map(({ dish, score, warnings }) => (
            <DishCard key={dish.id} dish={dish} score={score} warnings={warnings}
              onSelect={(d) => onAdd(d, 1)}
              onDetail={(d) => setDetailDish(d)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Shopping List Panel ----
function ShoppingListPanel({ mealPlan, onClose }) {
  const items = getShoppingList(mealPlan);
  const totalDishes = (() => {
    let c = 0;
    for (let d = 0; d < 7; d++) MEAL_TYPES.forEach(mt => { if (mealPlan[d]?.[mt]) c++; });
    return c;
  })();

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "flex-end" }}
      onClick={onClose}>
      <div style={{
        background: COLORS.bg, borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 500, maxHeight: "85vh", overflow: "auto", padding: 24,
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: COLORS.navy, margin: 0 }}>🛒 Shopping List</h2>
            <p style={{ color: COLORS.gray, fontSize: 13, margin: "4px 0 0 0" }}>{totalDishes} dishes planned this week</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, color: COLORS.gray, cursor: "pointer" }}>×</button>
        </div>

        {items.length === 0 ? (
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

// ---- Weekly Nutrient Summary ----
function NutrientSummaryPanel({ mealPlan, userProfile, onClose }) {
  const weekN = getWeekNutrients(mealPlan);
  const weekRDA = {};
  NUTRIENT_KEYS.forEach(k => weekRDA[k] = RDA[k] * 7);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "flex-end" }}
      onClick={onClose}>
      <div style={{
        background: COLORS.bg, borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 500, maxHeight: "85vh", overflow: "auto", padding: 24,
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: COLORS.navy, margin: 0 }}>📊 Weekly Nutrition</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, color: COLORS.gray, cursor: "pointer" }}>×</button>
        </div>

        <div style={{ padding: 16, background: COLORS.card, borderRadius: 14, border: `1px solid ${COLORS.grayLight}`, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy, margin: "0 0 14px 0" }}>Weekly Totals vs RDA × 7</h3>
          <NutrientBar label="Calories" value={weekN.calories} max={weekRDA.calories} unit=" kcal" color={COLORS.accent} />
          <NutrientBar label="Protein" value={weekN.protein} max={weekRDA.protein} unit="g" color={COLORS.green} />
          <NutrientBar label="Carbs" value={weekN.carbs} max={weekRDA.carbs} unit="g" color={COLORS.gold} />
          <NutrientBar label="Fat" value={weekN.fat} max={weekRDA.fat} unit="g" color={COLORS.accent} />
          <NutrientBar label="Fiber" value={weekN.fiber} max={weekRDA.fiber} unit="g" color={COLORS.green} />
          <NutrientBar label="Sodium" value={weekN.sodium} max={weekRDA.sodium} unit="mg" color={COLORS.gray} warn />
          <NutrientBar label="Cholesterol" value={weekN.cholesterol} max={weekRDA.cholesterol} unit="mg" color={COLORS.gray} warn />
        </div>

        {/* Daily breakdown */}
        <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy, margin: "0 0 10px 0" }}>Daily Breakdown</h3>
        {DAYS.map((day, di) => {
          const dn = getDayNutrients(mealPlan, di);
          const hasMeals = MEAL_TYPES.some(mt => mealPlan[di]?.[mt]);
          if (!hasMeals) return (
            <div key={day} style={{ padding: "10px 14px", marginBottom: 6, borderRadius: 10, background: COLORS.card, border: `1px solid ${COLORS.grayLight}`, color: COLORS.gray, fontSize: 13 }}>
              {DAYS_FULL[di]}: No meals planned
            </div>
          );

          const warnings = [];
          userProfile.conditions.forEach(c => {
            const rule = CONDITION_RULES[c];
            if (!rule) return;
            for (const [nutrient, limit] of Object.entries(rule.limit)) {
              if (dn[nutrient] > limit * 3) warnings.push(`${rule.warnLabel} for the day`);
            }
          });

          return (
            <div key={day} style={{ padding: "12px 14px", marginBottom: 6, borderRadius: 10, background: COLORS.card, border: `1px solid ${COLORS.grayLight}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontWeight: 700, color: COLORS.navy, fontSize: 14 }}>{DAYS_FULL[di]}</span>
                <span style={{ fontSize: 12, color: COLORS.gray }}>{Math.round(dn.calories)} cal</span>
              </div>
              <div style={{ display: "flex", gap: 10, fontSize: 11, color: COLORS.gray }}>
                <span>P: {Math.round(dn.protein)}g</span>
                <span>C: {Math.round(dn.carbs)}g</span>
                <span>F: {Math.round(dn.fat)}g</span>
                <span>Na: {Math.round(dn.sodium)}mg</span>
              </div>
              {warnings.length > 0 && (
                <div style={{ marginTop: 6 }}>
                  {[...new Set(warnings)].map(w => <WarningTag key={w} text={w} />)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Main Calendar Screen ----
function CalendarScreen({ userProfile, onEditProfile }) {
  const [mealPlan, setMealPlan] = useState(() => {
    const plan = {};
    for (let i = 0; i < 7; i++) plan[i] = {};
    return plan;
  });
  const [addModal, setAddModal] = useState(null); // { dayIndex, mealType }
  const [showShopping, setShowShopping] = useState(false);
  const [showNutrients, setShowNutrients] = useState(false);

  const handleAdd = useCallback((dish, servings) => {
    if (!addModal) return;
    setMealPlan(prev => ({
      ...prev,
      [addModal.dayIndex]: {
        ...prev[addModal.dayIndex],
        [addModal.mealType]: { dishId: dish.id, servings },
      }
    }));
    setAddModal(null);
  }, [addModal]);

  const handleRemove = useCallback((dayIndex, mealType) => {
    setMealPlan(prev => {
      const day = { ...prev[dayIndex] };
      delete day[mealType];
      return { ...prev, [dayIndex]: day };
    });
  }, []);

  const totalPlanned = (() => {
    let c = 0;
    for (let d = 0; d < 7; d++) MEAL_TYPES.forEach(mt => { if (mealPlan[d]?.[mt]) c++; });
    return c;
  })();

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, padding: "16px 12px 100px 12px" }}>
      {/* Header */}
      <div style={{ maxWidth: 900, margin: "0 auto", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 24, fontWeight: 800, color: COLORS.accent }}>🥘 MealWise</span>
          <button onClick={onEditProfile}
            style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid ${COLORS.grayLight}`, background: COLORS.card, color: COLORS.gray, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            ⚙ Profile
          </button>
        </div>

        {/* Condition tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {userProfile.conditions.map(c => (
            <span key={c} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 8, background: COLORS.warnBg, color: COLORS.warn, fontWeight: 600 }}>
              {c}
            </span>
          ))}
          {userProfile.diet !== "none" && (
            <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 8, background: COLORS.greenLight, color: COLORS.green, fontWeight: 600 }}>
              {userProfile.diet}
            </span>
          )}
          {userProfile.allergies.map(a => (
            <span key={a} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 8, background: COLORS.goldLight, color: COLORS.gold, fontWeight: 600 }}>
              ✗ {a}
            </span>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowNutrients(true)}
            style={{ padding: "10px 16px", borderRadius: 12, border: "none", background: COLORS.green, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            📊 Nutrition Summary
          </button>
          <button onClick={() => setShowShopping(true)}
            style={{ padding: "10px 16px", borderRadius: 12, border: "none", background: COLORS.navy, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            🛒 Shopping List
          </button>
          <span style={{ fontSize: 12, color: COLORS.gray, display: "flex", alignItems: "center", marginLeft: 8 }}>
            {totalPlanned} meal{totalPlanned !== 1 ? "s" : ""} planned
          </span>
        </div>
      </div>

      {/* Week label */}
      <div style={{ maxWidth: 900, margin: "0 auto", marginBottom: 12 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy, margin: 0 }}>This Week</h2>
      </div>

      {/* Calendar Grid */}
      <div style={{ maxWidth: 900, margin: "0 auto", overflowX: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "80px repeat(7, 1fr)", gap: 4, minWidth: 700 }}>
          {/* Header row */}
          <div />
          {DAYS.map((d, i) => (
            <div key={d} style={{ textAlign: "center", fontSize: 13, fontWeight: 700, color: COLORS.navy, padding: "8px 0" }}>{d}</div>
          ))}

          {/* Meal rows */}
          {MEAL_TYPES.map(mt => (
            <>
              <div key={`label-${mt}`} style={{
                display: "flex", alignItems: "center", fontSize: 12, fontWeight: 700, color: COLORS.gray,
                textTransform: "capitalize", paddingLeft: 4,
              }}>
                {mt === "breakfast" ? "🌅" : mt === "lunch" ? "☀️" : mt === "dinner" ? "🌙" : "🍪"} {mt}
              </div>
              {DAYS.map((d, di) => {
                const entry = mealPlan[di]?.[mt];
                const dish = entry ? DISHES.find(dd => dd.id === entry.dishId) : null;

                return (
                  <div key={`${mt}-${di}`}
                    style={{
                      background: COLORS.card, borderRadius: 12, minHeight: 60, padding: 6,
                      border: `1px solid ${COLORS.grayLight}`, display: "flex", flexDirection: "column",
                      justifyContent: "center", alignItems: "center", position: "relative",
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                    onClick={() => !dish && setAddModal({ dayIndex: di, mealType: mt })}
                    onMouseEnter={e => { if (!dish) e.currentTarget.style.borderColor = COLORS.accent; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.grayLight; }}
                  >
                    {dish ? (
                      <div style={{ width: "100%", textAlign: "center" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.navy, lineHeight: 1.3, marginBottom: 2 }}>
                          {dish.name}
                        </div>
                        {entry.servings !== 1 && (
                          <div style={{ fontSize: 10, color: COLORS.gray }}>×{entry.servings}</div>
                        )}
                        {getWarnings(dish, userProfile.conditions).map(w => (
                          <div key={w} style={{ fontSize: 9, color: COLORS.warn, fontWeight: 700 }}>⚠ {w.replace("High ", "")}</div>
                        ))}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemove(di, mt); }}
                          style={{
                            position: "absolute", top: 2, right: 4, background: "none", border: "none",
                            color: COLORS.gray, cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1,
                          }}
                          title="Remove"
                        >×</button>
                      </div>
                    ) : (
                      <div style={{ color: COLORS.grayLight, fontSize: 22, fontWeight: 300 }}>+</div>
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      {/* Modals */}
      {addModal && (
        <AddDishModal
          dayIndex={addModal.dayIndex}
          mealType={addModal.mealType}
          userProfile={userProfile}
          mealPlan={mealPlan}
          onAdd={handleAdd}
          onClose={() => setAddModal(null)}
        />
      )}
      {showShopping && <ShoppingListPanel mealPlan={mealPlan} onClose={() => setShowShopping(false)} />}
      {showNutrients && <NutrientSummaryPanel mealPlan={mealPlan} userProfile={userProfile} onClose={() => setShowNutrients(false)} />}
    </div>
  );
}

// ============================================================
// APP ROOT
// ============================================================

export default function App() {
  const [userProfile, setUserProfile] = useState(null);

  if (!userProfile) {
    return <OnboardingScreen onComplete={setUserProfile} />;
  }

  return (
    <CalendarScreen
      userProfile={userProfile}
      onEditProfile={() => setUserProfile(null)}
    />
  );
}
