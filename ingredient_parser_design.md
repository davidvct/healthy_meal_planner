# Ingredient Parser Design

## Problem

The CSV stores ingredients as **freeform human-readable text** scraped from recipe websites.
The current parser assigns a hardcoded `100g` to every ingredient and uses the full raw line
as the key — meaning `"1 tablespoon olive oil"` and `"olive oil"` are treated as two
different items in the shopping list.

---

## Parsing Pipeline

Each bullet line goes through 4 stages:

```
Raw line
  │
  ▼
Stage 1: Strip parentheticals
  │
  ▼
Stage 2: Extract quantity + unit + name
  │
  ▼
Stage 3: Convert unit → grams or ml
  │
  ▼
Stage 4: Normalize name (existing logic)
  │
  ▼
{ name: "olive oil", amount: 15.0 }
```

---

## Stage 1 — Strip Parentheticals

Parentheticals are always safe to strip because the primary quantity comes before them.

| Raw line | After stripping | Why |
| --- | --- | --- |
| `1 tablespoon olive oil (extra virgin)` | `1 tablespoon olive oil` | quality descriptor |
| `1/4 cup butter (melted)` | `1/4 cup butter` | prep state |
| `4 cloves garlic (minced)` | `4 cloves garlic` | prep state |
| `1 1/2 pounds chicken thighs (approximately 6 medium)` | `1 1/2 pounds chicken thighs` | count clarification — primary qty already present |
| `salt (to taste)` | `salt` | taste guidance |
| `spray oil (optional)` | `spray oil` | optional marker |
| `2 tablespoons neutral oil (avocado oil, olive oil, etc.)` | `2 tablespoons neutral oil` | alias list |
| `1 (14-ounce) can crushed tomatoes` | `1 can crushed tomatoes` | size embedded in parens — unit extracted first |
| `1 cup packed brown sugar (see Notes)` | `1 cup brown sugar` | recipe note |
| `1 egg (lightly beaten)` | `1 egg` | prep state |

---

## Stage 2 — Extract Quantity + Unit + Name

Regex splits the cleaned line into three parts.

| Cleaned line | Quantity | Unit | Name |
| --- | --- | --- | --- |
| `1 tablespoon olive oil` | `1` | `tablespoon` | `olive oil` |
| `2 tablespoons soy sauce` | `2` | `tablespoon` | `soy sauce` |
| `1/2 teaspoon salt` | `0.5` | `teaspoon` | `salt` |
| `1 1/2 cups all purpose flour` | `1.5` | `cup` | `all purpose flour` |
| `1/4 cup butter` | `0.25` | `cup` | `butter` |
| `3 pounds chicken breast` | `3` | `pound` | `chicken breast` |
| `8 ounces cream cheese` | `8` | `ounce` | `cream cheese` |
| `4 cloves garlic` | `4` | `clove` | `garlic` |
| `2 large eggs` | `2` | `piece` | `egg` |
| `1 can black beans` | `1` | `can` | `black beans` |
| `salt` | `1` | `pinch` | `salt` | ← no quantity → fallback |
| `fresh cilantro` | `1` | `serving` | `cilantro` | ← no quantity → fallback |

---

## Stage 3 — Unit Conversion to grams / ml

All amounts are normalised to a single number for shopping list aggregation.

### Volume → ml

| Unit | ml |
| --- | --- |
| teaspoon / tsp | 5 ml |
| tablespoon / tbsp | 15 ml |
| cup | 240 ml |
| fl oz | 30 ml |
| pint | 480 ml |
| quart | 960 ml |

### Weight → grams

| Unit | grams |
| --- | --- |
| ounce / oz | 28 g |
| pound / lb | 454 g |
| gram / g | 1 g |
| kilogram / kg | 1000 g |

### Count → grams (estimated typical weight)

| Unit | grams |
| --- | --- |
| clove (garlic) | 3 g |
| egg | 50 g |
| can (standard) | 400 g |
| pinch | 1 g |
| slice | 20 g |
| piece / whole | 100 g |
| serving / (no unit) | 100 g |

### Full examples

| Raw line | → name | → amount |
| --- | --- | --- |
| `1 tablespoon olive oil` | `olive oil` | **15 ml** |
| `1/4 cup olive oil` | `olive oil` | **60 ml** |
| `2 tablespoons soy sauce` | `soy sauce` | **30 ml** |
| `1 1/2 pounds chicken thighs` | `chicken thighs` | **681 g** |
| `8 ounces cream cheese` | `cream cheese` | **224 g** |
| `4 cloves garlic` | `garlic` | **12 g** |
| `2 large eggs` | `egg` | **100 g** |
| `salt` | `salt` | **1 g** |
| `fresh cilantro` | `cilantro` | **100 g** |

---

## Shopping List Aggregation Example

Two recipes both use olive oil with different descriptions:

| Recipe | Raw line | → name | → amount |
| --- | --- | --- | --- |
| Achiote Chicken | `1 tablespoon olive oil` | `olive oil` | 15 ml |
| Air Fryer Potatoes | `2 tablespoons neutral oil (avocado oil, olive oil, etc.)` | `neutral oil` | 30 ml |

> Note: these still won't merge because `olive oil ≠ neutral oil` — the recipe genuinely
> uses a different ingredient. That is correct behaviour.

| Recipe | Raw line | → name | → amount |
| --- | --- | --- | --- |
| Recipe A | `1 tablespoon olive oil` | `olive oil` | 15 ml |
| Recipe B | `1/4 cup olive oil (extra virgin)` | `olive oil` | 60 ml |
| **Shopping list** | | **olive oil** | **75 ml ✅** |

---

## Where to Implement

| File | Function | Change |
| --- | --- | --- |
| `backend/utils.py` | `parse_ingredients_map()` | Replace the current line-split + `100g` fallback with the full 4-stage parser |
| `backend/services/ingredient_categories.py` | `normalize_ingredient()` | Add parenthetical stripping as a first pass (safety net for anything Stage 1 misses) |

No changes needed to:
- The CSV / dataset
- The database schema
- The GCP deployment
- Any frontend code

The shopping list endpoint (`get_shopping_list` in `backend/services/shopping_list_generator.py`)
already calls both functions — it will automatically benefit from the fix with no changes.
