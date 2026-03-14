# MealVitals: Free vs Paid Feature Comparison

## Current Planned Features

| Feature | Free | Paid | Feature Ready | Implemented |
|---|---|---|---|---|
| Onboarding & health profile setup | Yes | Yes | Yes | Yes |
| Manual meal plan creation | Yes | Yes | Yes | Yes |
| Template-based dish recommendations (static, rule-based filtering by health condition/restriction) | Yes | Yes | Yes | Yes |
| Basic shopping list | Yes | Yes | Yes | Yes |
| Dish detail & recipe viewing | Yes | Yes | Yes | Yes |
| Personalized/dynamic recommendations (scored, adaptive, history-aware) | No | Yes | Partial (scoring done; not history-aware yet) | Yes (free limited to top 5; paid unlimited) |
| Auto-fill meal plan (1-day / 7-day / 30-day) | No | Yes | Yes | Yes (locked for free; backend + UI gated) |
| One-click ingredient swaps | No | Yes | No | No |
| Consolidated grocery cart with recommended quantities | No | Yes | Partial (list exists; recommended quantities not yet) | No |
| Custom nutrient thresholds (per-day and per-meal) | No | Yes | Yes | Yes (save blocked for free; read allowed) |
| Weekly/daily nutrient summary & charts | Basic (view only) | Full + condition warnings | Yes | Partial (view accessible to all; condition warnings not yet gated) |
| Multi-diner / family member management | Limited (1 diner) | Unlimited diners | Yes (no limit enforced yet) | Yes (free limited to 1 diner; backend + UI gated) |
| Ad-free experience | No | Yes | N/A (no ads currently) | No |
| Scheduled replenishment | No | Yes | No | No |

## Additional Suggestions

| Suggestion | Free | Paid | Rationale | Feature Ready | Implemented |
|---|---|---|---|---|---|
| Dish recommendations limit | Top 5 dishes only | Unlimited, with sorting options | Gives free users a taste of recommendations while incentivising upgrade | No | Yes (backend limits to 5 for free; banner shown in UI) |
| Shopping list scope | Current week only | Rolling / future weeks | Low-effort paywall on a high-value feature | No | No |
| Auto-fill button | Visible but locked (upgrade prompt) | Fully functional | Natural in-product upgrade trigger | No | Yes (lock icon + UpgradePromptModal for free tier) |
| Family member limit | 1 diner | Unlimited diners | Families are a clear paid segment | No | Yes (backend 403 + UI lock for free with 1+ diners) |
| Nutrient threshold customisation | Not accessible (upgrade prompt) | Full per-day and per-meal control | Advanced feature suited for health-conscious paid users | No | Yes (save gated; lock icon + UpgradePromptModal) |
| Meal plan export (PDF / share link) | No | Yes | Useful for users sharing plans with a dietitian or carer | No | No |
| Nutrition history & trends | No | Yes (past 4 weeks) | Encourages long-term engagement on paid tier | No | No |
| Priority dish database updates | Standard | Early access to new recipes | Low-cost perk that adds perceived value | No | No |
