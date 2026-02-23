const RECIPES = {
  r1: {
    name: "Hainanese Chicken Rice", prepTime: 15, cookTime: 45, steps: [
      "Rub chicken breast with salt and ginger. Bring a pot of water to boil.",
      "Poach chicken in gently simmering water for 20 minutes. Remove and plunge into ice water.",
      "Use the poaching liquid to cook rice with garlic and a pandan leaf if available.",
      "Slice cucumber. Chop spring onion finely.",
      "Slice chicken, arrange over rice with cucumber. Drizzle with sesame oil and soy sauce. Garnish with spring onion."
    ]
  },
  r2: {
    name: "Nasi Lemak", prepTime: 10, cookTime: 30, steps: [
      "Cook rice with coconut milk and a pinch of salt until fluffy.",
      "Hard-boil egg, peel and halve.",
      "Deep fry anchovies until crispy. Toast peanuts in a dry pan.",
      "Prepare sambal chili by blending and frying chili paste.",
      "Arrange coconut rice on plate with egg, anchovies, peanuts, cucumber slices, and sambal on the side."
    ]
  },
  r3: {
    name: "Chicken Congee", prepTime: 5, cookTime: 60, steps: [
      "Rinse rice and add to a large pot with 8 cups of water.",
      "Bring to a boil, then reduce heat to low. Simmer for 40 minutes, stirring occasionally.",
      "Add chicken breast pieces and ginger slices. Cook another 15 minutes until chicken is done.",
      "Shred the chicken. Season congee with sesame oil and soy sauce.",
      "Serve topped with spring onion."
    ]
  },
  r4: {
    name: "Stir Fry Kangkong", prepTime: 5, cookTime: 5, steps: [
      "Wash kangkong thoroughly. Cut into 3-inch lengths.",
      "Heat oil in a wok over high heat. Add minced garlic and chili, stir 15 seconds.",
      "Add kangkong and toss rapidly for 2-3 minutes until just wilted.",
      "Season with soy sauce. Serve immediately."
    ]
  },
  r5: {
    name: "Steamed Fish with Ginger & Soy", prepTime: 10, cookTime: 12, steps: [
      "Place fish fillet on a heatproof plate. Top with julienned ginger.",
      "Steam over high heat for 10-12 minutes until fish is just cooked through.",
      "Discard any liquid. Top with spring onion shreds.",
      "Heat sesame oil until smoking and pour over fish. Drizzle soy sauce and serve."
    ]
  },
  r6: {
    name: "Egg Fried Rice", prepTime: 5, cookTime: 10, steps: [
      "Use day-old cold rice for best results. Dice carrot finely.",
      "Beat eggs in a bowl. Heat oil in a wok over high heat.",
      "Scramble eggs until just set, break into pieces.",
      "Add carrot, stir fry 1 minute. Add rice and toss vigorously.",
      "Season with soy sauce, add spring onion, toss and serve."
    ]
  },
  r7: {
    name: "Tofu Vegetable Soup", prepTime: 10, cookTime: 15, steps: [
      "Cut tofu into cubes. Shred cabbage. Slice carrot thinly.",
      "Bring 4 cups of water to a boil with ginger slices.",
      "Add carrot and cook 3 minutes. Add cabbage and tofu.",
      "Simmer for 8 minutes. Season with a pinch of salt.",
      "Garnish with spring onion and serve hot."
    ]
  },
  r8: {
    name: "Mee Goreng", prepTime: 10, cookTime: 10, steps: [
      "Blanch yellow noodles briefly in hot water. Drain well.",
      "Heat oil in a wok. Stir fry shrimp until pink, set aside.",
      "Scramble egg in the same wok. Add cabbage and bean sprouts, toss 1 minute.",
      "Add noodles, soy sauce, and chili paste. Toss everything over high heat.",
      "Return shrimp to wok, toss to combine. Serve hot."
    ]
  },
  r9: {
    name: "Kaya Toast & Soft-Boiled Eggs", prepTime: 3, cookTime: 5, steps: [
      "Toast bread slices until golden and crispy.",
      "Spread kaya generously on one side, butter on the other. Sandwich together and cut diagonally.",
      "Bring water to a boil, turn off heat. Gently lower eggs in and cover for 6 minutes.",
      "Crack eggs into a small dish. Season with soy sauce and white pepper.",
      "Serve kaya toast alongside the soft-boiled eggs."
    ]
  },
  r10: {
    name: "Cheng Tng", prepTime: 10, cookTime: 40, steps: [
      "Soak barley and white fungus in water for 30 minutes. Drain.",
      "Boil 6 cups of water with pandan leaf (tied in a knot).",
      "Add barley and ginkgo nuts, simmer 20 minutes.",
      "Add white fungus and longan, simmer another 10 minutes.",
      "Add rock sugar to taste. Remove pandan leaf. Serve warm or chilled."
    ]
  },
};

module.exports = { RECIPES };
