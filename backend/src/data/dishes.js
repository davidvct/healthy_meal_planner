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

module.exports = { DISHES };
