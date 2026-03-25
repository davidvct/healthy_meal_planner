# Ingredient Parser — Full Output (All 468 Dishes)

Amounts: **ml** for liquids, **g** for everything else.

> Previous behaviour: every ingredient was hardcoded to `100 g`.

## Parser rules

| Rule | Example input | Output |
| --- | --- | --- |
| Strip prep parens | `butter (melted)` | `butter` |
| Keep alt-ingredient parens | `neutral oil (avocado oil, olive oil, etc.)` | `neutral oil (avocado oil, olive oil, etc.)` |
| Strip 'packed' | `1 cup packed brown sugar` | `brown sugar` — 204 g |
| Strip bone-in/skin-on/boneless/skinless | `bone-in, skin-on chicken drumsticks` | `chicken drumsticks` |
| Strip adverb+prep combo | `freshly ground black pepper` | `black pepper` |
| Strip prep words | `fresh chopped parsley` | `fresh parsley` |
| Strip 'of choice' | `seasoning of choice` | `seasoning` |
| Strip inline size | `10.5-ounce can condensed soup` | `condensed soup` |
| Normalize -tasting/-flavored | `neutral-tasting oil` | `neutral oil` |
| Strip (any brand/variety/type) | `frozen dumplings (any brand, any variety)` | `frozen dumplings` |
| Strip (optional, for serving) | `mustard (optional, for serving)` | `mustard` |
| Handle range qty | `1-2 teaspoons chili paste` | `chili paste` |
| cooked, + prep word | `1 cup cooked, shredded chicken` | `chicken` |
| bag/loaf/jar as units | `1 12-oz bag frozen Brussels sprouts` | `frozen brussels sprouts` |
| Keep dried/fresh/frozen/canned | `dried oregano` | `dried oregano` |
| Liquid → ml | `2 tbsp soy sauce` | `soy sauce` — 30 ml |
| Dry volume → g via density | `1 cup rolled oats` | `rolled oats` — 86 g |

---


---

## 3 Ingredient Peanut Butter Cookies

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 cup peanut butter (creamy or crunchy, at room temperature)` | `peanut butter` | 132.0 g |
| `1 cup packed brown sugar (see Notes)` | `brown sugar` | 204.0 g |
| `1 large egg` | `egg` | 100.0 g |

---

## Accordion Potatoes

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4 large russet potatoes (or Yukon gold potatoes, approximately 4 pounds total)` | `russet potatoes` | 400.0 g |
| `1/4 cup butter (melted)` | `butter` | 45.0 g |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `1/2 teaspoon garlic powder` | `garlic powder` | 1.25 g |
| `1/2 teaspoon onion powder` | `onion powder` | 1.25 g |
| `1/4 teaspoon freshly cracked black pepper (more or less to taste)` | `black pepper` | 0.94 g |
| `1 tablespoon fresh chopped parsley (plus more for garnish)` | `fresh parsley` | 11.25 g |

---

## Achiote Chicken

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 1/2 pounds boneless, skinless chicken thighs (approximately 6 medium chicken thighs)` | `chicken thighs` | 680.38 g |
| `1  tablespoon olive oil` | `olive oil` | 15.0 ml |
| `1 teaspoon salt (more or less to taste)` | `salt` | 6.0 g |
| `1/2 teaspoon freshly ground black pepper (more or less to taste)` | `black pepper` | 1.88 g |
| `1 1/2 tablespoon achiote paste` | `achiote paste` | 16.88 g |
| `1/4 cup apple cider vinegar` | `apple cider vinegar` | 60.0 ml |
| `1/4 cup orange juice` | `orange juice` | 60.0 ml |
| `2 tablespoons fresh lime juice (approximately 1 large lime)` | `fresh lime juice` | 30.0 ml |
| `4 cloves garlic (minced)` | `garlic` | 12.0 g |
| `1 teaspoon dried oregano` | `dried oregano` | 3.75 g |
| `1/2 teaspoon dried thyme` | `dried thyme` | 1.88 g |
| `1/4 teaspoon cumin` | `cumin` | 0.62 g |

---

## Brats in the Air Fryer

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `5  uncooked brats` | `uncooked brats` | 500.0 g |

---

## Air Fryer Breakfast Potatoes

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 pounds Yukon gold potatoes (cut into 1-inch or 1/2-inch cubes)` | `yukon gold potatoes` | 907.18 g |
| `2 tablespoons neutral oil (avocado oil, olive oil, etc.)` | `neutral oil (avocado oil, olive oil, etc.)` | 30.0 ml |
| `1 1/2 teaspoon salt (more or less to taste)` | `salt` | 9.0 g |
| `1 teaspoon paprika` | `paprika` | 2.5 g |
| `1 teaspoon garlic powder` | `garlic powder` | 2.5 g |
| `1 teaspoon onion powder` | `onion powder` | 2.5 g |
| `1/2 teaspoon freshly ground black pepper (more or less to taste)` | `black pepper` | 1.88 g |

---

## Air Fryer Butternut Squash

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 medium butternut squash (approximately 3 pounds; peeled, cubed)` | `butternut squash` | 80.0 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `seasoning of choice (see Notes)` | `seasoning` | 100.0 g |

---

## Air Fryer Chicken Cordon Bleu

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4 medium boneless, skinless chicken breasts (approximately 8 ounces each)` | `chicken breasts` | 320.0 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly cracked black pepper (to taste)` | `black pepper` | 100.0 g |
| `2 tablespoons dijon mustard (divided)` | `dijon mustard` | 22.5 g |
| `4 slices Swiss cheese (or 4 ounces shredded Swiss cheese)` | `swiss cheese` | 80.0 g |
| `8 slices ham (thinly cut)` | `ham` | 160.0 g |
| `4 slices Swiss cheese (or 4 ounces shredded Swiss cheese)` | `swiss cheese` | 80.0 g |
| `2 large eggs` | `eggs` | 200.0 g |
| `1 1/2 cups panko breadcrumbs (or seasoned breadcrumbs)` | `panko breadcrumbs` | 162.0 g |
| `1 10.5-ounce can condensed cream of chicken soup (or 1 1/4 cup homemade cream of chicken soup)` | `condensed cream of chicken soup` | 400.0 ml |
| `1/2 cup full-fat sour cream (at room temperature)` | `full-fat sour cream` | 120.0 ml |
| `1 tablespoon lemon juice` | `lemon juice` | 15.0 ml |
| `1 tablespoon dijon mustard` | `dijon mustard` | 11.25 g |

---

## Air Fryer Chicken Legs

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `6 large bone-in, skin-on chicken drumsticks (approximately 4-6 ounces each)` | `chicken drumsticks` | 600.0 g |
| `2 tablespoons neutral-tasting oil (avocado oil, olive oil, etc.)` | `neutral oil (avocado oil, olive oil, etc.)` | 30.0 ml |
| `1 teaspoon salt (more or less to taste)` | `salt` | 6.0 g |
| `1/2 teaspoon freshly ground black pepper (more or less to taste)` | `black pepper` | 1.88 g |
| `1 teaspoon garlic powder` | `garlic powder` | 2.5 g |
| `1 1/2 teaspoons smoked paprika` | `smoked paprika` | 3.75 g |
| `1 teaspoon onion powder` | `onion powder` | 2.5 g |

---

## Air Fryer Chicken Patties (from Frozen!)

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3  frozen breaded chicken patties` | `frozen breaded chicken patties` | 300.0 g |
| `cheese` | `cheese` | 100.0 g |
| `hamburger buns` | `hamburger buns` | 100.0 g |
| `sliced tomatoes` | `tomatoes` | 100.0 g |
| `lettuce` | `lettuce` | 100.0 g |
| `mayonnaise` | `mayonnaise` | 100.0 g |

---

## Air Fryer Corn Dogs

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4  frozen corn dogs` | `frozen corn dogs` | 400.0 g |
| `spray oil (optional)` | `spray oil` | 100.0 ml |
| `mustard (optional, for serving)` | `mustard` | 100.0 g |

---

## Air Fryer Dino Nuggets

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `8  frozen dino nuggets (any brand)` | `frozen dino nuggets` | 800.0 g |

---

## Air Fryer Dumplings

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `12  frozen dumplings (any brand, any variety)` | `frozen dumplings` | 1200.0 g |
| `3 tablespoons soy sauce (or coconut aminos)` | `soy sauce` | 45.0 ml |
| `1 tablespoon rice vinegar` | `rice vinegar` | 15.0 ml |
| `1-2 teaspoons chili paste (more or less to taste)` | `chili paste` | 3.75 g |

---

## Air Fryer Empanadas

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 tablespoon butter` | `butter` | 11.25 g |
| `1 pound ground beef` | `ground beef` | 453.59 g |
| `2 cloves garlic (minced)` | `garlic` | 6.0 g |
| `1/2 of one yellow onion (chopped)` | `yellow onion` | 50.0 g |
| `1/2 of one red bell pepper (chopped)` | `red bell pepper` | 50.0 g |
| `1 teaspoon cumin` | `cumin` | 2.5 g |
| `1/2 teaspoon paprika` | `paprika` | 1.25 g |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `1/2 teaspoon black pepper` | `black pepper` | 1.88 g |
| `1 teaspoon chili powder` | `chili powder` | 2.5 g |
| `3/4 cup beef broth` | `beef broth` | 180.0 ml |
| `1  egg` | `egg` | 50.0 g |
| `1 tablespoon water` | `water` | 15.0 ml |
| `10  empanada dough discs` | `empanada dough discs` | 1000.0 g |

---

## Air Fryer Falafel

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 (15-ounce) cans chickpeas (drained and rinsed)` | `chickpeas` | 800.0 g |
| `1 cup parsley (chopped)` | `parsley` | 180.0 g |
| `1 cup cilantro (chopped)` | `cilantro` | 180.0 g |
| `1/2 cup fresh dill (chopped)` | `fresh dill` | 90.0 g |
| `5  garlic cloves (minced)` | `garlic cloves` | 500.0 g |
| `1  small yellow onion (chopped)` | `yellow onion` | 50.0 g |
| `4 tablespoons all purpose flour (see Notes)` | `all purpose flour` | 30.0 g |
| `1 teaspoon salt` | `salt` | 6.0 g |
| `1 teaspoon baking powder` | `baking powder` | 4.5 g |
| `1/4 teaspoon red pepper flakes (optional)` | `red pepper flakes` | 0.94 g |
| `spray cooking oil` | `spray cooking oil` | 100.0 ml |

---

## Air Fryer Flautas with Shredded Chicken

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 cup cooked, shredded chicken` | `chicken` | 180.0 g |
| `1/2 cup salsa (any type, any flavor)` | `salsa` | 90.0 g |
| `1/2 cup shredded Mexican-blend cheese` | `mexican-blend cheese` | 56.4 g |
| `1/4 cup cream cheese (softened)` | `cream cheese` | 60.0 ml |
| `8 10-inch flour tortillas (burrito-size tortillas)` | `10-inch flour tortillas` | 800.0 g |

---

## Perfect Air Fryer French Toast

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 large eggs` | `eggs` | 200.0 g |
| `3/4 cup half and half` | `half and half` | 180.0 g |
| `1 teaspoon vanilla extract` | `vanilla extract` | 5.0 ml |
| `1 teaspoon cinnamon` | `cinnamon` | 2.5 g |
| `5 slices thick cut bread` | `thick cut bread` | 100.0 g |
| `butter (or cinnamon honey butter)` | `butter` | 100.0 g |
| `maple syrup (or your favorite sugar-free maple syrup)` | `maple syrup` | 100.0 ml |
| `powdered sugar (or powdered erythritol)` | `powdered sugar` | 100.0 g |
| `cinnamon sugar` | `cinnamon sugar` | 100.0 g |
| `blueberries` | `blueberries` | 100.0 g |
| `strawberries` | `strawberries` | 100.0 g |
| `bananas` | `bananas` | 100.0 g |
| `chocolate chips` | `chocolate chips` | 100.0 g |
| `whipped cream` | `whipped cream` | 100.0 ml |

---

## Crispy Air Fryer Fried Pickles

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `16 ounces dill pickle chips (or slices, drained (1 jar))` | `dill pickle chips` | 100.0 g |
| `1 large egg` | `egg` | 100.0 g |
| `1 tablespoon water` | `water` | 15.0 ml |
| `1/2 cup all-purpose flour` | `all-purpose flour` | 60.0 g |
| `1/2 cup panko breadcrumbs` | `panko breadcrumbs` | 54.0 g |
| `1/4 cup parmesan cheese (finely grated)` | `parmesan cheese` | 28.2 g |
| `1 tablespoon Italian seasoning` | `italian seasoning` | 11.25 g |
| `extra-virgin olive oil spray` | `extra-virgin olive oil spray` | 100.0 ml |
| `dipping sauce of choice ((e.g., ranch, remoulade, spicy mayo))` | `dipping sauce ((e.g., ranch, remoulade, spicy mayo))` | 100.0 ml |

---

## Air Fryer Frozen Brussels Sprouts

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 12-ounce bag frozen Brussels sprouts (unseasoned)` | `frozen brussels sprouts` | 300.0 g |
| `1/2 tablespoon olive oil (or avocado oil)` | `olive oil` | 7.5 ml |
| `sea salt (to taste)` | `sea salt` | 100.0 g |
| `freshly cracked black pepper (to taste)` | `black pepper` | 100.0 g |
| `2 tablespoons unsalted butter` | `unsalted butter` | 36.0 g |
| `1 tablespoon maple syrup` | `maple syrup` | 15.0 ml |
| `1 teaspoon minced fresh garlic (approximately 2 cloves)` | `fresh garlic` | 3.75 g |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |

---

## Chicken Fries in the Air Fryer

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `8 ounces frozen chicken fries (any brand)` | `frozen chicken fries` | 100.0 g |

---

## Air Fryer Frozen Garlic Bread

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 14-ounce loaf frozen garlic bread (halved, see Notes)` | `frozen garlic bread` | 450.0 g |

---

## Frozen Jalapeño Poppers in Air Fryer with Cilantro Lime Dipping Sauce

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `8-12  frozen jalapeño poppers` | `frozen jalapeño poppers` | 800.0 g |
| `1/2 cup sour cream` | `sour cream` | 120.0 ml |
| `1 tablespoon lime juice` | `lime juice` | 15.0 ml |
| `2 teaspoons finely chopped fresh cilantro` | `fresh cilantro` | 7.5 g |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `pinch of garlic powder` | `garlic powder` | 1.0 g |

---

## Air Fryer Popcorn Chicken

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 24-ounce bag frozen popcorn chicken` | `frozen popcorn chicken` | 300.0 g |

---

## Air Fryer Garlic Bread

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `8 slices fresh French bread` | `fresh french bread` | 160.0 g |
| `4 tablespoons salted butter` | `salted butter` | 72.0 g |
| `4 cloves garlic (crushed)` | `garlic` | 12.0 g |
| `1/4 teaspoon fresh parsley` | `fresh parsley` | 0.94 g |
| `1/3 cup freshly grated parmesan` | `parmesan` | 30.4 g |

---

## Frozen Hashbrowns in the Air Fryer

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4  frozen hashbrown patties (any size, any brand)` | `frozen hashbrown patties` | 400.0 g |
| `ketchup (optional, for serving)` | `ketchup` | 100.0 g |

---

## Air Fryer Home Fries

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 1/2 pounds potatoes (chopped into even 1-inch chunks, see Notes)` | `potatoes` | 680.38 g |
| `spray cooking oil` | `spray cooking oil` | 100.0 ml |
| `1 teaspoon salt` | `salt` | 6.0 g |
| `1/2 teaspoon smoked paprika (or regular paprika)` | `smoked paprika` | 1.25 g |
| `1/4 teaspoon garlic powder` | `garlic powder` | 0.62 g |
| `1/4 teaspoon onion powder` | `onion powder` | 0.62 g |

---

## Air Fryer Italian Sausage

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `5  Italian sausage links (any brand)` | `italian sausage links` | 500.0 g |

---

## Homemade Air Fryer Mozzarella Sticks (Gluten Free Option)

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `6 sticks mozzarella string cheese (whole or reduced-fat)` | `mozzarella string cheese` | 678.0 g |
| `1 large egg` | `egg` | 100.0 g |
| `1/2 cup all-purpose flour` | `all-purpose flour` | 60.0 g |
| `1/2 cup Italian-seasoned breadcrumbs` | `italian-seasoned breadcrumbs` | 54.0 g |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `1/2 teaspoon garlic powder` | `garlic powder` | 1.25 g |
| `6 sticks mozzarella string cheese (whole or reduced-fat)` | `mozzarella string cheese` | 678.0 g |
| `1 large egg` | `egg` | 100.0 g |
| `1/2 cup gluten-free all-purpose flour (with xanthan gum)` | `gluten-free all-purpose flour` | 60.0 g |
| `1/2 cup gluten-free breadcrumbs (store-bought or homemade)` | `gluten-free breadcrumbs` | 54.0 g |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `1/2 teaspoon garlic powder` | `garlic powder` | 1.25 g |
| `2 teaspoons Italian seasoning` | `italian seasoning` | 7.5 g |
| `finely chopped fresh parsley` | `fresh parsley` | 100.0 g |
| `finely grated fresh parmesan` | `fresh parmesan` | 100.0 g |
| `marinara sauce` | `marinara sauce` | 100.0 ml |
| `ranch dressing` | `ranch dressing` | 100.0 g |

---

## Air Fryer Mushrooms

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `8 ounces mushrooms (rinsed, dried, cut into halves or quarters)` | `mushrooms` | 100.0 g |
| `2 tablespoons olive oil (or other neutral oil)` | `olive oil` | 30.0 ml |
| `1 teaspoon soy sauce (or Worcestershire)` | `soy sauce` | 5.0 ml |
| `1/2 teaspoon garlic powder` | `garlic powder` | 1.25 g |
| `kosher salt (to taste)` | `kosher salt` | 100.0 g |
| `black pepper (to taste)` | `black pepper` | 100.0 g |
| `lemon (cut into wedges, optional)` | `lemon` | 100.0 g |
| `1 tablespoon fresh parsley (chopped, optional)` | `fresh parsley` | 11.25 g |

---

## Air Fryer Okra

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3/4 cup cornmeal` | `cornmeal` | 135.0 g |
| `1/3 cup all-purpose flour` | `all-purpose flour` | 40.0 g |
| `1/2 teaspoon kosher salt` | `kosher salt` | 3.0 g |
| `1 teaspoon garlic powder` | `garlic powder` | 2.5 g |
| `1 teaspoon onion powder` | `onion powder` | 2.5 g |
| `1/3 teaspoon cayenne pepper` | `cayenne pepper` | 1.25 g |
| `2  eggs (beaten)` | `eggs` | 100.0 g |
| `1 pound fresh okra (cut into 1/2-to-1-inch-thick slices and patted dry)` | `fresh okra` | 453.59 g |
| `air-fryer-safe cooking spray` | `air-fryer-safe cooking spray` | 100.0 g |

---

## Air Fryer Pizza Rolls

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `20  pizza rolls` | `pizza rolls` | 2000.0 g |

---

## Air Fryer Popcorn

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/4 cup popcorn kernels` | `popcorn kernels` | 45.0 g |
| `1/4 tablespoon oil` | `oil` | 3.75 ml |
| `2 tablespoons butter` | `butter` | 22.5 g |
| `salt (to taste)` | `salt` | 100.0 g |

---

## Air Fryer Potato Skins

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3  russet potatoes (cooked and cut in half)` | `russet potatoes` | 300.0 g |
| `spray cooking oil` | `spray cooking oil` | 100.0 ml |
| `salt and black pepper (to taste)` | `salt and black pepper` | 100.0 g |
| `1/2 cup shredded cheddar cheese` | `cheddar cheese` | 56.4 g |
| `4 slices bacon (cooked and crumbled)` | `bacon` | 80.0 g |
| `1/4 cup sour cream` | `sour cream` | 60.0 ml |
| `2  green onions (thinly sliced)` | `green onions` | 200.0 g |

---

## Air Fryer Quesadilla

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 10-inch flour tortillas` | `10-inch flour tortillas` | 200.0 g |
| `1/2 cup refried beans (divided, see Notes)` | `refried beans` | 90.0 g |
| `1/2 cup shredded Mexican cheese blend (divided)` | `mexican cheese blend` | 56.4 g |
| `pico de gallo (or salsa of choice)` | `pico de gallo` | 100.0 g |
| `sour cream (or crema)` | `sour cream` | 100.0 ml |
| `guacamole` | `guacamole` | 100.0 g |

---

## Air Fryer Red Potatoes

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 1/2 pounds red potatoes (halved)` | `red potatoes` | 680.38 g |
| `2 tablespoons extra virgin olive oil` | `virgin olive oil` | 30.0 ml |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `1/4 teaspoon freshly cracked black pepper` | `black pepper` | 0.94 g |
| `1 teaspoon garlic powder` | `garlic powder` | 2.5 g |
| `1/2 teaspoon smoked paprika (optional)` | `smoked paprika` | 1.25 g |
| `chopped fresh parsley (or chopped fresh chives)` | `fresh parsley` | 100.0 g |
| `lemon wedges` | `lemon wedges` | 100.0 g |

---

## 10-Minute Air Fryer Salmon

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 4-ounce boneless salmon fillets` | `salmon fillets` | 200.0 g |
| `1 1/2 teaspoons avocado oil` | `avocado oil` | 7.5 ml |
| `1/8 teaspoon sea salt (more or less to taste)` | `sea salt` | 0.75 g |
| `1/8 teaspoon freshly cracked black pepper (more or less to taste)` | `black pepper` | 0.47 g |

---

## Air Fryer Scallops

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `6 large sea scallops` | `sea scallops` | 600.0 g |
| `spray cooking oil` | `spray cooking oil` | 100.0 ml |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `1/4 teaspoon black pepper` | `black pepper` | 0.94 g |
| `lemon wedges (for serving)` | `lemon wedges` | 100.0 g |

---

## Air Fryer Smashed Potatoes

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 1/2 pounds baby gold potatoes (1 24-ounce bag)` | `baby gold potatoes` | 680.38 g |
| `3 tablespoons neutral oil (avocado oil, olive oil, vegetable oil, etc.)` | `neutral oil (avocado oil, olive oil, vegetable oil, etc.)` | 45.0 ml |
| `1 teaspoon salt (more or less to taste)` | `salt` | 6.0 g |
| `1 teaspoon garlic powder` | `garlic powder` | 2.5 g |
| `1/2 teaspoon freshly cracked black pepper (more or less to taste)` | `black pepper` | 1.88 g |

---

## Air Fryer S'mores (Two Ways)

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 sheets graham crackers (each sheet broken in half)` | `graham crackers` | 10.0 g |
| `4  marshmallows` | `marshmallows` | 400.0 g |
| `4 squares milk chocolate bar` | `squares milk chocolate bar` | 400.0 ml |
| `2 sheets graham crackers (each sheet broken in half)` | `graham crackers` | 10.0 g |
| `6 ounces marshmallows (half of 1 12-ounce bag)` | `marshmallows` | 100.0 g |
| `1 full-size milk chocolate bar (broken into individual pieces)` | `full-size milk chocolate bar` | 100.0 ml |
| `4 sheets graham crackers (each sheet broken into 4 individual crackers)` | `graham crackers` | 20.0 g |

---

## Air Fryer Squash

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 small yellow squash` | `yellow squash` | 50.0 g |
| `1 small zucchini` | `zucchini` | 50.0 g |
| `1 tablespoon olive oil` | `olive oil` | 15.0 ml |
| `salt (to taste)` | `salt` | 100.0 g |
| `pepper (to taste)` | `pepper` | 100.0 g |

---

## Air Fryer Sweet Potato Cubes

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 large sweet potato (approximately 8 ounces)` | `sweet potato` | 100.0 g |
| `1 tablespoon neutral oil (avocado oil, olive oil, etc.)` | `neutral oil (avocado oil, olive oil, etc.)` | 15.0 ml |
| `1/2 teaspoon garlic powder` | `garlic powder` | 1.25 g |
| `1/2 teaspoon onion powder` | `onion powder` | 1.25 g |
| `1/4 teaspoon freshly cracked black pepper (more or less to taste)` | `black pepper` | 0.94 g |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |

---

## Air Fryer Sweet Potato Wedges

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3 medium sweet potatoes (approximately 4-6 ounces each)` | `sweet potatoes` | 240.0 g |
| `1/4 cup avocado oil (or other neutral oil with high smoke point)` | `avocado oil` | 60.0 ml |
| `1 teaspoon salt (more or less to taste)` | `salt` | 6.0 g |
| `1/2 teaspoon freshly cracked black pepper (more or less to taste)` | `black pepper` | 1.88 g |
| `1/2 teaspoon paprika` | `paprika` | 1.25 g |
| `1/2 teaspoon garlic powder` | `garlic powder` | 1.25 g |

---

## Air Fryer Sweet Potatoes

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 medium sweet potatoes (approximately 6 ounces each)` | `sweet potatoes` | 160.0 g |
| `avocado oil (or other neutral-flavored oil, optional)` | `avocado oil` | 100.0 ml |
| `sea salt (more or less to taste, optional)` | `sea salt` | 100.0 g |

---

## Air Fryer Tuna Steak

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/2 cup reduced sodium soy sauce` | `reduced sodium soy sauce` | 120.0 ml |
| `1 teaspoon toasted sesame oil` | `sesame oil` | 5.0 ml |
| `2 tablespoons rice vinegar` | `rice vinegar` | 30.0 ml |
| `1 tablespoon fresh lime juice` | `fresh lime juice` | 15.0 ml |
| `2 tablespoons honey` | `honey` | 30.0 ml |
| `1 teaspoon freshly grated ginger` | `ginger` | 3.75 g |
| `1-2 cloves garlic` | `garlic` | 3.0 g |
| `1 teaspoon chili garlic sauce (optional, more or less to taste)` | `chili garlic sauce` | 5.0 ml |
| `1-2  green onions (chopped)` | `green onions` | 100.0 g |
| `2 6-ounce boneless, skinless ahi tuna steaks (see Notes)` | `ahi tuna steaks` | 200.0 g |
| `freshly ground black pepper (to taste)` | `black pepper` | 100.0 g |
| `white sesame seeds` | `white sesame seeds` | 100.0 g |
| `finely chopped green onions` | `green onions` | 100.0 g |

---

## Air Fryer Turkey Burgers

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 pound ground turkey` | `ground turkey` | 453.59 g |
| `1   egg` | `egg` | 50.0 g |
| `1 tablespoon Worcestershire sauce` | `worcestershire sauce` | 15.0 ml |
| `1 teaspoon salt` | `salt` | 6.0 g |
| `1/2 teaspoon garlic powder` | `garlic powder` | 1.25 g |
| `1/4 teaspoon black pepper` | `black pepper` | 0.94 g |

---

## Air Fryer Twice Baked Potatoes

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4 medium russet potatoes (approximately 8 ounces each)` | `russet potatoes` | 320.0 g |
| `2 tablespoons neutral oil (avocado oil, olive oil, etc.)` | `neutral oil (avocado oil, olive oil, etc.)` | 30.0 ml |
| `coarse sea salt (to taste)` | `coarse sea salt` | 100.0 g |
| `1/2 cup unsalted butter (1 stick, at room temperature)` | `unsalted butter` | 144.0 g |
| `1/2 cup cooked and crumbled bacon` | `and bacon` | 90.0 g |
| `1/2 cup sour cream (at room temperature)` | `sour cream` | 120.0 ml |
| `1 cup shredded fresh cheddar cheese (or jack cheese, or combination; at room temperature)` | `fresh cheddar cheese` | 112.8 g |
| `1/2 cup whole milk (or 2% milk, at room temperature)` | `milk` | 120.0 ml |
| `1 teaspoon seasoned salt (more or less to taste)` | `seasoned salt` | 6.0 g |
| `1/4 teaspoon freshly cracked black pepper (more or less to taste)` | `black pepper` | 0.94 g |
| `2  green onions (thinly sliced)` | `green onions` | 200.0 g |
| `additional shredded cheese` | `additional cheese` | 100.0 g |
| `finely chopped chives` | `chives` | 100.0 g |

---

## Air Fryer Zucchini Chips

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1  zucchini (medium)` | `zucchini` | 100.0 g |
| `1/2 cup grated parmesan cheese` | `parmesan cheese` | 56.4 g |

---

## Amish Broccoli Salad

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/2 pound diced bacon` | `bacon` | 226.79 g |
| `3 1/2 cups chopped broccoli florets (raw, defrosted if frozen)` | `broccoli florets` | 630.0 g |
| `3 1/2 cups chopped cauliflower florets (raw, defrosted if frozen)` | `cauliflower florets` | 630.0 g |
| `1/2 cup chopped red onion` | `red onion` | 90.0 g |
| `1 cup shredded cheddar cheese` | `cheddar cheese` | 112.8 g |
| `1 cup mayonnaise` | `mayonnaise` | 180.0 g |
| `3/4 cup sour cream` | `sour cream` | 180.0 ml |
| `1 tablespoon white sugar (see Notes)` | `white sugar` | 12.75 g |
| `2 teaspoons salt (more or less to taste)` | `salt` | 12.0 g |

---

## Apple Cider Sangria

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 medium orange (approximately 4-6 ounces)` | `orange` | 80.0 g |
| `2 medium apples (any variety, approximately 5-6 ounces each)` | `apples` | 160.0 g |
| `1/2 teaspoon ground cinnamon` | `ground cinnamon` | 1.25 g |
| `1/2 teaspoon ground clove` | `ground clove` | 1.88 g |
| `1/2 teaspoon ground ginger` | `ground ginger` | 1.88 g |
| `1 750-milliliter bottle white wine (any type, sparkling or not)` | `750-milliliter bottle white wine` | 100.0 ml |
| `1 32-ounce bottle apple cider` | `apple cider` | 350.0 g |
| `1 1/2 tablespoons maple syrup (plus more to taste)` | `maple syrup` | 22.5 ml |
| `3-4  cinnamon sticks` | `cinnamon sticks` | 300.0 g |
| `1 cup carbonated water (seltzer or sparkling water)` | `carbonated water` | 240.0 ml |
| `1 medium orange (approximately 4-6 ounces)` | `orange` | 80.0 g |
| `1 medium apple (approximately 4-6 ounces)` | `apple` | 80.0 g |
| `8  cinnamon sticks (1 per glass)` | `cinnamon sticks` | 800.0 g |

---

## Apple Cider Vinaigrette

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 tablespoon dijon mustard` | `dijon mustard` | 11.25 g |
| `1 tablespoon raw apple cider vinegar (containing &quot;the Mother&quot;)` | `apple cider vinegar` | 15.0 ml |
| `8 tablespoons high-quality olive oil` | `high-quality olive oil` | 120.0 ml |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly cracked black pepper (to taste)` | `black pepper` | 100.0 g |

---

## Apple Smoothie

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1  apple (cored and cut into chunks)` | `apple` | 100.0 g |
| `1/8 teaspoon cinnamon` | `cinnamon` | 0.31 g |
| `2  pitted dates` | `pitted dates` | 200.0 g |
| `2 tablespoon rolled oats` | `rolled oats` | 10.8 g |
| `1 scoop collagen peptides (or plain protein powder, optional)` | `scoop collagen peptides` | 100.0 g |
| `1 cup milk of choice` | `milk` | 240.0 ml |
| `1 teaspoon vanilla extract (optional)` | `vanilla extract` | 5.0 ml |
| `1/2 cup Greek yogurt` | `greek yogurt` | 90.0 g |

---

## Asian Turkey Meatballs

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 pound ground turkey` | `ground turkey` | 453.59 g |
| `1 large egg` | `egg` | 100.0 g |
| `1/2 cup panko breadcrumbs` | `panko breadcrumbs` | 54.0 g |
| `2 cloves garlic (minced)` | `garlic` | 6.0 g |
| `2  green onions (sliced, white and green parts separated)` | `green onions` | 200.0 g |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `1/4 teaspoon black pepper` | `black pepper` | 0.94 g |
| `1/4 cup hoisin sauce` | `hoisin sauce` | 60.0 ml |
| `1/8 cup soy sauce` | `soy sauce` | 30.0 ml |
| `2 tablespoons rice vinegar` | `rice vinegar` | 30.0 ml |
| `1 tablespoon maple syrup` | `maple syrup` | 15.0 ml |
| `1 1-inch piece fresh ginger (grated)` | `1-inch piece fresh ginger` | 100.0 g |
| `1 teaspoon sesame oil` | `sesame oil` | 5.0 ml |
| `2 tablespoons water` | `water` | 30.0 ml |

---

## Avocado Chips

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1  avocado (large, peeled and pitted)` | `avocado` | 100.0 g |
| `3/4  cup Parmesan cheese (fresh, grated)` | `parmesan cheese` | 84.6 g |
| `1 teaspoon lemon juice (fresh)` | `lemon juice` | 5.0 ml |
| `1/2 teaspoon garlic powder` | `garlic powder` | 1.25 g |
| `1/4 teaspoon onion powder` | `onion powder` | 0.62 g |
| `1/4 teaspoon paprika` | `paprika` | 0.62 g |
| `salt (pinch, to taste)` | `salt` | 100.0 g |
| `ground black pepper (pinch, to taste)` | `ground black pepper` | 100.0 g |

---

## Avocado Salad Dressing

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1  avocado` | `avocado` | 100.0 g |
| `1/4 cup cilantro (chopped)` | `cilantro` | 45.0 g |
| `2  cloves garlic (minced)` | `garlic` | 6.0 g |
| `2 tablespoons lime juice (fresh)` | `lime juice` | 30.0 ml |
| `1 tablespoon olive oil` | `olive oil` | 15.0 ml |
| `1/2 cup Greek yogurt` | `greek yogurt` | 90.0 g |
| `1/2 cup water (or as much as desired)` | `water` | 120.0 ml |
| `salt (to taste)` | `salt` | 100.0 g |
| `pepper (to taste)` | `pepper` | 100.0 g |

---

## Bacon Wrapped Turkey Breast

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3 tablespoons salted butter (melted)` | `salted butter` | 54.0 g |
| `2 tablespoons fresh thyme (chopped )` | `fresh thyme` | 22.5 g |
| `2 teaspoons fresh rosemary (chopped )` | `fresh rosemary` | 7.5 g |
| `1 tablespoon fresh parsley (chopped )` | `fresh parsley` | 11.25 g |
| `1  sage leaf (chopped )` | `sage leaf` | 100.0 g |
| `2 cloves garlic (minced)` | `garlic` | 6.0 g |
| `1 3-pound boneless turkey breast` | `3-pound turkey breast` | 100.0 g |
| `8-10 slices bacon` | `bacon` | 160.0 g |

---

## Baked Chicken Tacos

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 tablespoon neutral-flavored oil (avocado oil, olive oil, etc.)` | `neutral-flavored oil (avocado oil, olive oil, etc.)` | 15.0 ml |
| `1/2 cup diced white onion` | `white onion` | 90.0 g |
| `2 cups cooked, shredded chicken (see Notes)` | `chicken` | 360.0 g |
| `8 ounces refried beans (black or pinto; half of one can)` | `refried beans` | 100.0 g |
| `1 cup salsa (any variety)` | `salsa` | 180.0 g |
| `1 tablespoon taco seasoning (store-bought or make your own)` | `taco seasoning` | 11.25 g |
| `10  hard taco shells` | `hard taco shells` | 1000.0 g |
| `2 cups shredded Mexican-style cheese blend` | `mexican-style cheese blend` | 225.6 g |
| `diced cilantro` | `cilantro` | 100.0 g |
| `sliced avocado (or guacamole)` | `avocado` | 100.0 g |
| `sour cream` | `sour cream` | 100.0 ml |

---

## Baked Teriyaki Chicken

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 cup soy sauce` | `soy sauce` | 240.0 ml |
| `3/4 cup sugar` | `sugar` | 153.0 g |
| `1/4 cup apple cider vinegar` | `apple cider vinegar` | 60.0 ml |
| `1/4 cup water` | `water` | 60.0 ml |
| `2 cloves garlic (minced)` | `garlic` | 6.0 g |
| `1 tsp ground ginger` | `ground ginger` | 3.75 g |
| `2 Tbsp cornstarch (plus 2 Tbsp cold water)` | `cornstarch` | 18.0 g |
| `black pepper (to taste)` | `black pepper` | 100.0 g |
| `3 lb boneless skinless chicken thighs` | `chicken thighs` | 1360.77 g |

---

## Chili with Corn

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 Tbsp olive oil` | `olive oil` | 15.0 ml |
| `1  onion (diced)` | `onion` | 100.0 g |
| `1  red bell pepper (diced)` | `red bell pepper` | 100.0 g |
| `3  garlic cloves (minced)` | `garlic cloves` | 300.0 g |
| `1/2 Pound ground beef` | `ground beef` | 226.79 g |
| `2 Tsp chili powder` | `chili powder` | 5.0 g |
| `1 Tsp ground cumin` | `ground cumin` | 2.5 g |
| `3 cups beef broth` | `beef broth` | 720.0 ml |
| `15 oz kidney beans (1 can)` | `kidney beans` | 100.0 g |
| `15 oz chopped tomatoes (1 can)` | `tomatoes` | 100.0 g |
| `7 oz canned corn (1 can, drained)` | `canned corn` | 100.0 g |

---

## Beef with Garlic Sauce

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 pound flank steak or sirloin (cut into small, short strips)` | `flank steak or sirloin` | 453.59 g |
| `1 tablespoon cornstarch (plus more as needed)` | `cornstarch` | 9.0 g |
| `1 tablespoon sesame oil` | `sesame oil` | 15.0 ml |
| `1 tablespoon garlic (minced)` | `garlic` | 11.25 g |
| `1/2 tablespoon ginger (grated)` | `ginger` | 5.62 g |
| `2 cups broccoli (chopped into bite-sized pieces)` | `broccoli` | 360.0 g |
| `2 tablespoons soy sauce` | `soy sauce` | 30.0 ml |
| `1/3 teaspoon garlic powder` | `garlic powder` | 0.83 g |
| `1/8 teaspoon pepper` | `pepper` | 0.47 g |
| `1 cup rice (cooked, optional, for serving)` | `rice` | 204.0 g |
| `white sesame seeds (optional, for garnish)` | `white sesame seeds` | 100.0 g |
| `green onions (optional, for garnish)` | `green onions` | 100.0 g |

---

## Beef with Oyster Sauce

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 tablespoons soy sauce (or lite tamari, or coconut aminos)` | `soy sauce (or lite tamari, or coconut aminos)` | 30.0 ml |
| `1 tablespoon mirin (or white cooking wine)` | `mirin` | 11.25 g |
| `1 tablespoon cornstarch` | `cornstarch` | 9.0 g |
| `1 teaspoon sugar (or sugar substitute)` | `sugar` | 4.25 g |
| `1 pound flank steak (thinly sliced)` | `flank steak` | 453.59 g |
| `1 tablespoon sesame oil (for cooking)` | `sesame oil` | 15.0 ml |
| `1 medium green bell pepper (chopped)` | `green bell pepper` | 80.0 g |
| `1 medium red bell pepper (chopped)` | `red bell pepper` | 80.0 g |
| `1 medium white onion (thinly sliced)` | `white onion` | 80.0 g |
| `1/4 cup oyster sauce` | `oyster sauce` | 60.0 ml |
| `2  green onions (sliced)` | `green onions` | 200.0 g |

---

## Beef Pad Thai

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 tablespoons fish sauce` | `fish sauce` | 30.0 ml |
| `2 tablespoons rice vinegar` | `rice vinegar` | 30.0 ml |
| `1 tablespoon lime juice` | `lime juice` | 15.0 ml |
| `1 tablespoons tamari (or soy sauce)` | `tamari` | 11.25 g |
| `1 tablespoon oyster sauce` | `oyster sauce` | 15.0 ml |
| `3 tablespoons coconut sugar` | `coconut sugar` | 38.25 g |
| `8 ounces pad thai noodles` | `pad thai noodles` | 100.0 g |
| `2 tablespoons avocado oil` | `avocado oil` | 30.0 ml |
| `3 cloves garlic (minced)` | `garlic` | 9.0 g |
| `1  red chili (sliced)` | `red chili` | 100.0 g |
| `1 1-inch piece ginger (grated)` | `1-inch piece ginger` | 100.0 g |
| `4  scallions (sliced, white &amp; green parts divided)` | `scallions` | 400.0 g |
| `1 pound sirloin (thinly sliced)` | `sirloin` | 453.59 g |
| `1  egg` | `egg` | 50.0 g |
| `2 cups bean sprouts` | `bean sprouts` | 360.0 g |
| `salt &amp; pepper (to taste)` | `salt &amp; pepper` | 100.0 g |
| `peanuts (without shells, for garnish)` | `peanuts` | 100.0 g |

---

## Crispy Beef Schnitzel

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `5  thin-cut steaks (1/4-inch thin)` | `thin-cut steaks` | 500.0 g |
| `1/3 cup all-purpose flour` | `all-purpose flour` | 40.0 g |
| `2 teaspoons garlic powder` | `garlic powder` | 5.0 g |
| `1 teaspoon paprika` | `paprika` | 2.5 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly cracked black pepper (to taste)` | `black pepper` | 100.0 g |
| `2 large eggs (whisked)` | `eggs` | 200.0 g |
| `2 cups panko breadcrumbs` | `panko breadcrumbs` | 216.0 g |
| `2 tablespoons olive oil` | `olive oil` | 30.0 ml |

---

## Beef Vindaloo

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 pounds beef chuck (see Notes)` | `beef chuck` | 907.18 g |
| `1 teaspoon salt` | `salt` | 6.0 g |
| `1/2 teaspoon freshly cracked black pepper` | `black pepper` | 1.88 g |
| `3 tablespoons neutral oil` | `neutral oil` | 45.0 ml |
| `1 medium onion (chopped)` | `onion` | 80.0 g |
| `3 cloves garlic (minced)` | `garlic` | 9.0 g |
| `2 teaspoons garam masala` | `garam masala` | 7.5 g |
| `2 teaspoons cumin` | `cumin` | 5.0 g |
| `1 teaspoon paprika` | `paprika` | 2.5 g |
| `1 teaspoon turmeric` | `turmeric` | 3.75 g |
| `1/2 teaspoon ground mustard` | `ground mustard` | 1.88 g |
| `1/2 teaspoon cayenne pepper (omit for more mild flavor)` | `cayenne pepper` | 1.88 g |
| `1/2 teaspoon ground ginger` | `ground ginger` | 1.88 g |
| `1/2 teaspoon cinnamon` | `cinnamon` | 1.25 g |
| `2 tablespoons tomato paste` | `tomato paste` | 22.5 g |
| `1/4 cup apple cider vinegar` | `apple cider vinegar` | 60.0 ml |
| `1 cup low-sodium beef stock (plus more as needed)` | `low-sodium beef stock` | 240.0 ml |
| `cooked basmati rice` | `basmati rice` | 100.0 g |
| `warmed naan` | `warmed naan` | 100.0 g |
| `plain Greek yogurt` | `greek yogurt` | 100.0 g |

---

## The Best EVER Gluten-Free Lemon Cake

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 1/2 cups gluten-free all-purpose flour` | `gluten-free all-purpose flour` | 180.0 g |
| `1 1/2 teaspoons baking powder` | `baking powder` | 6.75 g |
| `1 tablespoon lemon zest (from 2-4 lemons, see Notes)` | `lemon zest` | 11.25 g |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `1/2 cup unsalted butter (room temperature, see Notes)` | `unsalted butter` | 144.0 g |
| `1 cup granulated sugar` | `granulated sugar` | 204.0 g |
| `3 large eggs (at room temperature, see Notes)` | `eggs` | 300.0 g |
| `1 teaspoon vanilla extract` | `vanilla extract` | 5.0 ml |
| `2 tablespoons  lemon juice (approximately 1-2 lemons&#39; worth)` | `lemon juice` | 30.0 ml |
| `1/2 cup buttermilk (divided)` | `buttermilk` | 120.0 ml |
| `1 1/4-1 1/2 cups powdered sugar (sifted, plus more as needed)` | `1/2 cups powdered sugar` | 125.0 g |
| `2 tablespoons lemon juice (approximately 1-2 lemons&#39; worth)` | `lemon juice` | 30.0 ml |
| `1 tablespoon milk` | `milk` | 15.0 ml |

---

## Bison Chili

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 pound ground bison` | `ground bison` | 453.59 g |
| `2 teaspoons ground cumin (divided)` | `ground cumin` | 5.0 g |
| `1 teaspoon black pepper` | `black pepper` | 3.75 g |
| `1  (10-ounce) can diced tomatoes with green chiles` | `tomatoes with green chiles` | 400.0 g |
| `1  (10.75-ounce) can crushed tomatoes` | `crushed tomatoes` | 400.0 g |
| `1  (14.5-ounce) can kidney beans (drained)` | `kidney beans` | 400.0 g |
| `1  (15-ounce) can chili beans (drained)` | `chili beans` | 400.0 g |
| `1  medium onion (chopped)` | `onion` | 80.0 g |
| `4 cloves garlic (minced)` | `garlic` | 12.0 g |
| `1 1/2 tablespoons chili powder` | `chili powder` | 11.25 g |
| `1 teaspoon salt (plus more to taste)` | `salt` | 6.0 g |

---

## Baked Blueberry Oatmeal

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3 cups rolled oats` | `rolled oats` | 259.2 g |
| `2/3 cup maple syrup` | `maple syrup` | 160.0 ml |
| `2 teaspoons ground cinnamon` | `ground cinnamon` | 5.0 g |
| `2 teaspoons baking powder` | `baking powder` | 9.0 g |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `1/2-3/4 cup milk of choice (1/2 cup for firmer oatmeal, 3/4 for less-firm oatmeal)` | `/4 cup milk` | 50.0 ml |
| `2 large eggs` | `eggs` | 200.0 g |
| `1/2 cup melted butter (or refined coconut oil, plus more to grease baking dish)` | `butter` | 90.0 g |
| `3 teaspoons vanilla extract` | `vanilla extract` | 15.0 ml |
| `1 1/2 cups blueberries (fresh, or thawed &amp; drained if frozen)` | `blueberries` | 270.0 g |

---

## Boilermaker Chili

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 tablespoon neutral-tasting oil (avocado oil, olive oil, vegetable oil, etc.)` | `neutral oil (avocado oil, olive oil, vegetable oil, etc.)` | 15.0 ml |
| `1 cup chopped celery (approximately 2 large stalks)` | `celery` | 180.0 g |
| `1 1/2 cups chopped yellow onion (approximately 1 large onion)` | `yellow onion` | 270.0 g |
| `1 cup chopped green bell pepper (approximately 1 large bell pepper, seeds removed)` | `green bell pepper` | 180.0 g |
| `1 cup chopped red bell pepper (approximately 1 large bell pepper, seeds removed)` | `red bell pepper` | 180.0 g |
| `2-3 tablespoons chopped serrano pepper (approximately 2 peppers, seeds removed)` | `serrano pepper` | 22.5 g |
| `1/4 cup chili powder (more or less to taste)` | `chili powder` | 30.0 g |
| `1 tablespoon Italian seasoning` | `italian seasoning` | 11.25 g |
| `2 teaspoons ground cumin` | `ground cumin` | 5.0 g |
| `1 teaspoon freshly ground black pepper (plus more to taste)` | `black pepper` | 3.75 g |
| `1/4 teaspoon cayenne pepper (plus more to taste)` | `cayenne pepper` | 0.94 g |
| `1 tablespoon minced fresh garlic (approximately 2 large cloves)` | `fresh garlic` | 11.25 g |
| `2 pounds lean ground beef (85/15 or 90/10 preferred)` | `ground beef` | 907.18 g |
| `1 pound bulk Italian sausage` | `bulk italian sausage` | 453.59 g |
| `3 15-ounce cans chili beans (drained)` | `chili beans` | 1200.0 g |
| `1 15-ounce can chili beans in spicy sauce (do not drain)` | `chili beans in spicy sauce` | 400.0 ml |
| `2 28-ounce cans diced tomatoes (do not drain)` | `tomatoes` | 800.0 g |
| `1 6-ounce can tomato paste` | `tomato paste` | 400.0 g |
| `1/4 cup cooked, crumbled bacon (approximately 4 thick-cut slices)` | `bacon` | 45.0 g |
| `1 tablespoon Worcestershire sauce` | `worcestershire sauce` | 15.0 ml |
| `1 tablespoon hot sauce` | `hot sauce` | 15.0 ml |
| `4 cubes beef bouillon (or 4 teaspoons beef bouillon paste)` | `cubes beef bouillon` | 400.0 g |
| `1 cup beer of choice (dark stout preferred)` | `beer` | 240.0 ml |
| `1 teaspoon granulated white sugar` | `granulated white sugar` | 4.25 g |
| `1 teaspoon salt (plus more to taste)` | `salt` | 6.0 g |
| `corn chips (crushed or whole)` | `corn chips` | 100.0 g |
| `minced red onions` | `red onions` | 100.0 g |
| `shredded cheddar (or shredded Mexican cheese blend)` | `cheddar` | 100.0 g |
| `cornbread` | `cornbread` | 100.0 g |

---

## Boursin Mashed Potatoes

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3 pounds Yukon gold potatoes (or russet potatoes; washed, peeled, cubed)` | `yukon gold potatoes` | 1360.77 g |
| `1 big pinch salt (plus more to taste)` | `big pinch salt` | 100.0 g |
| `1/4 cup butter` | `butter` | 45.0 g |
| `1/2 cup milk of choice (at or near room temperature)` | `milk` | 120.0 ml |
| `1 5.2-ounce wheel Boursin garlic &amp; fine herb cheese (at room temperature, cut into small pieces)` | `wheel boursin garlic &amp; fine herb cheese` | 100.0 g |
| `finely chopped fresh chives (optional, to garnish)` | `fresh chives` | 100.0 g |

---

## How To Brine Chicken Wings

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 1/2 gallons water (more or less as needed)` | `gallons water` | 150.0 ml |
| `1 tablespoon minced garlic (approximately 6 cloves)` | `garlic` | 11.25 g |
| `1/2 cup sea salt` | `sea salt` | 144.0 g |
| `1 tablespoon paprika` | `paprika` | 7.5 g |
| `1 tablespoon dried oregano` | `dried oregano` | 11.25 g |
| `1 tablespoon dried basil` | `dried basil` | 11.25 g |
| `1 tablespoon dried chili pepper` | `dried chili pepper` | 11.25 g |
| `1 1/2 pounds chicken wings (flats and drums, defrosted if frozen)` | `chicken wings` | 680.38 g |
| `crushed red pepper flakes` | `crushed red pepper flakes` | 100.0 g |
| `chopped fresh herbs` | `fresh herbs` | 100.0 g |
| `ranch dressing` | `ranch dressing` | 100.0 g |
| `blue cheese dressing` | `blue cheese dressing` | 100.0 g |

---

## Broccoli Cornbread

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 cup all-purpose flour` | `all-purpose flour` | 120.0 g |
| `1 cup yellow cornmeal` | `yellow cornmeal` | 180.0 g |
| `1 tablespoon fresh baking powder` | `fresh baking powder` | 13.5 g |
| `1/4 cup granulated sugar` | `granulated sugar` | 51.0 g |
| `1 pinch salt` | `salt` | 1.0 g |
| `1 cup cottage cheese` | `cottage cheese` | 112.8 g |
| `6 tablespoons unsalted butter (melted)` | `unsalted butter` | 108.0 g |
| `4 large eggs (lightly beaten)` | `eggs` | 400.0 g |
| `1/2 cup milk` | `milk` | 120.0 ml |
| `1/2 cup shredded cheddar cheese` | `cheddar cheese` | 56.4 g |
| `2 cups finely chopped broccoli` | `broccoli` | 360.0 g |
| `1/2 cup shredded cheddar cheese (optional)` | `cheddar cheese` | 56.4 g |

---

## Shredded Brussels Sprout Salad with Maple-Dijon Vinaigrette

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4 cups shaved Brussels sprouts` | `shaved brussels sprouts` | 720.0 g |
| `1/4 cup extra-virgin olive oil (plus more for drizzling)` | `extra-virgin olive oil` | 60.0 ml |
| `3 tablespoons balsamic vinegar` | `balsamic vinegar` | 45.0 ml |
| `1 tablespoon Dijon mustard` | `dijon mustard` | 11.25 g |
| `1 tablespoon pure maple syrup` | `maple syrup` | 15.0 ml |
| `1/4 cup toasted pecans ( or other nut)` | `pecans` | 45.0 g |
| `1  honeycrisp apple (or your favorite type, thinly sliced or chopped)` | `honeycrisp apple` | 100.0 ml |
| `1/3 cup grated pecorino cheese (optional)` | `pecorino cheese` | 37.6 g |
| `plenty of salt and freshly ground black pepper` | `plenty of salt and black pepper` | 100.0 g |

---

## Buffalo Burger with an Easy Burger Sauce

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 tablespoon butter (for cooking, see Notes)` | `butter` | 11.25 g |
| `toppings of choice` | `toppings` | 100.0 g |
| `1 pound ground bison` | `ground bison` | 453.59 g |
| `1 teaspoon kosher salt` | `kosher salt` | 6.0 g |
| `1/2 teaspoon garlic powder` | `garlic powder` | 1.25 g |
| `1/2 teaspoon onion powder` | `onion powder` | 1.25 g |
| `1/4 teaspoon black pepper` | `black pepper` | 0.94 g |
| `1/4 cup mayonnaise` | `mayonnaise` | 45.0 g |
| `2 tablespoons pickle relish` | `pickle relish` | 22.5 g |
| `2 tablespoons ketchup` | `ketchup` | 22.5 g |
| `1/2 tablespoon dijon mustard` | `dijon mustard` | 5.62 g |
| `1 teaspoon Worcestershire sauce` | `worcestershire sauce` | 5.0 ml |
| `1/4 teaspoon onion powder` | `onion powder` | 0.62 g |
| `1/4 teaspoon garlic powder` | `garlic powder` | 0.62 g |
| `1 teaspoon sugar (or sugar substitute, optional)` | `sugar` | 4.25 g |
| `salt and pepper (to taste)` | `salt and pepper` | 100.0 g |

---

## Buffalo Chicken Flatbread

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 1/2 cups shredded cooked chicken (like rotisserie)` | `chicken` | 270.0 g |
| `1/2 cup buffalo sauce (plus extra for serving)` | `buffalo sauce` | 120.0 ml |
| `1/2 cup ranch dressing (plus extra for serving)` | `ranch dressing` | 90.0 g |
| `1 Teaspoon garlic powder` | `garlic powder` | 2.5 g |
| `2  flatbread crusts (1 x 14 oz package)` | `flatbread crusts` | 200.0 g |
| `2 cups shredded mozzarella cheese (or more to taste)` | `mozzarella cheese` | 225.6 g |
| `1/4  red onion (thinly sliced)` | `red onion` | 25.0 g |
| `2  green onions (thinly sliced)` | `green onions` | 200.0 g |
| `crumbled blue cheese (optional, for topping)` | `blue cheese` | 100.0 g |

---

## Buffalo Chicken Fries

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/4 cup Louisiana style hot sauce` | `louisiana style hot sauce` | 60.0 ml |
| `1/4 cup unsalted butter` | `unsalted butter` | 72.0 g |
| `1 tablespoon white vinegar` | `white vinegar` | 15.0 ml |
| `1/4 teaspoon Worcestershire sauce` | `worcestershire sauce` | 1.25 ml |
| `1/6 teaspoon garlic powder` | `garlic powder` | 0.42 g |
| `1/6 teaspoon paprika` | `paprika` | 0.42 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly cracked black pepper (to taste)` | `black pepper` | 100.0 g |
| `1 pound fully-cooked chicken (shredded or chopped into 1-inch chunks)` | `fully-cooked chicken` | 453.59 g |
| `1 32-ounce bag frozen french fries (any type, cooked as preferred)` | `frozen french fries` | 300.0 g |
| `8 ounces shredded fresh mozzarella` | `fresh mozzarella` | 100.0 g |
| `1/3 cup blue cheese crumbles` | `blue cheese crumbles` | 37.6 g |
| `1/3 cup sliced green onions (green parts only)` | `green onions` | 60.0 g |
| `1/3 cup ranch dressing` | `ranch dressing` | 60.0 g |

---

## Buffalo Chicken Mac and Cheese

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 pound elbow pasta (uncooked)` | `elbow pasta` | 453.59 g |
| `3 tablespoons butter` | `butter` | 33.75 g |
| `3 tablespoons all-purpose flour` | `all-purpose flour` | 22.5 g |
| `2 cups whole milk (at room temperature)` | `milk` | 480.0 ml |
| `1 cup shredded mozzarella cheese (at room temperature)` | `mozzarella cheese` | 112.8 g |
| `1 cup shredded cheddar cheese (at room temperature)` | `cheddar cheese` | 112.8 g |
| `1/2 cup buffalo sauce` | `buffalo sauce` | 120.0 ml |
| `2 cups chicken (fully cooked and shredded)` | `chicken` | 360.0 g |
| `3  celery stalks (chopped)` | `celery stalks` | 300.0 g |
| `1/2 cup crumbled blue cheese (optional)` | `blue cheese` | 56.4 g |

---

## Buffalo Chicken Quesadillas

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 cups cooked shredded chicken (see Notes)` | `chicken` | 360.0 g |
| `1/2 cup buffalo sauce` | `buffalo sauce` | 120.0 ml |
| `4 tablespoons butter` | `butter` | 45.0 g |
| `4 10-inch flour tortillas` | `10-inch flour tortillas` | 400.0 g |
| `2 cups shredded Mexican cheese` | `mexican cheese` | 225.6 g |
| `ranch dressing` | `ranch dressing` | 100.0 g |
| `fresh chopped cilantro` | `fresh cilantro` | 100.0 g |

---

## Buffalo Chicken Thighs

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4  bone-in skin-on chicken thighs` | `chicken thighs` | 400.0 g |
| `1 tablespoon olive oil` | `olive oil` | 15.0 ml |
| `1 teaspoon salt` | `salt` | 6.0 g |
| `1/2 teaspoon garlic powder` | `garlic powder` | 1.25 g |
| `1/4 teaspoon black pepper` | `black pepper` | 0.94 g |
| `1/4 cup hot sauce` | `hot sauce` | 60.0 ml |
| `1 tablespoon butter (melted)` | `butter` | 11.25 g |
| `1 tablespoon honey` | `honey` | 15.0 ml |

---

## Homemade Buffalo Ranch Dressing

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/4 cup mayonnaise` | `mayonnaise` | 45.0 g |
| `3/4 cup full-fat sour cream` | `full-fat sour cream` | 180.0 ml |
| `2 tablespoons ranch seasoning mix` | `ranch seasoning mix` | 22.5 g |
| `1 teaspoon garlic powder` | `garlic powder` | 2.5 g |
| `1/3 cup milk of choice (whole milk recommended)` | `milk` | 80.0 ml |
| `2 teaspoons Frank&#39;s RedHot sauce (plus more to taste)` | `frank&#39;s redhot sauce` | 10.0 ml |

---

## Buffalo Ribs

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 tablespoon brown sugar (see Notes)` | `brown sugar` | 12.75 g |
| `1 tablespoon chili powder` | `chili powder` | 7.5 g |
| `1/2 tablespoon garlic powder` | `garlic powder` | 3.75 g |
| `1 teaspoon smoked paprika` | `smoked paprika` | 2.5 g |
| `1/2 tablespoon cumin` | `cumin` | 3.75 g |
| `1/2 tablespoon kosher salt` | `kosher salt` | 9.0 g |
| `1 teaspoon black pepper` | `black pepper` | 3.75 g |
| `1 slab baby back ribs (about 3 pounds)` | `slab baby back ribs` | 100.0 g |
| `1 teaspoon liquid smoke` | `liquid smoke` | 3.75 g |
| `1 cup buffalo sauce` | `buffalo sauce` | 240.0 ml |
| `1 stick butter` | `butter` | 113.0 g |
| `2 tablespoons honey (optional)` | `honey` | 30.0 ml |
| `ranch dressing` | `ranch dressing` | 100.0 g |
| `blue cheese dressing` | `blue cheese dressing` | 100.0 g |
| `celery sticks` | `celery sticks` | 100.0 g |
| `baby carrots` | `baby carrots` | 100.0 g |

---

## Buffalo Shrimp

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 pound shrimp (peeled and deveined)` | `shrimp` | 453.59 g |
| `1 tablespoon Cajun seasoning (see Notes)` | `cajun seasoning` | 11.25 g |
| `2 tablespoons olive oil` | `olive oil` | 30.0 ml |
| `1/2 cup hot sauce (such as Frank&#39;s RedHot)` | `hot sauce` | 120.0 ml |
| `2 tablespoons butter (melted)` | `butter` | 22.5 g |
| `1 tablespoon honey (optional)` | `honey` | 15.0 ml |

---

## Crispy Baked Buffalo Tofu

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4 tablespoons cornstarch` | `cornstarch` | 36.0 g |
| `1/4 teaspoon garlic powder` | `garlic powder` | 0.62 g |
| `1/4 teaspoon onion powder` | `onion powder` | 0.62 g |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `1/8 teaspoon freshly ground black pepper (more or less to taste)` | `black pepper` | 0.47 g |
| `1 16-ounce block extra-firm tofu (drained very well, pressed)` | `block extra-firm tofu` | 100.0 g |
| `2 tablespoons unsalted butter (vegan or traditional)` | `unsalted butter` | 36.0 g |
| `1/4 cup Frank&#39;s hot sauce (more or less to taste)` | `frank&#39;s hot sauce` | 60.0 ml |
| `1/4 teaspoon garlic powder` | `garlic powder` | 0.62 g |
| `blue cheese dressing (vegan or traditional)` | `blue cheese dressing` | 100.0 g |
| `ranch dressing (vegan or traditional)` | `ranch dressing` | 100.0 g |
| `carrot sticks` | `carrot sticks` | 100.0 g |
| `celery sticks` | `celery sticks` | 100.0 g |

---

## Buttery and "Cheesy" Vegan Popcorn

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3 tablespoons neutral oil (i.e. vegetable oil, avocado oil, or sunflower oil)` | `neutral oil (i.e. vegetable oil, avocado oil, or sunflower oil)` | 45.0 ml |
| `3/4 cup popcorn kernels (unsalted, unbuttered)` | `popcorn kernels` | 135.0 g |
| `3 tablespoons vegan butter (melted)` | `vegan butter` | 33.75 g |
| `2 tablespoons nutritional yeast` | `nutritional yeast` | 16.5 g |
| `2 teaspoons garlic powder` | `garlic powder` | 5.0 g |
| `1-2 teaspoons salt` | `salt` | 6.0 g |

---

## Blackened Salmon Fries

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 pound salmon fillet (skin removed)` | `salmon fillet` | 453.59 g |
| `1 tablespoon olive oil` | `olive oil` | 15.0 ml |
| `1 tablespoon Cajun seasoning (store-bought or homemade)` | `cajun seasoning` | 11.25 g |
| `1/2 teaspoon smoked paprika` | `smoked paprika` | 1.25 g |
| `1/2 teaspoon garlic powder` | `garlic powder` | 1.25 g |
| `1  bag frozen French fries (waffle fries or shoestring work best)` | `frozen french fries` | 300.0 g |
| `1 cup shredded cheddar-jack cheese (or pepper jack for extra kick)` | `cheddar-jack cheese` | 112.8 g |
| `1/2 cup pico de gallo (or diced tomatoes, red onion, cilantro)` | `pico de gallo (or tomatoes, red onion, cilantro)` | 90.0 g |
| `1/2  avocado (diced (or guacamole))` | `avocado` | 50.0 g |
| `1/4 cup pickled jalapeños` | `pickled jalapeños` | 45.0 g |
| `2 tablespoons chopped green onions` | `green onions` | 22.5 g |
| `Sour cream (or chipotle crema drizzle)` | `sour cream` | 100.0 ml |
| `Fresh cilantro (for garnish)` | `fresh cilantro` | 100.0 g |
| `Optional: corn kernels, black beans, or a squeeze of lime` | `optional: corn kernels, black beans, or a squeeze of lime` | 100.0 g |

---

## Carnitas Burrito

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 tablespoon dried oregano` | `dried oregano` | 11.25 g |
| `2 teaspoons cumin` | `cumin` | 5.0 g |
| `3 teaspoons salt (divided)` | `salt` | 18.0 g |
| `1 teaspoon chili powder` | `chili powder` | 2.5 g |
| `2 pounds pork shoulder` | `pork shoulder` | 907.18 g |
| `1 tablespoon neutral oil (avocado oil, olive oil, etc.)` | `neutral oil (avocado oil, olive oil, etc.)` | 15.0 ml |
| `half of one onion (chopped)` | `half of one onion` | 100.0 g |
| `1/4 cup orange juice` | `orange juice` | 60.0 ml |
| `3 cloves garlic (minced)` | `garlic` | 9.0 g |
| `1  jalapeño pepper (stem and seeds removed, pepper minced)` | `jalapeño pepper` | 100.0 g |
| `1 tablespoon freshly squeezed lime juice` | `freshly squeezed lime juice` | 15.0 ml |
| `2 medium avocados (pit removed, peeled)` | `avocados` | 160.0 g |
| `1 tablespoon freshly squeezed lime juice` | `freshly squeezed lime juice` | 15.0 ml |
| `1 teaspoon  salt (more or less to taste)` | `salt` | 6.0 g |
| `6 12-inch flour tortillas` | `12-inch flour tortillas` | 600.0 g |
| `2 cups cooked white rice` | `white rice` | 408.0 g |
| `2 cups pico de gallo (or salsa)` | `pico de gallo` | 360.0 g |
| `2 cups shredded Mexican cheese` | `mexican cheese` | 225.6 g |
| `1 cup pinto beans (or black beans, drained)` | `pinto beans` | 180.0 g |
| `chopped fresh cilantro (to taste)` | `fresh cilantro` | 100.0 g |

---

## Carrot Fries

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 pounds carrots` | `carrots` | 907.18 g |
| `2 tablespoons avocado oil (or neutral oil of choice)` | `avocado oil` | 30.0 ml |
| `salt` | `salt` | 100.0 g |
| `pepper` | `pepper` | 100.0 g |
| `1 cup full-fat sour cream` | `full-fat sour cream` | 240.0 ml |
| `1  tablespoon dried onion flakes` | `dried onion flakes` | 11.25 g |
| `1/2 teaspoon garlic powder` | `garlic powder` | 1.25 g |
| `1 tablespoon chopped fresh herbs (chives, parsley, dill, etc.)` | `fresh herbs (chives, parsley, dill, etc.)` | 11.25 g |
| `1/4 teaspoon salt` | `salt` | 1.5 g |

---

## Cauliflower Chips

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 head cauliflower` | `cauliflower` | 150.0 g |
| `1 cup parmesan cheese (freshly grated)` | `parmesan cheese` | 112.8 g |
| `1 tablespoon dried parsley` | `dried parsley` | 11.25 g |
| `1 teaspoon garlic powder` | `garlic powder` | 2.5 g |
| `1 teaspoon onion powder` | `onion powder` | 2.5 g |
| `1/2 teaspoon chili powder` | `chili powder` | 1.25 g |
| `salt (to taste)` | `salt` | 100.0 g |

---

## Cherry Tomato Salad

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4 cups quartered cherry tomatoes` | `quartered cherry tomatoes` | 720.0 g |
| `2 cloves garlic (finely minced)` | `garlic` | 6.0 g |
| `1/4 cup olive oil` | `olive oil` | 60.0 ml |
| `1 tablespoon chopped fresh basil` | `fresh basil` | 11.25 g |
| `2 tablespoons red wine vinegar` | `red wine vinegar` | 30.0 ml |
| `2 teaspoons Italian seasoning` | `italian seasoning` | 7.5 g |
| `1 teaspoon granulated sugar (or 1 teaspoon honey)` | `granulated sugar` | 4.25 g |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `additional chopped fresh basil (to taste)` | `additional fresh basil` | 100.0 g |

---

## Chick-Fil-A Cobb Salad Recipe

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/2 cup buttermilk (plus more if needed)` | `buttermilk` | 120.0 ml |
| `1/2 cup sour cream` | `sour cream` | 120.0 ml |
| `1/4 cup mayonnaise` | `mayonnaise` | 45.0 g |
| `1 cup avocado (peeled, pit removed; meat cubed)` | `avocado` | 180.0 g |
| `2 tablespoons chopped fresh cilantro` | `fresh cilantro` | 22.5 g |
| `2 tablespoons lime juice` | `lime juice` | 30.0 ml |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `1/2 teaspoon garlic powder` | `garlic powder` | 1.25 g |
| `1/2 teaspoon ground cumin` | `ground cumin` | 1.25 g |
| `1/4 teaspoon freshly cracked black pepper` | `black pepper` | 0.94 g |
| `2 cups chicken nuggets (store-bought or homemade, see Notes)` | `chicken nuggets` | 360.0 g |
| `9 cups mixed greens` | `mixed greens` | 1620.0 g |
| `12  cherry tomatoes` | `cherry tomatoes` | 1200.0 g |
| `1/4 cup fire-roasted corn (drained well if canned, defrosted if frozen)` | `fire-roasted corn` | 45.0 g |
| `1/2 cup shredded Mexican blend cheese` | `mexican blend cheese` | 56.4 g |

---

## Chick-Fil-A Coleslaw Copycat Recipe

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 cup mayonnaise (see Notes)` | `mayonnaise` | 180.0 g |
| `1/4 cup granulated sugar (see Notes)` | `granulated sugar` | 51.0 g |
| `4 teaspoons white vinegar` | `white vinegar` | 20.0 ml |
| `1/4 teaspoon dry mustard` | `dry mustard` | 0.94 g |
| `1/4 teaspoon kosher salt` | `kosher salt` | 1.5 g |
| `2 14-ounce bags shredded coleslaw mix` | `coleslaw mix` | 600.0 g |

---

## Chicken Bacon Ranch Sliders

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `12  sweet Hawaiian rolls` | `sweet hawaiian rolls` | 1200.0 g |
| `6 slices colby jack cheese` | `colby jack cheese` | 120.0 g |
| `1 pound thinly sliced deli chicken (any brand, any flavor)` | `deli chicken` | 453.59 g |
| `1/2 cup cooked, crumbled bacon (approximately 8 slices)` | `bacon` | 90.0 g |
| `1/3 cup ranch dressing (store-bought or make your own)` | `ranch dressing` | 60.0 g |
| `6 slices colby jack cheese` | `colby jack cheese` | 120.0 g |
| `2 tablespoons grated parmesan` | `parmesan` | 11.4 g |
| `1/2 cup unsalted butter (1 full stick, cut into pieces)` | `unsalted butter` | 144.0 g |
| `1 teaspoon dried parsley` | `dried parsley` | 3.75 g |
| `1/2 teaspoon garlic powder` | `garlic powder` | 1.25 g |
| `1/4 teaspoon salt (more or less to taste)` | `salt` | 1.5 g |

---

## Chicken Bryan

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4 medium boneless, skinless chicken breasts (approximately 6 ounces each)` | `chicken breasts` | 320.0 g |
| `1 tablespoon olive oil` | `olive oil` | 15.0 ml |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly cracked black pepper (to taste)` | `black pepper` | 100.0 g |
| `1/2 teaspoon garlic powder` | `garlic powder` | 1.25 g |
| `4 tablespoons unsalted butter` | `unsalted butter` | 72.0 g |
| `1 teaspoon sun-dried tomato oil (from jar of sun-dried tomatoes)` | `sun-dried tomato oil` | 5.0 ml |
| `1 small yellow onion (chopped, approximately 1/2 cup)` | `yellow onion` | 50.0 g |
| `2 cloves garlic (minced)` | `garlic` | 6.0 g |
| `1/2 cup dry white wine (pinot grigio, sauvignon blanc)` | `dry white wine (pinot grigio, sauvignon blanc)` | 120.0 ml |
| `1/4 cup fresh lemon juice` | `fresh lemon juice` | 60.0 ml |
| `1/3 cup sun-dried tomatoes (drained, chopped)` | `sun-dried tomatoes` | 60.0 g |
| `4 ounces crumbled goat cheese` | `goat cheese` | 100.0 g |
| `5-6 large leaves basil (chiffonaded)` | `leaves basil` | 500.0 g |

---

## Chicken Chashu

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 pound boneless chicken thighs` | `chicken thighs` | 453.59 g |
| `2 cups water` | `water` | 480.0 ml |
| `1 cup soy sauce` | `soy sauce` | 240.0 ml |
| `1 cup mirin` | `mirin` | 180.0 g |
| `1/2 cup sake or dry white wine` | `sake or dry white wine` | 120.0 ml |
| `1/2 cup sugar` | `sugar` | 102.0 g |
| `2-inch  knob ginger (optional)` | `-inch knob ginger` | 200.0 g |
| `1  shallot (peeled and sliced in half)` | `shallot` | 100.0 g |

---

## Chicken Etoufee

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 pound boneless, skinless chicken thighs (approximately 2-3 large chicken thighs)` | `chicken thighs` | 453.59 g |
| `1 tablespoon Cajun seasoning (salt-free recommended)` | `cajun seasoning` | 11.25 g |
| `1 tablespoon neutral-flavored oil (avocado oil, olive oil, vegetable oil, refined coconut oil)` | `neutral-flavored oil (avocado oil, olive oil, vegetable oil, refined coconut oil)` | 15.0 ml |
| `1/4 cup unsalted butter (cut into small pieces, at room temperature)` | `unsalted butter` | 72.0 g |
| `1/4 cup all-purpose flour` | `all-purpose flour` | 30.0 g |
| `1/2 cup chopped celery (approximately 1 large celery stalk)` | `celery` | 90.0 g |
| `1/2 cup chopped green bell pepper (approximately 1 medium bell pepper)` | `green bell pepper` | 90.0 g |
| `1/2 cup chopped white onion (approximately 1 small onion)` | `white onion` | 90.0 g |
| `4 cups chicken stock` | `chicken stock` | 960.0 ml |
| `2 tablespoons tomato paste` | `tomato paste` | 22.5 g |
| `1 tablespoon Worcestershire sauce` | `worcestershire sauce` | 15.0 ml |
| `1 tablespoon Cajun seasoning (salt-free recommended)` | `cajun seasoning` | 11.25 g |
| `1 teaspoon garlic powder` | `garlic powder` | 2.5 g |
| `1/4 teaspoon cayenne pepper (more or less to taste)` | `cayenne pepper` | 0.94 g |
| `1-2 teaspoons hot sauce (Louisiana or Crystal recommended; to taste)` | `hot sauce` | 5.0 ml |
| `salt (to taste)` | `salt` | 100.0 g |
| `cooked long-grain white rice` | `long-grain white rice` | 100.0 g |
| `1 cup thinly sliced scallions (green parts only, approximately 1 bunch)` | `scallions` | 180.0 g |
| `chopped parsley (optional)` | `parsley` | 100.0 g |

---

## Chicken Florentine Soup

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 tablespoons butter` | `butter` | 22.5 g |
| `4  garlic cloves (minced)` | `garlic cloves` | 400.0 g |
| `1  onion (diced)` | `onion` | 100.0 g |
| `1 cup carrots (diced)` | `carrots` | 180.0 g |
| `1 cup celery (diced)` | `celery` | 180.0 g |
| `3 tablespoons all purpose flour` | `all purpose flour` | 22.5 g |
| `1/2 teaspoon Italian seasoning` | `italian seasoning` | 1.88 g |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `1/4 teaspoon black pepper` | `black pepper` | 0.94 g |
| `1 quart chicken broth` | `chicken broth` | 960.0 ml |
| `1 cup half and half` | `half and half` | 240.0 g |
| `2 cups cooked chicken (diced or shredded)` | `chicken` | 360.0 g |
| `2 cups baby spinach` | `baby spinach` | 360.0 g |

---

## Chicken Gyoza

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 tablespoons rice vinegar` | `rice vinegar` | 30.0 ml |
| `2 tablespoons soy sauce` | `soy sauce` | 30.0 ml |
| `1 teaspoon ginger (grated)` | `ginger` | 3.75 g |
| `1 clove garlic (minced)` | `garlic` | 3.0 g |
| `1  scallion (chopped)` | `scallion` | 100.0 g |
| `1/2 teaspoon sesame oil` | `sesame oil` | 2.5 ml |
| `1 pound ground chicken` | `ground chicken` | 453.59 g |
| `2 cloves garlic (minced)` | `garlic` | 6.0 g |
| `1 1-inch knob ginger (grated)` | `1-inch knob ginger` | 100.0 g |
| `1 tablespoon finely diced scallions` | `scallions` | 11.25 g |
| `1 teaspoon sesame oil` | `sesame oil` | 5.0 ml |
| `1 teaspoon rice vinegar` | `rice vinegar` | 5.0 ml |
| `1 tablespoon soy sauce` | `soy sauce` | 15.0 ml |
| `1/4 teaspoon salt` | `salt` | 1.5 g |
| `1/4 teaspoon pepper` | `pepper` | 0.94 g |
| `1 12-ounce package gyoza wrappers (about 30 wrappers)` | `gyoza wrappers` | 300.0 g |
| `1/3 cup water` | `water` | 80.0 ml |
| `avocado oil (for frying)` | `avocado oil` | 100.0 ml |

---

## Chicken Omelette

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3 large eggs` | `eggs` | 300.0 g |
| `1/4 cup milk of choice` | `milk` | 60.0 ml |
| `1 pinch salt (more or less to taste)` | `salt` | 1.0 g |
| `1 pinch freshly ground black pepper (more or less to taste)` | `black pepper` | 1.0 g |
| `1 teaspoon neutral-flavored oil (avocado oil, olive oil, etc.)` | `neutral-flavored oil (avocado oil, olive oil, etc.)` | 5.0 ml |
| `1/3 cup shredded cooked chicken (or diced cooked chicken)` | `chicken` | 60.0 g |
| `1/4 cup shredded cheddar (or shredded gruyere)` | `cheddar` | 45.0 g |
| `1/4 cup finely chopped fresh spinach` | `fresh spinach` | 45.0 g |
| `2-4 tablespoons diced roma tomatoes (to taste)` | `roma tomatoes` | 22.5 g |

---

## Chicken Orzo Bake

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `non-stick cooking spray` | `non-stick cooking spray` | 100.0 g |
| `1 pound orzo` | `orzo` | 453.59 g |
| `3 cups low-sodium chicken broth` | `low-sodium chicken broth` | 720.0 ml |
| `3 cups cooked chicken (rotisserie or diced)` | `chicken` | 540.0 g |
| `1 cup heavy cream ( or whole milk)` | `heavy cream` | 240.0 ml |
| `3 cups baby spinach (coarsely chopped)` | `baby spinach` | 540.0 g |
| `1 pint cherry tomatoes (halved (or 1/3 cup sun-dried tomatoes, chopped))` | `cherry tomatoes` | 360.0 g |
| `5 cloves garlic (minced)` | `garlic` | 15.0 g |
| `1  lemon (zest and juice)` | `lemon` | 100.0 g |
| `1 teaspoon Italian seasoning` | `italian seasoning` | 3.75 g |
| `1 teaspoon salt` | `salt` | 6.0 g |
| `1/2 teaspoon black pepper` | `black pepper` | 1.88 g |
| `2/3 cup grated Parmesan cheese` | `parmesan cheese` | 75.2 g |
| `1 1/2 cups shredded mozzarella cheese` | `mozzarella cheese` | 169.2 g |

---

## Chicken Parm Sandwich

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 pound boneless, skinless chicken breasts (2 chicken breasts, depending on size)` | `chicken breasts` | 453.59 g |
| `1/2 cup all-purpose flour` | `all-purpose flour` | 60.0 g |
| `2 large eggs` | `eggs` | 200.0 g |
| `1 cup Italian breadcrumbs` | `italian breadcrumbs` | 108.0 g |
| `1 1/2 cups Panko breadcrumbs` | `panko breadcrumbs` | 162.0 g |
| `1/2 tablespoon kosher salt` | `kosher salt` | 9.0 g |
| `1/2 teaspoon black pepper` | `black pepper` | 1.88 g |
| `1/4 cup grated parmesan` | `parmesan` | 22.8 g |
| `neutral oil (for cooking)` | `neutral oil` | 100.0 ml |
| `1 cup shredded mozzarella` | `mozzarella` | 180.0 g |
| `1 cup marinara (warmed, divided)` | `marinara` | 180.0 g |
| `1 loaf ciabatta bread (or 4 ciabatta rolls)` | `ciabatta bread` | 450.0 g |
| `2 tablespoons fresh basil (chopped)` | `fresh basil` | 22.5 g |

---

## Chicken Pesto Caprese Sandwich

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 large boneless, skinless chicken breasts (approximately 1 pound)` | `chicken breasts` | 200.0 g |
| `1 tablespoon Italian seasoning` | `italian seasoning` | 11.25 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly cracked black pepper (to taste)` | `black pepper` | 100.0 g |
| `1 tablespoon avocado oil` | `avocado oil` | 15.0 ml |
| `4  ciabatta rolls (sliced in half horizontally)` | `ciabatta rolls` | 400.0 g |
| `4 tablespoons mayonnaise (divided, optional)` | `mayonnaise` | 45.0 g |
| `1/3 cup pesto (divided)` | `pesto` | 60.0 g |
| `6 ounces fresh mozzarella (sliced)` | `fresh mozzarella` | 100.0 g |
| `4  Roma tomatoes (sliced)` | `roma tomatoes` | 400.0 g |
| `avocado oil` | `avocado oil` | 100.0 ml |

---

## Chicken Pomodoro

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 pounds chicken breast cutlets` | `chicken breast cutlets` | 907.18 g |
| `1 teaspoon salt` | `salt` | 6.0 g |
| `1/2 teaspoon black pepper` | `black pepper` | 1.88 g |
| `1 tablespoon olive oil` | `olive oil` | 15.0 ml |
| `1/2  onion (chopped)` | `onion` | 50.0 g |
| `4  garlic cloves (minced)` | `garlic cloves` | 400.0 g |
| `1 cup cherry tomatoes (sliced in half)` | `cherry tomatoes` | 180.0 g |
| `1/2 cup chicken broth` | `chicken broth` | 120.0 ml |
| `2 tablespoons lemon juice` | `lemon juice` | 30.0 ml |
| `Additional salt and pepper (to taste)` | `additional salt and pepper` | 100.0 g |

---

## Chicken Rollatini

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/4 cup olive oil` | `olive oil` | 60.0 ml |
| `1 tablespoon fresh lemon juice` | `fresh lemon juice` | 15.0 ml |
| `1 cup Italian breadcrumbs` | `italian breadcrumbs` | 108.0 g |
| `6 medium boneless, skinless chicken cutlets (evenly sized, evenly thick; approximately 2-3 pounds)` | `chicken cutlets` | 480.0 g |
| `6 thin slices prosciutto` | `thin slices prosciutto` | 600.0 g |
| `6 slices  fresh provolone` | `fresh provolone` | 120.0 g |
| `8-10 slices fresh mozzarella  (or 2 large fresh mozzarella balls sliced into 4-5 pieces each)` | `fresh mozzarella` | 160.0 g |

---

## Chicken Spiedini

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 pounds chicken breasts (boneless, skinless)` | `chicken breasts` | 907.18 g |
| `salt (more or less to taste)` | `salt` | 100.0 g |
| `freshly ground black pepper (more or less to taste)` | `black pepper` | 100.0 g |
| `1/4 cup olive oil` | `olive oil` | 60.0 ml |
| `1/4 cup dry white wine (such as pinot grigio or sauvignon blanc)` | `dry white wine` | 60.0 ml |
| `2 tablespoons lemon juice` | `lemon juice` | 30.0 ml |
| `1 cup Italian seasoned breadcrumbs` | `italian seasoned breadcrumbs` | 108.0 g |
| `1/2 cup butter (1 stick)` | `butter` | 90.0 g |
| `4 cloves garlic (minced)` | `garlic` | 12.0 g |
| `1 tablespoon lemon juice` | `lemon juice` | 15.0 ml |
| `1 tablespoon fresh parsley (finely chopped)` | `fresh parsley` | 11.25 g |

---

## Chile Relleno Burrito

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4 large poblano peppers (approximately 4 ounces each)` | `poblano peppers` | 400.0 g |
| `8 ounces Monterey jack cheese (cut into 1-ounce strips)` | `monterey jack cheese` | 100.0 g |
| `1 cup all-purpose flour` | `all-purpose flour` | 120.0 g |
| `3 large eggs` | `eggs` | 300.0 g |
| `neutral oil (avocado oil, olive oil, etc.)` | `neutral oil (avocado oil, olive oil, etc.)` | 100.0 ml |
| `2 large avocados (pit removed, skin removed)` | `avocados` | 200.0 g |
| `1/2 tablespoon freshly squeezed lime juice (juice from approximately half of one lime)` | `freshly squeezed lime juice` | 7.5 ml |
| `salt (to taste)` | `salt` | 100.0 g |
| `4 10-inch or 12-inch flour tortillas` | `10-inch or 12-inch flour tortillas` | 400.0 g |
| `1/2 cup pico de gallo` | `pico de gallo` | 90.0 g |
| `2 cups cooked, shredded carnitas (or cooked, shredded chicken)` | `carnitas` | 360.0 g |

---

## 4-Ingredient Chili Cheese Dip

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 cup chili (or 1 15-ounce can chili)` | `chili` | 360.0 g |
| `8 ounces plain cream cheese` | `cream cheese` | 100.0 ml |
| `2 cups shredded cheddar cheese (divided)` | `cheddar cheese` | 225.6 g |
| `1/4 cup salsa` | `salsa` | 45.0 g |

---

## Chili's Southwest Chicken Soup

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3 tablespoons vegetable oil` | `vegetable oil` | 45.0 ml |
| `1 pound boneless skinless chicken breasts` | `chicken breasts` | 453.59 g |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `1/4 teaspoon black pepper` | `black pepper` | 0.94 g |
| `1  onion (chopped)` | `onion` | 100.0 g |
| `1  green bell pepper (chopped)` | `green bell pepper` | 100.0 g |
| `3  garlic cloves (minced)` | `garlic cloves` | 300.0 g |
| `1 tablespoon cumin` | `cumin` | 7.5 g |
| `1 tablespoon chili powder` | `chili powder` | 7.5 g |
| `2 teaspoons paprika` | `paprika` | 5.0 g |
| `1 quart chicken stock (see Notes)` | `chicken stock` | 960.0 ml |
| `1 (4-ounce) can diced green chiles` | `green chiles` | 400.0 g |
| `1 (10-ounce) can diced tomatoes` | `tomatoes` | 400.0 g |
| `1 cup white hominy (or navy beans, drained)` | `white hominy` | 180.0 g |
| `2 teaspoons lime juice` | `lime juice` | 10.0 ml |
| `1/4 cup fresh cilantro (chopped)` | `fresh cilantro` | 45.0 g |
| `corn tortilla chips (for serving)` | `corn tortilla chips` | 100.0 g |
| `shredded cheese or crumbled queso fresco (for serving)` | `cheese or queso fresco` | 100.0 g |

---

## Chinese Vegetable Soup

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 cups water` | `water` | 480.0 ml |
| `4 cups vegetable broth` | `vegetable broth` | 960.0 ml |
| `1 head bok choy (sliced)` | `bok choy` | 150.0 g |
| `8 ounces mushrooms (sliced)` | `mushrooms` | 100.0 g |
| `1 cup carrots (shredded)` | `carrots` | 180.0 g |
| `2 teaspoons soy sauce` | `soy sauce` | 10.0 ml |
| `1 clove garlic (minced)` | `garlic` | 3.0 g |
| `1 teaspoon fresh ginger (minced)` | `fresh ginger` | 3.75 g |
| `1/2 teaspoon sesame oil` | `sesame oil` | 2.5 ml |
| `2 teaspoons salt (plus more as needed)` | `salt` | 12.0 g |
| `pepper (to taste)` | `pepper` | 100.0 g |
| `cilantro (optional, for garnish)` | `cilantro` | 100.0 g |
| `scallions (optional, for garnish)` | `scallions` | 100.0 g |

---

## Chocolate Covered Almonds

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 1/2 cups almonds` | `almonds` | 198.0 g |
| `9 ounces dark chocolate` | `dark chocolate` | 100.0 g |
| `sea salt` | `sea salt` | 100.0 g |
| `chili powder (optional)` | `chili powder` | 100.0 g |

---

## Chocolate Covered Espresso Beans

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 cup espresso beans` | `espresso beans` | 180.0 g |
| `1 cup semi-sweet chocolate chips (or 1 milk chocolate bar)` | `semi-sweet chocolate chips` | 180.0 g |

---

## Coconut Bacon

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 cups unsweetened coconut flakes` | `unsweetened coconut flakes` | 264.0 g |
| `2 tablespoons lite tamari` | `lite tamari` | 22.5 g |
| `1 tablespoon liquid smoke` | `liquid smoke` | 11.25 g |
| `1 tablespoon maple syrup` | `maple syrup` | 15.0 ml |
| `1/4 teaspoon smoked paprika` | `smoked paprika` | 0.62 g |

---

## Cold Brew Green Tea Recipe

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `20 ounces cold filtered water` | `cold filtered water` | 100.0 ml |
| `3 bags green tea` | `green tea` | 900.0 g |
| `lemon slices (optional)` | `lemon slices` | 100.0 g |
| `1/4 teaspoon liquid sweetener (optional)` | `liquid sweetener` | 0.94 g |
| `fresh basil leaves (ripped by hand)` | `fresh basil leaves` | 100.0 g |

---

## Confit Potatoes

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 1/2-2 pounds baby potatoes` | `baby potatoes` | 680.38 g |
| `2-4 cups mild-tasting olive oil (enough to cover potatoes, see Notes)` | `mild olive oil` | 480.0 ml |
| `3 cloves garlic (smashed)` | `garlic` | 9.0 g |
| `1-2 sprigs fresh thyme` | `fresh thyme` | 3.0 g |
| `1-2 sprigs fresh rosemary` | `fresh rosemary` | 3.0 g |

---

## Copycat Texas Roadhouse Steak Seasoning

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 tablespoons kosher salt` | `kosher salt` | 36.0 g |
| `2 tablespoons brown sugar` | `brown sugar` | 25.5 g |
| `1 tablespoon black pepper` | `black pepper` | 11.25 g |
| `1 tablespoon paprika` | `paprika` | 7.5 g |
| `1 tablespoon garlic powder` | `garlic powder` | 7.5 g |
| `1 tablespoon onion powder` | `onion powder` | 7.5 g |
| `2 teaspoons chili powder` | `chili powder` | 5.0 g |
| `2 teaspoons smoked paprika` | `smoked paprika` | 5.0 g |
| `1 teaspoon turmeric` | `turmeric` | 3.75 g |
| `1 teaspoon cornstarch (helps the seasoning "stick" and crisp)` | `cornstarch` | 3.0 g |
| `1 teaspoon coarse sea salt (optional, for texture)` | `coarse sea salt` | 6.0 g |

---

## Country Omelette

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3 slices uncooked bacon (cut into 1-inch pieces)` | `uncooked bacon` | 60.0 g |
| `1 cup peeled and cubed potatoes (1-inch cubes)` | `and potatoes` | 180.0 g |
| `salt` | `salt` | 100.0 g |
| `freshly cracked black pepper` | `black pepper` | 100.0 g |
| `6 large eggs` | `eggs` | 600.0 g |
| `1 tablespoon butter` | `butter` | 11.25 g |
| `1/4 cup milk of choice` | `milk` | 60.0 ml |
| `2 tablespoons chopped fresh chives` | `fresh chives` | 22.5 g |

---

## Cranberry Brie Pull-Apart Bread

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1  large round sourdough bread (about 1 1/2 to 1 3/4 lbs, unsliced)` | `round sourdough bread` | 100.0 g |
| `1/2 cup butter (1 stick)` | `butter` | 90.0 g |
| `3 tablespoons honey` | `honey` | 45.0 ml |
| `1 teaspoon chopped fresh rosemary` | `fresh rosemary` | 3.75 g |
| `16  ounce wheel of brie (chopped or cubed)` | `wheel of brie` | 453.6 g |
| `1 1/2 cups whole berry cranberry sauce (fresh or canned is fine)` | `berry cranberry sauce` | 360.0 ml |
| `Kosher salt (to taste)` | `kosher salt` | 100.0 g |

---

## Cranberry Chicken Salad

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3 pounds cooked chicken (diced or shredded, cooled completely)` | `chicken` | 1360.77 g |
| `1 1/2 cups finely chopped apple (approximately 1 large apple, Granny Smith or honeycrisp)` | `apple` | 270.0 g |
| `1 1/2 cups very finely chopped celery` | `very celery` | 270.0 g |
| `1 cup dried cranberries` | `dried cranberries` | 180.0 g |
| `1 tablespoon fresh lemon juice` | `fresh lemon juice` | 15.0 ml |
| `1 cup mayonnaise` | `mayonnaise` | 180.0 g |
| `2 teaspoons dijon mustard` | `dijon mustard` | 7.5 g |
| `1 tablespoon chopped fresh parsley` | `fresh parsley` | 11.25 g |
| `1 teaspoon salt (more or less to taste)` | `salt` | 6.0 g |
| `1/4 teaspoon freshly ground black pepper (more or less to taste)` | `black pepper` | 0.94 g |

---

## Cream Cheese Fat Bombs

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `8 ounces cream cheese (softened)` | `cream cheese` | 100.0 ml |
| `4 ounces butter (softened)` | `butter` | 100.0 g |
| `3 tablespoons Confectioners Swerve Sweetener (or other powdered erythritol)` | `confectioners swerve sweetener` | 33.75 g |
| `1 teaspoon lemon juice` | `lemon juice` | 5.0 ml |
| `1 teaspoon vanilla` | `vanilla` | 3.75 g |
| `1 package (2 ounces) HighKey Snickerdoodle Mini Cookies (or other keto cookies, crumbled, see Notes)` | `highkey snickerdoodle mini cookies` | 300.0 g |

---

## Cream Cheese Sausage Balls

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 pound hot pork sausage` | `hot pork sausage` | 453.59 g |
| `8 ounce block cream cheese (softened)` | `block cream cheese` | 100.0 ml |
| `1 1/2 cups Bisquick baking mix` | `bisquick baking mix` | 270.0 g |
| `1 cup shredded cheddar cheese` | `cheddar cheese` | 112.8 g |

---

## Cream of Jalapeño Soup

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 tablespoons neutral oil (avocado oil, olive oil; plus more as needed)` | `neutral oil` | 30.0 ml |
| `5-6 large jalapeño peppers (approximately 1-1 1/4 pounds; stems removed, seeds removed, peppers minced)` | `jalapeño peppers` | 500.0 g |
| `1/2 of one small white onion (chopped, approximately 3/4 cup)` | `small white onion` | 50.0 g |
| `4 cloves garlic` | `garlic` | 12.0 g |
| `1/2 cup cilantro (leaves and stems)` | `cilantro` | 90.0 g |
| `4 cups low-sodium chicken broth (see Notes)` | `low-sodium chicken broth` | 960.0 ml |
| `1/2 teaspoon cumin` | `cumin` | 1.25 g |
| `1 teaspoon salt (more or less to taste)` | `salt` | 6.0 g |
| `4 ounces feta (at room temperature)` | `feta` | 100.0 g |
| `1 cup heavy cream (at room temperature)` | `heavy cream` | 240.0 ml |
| `1 tablespoon fresh lemon juice (more or less to taste)` | `fresh lemon juice` | 15.0 ml |

---

## Cream Of Onion Soup

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 tablespoon olive oil` | `olive oil` | 15.0 ml |
| `3 tablespoons butter` | `butter` | 33.75 g |
| `3 medium yellow onions (peeled, sliced; approximately 1 1/2 pounds total)` | `yellow onions` | 240.0 g |
| `3 stalks celery (chopped, approximately 1 cup)` | `celery` | 120.0 g |
| `1/2 teaspoon fresh thyme leaves (approximately 3 sprigs, stems removed)` | `fresh thyme leaves` | 1.88 g |
| `2 cloves garlic (minced)` | `garlic` | 6.0 g |
| `2 tablespoons all-purpose flour` | `all-purpose flour` | 15.0 g |
| `3 cups low-sodium chicken broth` | `low-sodium chicken broth` | 720.0 ml |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly ground black pepper (to taste)` | `black pepper` | 100.0 g |
| `1  bay leaf` | `bay leaf` | 100.0 g |
| `1/2 cup  heavy cream (at room temperature)` | `heavy cream` | 120.0 ml |
| `croutons` | `croutons` | 100.0 g |
| `warm baguettes (torn into small pieces if used as topping)` | `warm baguettes` | 100.0 g |
| `fried onions` | `fried onions` | 100.0 g |
| `cheddar cheese` | `cheddar cheese` | 100.0 g |
| `finely chopped parsley` | `parsley` | 100.0 g |

---

## Creamy Chicken Enchiladas

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 cups shredded cooked chicken  (can use a store-bought rotisserie chicken)` | `chicken` | 360.0 g |
| `1 cup corn (frozen or canned)` | `corn` | 180.0 g |
| `6-8  flour tortillas` | `flour tortillas` | 600.0 g |
| `2 cups shredded Monterey Jack cheese (or mozzarella)` | `monterey jack cheese` | 225.6 g |
| `1 cup salsa` | `salsa` | 180.0 g |
| `1  chipotle pepper` | `chipotle pepper` | 100.0 g |
| `1 cup sour cream or yogurt` | `sour cream or yogurt` | 240.0 ml |
| `1 tbsp taco seasoning` | `taco seasoning` | 11.25 g |
| `4 ounces canned diced green chiles` | `canned green chiles` | 100.0 g |

---

## Creamy Dill Sauce for Salmon

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/4 cup mayonnaise` | `mayonnaise` | 45.0 g |
| `3/4 cups sour cream` | `sour cream` | 180.0 ml |
| `1 tablespoon fresh lemon juice (juice from approximately 1 small lemon, more or less to taste)` | `fresh lemon juice` | 15.0 ml |
| `4 tablespoons chopped fresh dill` | `fresh dill` | 45.0 g |
| `1/8 teaspoon sea salt (more or less to taste)` | `sea salt` | 0.75 g |
| `1/8 teaspoon freshly cracked white pepper (more or less to taste)` | `white pepper` | 0.47 g |
| `fresh dill sprigs` | `fresh dill sprigs` | 100.0 g |

---

## Crispy Air Fryer Turkey Bacon

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 12-ounce package turkey bacon (any brand)` | `turkey bacon` | 300.0 g |

---

## Crockpot Cabbage

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/4 cup diced bacon (approximately 6 slices)` | `bacon` | 45.0 g |
| `1 cup chopped white onion (approximately 1 large onion)` | `white onion` | 180.0 g |
| `2 1/2 tablespoons minced fresh garlic (approximately 5 large cloves)` | `fresh garlic` | 28.12 g |
| `4-5 cups chopped green cabbage (approximately 1 small head cabbage)` | `green cabbage` | 720.0 g |
| `2 cups chicken broth (or vegetable broth)` | `chicken broth` | 480.0 ml |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly cracked black pepper (to taste)` | `black pepper` | 100.0 g |

---

## Crockpot Queso Dip

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 pound monterey jack cheese` | `monterey jack cheese` | 453.59 g |
| `8 ounces cream cheese` | `cream cheese` | 100.0 ml |
| `12 ounces evaporated milk (1 can)` | `evaporated milk` | 100.0 ml |
| `1 tablespoon cornstarch` | `cornstarch` | 9.0 g |
| `1 teaspoon garlic powder` | `garlic powder` | 2.5 g |
| `1 teaspoon salt` | `salt` | 6.0 g |
| `4 ounces green chiles (1 can)` | `green chiles` | 100.0 g |
| `4 ounces jalapeños (1 can, including juice)` | `jalapeños` | 100.0 g |

---

## Crockpot Spinach Artichoke Dip

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `8 ounces full-fat cream cheese (at room temperature)` | `full-fat cream cheese` | 100.0 ml |
| `1/4 cup full-fat mayonnaise` | `full-fat mayonnaise` | 45.0 g |
| `1/4 cup grated fresh parmesan (at room temperature)` | `fresh parmesan` | 22.8 g |
| `1 cup shredded fresh mozzarella cheese (at room temperature)` | `fresh mozzarella cheese` | 112.8 g |
| `2 cloves garlic (minced)` | `garlic` | 6.0 g |
| `1 12-ounce jar marinated artichoke hearts (drained, chopped)` | `marinated artichoke hearts` | 400.0 g |
| `2 cups frozen chopped spinach (defrosted or still frozen, see Notes)` | `frozen spinach` | 360.0 g |
| `1 teaspoon salt  (plus more to taste)` | `salt` | 6.0 g |
| `1 teaspoon freshly cracked black pepper (plus more to taste)` | `black pepper` | 3.75 g |
| `tortilla chips (white corn, yellow corn, or blue corn)` | `tortilla chips (white corn, yellow corn, or blue corn)` | 100.0 g |
| `pita chips (store-bought or make your own)` | `pita chips` | 100.0 g |
| `crostini` | `crostini` | 100.0 g |
| `naan dippers` | `naan dippers` | 100.0 g |
| `celery sticks` | `celery sticks` | 100.0 g |

---

## Crusted Chicken Romano

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/2 cup all-purpose flour` | `all-purpose flour` | 60.0 g |
| `1 teaspoon salt` | `salt` | 6.0 g |
| `1/2 teaspoon freshly cracked black pepper` | `black pepper` | 1.88 g |
| `1 large egg` | `egg` | 100.0 g |
| `1 tablespoon water (room temperature)` | `water` | 15.0 ml |
| `2 large chicken breasts (halved to make 4 cutlets)` | `chicken breasts` | 200.0 g |
| `1/2 cup freshly grated Romano cheese` | `romano cheese` | 56.4 g |
| `neutral oil (to fry chicken)` | `neutral oil` | 100.0 ml |

---

## Cucumber Chips

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 large cucumbers (approximately 8 ounces each)` | `cucumbers` | 200.0 g |
| `1 tablespoon avocado oil` | `avocado oil` | 15.0 ml |
| `1 tablespoon vinegar` | `vinegar` | 15.0 ml |
| `1/4 teaspoon sea salt (more or less to taste)` | `sea salt` | 1.5 g |

---

## Cucumber Salsa

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 medium cucumbers (approximately 8 ounces each; peeled, chopped)` | `cucumbers` | 160.0 g |
| `1 medium green bell pepper (approximately 5 ounces; stem removed, seeds removed, chopped)` | `green bell pepper` | 80.0 g |
| `2 medium red tomatoes (approximately 5 ounces each, chopped)` | `red tomatoes` | 160.0 g |
| `1 medium jalapeño pepper (stem removed, seeds removed, minced)` | `jalapeño pepper` | 80.0 g |
| `half of one medium red onion (chopped, approximately 1 cup)` | `half of one medium red onion` | 100.0 g |
| `2 cloves garlic (minced)` | `garlic` | 6.0 g |
| `1 tablespoon chopped fresh cilantro` | `fresh cilantro` | 11.25 g |
| `2 tablespoons fresh lime juice (juice from approximately 1 lime)` | `fresh lime juice` | 30.0 ml |
| `1 tablespoon olive oil` | `olive oil` | 15.0 ml |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `freshly ground black pepper (to taste)` | `black pepper` | 100.0 g |

---

## Deviled Egg Salad

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `6 large hard-boiled eggs (peeled, halved)` | `hard-boiled eggs` | 600.0 ml |
| `1/3 cup mayonnaise (see Notes)` | `mayonnaise` | 60.0 g |
| `1/4 cup chopped dill pickles (or dill pickle relish)` | `dill pickles` | 45.0 g |
| `1 tablespoon yellow mustard` | `yellow mustard` | 11.25 g |
| `1 teaspoon white vinegar` | `white vinegar` | 5.0 ml |
| `1/2 teaspoon paprika` | `paprika` | 1.25 g |
| `1/2 teaspoon garlic powder` | `garlic powder` | 1.25 g |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `1/2 teaspoon freshly cracked black pepper (more or less to taste)` | `black pepper` | 1.88 g |
| `additional paprika` | `additional paprika` | 100.0 g |
| `lettuce cups` | `lettuce cups` | 100.0 g |
| `bacon chips (made from this recipe)` | `bacon chips` | 100.0 g |
| `cucumber coins` | `cucumber coins` | 100.0 g |
| `celery sticks` | `celery sticks` | 100.0 g |
| `buttery crackers (or saltines)` | `buttery crackers` | 100.0 g |
| `croissants (or brioche buns)` | `croissants` | 100.0 g |

---

## Deviled Eggs

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `6  large hard-boiled eggs` | `hard-boiled eggs` | 600.0 ml |
| `1 teaspoon Dijon mustard` | `dijon mustard` | 3.75 g |
| `1/2 teaspoon white vinegar` | `white vinegar` | 2.5 ml |
| `1/4 cup mayonnaise` | `mayonnaise` | 45.0 g |
| `1/2-1 tablespoon unsalted butter (softened)` | `unsalted butter` | 9.0 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `paprika (for topping)` | `paprika` | 100.0 g |
| `chopped green onion or chives (optional, to serve)` | `green onion or chives` | 100.0 g |

---

## Diced Potatoes

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 pounds potatoes (peeled and 1-inch cubed)` | `potatoes` | 907.18 g |
| `2 tablespoons neutral oil (olive oil, avocado oil, etc.)` | `neutral oil (olive oil, avocado oil, etc.)` | 30.0 ml |
| `1 teaspoon dried herbs of choice (herbs de Provence, dried rosemary, dried oregano, etc.)` | `dried herbs (herbs de provence, dried rosemary, dried oregano, etc.)` | 3.75 g |
| `1 teaspoon salt (more or less to taste)` | `salt` | 6.0 g |
| `1/2 teaspoon freshly ground black pepper (more or less to taste)` | `black pepper` | 1.88 g |

---

## Duck Fried Rice

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 1/2 teaspoons sesame oil` | `sesame oil` | 7.5 ml |
| `1 cup diced duck breast` | `duck breast` | 180.0 g |
| `5 tablespoons soy sauce (divided)` | `soy sauce` | 75.0 ml |
| `4 tablespoons butter  (divided)` | `butter` | 45.0 g |
| `2 teaspoons fresh lemon juice` | `fresh lemon juice` | 10.0 ml |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly ground black pepper (to taste)` | `black pepper` | 100.0 g |
| `1/2 cup diced white onion` | `white onion` | 90.0 g |
| `1 cup frozen mixed vegetables` | `frozen mixed vegetables` | 180.0 g |
| `2 large eggs` | `eggs` | 200.0 g |
| `4 cups cooked white rice (completely cooled)` | `white rice` | 816.0 g |
| `sesame seeds` | `sesame seeds` | 100.0 g |
| `sliced green onions` | `green onions` | 100.0 g |

---

## London Fog Latte

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 bags earl grey tea` | `earl grey tea` | 600.0 g |
| `1 1/2 cups boiling water` | `boiling water` | 360.0 ml |
| `1 1/2 cups milk of choice (whole milk, almond milk, coconut milk, etc.)` | `milk (whole milk, almond milk, coconut milk, etc.)` | 360.0 ml |
| `1/2 teaspoon pure vanilla extract (see Notes)` | `vanilla extract` | 2.5 ml |
| `2 tablespoons honey (or 2 tablespoons vanilla syrup, see Notes)` | `honey` | 30.0 ml |

---

## Easy Salmon Patties with Creamy Lemon-Garlic Sauce

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/4 cup mayonnaise` | `mayonnaise` | 45.0 g |
| `1/2 cup plain Greek yogurt` | `greek yogurt` | 90.0 g |
| `1  tablespoon fresh lemon juice` | `fresh lemon juice` | 15.0 ml |
| `1 clove garlic (chopped)` | `garlic` | 3.0 g |
| `1 tablespoon freshly chopped parsley (plus more for garnish)` | `parsley` | 11.25 g |
| `16 ounces cooked salmon (or 1 14.75-ounce can canned salmon)` | `salmon` | 100.0 g |
| `2 large eggs (lightly beaten)` | `eggs` | 200.0 g |
| `1/2 cup chopped onion` | `onion` | 90.0 g |
| `2/3 cup fine almond flour` | `fine almond flour` | 80.0 g |
| `1/4 cup chopped fresh parsley` | `fresh parsley` | 45.0 g |
| `2 cloves garlic (chopped)` | `garlic` | 6.0 g |
| `2 tablespoons fresh lemon juice` | `fresh lemon juice` | 30.0 ml |
| `1/8 teaspoon sea salt (more or less to taste)` | `sea salt` | 0.75 g |
| `1/8 teaspoon freshly cracked black pepper (more or less to taste)` | `black pepper` | 0.47 g |
| `neutral oil (approximately 2-4 tablespoons as needed)` | `neutral oil` | 100.0 ml |
| `chopped fresh parsley` | `fresh parsley` | 100.0 g |
| `lemon wedges` | `lemon wedges` | 100.0 g |

---

## Quick & Easy Tuna Salad Recipe

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 5-ounce cans chunk light tuna (packed in water)` | `chunk light tuna` | 800.0 g |
| `1/2 cup mayonnaise` | `mayonnaise` | 90.0 g |
| `3 tablespoons finely chopped dill pickles (or dill relish)` | `dill pickles` | 33.75 g |
| `3 tablespoons finely chopped celery` | `celery` | 33.75 g |
| `2 tablespoons finely chopped onion` | `onion` | 22.5 g |
| `1/4 teaspoon paprika` | `paprika` | 0.62 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly cracked black pepper (to taste)` | `black pepper` | 100.0 g |
| `saltine crackers` | `saltine crackers` | 100.0 g |
| `2 slices toast` | `toast` | 40.0 g |

---

## Easy Vegan Lemon Curd

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 1/2 cups full-fat coconut milk (from a can)` | `full-fat coconut milk` | 360.0 ml |
| `1/2 cup freshly squeezed lemon juice (approximately 2 1/2 lemons)` | `freshly squeezed lemon juice` | 120.0 ml |
| `1/2 cup white sugar (see Notes)` | `white sugar` | 102.0 g |
| `2 tablespoons cornstarch` | `cornstarch` | 18.0 g |
| `1 tablespoon lemon zest` | `lemon zest` | 11.25 g |
| `1 small pinch turmeric (optional, for color)` | `pinch turmeric` | 50.0 g |

---

## Escarole Soup

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 tablespoons olive oil` | `olive oil` | 30.0 ml |
| `3 cloves garlic (minced or pressed)` | `garlic` | 9.0 g |
| `4 cups low-sodium chicken broth` | `low-sodium chicken broth` | 960.0 ml |
| `1 15-ounce can cannellini beans` | `cannellini beans` | 400.0 g |
| `1 1-ounce piece fresh parmesan  (or fresh parmesan rind)` | `fresh parmesan` | 100.0 g |
| `1 pinch red pepper flakes (more or less to taste)` | `red pepper flakes` | 1.0 g |
| `3/4 cup dry ditalini pasta` | `dry ditalini pasta` | 135.0 g |
| `1 pound escarole (rinsed well, chopped)` | `escarole` | 453.59 g |
| `1 tablespoon fresh lemon juice` | `fresh lemon juice` | 15.0 ml |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly cracked black pepper (to taste)` | `black pepper` | 100.0 g |
| `olive oil` | `olive oil` | 100.0 ml |
| `grated fresh parmesan cheese` | `fresh parmesan cheese` | 100.0 g |
| `crusty bread` | `crusty bread` | 100.0 g |

---

## Simple French Green Lentils Recipe

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 cup French green lentils` | `french green lentils` | 180.0 g |
| `4 cups water (or vegetable broth)` | `water` | 960.0 ml |
| `2 cloves garlic (smashed)` | `garlic` | 6.0 g |
| `2 large bay leaves (optional)` | `bay leaves` | 200.0 g |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |

---

## Frozen Biscuits in Air Fryer

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `6  frozen biscuits (any brand, any type)` | `frozen biscuits` | 600.0 g |
| `spray cooking oil` | `spray cooking oil` | 100.0 ml |

---

## Frozen Burgers in the Air Fryer (with Special Burger Sauce)

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4  frozen burger patties` | `frozen burger patties` | 400.0 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `black pepper (to taste)` | `black pepper` | 100.0 g |
| `1/2 cup mayonnaise` | `mayonnaise` | 90.0 g |
| `2 tablespoons ketchup` | `ketchup` | 22.5 g |
| `1 tablespoon dill pickle relish` | `dill pickle relish` | 11.25 g |
| `2 teaspoons onion powder` | `onion powder` | 5.0 g |
| `1 teaspoon soy sauce` | `soy sauce` | 5.0 ml |
| `1 pinch red pepper flakes` | `red pepper flakes` | 1.0 g |
| `1 pinch salt` | `salt` | 1.0 g |
| `4  hamburger buns` | `hamburger buns` | 400.0 g |
| `lettuce` | `lettuce` | 100.0 g |
| `tomato (sliced)` | `tomato` | 100.0 g |
| `onion (sliced)` | `onion` | 100.0 g |
| `cheese of choice` | `cheese` | 100.0 g |

---

## Frozen Burritos in the Air Fryer

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `air-fryer-safe spray oil` | `air-fryer-safe spray oil` | 100.0 ml |
| `2-4  frozen burritos` | `frozen burritos` | 200.0 g |
| `toppings of choice` | `toppings` | 100.0 g |

---

## Frozen Chicken Breasts in the Air Fryer

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 pound frozen boneless, skinless chicken breasts (approximately 2-3 chicken breasts depending on size)` | `frozen chicken breasts` | 453.59 g |
| `2 teaspoons olive oil (or avocado oil)` | `olive oil` | 10.0 ml |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `1/4 teaspoon freshly cracked black pepper (more or less to taste)` | `black pepper` | 0.94 g |

---

## Frozen Egg Rolls in the Air Fryer

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4  frozen egg rolls` | `frozen egg rolls` | 400.0 g |
| `spray oil (see Notes)` | `spray oil` | 100.0 ml |
| `green onion (for garnish, optional)` | `green onion` | 100.0 g |
| `sesame oil (for garnish, optional)` | `sesame oil` | 100.0 ml |
| `soy sauce (for dipping, optional)` | `soy sauce` | 100.0 ml |

---

## Easy Frozen Lemonade Recipe

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/2 cup fresh lemon juice (juice from approximately 4 large lemons)` | `fresh lemon juice` | 120.0 ml |
| `1/4 cup honey (see Notes)` | `honey` | 60.0 ml |
| `1/4 cup water` | `water` | 60.0 ml |
| `2 cups ice` | `ice` | 360.0 g |
| `lemon coins` | `lemon coins` | 100.0 g |

---

## Frozen Meatballs in Air Fryer

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 pound frozen meatballs (pre-cooked)` | `frozen meatballs` | 453.59 g |
| `teriyaki or tomato sauce (for serving)` | `teriyaki or tomato sauce` | 100.0 ml |

---

## Frozen Mozzarella Sticks in the Air Fryer

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `air-fryer-safe spray oil (optional)` | `air-fryer-safe spray oil` | 100.0 ml |
| `frozen mozzarella sticks` | `frozen mozzarella sticks` | 100.0 g |
| `marinara sauce (optional, for serving)` | `marinara sauce` | 100.0 ml |

---

## Frozen Pretzels in the Air Fryer

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4  frozen soft pretzels` | `frozen soft pretzels` | 400.0 g |
| `water (optional)` | `water` | 100.0 ml |
| `coarse kosher salt (optional)` | `coarse kosher salt` | 100.0 g |

---

## Frozen Shrimp in the Air Fryer

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 pound frozen shrimp (raw or cooked)` | `frozen shrimp` | 453.59 g |
| `spray cooking oil (see Notes)` | `spray cooking oil` | 100.0 ml |
| `salt and pepper (to taste)` | `salt and pepper` | 100.0 g |

---

## Frozen Sweet Potato Fries in the Air Fryer

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 15-ounce bag frozen sweet potato fries` | `frozen sweet potato fries` | 300.0 g |
| `1 tablespoon extra-virgin olive oil (or avocado oil)` | `extra-virgin olive oil` | 15.0 ml |
| `big pinch cinnamon` | `big pinch cinnamon` | 100.0 g |
| `Kosher salt` | `kosher salt` | 100.0 g |

---

## Frozen Waffles in the Air Fryer

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4  frozen waffles (see Notes)` | `frozen waffles` | 400.0 g |

---

## Garlic Butter Parsley Potatoes

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 1/2-2 pounds baby potatoes (cut into half)` | `baby potatoes` | 680.38 g |
| `1 teaspoon kosher salt` | `kosher salt` | 6.0 g |
| `3 tablespoons salted butter (sliced)` | `salted butter` | 54.0 g |
| `1/4 cup parsley (chopped)` | `parsley` | 45.0 g |
| `black pepper` | `black pepper` | 100.0 g |
| `3 cloves garlic (minced)` | `garlic` | 9.0 g |

---

## Glazed Pecans

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 tablespoons unsalted butter` | `unsalted butter` | 36.0 g |
| `1 teaspoon ground cinnamon` | `ground cinnamon` | 2.5 g |
| `2 tablespoons pure maple syrup` | `maple syrup` | 30.0 ml |
| `2 packed tablespoons dark brown sugar` | `tablespoons dark brown sugar` | 200.0 g |
| `salt (1 pinch up to 1 teaspoon, to taste)` | `salt` | 100.0 g |
| `2 cups raw pecan halves` | `pecan halves` | 360.0 g |

---

## Gluten Free Apple Cake

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/3 cup butter (softened)` | `butter` | 60.0 g |
| `2 cups sugar` | `sugar` | 408.0 g |
| `4  eggs` | `eggs` | 200.0 g |
| `2 1/2 cups gluten-free all-purpose flour` | `gluten-free all-purpose flour` | 300.0 g |
| `1/4 cup cornstarch` | `cornstarch` | 36.0 g |
| `1 Tablespoon apple cider vinegar` | `apple cider vinegar` | 15.0 ml |
| `5 cups peeled and chopped apples (about 4 large apples (see note))` | `and apples` | 900.0 g |
| `2 Teaspoons baking powder` | `baking powder` | 9.0 g |
| `1/2 Teaspoon salt` | `salt` | 3.0 g |
| `2 Teaspoons vanilla extract` | `vanilla extract` | 10.0 ml |
| `1/2 cup sugar` | `sugar` | 102.0 g |
| `1 Teaspoon cinnamon` | `cinnamon` | 2.5 g |
| `1 Tablespoon butter (melted)` | `butter` | 11.25 g |

---

## Gluten Free Chicken Parmesan

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 large boneless, skinless chicken breasts (approximately 8-10 ounces each, evenly sized)` | `chicken breasts` | 200.0 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly ground black pepper (to taste)` | `black pepper` | 100.0 g |
| `2 large eggs` | `eggs` | 200.0 g |
| `1 cup gluten-free breadcrumbs (plus more as needed)` | `gluten-free breadcrumbs` | 108.0 g |
| `1/2 cup grated fresh parmesan` | `fresh parmesan` | 45.6 g |
| `1/2 cup gluten-free all purpose flour` | `gluten-free all purpose flour` | 60.0 g |
| `1/2 cup avocado oil (approximate; enough to fill pan by 1/2-inch)` | `avocado oil` | 120.0 ml |
| `1/2 cup prepared tomato sauce` | `prepared tomato sauce` | 120.0 ml |
| `1 cup shredded fresh mozzarella` | `fresh mozzarella` | 180.0 g |
| `1/4 cup chopped fresh basil` | `fresh basil` | 45.0 g |
| `1/2 cup grated fresh provolone` | `fresh provolone` | 90.0 g |
| `1/2 cup grated fresh parmesan` | `fresh parmesan` | 45.6 g |
| `1 tablespoon olive oil` | `olive oil` | 15.0 ml |
| `gluten-free spaghetti` | `gluten-free spaghetti` | 100.0 g |
| `additional tomato sauce` | `additional tomato sauce` | 100.0 ml |

---

## Gluten Free Chicken Pot Pie

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 1/2 cups gluten-free all-purpose flour (with xanthan gum, plus more for rolling)` | `gluten-free all-purpose flour` | 300.0 g |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `2 4-ounce sticks unsalted butter (8 ounces total, cut into 1/2-inch cubes)` | `unsalted butter` | 226.0 g |
| `1 teaspoon apple cider vinegar` | `apple cider vinegar` | 5.0 ml |
| `1/3 cup cold water (up to 1/2 cup if needed)` | `cold water` | 80.0 ml |
| `2 cups low-sodium chicken broth (or chicken stock, see Notes)` | `low-sodium chicken broth` | 480.0 ml |
| `2 small red potatoes (approximately 4-5 ounces each, chopped into bite-sized pieces)` | `red potatoes` | 100.0 g |
| `1 medium stalk celery (diced, approximately 1/2 cup)` | `stalk celery` | 80.0 g |
| `1 medium carrot (finely chopped, approximately 1/2 cup)` | `carrot` | 80.0 g |
| `1/2 cup diced yellow onion` | `yellow onion` | 90.0 g |
| `1/2 cup frozen peas` | `frozen peas` | 90.0 g |
| `2 cups chopped roasted chicken` | `roasted chicken` | 360.0 g |
| `4 tablespoons unsalted butter` | `unsalted butter` | 72.0 g |
| `4 tablespoons gluten-free all-purpose flour (with xanthan gum)` | `gluten-free all-purpose flour` | 30.0 g |
| `1/2 cup milk (or half and half, at room temperature)` | `milk` | 120.0 ml |
| `1 tablespoon dried sage (see Notes)` | `dried sage` | 11.25 g |
| `1 tablespoon dried thyme` | `dried thyme` | 11.25 g |
| `1 pinch nutmeg` | `nutmeg` | 1.0 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly ground black pepper (to taste)` | `black pepper` | 100.0 g |

---

## Gluten Free Coffee Cake

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2/3 cup packed dark or light brown sugar` | `dark or light brown sugar` | 136.0 g |
| `3/4 cup gluten free all-purpose flour (spooned and leveled)` | `gluten free all-purpose flour` | 90.0 g |
| `2 1/2 teaspoons ground cinnamon` | `ground cinnamon` | 6.25 g |
| `6 tablespoons unsalted butter (cold and cubed)` | `unsalted butter` | 108.0 g |
| `1/2 cup unsalted butter (softened)` | `unsalted butter` | 144.0 g |
| `1/2 cup granulated sugar (or use 3/4 cup granulated sugar and no brown sugar)` | `granulated sugar` | 102.0 g |
| `1/4 cup light brown sugar (packed - omit if using 3/4 cup granulated sugar)` | `light brown sugar` | 51.0 g |
| `1 1/2 cups gluten free all-purpose flour (spooned and leveled)` | `gluten free all-purpose flour` | 180.0 g |
| `1 teaspoon baking powder` | `baking powder` | 4.5 g |
| `1/4 teaspoon baking soda` | `baking soda` | 1.12 g |
| `1/4 teaspoon salt` | `salt` | 1.5 g |
| `3/4 cup granulated sugar` | `granulated sugar` | 153.0 g |
| `2  large eggs (at room temperature)` | `eggs` | 200.0 g |
| `1 tablespoon pure vanilla extract` | `vanilla extract` | 15.0 ml |
| `1/2 cup full-fat sour cream (at room temperature*, or thick vegan yogurt)` | `full-fat sour cream` | 120.0 ml |
| `2 tablespoons milk (any kind, dairy or non-dairy, is fine)` | `milk` | 30.0 ml |
| `1/4 cup brown sugar` | `brown sugar` | 51.0 g |
| `2 teaspoons cinnamon` | `cinnamon` | 5.0 g |
| `1/2 cup powdered sugar` | `powdered sugar` | 102.0 g |
| `2-3 teaspoons milk of choice` | `milk` | 10.0 ml |

---

## Gluten Free Cookie Dough (Egg Free, Safe to Consume)

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 cup gluten-free all purpose flour` | `gluten-free all purpose flour` | 120.0 g |
| `3/4 packed cup light brown sugar` | `cup light brown sugar` | 75.0 g |
| `1/2 cup unsalted butter (softened to room temperature)` | `unsalted butter` | 144.0 g |
| `1 teaspoon pure vanilla extract` | `vanilla extract` | 5.0 ml |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `2 tablespoons milk of choice (whole milk, 2%, almond milk, coconut milk, etc.)` | `milk` | 30.0 ml |
| `1 cup mini chocolate chips` | `mini chocolate chips` | 180.0 g |

---

## Gluten Free Cream of Chicken Soup

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/4 cup cooked and chopped chicken` | `and chicken` | 45.0 g |
| `1 cup low-sodium chicken broth (see Notes)` | `low-sodium chicken broth` | 240.0 ml |
| `1 1/2 cups milk of choice (whole, 2%, almond, coconut, etc.; at room temperature)` | `milk` | 360.0 ml |
| `salt (to taste)` | `salt` | 100.0 g |
| `2 teaspoons all-purpose seasoning blend (or poultry seasoning)` | `all-purpose seasoning blend` | 7.5 g |
| `3/4 cup gluten-free all-purpose flour` | `gluten-free all-purpose flour` | 90.0 g |
| `1 1/2 cups low-sodium chicken broth (see Notes)` | `low-sodium chicken broth` | 360.0 ml |

---

## Gluten-Free Cream of Mushroom Soup

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `6 tablespoons unsalted butter (at room temperature)` | `unsalted butter` | 108.0 g |
| `4 teaspoons minced fresh garlic (approximately 4 large cloves)` | `fresh garlic` | 15.0 g |
| `1/2 cup diced onion` | `onion` | 90.0 g |
| `16 ounces sliced mushrooms` | `mushrooms` | 100.0 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly cracked black pepper (to taste)` | `black pepper` | 100.0 g |
| `1 tablespoon all-purpose seasoning (see Notes)` | `all-purpose seasoning` | 11.25 g |
| `1/2 cup gluten-free all-purpose flour (see Notes)` | `gluten-free all-purpose flour` | 60.0 g |
| `2 cups low-sodium vegetable broth` | `low-sodium vegetable broth` | 480.0 ml |
| `2 cups whole milk (at room temperature; see Notes)` | `milk` | 480.0 ml |

---

## Gluten Free Crepes

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 tablespoons salted butter` | `salted butter` | 36.0 g |
| `6 large eggs` | `eggs` | 600.0 g |
| `2 cups cornstarch` | `cornstarch` | 288.0 g |
| `4 cups milk (whole or 2%)` | `milk` | 960.0 ml |
| `1 1/2 tablespoons white sugar` | `white sugar` | 19.12 g |
| `whipped cream` | `whipped cream` | 100.0 ml |
| `strawberries (sliced)` | `strawberries` | 100.0 g |
| `blueberries` | `blueberries` | 100.0 g |
| `powdered sugar` | `powdered sugar` | 100.0 g |

---

## Gluten Free Croutons

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/2  loaf of gluten-free bread (about 9 ounces, cut into 3/4-inch cubes)` | `gluten-free bread` | 225.0 g |
| `3 tbsp olive oil (plus more as needed)` | `olive oil` | 45.0 ml |
| `1/2 teaspoon garlic powder` | `garlic powder` | 1.25 g |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `1/4 teaspoon black pepper` | `black pepper` | 0.94 g |

---

## Gluten Free Dutch Baby

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3  large eggs (at room temperature )` | `eggs` | 300.0 g |
| `1/2 cup corn starch` | `corn starch` | 72.0 g |
| `1/2 cup whole milk (at room temperature )` | `milk` | 120.0 ml |
| `1 Tbsp sugar` | `sugar` | 12.75 g |
| `3 Tbsp unsalted butter` | `unsalted butter` | 54.0 g |
| `confectioners sugar (for dusting)` | `confectioners sugar` | 100.0 g |
| `toppings (fresh fruit, syrup etc.)` | `toppings (fresh fruit, syrup etc.)` | 100.0 ml |

---

## Gluten Free Fried Chicken

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 cup buttermilk` | `buttermilk` | 240.0 ml |
| `2 cups gluten-free all-purpose flour (plus more as needed)` | `gluten-free all-purpose flour` | 240.0 g |
| `1 teaspoon paprika (plus more as needed)` | `paprika` | 2.5 g |
| `1 tablespoon salt (plus more as needed)` | `salt` | 18.0 g |
| `1 1/2 teaspoons freshly cracked black pepper (plus more as needed)` | `black pepper` | 5.62 g |
| `1 4-pound whole chicken (cut into separate pieces)` | `4-pound whole chicken` | 100.0 g |
| `vegetable oil (approximately 2 quarts, plus more as needed)` | `vegetable oil` | 100.0 ml |

---

## Gluten Free Ginger Snaps

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/4 cup granulated sugar` | `granulated sugar` | 51.0 g |
| `1 tablespoon ground cinnamon` | `ground cinnamon` | 7.5 g |
| `1 1/2 sticks unsalted butter (12 tablespoons)` | `unsalted butter` | 169.5 g |
| `1 packed cup brown sugar (dark preferred)` | `cup brown sugar` | 100.0 g |
| `1/4 cup molasses (regular or light)` | `molasses` | 60.0 g |
| `1 large egg` | `egg` | 100.0 g |
| `2 cups gluten-free all-purpose flour` | `gluten-free all-purpose flour` | 240.0 g |
| `2 teaspoons fresh baking soda` | `fresh baking soda` | 9.0 g |
| `1 teaspoon ground ginger` | `ground ginger` | 3.75 g |
| `1/2 teaspoon ground nutmeg` | `ground nutmeg` | 1.38 g |
| `1 teaspoon ground cinnamon` | `ground cinnamon` | 2.5 g |
| `1/2 teaspoon ground cloves` | `ground cloves` | 1.88 g |
| `1/4 teaspoon kosher salt` | `kosher salt` | 1.5 g |

---

## Gluten Free Gingerbread

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/2 cup butter (cubed, at room temperature)` | `butter` | 90.0 g |
| `1/2 packed cup brown sugar` | `cup brown sugar` | 50.0 g |
| `1 large egg (at room temperature)` | `egg` | 100.0 g |
| `1 cup unsulphured molasses (see Notes)` | `unsulphured molasses` | 240.0 g |
| `1 cup hot water (water should be hot but not bubbling or boiling)` | `hot water` | 240.0 ml |
| `1 teaspoon apple cider vinegar` | `apple cider vinegar` | 5.0 ml |
| `2 cups gluten-free all-purpose flour (see Notes)` | `gluten-free all-purpose flour` | 240.0 g |
| `1/2 teaspoon xanthan gum (omit if flour already contains xanthan gum)` | `xanthan gum` | 1.88 g |
| `2 teaspoons baking soda` | `baking soda` | 9.0 g |
| `2 teaspoons ground cinnamon` | `ground cinnamon` | 5.0 g |
| `1 1/2 teaspoons ground ginger` | `ground ginger` | 5.62 g |
| `1/4 teaspoon ground cloves` | `ground cloves` | 0.94 g |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `powdered sugar` | `powdered sugar` | 100.0 g |
| `whipped cream` | `whipped cream` | 100.0 ml |
| `whole fresh cranberries (or cherries)` | `fresh cranberries` | 100.0 g |

---

## Gluten Free Ground Beef Chili

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 tablespoon neutral oil (like avocado)` | `neutral oil` | 15.0 ml |
| `2 pounds ground beef (organic grass-fed)` | `ground beef` | 907.18 g |
| `1  onion (finely chopped)` | `onion` | 100.0 g |
| `5 cloves garlic (finely minced)` | `garlic` | 15.0 g |
| `28 ounce canned diced tomatoes (with liquid)` | `canned tomatoes` | 100.0 g |
| `14 ounce can kidney beans (drained)` | `kidney beans` | 400.0 g |
| `1/4 cup tomato paste` | `tomato paste` | 45.0 g |
| `1/4 cup chili powder` | `chili powder` | 30.0 g |
| `2 tablespoons cumin` | `cumin` | 15.0 g |
| `1 tablespoon salt` | `salt` | 18.0 g |
| `1 teaspoon pepper` | `pepper` | 3.75 g |
| `1/2 teaspoon smoked paprika` | `smoked paprika` | 1.25 g |
| `1 cup beef broth` | `beef broth` | 240.0 ml |

---

## Gluten Free King Cake

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 cup milk of choice (at room temperature)` | `milk` | 240.0 ml |
| `1/2 cup unsalted butter` | `unsalted butter` | 144.0 g |
| `1/2 cup warm water (between 105 degrees  and 115 degrees  Fahrenheit)` | `warm water` | 120.0 ml |
| `2 packets active dry yeast (approximately 4.5 teaspoons)` | `active dry yeast` | 60.0 g |
| `1 tablespoon granulated white sugar` | `granulated white sugar` | 12.75 g |
| `2 large eggs (at room temperature)` | `eggs` | 200.0 g |
| `2 teaspoons pure vanilla extract` | `vanilla extract` | 10.0 ml |
| `7 tablespoons granulated white sugar` | `granulated white sugar` | 89.25 g |
| `1 teaspoon apple cider vinegar` | `apple cider vinegar` | 5.0 ml |
| `2 teaspoons fresh gluten-free baking powder` | `fresh gluten-free baking powder` | 9.0 g |
| `1/4 teaspoon salt (more or less to taste)` | `salt` | 1.5 g |
| `5 1/2 cups Bob&#39;s Red Mill 1-to-1 Gluten-Free Baking Flour (see Notes)` | `bob&#39;s red mill 1-to-1 gluten-free baking flour` | 660.0 g |
| `1/2 cup unsalted butter` | `unsalted butter` | 144.0 g |
| `1 packed cup light brown sugar` | `cup light brown sugar` | 100.0 g |
| `1/2 cup Bob&#39;s Red Mill 1-to-1 Gluten-Free Baking Flour (see Notes)` | `bob&#39;s red mill 1-to-1 gluten-free baking flour` | 60.0 g |
| `1 tablespoon ground cinnamon` | `ground cinnamon` | 7.5 g |
| `2 cups powdered sugar` | `powdered sugar` | 408.0 g |
| `2 tablespoons milk of choice (plus more as needed)` | `milk` | 30.0 ml |
| `1 teaspoon pure vanilla extract` | `vanilla extract` | 5.0 ml |
| `1  plastic King Cake baby (or 1 whole coffee bean, optional)` | `plastic king cake baby` | 100.0 g |
| `purple sanding sugar (1 4-ounce container recommended, more or less as desired)` | `purple sanding sugar` | 100.0 g |
| `yellow sanding sugar (1 4-ounce container recommended, more or less as desired)` | `yellow sanding sugar` | 100.0 g |
| `green sanding sugar (1 4-ounce container recommended, more or less as desired)` | `green sanding sugar` | 100.0 g |

---

## Gluten Free Monkey Bread

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 1/2 cups whole milk (warmed to about 110 degrees F)` | `milk` | 360.0 ml |
| `1  instant yeast packet (2 and 1/4 teaspoons)` | `instant yeast packet` | 100.0 g |
| `1/3 cup granulated sugar` | `granulated sugar` | 68.0 g |
| `2  large eggs` | `eggs` | 200.0 g |
| `1/4 cup unsalted butter (melted and cooled slightly)` | `unsalted butter` | 72.0 g |
| `1 teaspoon salt` | `salt` | 6.0 g |
| `4 1/2 cups high quality gluten free all-purpose flour` | `high quality gluten free all-purpose flour` | 540.0 g |
| `1 1/4 cups granulated sugar` | `granulated sugar` | 255.0 g |
| `1 tablespoon ground cinnamon` | `ground cinnamon` | 7.5 g |
| `1 cup butter` | `butter` | 180.0 g |
| `1 teaspoon vanilla extract` | `vanilla extract` | 5.0 ml |
| `1/2 cup packed brown sugar` | `brown sugar` | 102.0 g |
| `1/4 teaspoon salt` | `salt` | 1.5 g |

---

## Gluten Free Monster Cookies

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 cups smooth peanut butter (like JIF, not natural - see notes)` | `smooth peanut butter` | 264.0 g |
| `6 tablespoons butter (room temperature)` | `butter` | 67.5 g |
| `1 1/2 cups brown sugar` | `brown sugar` | 306.0 g |
| `3  eggs` | `eggs` | 150.0 g |
| `1 1/2 teaspoon vanilla` | `vanilla` | 5.62 g |
| `1/4 teaspoon salt` | `salt` | 1.5 g |
| `3 cups gluten free old fashioned oats` | `gluten free old fashioned oats` | 259.2 g |
| `2 teaspoons baking soda` | `baking soda` | 9.0 g |
| `1 cup milk chocolate chips` | `milk chocolate chips` | 240.0 ml |
| `1 cup mini M&amp;Ms` | `mini m&amp;ms` | 180.0 g |
| `flake salt for topping (optional)` | `flake salt for topping` | 100.0 g |

---

## Gluten Free Mozzarella Sticks

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/4 cup all-purpose gluten-free flour` | `all-purpose gluten-free flour` | 30.0 g |
| `2  eggs` | `eggs` | 100.0 g |
| `1 tablespoon milk` | `milk` | 15.0 ml |
| `2 cups gluten-free panko breadcrumbs` | `gluten-free panko breadcrumbs` | 216.0 g |
| `salt and pepper (to taste)` | `salt and pepper` | 100.0 g |
| `1 tablespoon dried parsley` | `dried parsley` | 11.25 g |
| `1/2 teaspoon garlic powder` | `garlic powder` | 1.25 g |
| `1 teaspoon dried basil` | `dried basil` | 3.75 g |
| `1 teaspoon dried oregano` | `dried oregano` | 3.75 g |
| `12  mozzarella string cheese sticks` | `mozzarella string cheese sticks` | 1200.0 g |
| `oil (for frying)` | `oil` | 100.0 ml |
| `chopped parsley (optional, for garnish)` | `parsley` | 100.0 g |
| `marinara sauce (optional, for serving)` | `marinara sauce` | 100.0 ml |

---

## Gluten Free Mug Cake

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 tablespoons neutral-flavored oil (avocado oil, refined coconut oil, etc.)` | `neutral-flavored oil (avocado oil, refined coconut oil, etc.)` | 30.0 ml |
| `5 tablespoons milk of choice (whole, 2%, almond, coconut, etc.)` | `milk` | 75.0 ml |
| `1 teaspoon pure vanilla extract` | `vanilla extract` | 5.0 ml |
| `1/4 level cup gluten-free all-purpose flour (with xanthan gum, see Notes)` | `level cup gluten-free all-purpose flour` | 25.0 g |
| `2 tablespoons granulated white sugar (or granular Swerve, or coconut sugar)` | `granulated white sugar (or granular swerve, or coconut sugar)` | 25.5 g |
| `3 tablespoons baking cocoa powder` | `baking cocoa powder` | 22.5 g |
| `1/8 teaspoon fresh baking soda` | `fresh baking soda` | 0.56 g |
| `1/8 teaspoon salt` | `salt` | 0.75 g |
| `2 tablespoons chocolate chips` | `chocolate chips` | 22.5 g |

---

## Gluten Free Oatmeal Chocolate Chip Cookies

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 full sticks unsalted butter (8 ounces or 16 tablespoons, at room temperature)` | `full sticks unsalted butter` | 200.0 g |
| `3/4 cup packed light brown sugar` | `light brown sugar` | 153.0 g |
| `1/2 cup granulated white sugar` | `granulated white sugar` | 102.0 g |
| `2 large eggs` | `eggs` | 200.0 g |
| `1 teaspoon pure vanilla extract` | `vanilla extract` | 5.0 ml |
| `1 1/4 cups Bob&#39;s Red Mill 1-to-1 Gluten-Free Baking Flour` | `bob&#39;s red mill 1-to-1 gluten-free baking flour` | 150.0 g |
| `1 teaspoon fresh baking soda` | `fresh baking soda` | 4.5 g |
| `1 teaspoon ground cinnamon` | `ground cinnamon` | 2.5 g |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `3 cups gluten-free rolled oats` | `gluten-free rolled oats` | 259.2 g |
| `1 cup semi-sweet chocolate chips` | `semi-sweet chocolate chips` | 180.0 g |

---

## Gluten Free Onion Rings

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 medium sweet onions (sliced into rings)` | `sweet onions` | 160.0 g |
| `cornstarch (enough to dust sliced onions)` | `cornstarch` | 100.0 g |
| `neutral oil (for frying)` | `neutral oil` | 100.0 ml |
| `1/3 cup cornstarch` | `cornstarch` | 48.0 g |
| `1 1/2 cups gluten free flour blend` | `gluten free flour blend` | 180.0 g |
| `1/4 cup cornmeal` | `cornmeal` | 45.0 g |
| `1 teaspoon paprika` | `paprika` | 2.5 g |
| `2 teaspoons garlic powder` | `garlic powder` | 5.0 g |
| `1 teaspoon onion powder` | `onion powder` | 2.5 g |
| `2 teaspoons salt` | `salt` | 12.0 g |
| `1 cup milk (of your choice, see Notes)` | `milk` | 240.0 ml |
| `1 cup club soda` | `club soda` | 180.0 g |

---

## Gluten Free Peach Cobbler

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 stick unsalted butter` | `unsalted butter` | 113.0 g |
| `2 cups gluten-free all-purpose flour` | `gluten-free all-purpose flour` | 240.0 g |
| `1 tablespoon fresh baking powder` | `fresh baking powder` | 13.5 g |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `1 3/4 cups granulated sugar` | `granulated sugar` | 357.0 g |
| `2 cups milk of choice` | `milk` | 480.0 ml |
| `3-4 cups sliced peaches (see Notes)` | `peaches` | 540.0 g |
| `1 stick unsalted butter (cut into small pieces)` | `unsalted butter` | 113.0 g |
| `1/4 cup granulated sugar` | `granulated sugar` | 51.0 g |

---

## Gluten Free Pecan Pie

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 cup Karo dark corn syrup` | `karo dark corn syrup` | 240.0 ml |
| `3 large eggs (at room temperature)` | `eggs` | 300.0 g |
| `1 packed cup brown sugar (light or dark)` | `cup brown sugar` | 100.0 g |
| `2 tablespoons butter (melted)` | `butter` | 22.5 g |
| `1 1/2 teaspoons pure vanilla extract` | `vanilla extract` | 7.5 ml |
| `2 cups pecans (whole or coarsely chopped)` | `pecans` | 360.0 g |
| `1 9-inch ready-to-bake gluten-free pie crust` | `9-inch ready-to-bake gluten-free pie crust` | 100.0 g |

---

## Gluten Free Pineapple Upside Down Cake

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/4 cup unsalted butter (melted but not bubbling)` | `unsalted butter` | 72.0 g |
| `2/3 cup packed brown sugar (light or dark)` | `brown sugar` | 136.0 g |
| `8-10  pineapple slices (1 20-ounce can, drained well, slices patted dry)` | `pineapple slices` | 800.0 g |
| `18  maraschino cherries` | `maraschino cherries` | 1800.0 g |
| `1/4 cup unsalted butter (at room temperature)` | `unsalted butter` | 72.0 g |
| `1 cup granulated sugar` | `granulated sugar` | 204.0 g |
| `1 teaspoon pure vanilla extract` | `vanilla extract` | 5.0 ml |
| `1 large egg (at room temperature)` | `egg` | 100.0 g |
| `1 1/3 cups gluten-free all-purpose flour (must contain xanthan gum)` | `gluten-free all-purpose flour` | 160.0 g |
| `2 teaspoons fresh baking powder (see Notes)` | `fresh baking powder` | 9.0 g |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `1/3 cup full-fat sour cream` | `full-fat sour cream` | 80.0 ml |
| `2/3 cup milk of choice` | `milk` | 160.0 ml |

---

## Gluten Free Potato Soup

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/4 cup diced bacon (approximately 5 strips)` | `bacon` | 45.0 g |
| `1/4 cup bacon grease (reserved after cooking bacon)` | `bacon grease` | 45.0 g |
| `1 cup diced white onion (or yellow onion; approximately 1 medium onion)` | `white onion` | 180.0 g |
| `2 tablespoons minced garlic (approximately 4 large cloves)` | `garlic` | 22.5 g |
| `2 pounds Yukon gold potatoes (peeled, diced)` | `yukon gold potatoes` | 907.18 g |
| `4 cups chicken stock` | `chicken stock` | 960.0 ml |
| `3/4 cup heavy cream (at room temperature)` | `heavy cream` | 180.0 ml |
| `1 teaspoon salt (more or less to taste)` | `salt` | 6.0 g |
| `1/2 teaspoon freshly cracked black pepper (more or less to taste)` | `black pepper` | 1.88 g |
| `1 cup shredded cheddar cheese (at room temperature)` | `cheddar cheese` | 112.8 g |
| `2/3 cup full-fat sour cream (at room temperature)` | `full-fat sour cream` | 160.0 ml |
| `1/4 cup heavy cream (at room temperature)` | `heavy cream` | 60.0 ml |
| `3 tablespoons cornstarch` | `cornstarch` | 27.0 g |
| `shredded cheddar cheese` | `cheddar cheese` | 100.0 g |
| `sliced green onions` | `green onions` | 100.0 g |

---

## Gluten Free Pound Cake

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 1/2 cups unsalted butter (at room temperature)` | `unsalted butter` | 432.0 g |
| `1 8-ounce block full-fat cream cheese (at room temperature)` | `block full-fat cream cheese` | 100.0 ml |
| `2 1/2 cups granulated sugar` | `granulated sugar` | 510.0 g |
| `6 large eggs (at room temperature)` | `eggs` | 600.0 g |
| `2 1/2 cups King Arthur gluten-free measure for measure flour` | `king arthur gluten-free measure for measure flour` | 300.0 g |
| `1/4 cup cornstarch` | `cornstarch` | 36.0 g |
| `1/2 teaspoon fresh baking powder` | `fresh baking powder` | 2.25 g |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `2 teaspoons pure vanilla extract` | `vanilla extract` | 10.0 ml |

---

## Gluten Free Pumpkin Muffins

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2  eggs` | `eggs` | 100.0 g |
| `15 oz can pumpkin purée` | `pumpkin purée` | 400.0 g |
| `3/4 cup melted butter (vegan butter works as well)` | `butter` | 135.0 g |
| `3/4 cup brown sugar` | `brown sugar` | 153.0 g |
| `1/4 cup water` | `water` | 60.0 ml |
| `2  eggs (or 2 egg substitute like JustEgg)` | `eggs` | 100.0 g |
| `1 teaspoon vanilla extract` | `vanilla extract` | 5.0 ml |
| `2 cups gluten-free all-purpose flour (like Bob's Red Mill or Pillsbury. Make sure it's high quality!)` | `gluten-free all-purpose flour` | 240.0 g |
| `1/2 cup white sugar` | `white sugar` | 102.0 g |
| `2 teaspoons pumpkin pie spice` | `pumpkin pie spice` | 5.0 g |
| `1 teaspoon salt` | `salt` | 6.0 g |
| `1 teaspoon baking soda` | `baking soda` | 4.5 g |
| `1 teaspoon ground cinnamon` | `ground cinnamon` | 2.5 g |
| `1/4 teaspoon gluten-free baking powder` | `gluten-free baking powder` | 1.12 g |
| `3/4 cup gluten-free all-purpose flour` | `gluten-free all-purpose flour` | 90.0 g |
| `1/2 cup packed light or dark brown sugar` | `light or dark brown sugar` | 102.0 g |
| `1 teaspoon store-bought or homemade pumpkin pie spice` | `store-bought or homemade pumpkin pie spice` | 2.5 g |
| `6 tablespoons unsalted butter (melted, vegan is fine)` | `unsalted butter` | 108.0 g |
| `3/4 cup powdered sugar` | `powdered sugar` | 153.0 g |
| `2 tablespoons maple syrup` | `maple syrup` | 30.0 ml |
| `2 teaspoon milk of choice (plus more as needed to thin to desired consistency)` | `milk` | 10.0 ml |

---

## Gluten Free Roux

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `6 tablespoons butter (or drippings)` | `butter` | 67.5 g |
| `1/2 cup gluten free flour` | `gluten free flour` | 60.0 g |
| `1/2 cup butter (or drippings)` | `butter` | 90.0 g |
| `1/2 cup cassava flour` | `cassava flour` | 60.0 g |

---

## Gluten Free Scalloped Potato Gratin

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3 pounds yukon gold potatoes (thinly sliced)` | `yukon gold potatoes` | 1360.77 g |
| `1/2  onion (thinly sliced)` | `onion` | 50.0 g |
| `1/3 cup gluten free all-purpose flour (divided)` | `gluten free all-purpose flour` | 40.0 g |
| `1/4 cup butter (diced and divided)` | `butter` | 45.0 g |
| `1 teaspoon salt` | `salt` | 6.0 g |
| `1/4 teaspoon ground black pepper` | `ground black pepper` | 0.94 g |
| `1 teaspoon garlic powder` | `garlic powder` | 2.5 g |
| `2 teaspoons fresh thyme leaves (chopped, divided)` | `fresh thyme leaves` | 7.5 g |
| `2 cups whole milk` | `milk` | 480.0 ml |
| `1 cup vegetable stock ( or chicken stock)` | `vegetable stock` | 240.0 ml |
| `2 cups grated cheddar` | `cheddar` | 360.0 g |

---

## Gluten Free Teriyaki Sauce

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 cup water` | `water` | 240.0 ml |
| `1/4 cup gluten-free soy sauce (or tamari)` | `gluten-free soy sauce` | 60.0 ml |
| `6 packed tablespoons brown sugar (1/4 cup + 2 tablespoons)` | `tablespoons brown sugar` | 600.0 g |
| `1 tablespoon honey` | `honey` | 15.0 ml |
| `1/2 teaspoon ground ginger` | `ground ginger` | 1.88 g |
| `1/4 teaspoon garlic powder` | `garlic powder` | 0.62 g |
| `2 tablespoons cornstarch` | `cornstarch` | 18.0 g |
| `1/4 cup cold water` | `cold water` | 60.0 ml |

---

## Gluten Free Tiramisu

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4 large  egg yolks` | `egg yolks` | 400.0 g |
| `1/2 cup granulated sugar (divided)` | `granulated sugar` | 102.0 g |
| `3/4 cup heavy cream` | `heavy cream` | 180.0 ml |
| `1 cup mascarpone (8 ounces)` | `mascarpone` | 180.0 g |
| `3 cups espresso  (or VERY strong coffee)` | `espresso` | 540.0 g |
| `1/4 cup amaretto (coffee liqueur, or cognac)` | `amaretto (coffee liqueur, or cognac)` | 30.0 g |
| `approx 24 Schar gluten-free ladyfingers` | `schar gluten-free ladyfingers` | 2400.0 g |
| `2 tablespoons unsweetened cocoa powder` | `unsweetened cocoa powder` | 15.0 g |
| `1 to 2 ounces bittersweet chocolate (for shaving, optional)` | `to bittersweet chocolate` | 100.0 g |

---

## Gluten-Free Tomato Soup

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 tablespoon olive oil` | `olive oil` | 15.0 ml |
| `1/2  yellow onion (chopped)` | `yellow onion` | 50.0 g |
| `1  carrot (chopped)` | `carrot` | 100.0 g |
| `1  celery stalk (chopped)` | `celery stalk` | 100.0 g |
| `3  garlic cloves (minced)` | `garlic cloves` | 300.0 g |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `2 cups gluten-free vegetable or chicken stock` | `gluten-free vegetable or chicken stock` | 480.0 ml |
| `1 (28-ounce) can diced tomatoes (undrained)` | `tomatoes` | 400.0 g |
| `1 cup heavy cream` | `heavy cream` | 240.0 ml |

---

## Easy Gluten Free Turkey Gravy

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/2 cup butter` | `butter` | 90.0 g |
| `1 cup gluten-free all-purpose flour` | `gluten-free all-purpose flour` | 120.0 g |
| `1/2 - 1 teaspoon black pepper` | `black pepper` | 1.88 g |
| `4-5 cups pan drippings (or stock, or add more stock to make 4 cups pan drippings, plus 1 cup more for desired consistency)` | `pan drippings` | 720.0 g |

---

## Gluten Free Zucchini Muffins

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3  large eggs (at room temperature )` | `eggs` | 300.0 g |
| `2/3 cup vegetable (or melted refined coconut oil)` | `vegetable` | 120.0 g |
| `1/2 cup granulated sugar` | `granulated sugar` | 102.0 g |
| `1/3 cup brown sugar (see notes)` | `brown sugar` | 68.0 g |
| `1 1/2 cups gluten-free all-purpose flour (with xanthan gum )` | `gluten-free all-purpose flour` | 180.0 g |
| `1 tsp gluten-free baking powder` | `gluten-free baking powder` | 4.5 g |
| `1/2 tsp baking soda` | `baking soda` | 2.25 g |
| `1/2 tsp salt` | `salt` | 3.0 g |
| `2 tsp ground cinnamon` | `ground cinnamon` | 5.0 g |
| `1/2 tbsp pure vanilla extract` | `vanilla extract` | 7.5 ml |
| `2 cups zucchini (shredded)` | `zucchini` | 360.0 g |
| `coarse sugar (optional, for sprinkling on top)` | `coarse sugar` | 100.0 g |

---

## Greek Shrimp Salad with Feta and Rice

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 pound dry orzo (cooked to al dente, cooled completely)` | `dry orzo` | 453.59 g |
| `3/4 cup chopped parsley` | `parsley` | 135.0 g |
| `1 cup diced cucumber (approximately 1 medium cucumber)` | `cucumber` | 180.0 g |
| `1 1/2 cups diced tomatoes (seeded, approximately 2 medium tomatoes)` | `tomatoes` | 270.0 g |
| `1 pound medium shrimp (deveined, peeled, fully cooked)` | `medium shrimp` | 453.59 g |
| `1 cup thinly sliced scallions (approximately 3 scallions)` | `scallions` | 180.0 g |
| `1/2 cup chopped kalamata olives` | `kalamata olives` | 90.0 g |
| `6 ounces crumbled feta` | `feta` | 100.0 g |
| `2 cloves garlic (chopped)` | `garlic` | 6.0 g |
| `2-3 tablespoons fresh lemon juice (to taste)` | `fresh lemon juice` | 30.0 ml |
| `1/3 cup olive oil` | `olive oil` | 80.0 ml |
| `1 teaspoon salt (to taste)` | `salt` | 6.0 g |
| `2 teaspoons dried oregano` | `dried oregano` | 7.5 g |

---

## Grilled Acorn Squash with Cinnamon Butter

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/4 cup butter` | `butter` | 45.0 g |
| `1/2 teaspoon  cinnamon  (more or less to taste)` | `cinnamon` | 1.25 g |
| `1/2 teaspoon nutmeg (more or less to taste)` | `nutmeg` | 1.38 g |
| `1 pinch salt (more or less to taste)` | `salt` | 1.0 g |
| `2 medium acorn squashes  (approximately 4 pounds total, cut into 1/2-inch-thick slices)` | `acorn squashes` | 160.0 g |
| `2 tablespoons maple syrup` | `maple syrup` | 30.0 ml |
| `1/4 cup toasted pumpkin seeds (optional, for serving)` | `pumpkin seeds` | 39.0 g |

---

## Grilled Adobo Chicken

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/2 cup low-sodium soy sauce` | `low-sodium soy sauce` | 120.0 ml |
| `1/3 cup rice vinegar` | `rice vinegar` | 80.0 ml |
| `6 cloves garlic (minced)` | `garlic` | 18.0 g |
| `2-3  bay leaves` | `bay leaves` | 200.0 g |
| `1/2 teaspoon whole peppercorns` | `peppercorns` | 1.88 g |
| `2 teaspoons brown sugar (or coconut sugar, or Brown Swerve)` | `brown sugar (or coconut sugar, or brown swerve)` | 8.5 g |
| `2 tablespoons olive oil` | `olive oil` | 30.0 ml |
| `1/4 teaspoon red pepper flakes (optional, more or less to taste)` | `red pepper flakes` | 0.94 g |
| `1-2  green onions (sliced, plus more for garnish)` | `green onions` | 100.0 g |
| `4 medium boneless, skinless chicken breasts (approximately 2 pounds total; equally sized)` | `chicken breasts` | 320.0 g |

---

## Grilled Asparagus in Foil

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 pound asparagus (ends trimmed)` | `asparagus` | 453.59 g |
| `2 tablespoons olive oil` | `olive oil` | 30.0 ml |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `1/4 teaspoon freshly ground black pepper (more or less to taste)` | `black pepper` | 0.94 g |
| `fresh lemon juice (to taste, optional, for serving)` | `fresh lemon juice` | 100.0 ml |
| `grated parmesan cheese (to taste, optional, for serving)` | `parmesan cheese` | 100.0 g |

---

## Grilled Broccolini

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 1/2 pounds broccolini (approximately 1 large bunch or 2 small bunches)` | `broccolini` | 680.38 g |
| `3 tablespoons olive oil` | `olive oil` | 45.0 ml |
| `1 tablespoon  fresh lemon juice` | `fresh lemon juice` | 15.0 ml |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `1/4 teaspoon freshly cracked black pepper (more or less to taste)` | `black pepper` | 0.94 g |
| `1/2 teaspoon garlic powder (more or less to taste)` | `garlic powder` | 1.25 g |
| `1/4 teaspoon  crushed red pepper flakes (optional)` | `crushed red pepper flakes` | 0.94 g |
| `1/4 cup freshly grated parmesan` | `parmesan` | 22.8 g |

---

## Grilled Chicken And Rice

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 large chicken breasts (approximately 1 1/2 to 2 pounds, see Notes)` | `chicken breasts` | 200.0 g |
| `3 tablespoons olive oil` | `olive oil` | 45.0 ml |
| `1 tablespoon dijon mustard` | `dijon mustard` | 11.25 g |
| `1 tablespoon lemon juice` | `lemon juice` | 15.0 ml |
| `3 cloves garlic (minced)` | `garlic` | 9.0 g |
| `1/2 tablespoon soy sauce (see Notes)` | `soy sauce` | 7.5 ml |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `1/4 teaspoon pepper (more or less to taste)` | `pepper` | 0.94 g |
| `1 cup jasmine or basmati rice (uncooked)` | `jasmine or basmati rice` | 204.0 g |
| `1 tablespoon olive oil` | `olive oil` | 15.0 ml |
| `1 tablespoon butter (divided)` | `butter` | 11.25 g |
| `1/2 teaspoon garlic powder` | `garlic powder` | 1.25 g |
| `1/2 teaspoon onion powder` | `onion powder` | 1.25 g |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `1/2 teaspoon dried parsley (or 1 teaspoon fresh parsley)` | `dried parsley` | 1.88 g |
| `2 cups chicken broth` | `chicken broth` | 480.0 ml |
| `1 tablespoon  chopped fresh parsley (optional, for garnish)` | `fresh parsley` | 11.25 g |

---

## Grilled Cod in Foil with Lemon Butter Sauce

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4  cod fillets` | `cod fillets` | 400.0 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly ground black pepper (to taste)` | `black pepper` | 100.0 g |
| `1  lemon (sliced into coins)` | `lemon` | 100.0 g |
| `fresh chopped parsley (to garnish)` | `fresh parsley` | 100.0 g |
| `1/4 cup lemon juice` | `lemon juice` | 60.0 ml |
| `2 tablespoons butter (melted)` | `butter` | 22.5 g |
| `3 cloves garlic (minced)` | `garlic` | 9.0 g |

---

## Grilled Crab Legs with Garlic-Butter Sauce

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3 pounds king crab legs (defrosted if frozen)` | `king crab legs` | 1360.77 g |
| `1/2 cup butter (melted but not boiling, see Notes)` | `butter` | 90.0 g |
| `1/4 cup chopped fresh parsley` | `fresh parsley` | 45.0 g |
| `3 cloves garlic (minced)` | `garlic` | 9.0 g |
| `1 tablespoon fresh lemon juice` | `fresh lemon juice` | 15.0 ml |
| `1 pinch salt (to taste)` | `salt` | 1.0 g |
| `1 pinch freshly cracked black pepper (to taste)` | `black pepper` | 1.0 g |

---

## Grilled Mango with Chili-Lime Salt

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 medium ripe mangoes` | `mangoes` | 160.0 g |
| `spray cooking oil` | `spray cooking oil` | 100.0 ml |
| `1  lime (juiced)` | `lime` | 100.0 g |
| `2 teaspoons salt` | `salt` | 12.0 g |
| `1 teaspoon lime zest` | `lime zest` | 3.75 g |
| `1/2 teaspoon chili powder` | `chili powder` | 1.25 g |

---

## Grilled Meatloaf

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 pounds lean ground beef (85/15 or 93/7)` | `ground beef` | 907.18 g |
| `1 small onion (diced)` | `onion` | 50.0 g |
| `1 large egg` | `egg` | 100.0 g |
| `3/4 cup breadcrumbs (plain or seasoned)` | `breadcrumbs` | 81.0 g |
| `1/2 cup ketchup` | `ketchup` | 90.0 g |
| `2 cloves garlic (minced)` | `garlic` | 6.0 g |
| `2 teaspoons salt (more or less to taste)` | `salt` | 12.0 g |
| `1/2 teaspoon freshly cracked black pepper` | `black pepper` | 1.88 g |
| `1/2 cup ketchup` | `ketchup` | 90.0 g |
| `2 packed tablespoons brown sugar (see Notes)` | `tablespoons brown sugar` | 200.0 g |
| `1 teaspoon yellow mustard` | `yellow mustard` | 3.75 g |
| `1 teaspoon Worcestershire sauce` | `worcestershire sauce` | 5.0 ml |

---

## Grilled Peaches with Honey

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3-4 medium peaches (uniform in size)` | `peaches` | 240.0 g |
| `4 tablespoons honey (or maple syrup)` | `honey` | 60.0 ml |
| `1/8 teaspoon cinnamon (more or less to taste)` | `cinnamon` | 0.31 g |
| `1/8 teaspoon salt (more or less to taste)` | `salt` | 0.75 g |
| `vanilla yogurt (or plain Greek yogurt)` | `vanilla yogurt` | 100.0 g |
| `vanilla ice cream` | `vanilla ice cream` | 100.0 ml |
| `additional honey` | `additional honey` | 100.0 ml |
| `chopped fresh mint` | `fresh mint` | 100.0 g |
| `chopped pistachios` | `pistachios` | 100.0 g |

---

## Grilled Pork Belly

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 3-pound slab pork belly (skin on, center cut)` | `3-pound slab pork belly` | 100.0 g |
| `1/2 cup soy sauce` | `soy sauce` | 120.0 ml |
| `1/2 cup honey` | `honey` | 120.0 ml |
| `3 tablespoons lime juice` | `lime juice` | 45.0 ml |
| `1 tablespoon chili paste (optional)` | `chili paste` | 11.25 g |

---

## Grilled Spaghetti Squash

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 medium spaghetti squash (approximately 3 pounds)` | `spaghetti squash` | 80.0 g |
| `1 tablespoon olive oil (or other neutral oil, divided)` | `olive oil` | 15.0 ml |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly cracked black pepper (to taste)` | `black pepper` | 100.0 g |

---

## Grilled Spatchcock Turkey with Gravy

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 medium to large whole turkey (12 to 18 pounds, thawed if frozen)` | `to large whole turkey` | 80.0 g |
| `1 medium onion (roughly chopped)` | `onion` | 80.0 g |
| `16  lemon wedges (2 lemons)` | `lemon wedges` | 1600.0 g |
| `1 stick unsalted butter (softened)` | `unsalted butter` | 113.0 g |
| `2 tablespoons finely chopped poultry herb blend` | `poultry herb blend` | 22.5 g |
| `1 teaspoon garlic powder` | `garlic powder` | 2.5 g |
| `1 teaspoon onion powder` | `onion powder` | 2.5 g |
| `1 teaspoon freshly cracked black pepper` | `black pepper` | 3.75 g |
| `1 cup reserved turkey drippings (divided)` | `reserved turkey drippings` | 180.0 g |
| `1/2 cup all-purpose flour` | `all-purpose flour` | 60.0 g |
| `2 cups low-sodium chicken stock (or turkey stock)` | `low-sodium chicken stock` | 480.0 ml |
| `1/2 teaspoon salt (more or less to taste, see Notes)` | `salt` | 3.0 g |
| `1/2 teaspoon freshly cracked black pepper (more or less to taste)` | `black pepper` | 1.88 g |

---

## Grilled Turkey Breast

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `9  cups cold water (divided, plus more if needed)` | `cold water` | 2160.0 ml |
| `1/2 cup salt` | `salt` | 144.0 g |
| `1/4 packed cup brown sugar (see Notes)` | `cup brown sugar` | 25.0 g |
| `ice cubes (as needed)` | `ice cubes` | 100.0 g |
| `1 tablespoon whole peppercorns` | `peppercorns` | 11.25 g |
| `3 sprigs fresh rosemary` | `fresh rosemary` | 9.0 g |
| `4 sprigs fresh thyme` | `fresh thyme` | 12.0 g |
| `2-3  bay leaves` | `bay leaves` | 200.0 g |
| `3-4  fresh sage leaves` | `fresh sage leaves` | 300.0 g |
| `1 medium lemon (halved)` | `lemon` | 80.0 g |
| `1 medium orange (halved)` | `orange` | 80.0 g |
| `1 4-7 pound bone-in turkey breast (see Notes)` | `4-7 pound turkey breast` | 100.0 g |
| `6 tablespoons unsalted butter (at room temperature)` | `unsalted butter` | 108.0 g |
| `1 tablespoon high-quality olive oil` | `high-quality olive oil` | 15.0 ml |
| `1 tablespoon finely chopped poultry herb blend` | `poultry herb blend` | 11.25 g |
| `1  teaspoon garlic powder` | `garlic powder` | 2.5 g |
| `1/2 teaspoon onion powder` | `onion powder` | 1.25 g |
| `1/2 teaspoon freshly cracked black pepper` | `black pepper` | 1.88 g |

---

## Guacamole Salad

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 tablespoon olive oil` | `olive oil` | 15.0 ml |
| `1 tablespoon lime juice (preferably fresh)` | `lime juice` | 15.0 ml |
| `1/2 teaspoon minced garlic (1 medium clove)` | `garlic` | 1.88 g |
| `1/2 teaspoon cumin (more or less to taste)` | `cumin` | 1.25 g |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `1/2 teaspoon cayenne pepper (optional, more or less to taste)` | `cayenne pepper` | 1.88 g |
| `3-4 cups diced avocado (approximately 2 large avocados, 8-10 ounces each)` | `avocado` | 540.0 g |
| `1 cup halved cherry tomatoes` | `cherry tomatoes` | 180.0 g |
| `1 cup diced red onion (half of 1 medium red onion)` | `red onion` | 180.0 g |
| `2 tablespoons chopped fresh cilantro` | `fresh cilantro` | 22.5 g |
| `1 tablespoon minced jalapeño (see Notes)` | `jalapeño` | 11.25 g |

---

## Hasselback Sweet Potatoes

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 large sweet potatoes` | `sweet potatoes` | 200.0 g |
| `1/2 tablespoon olive oil` | `olive oil` | 7.5 ml |
| `1/2 tablespoon butter (melted)` | `butter` | 5.62 g |
| `2 cloves garlic (minced)` | `garlic` | 6.0 g |
| `1 tablespoon fresh rosemary (chopped)` | `fresh rosemary` | 11.25 g |
| `1/2 teaspoon salt (plus more to taste)` | `salt` | 3.0 g |
| `pepper (to taste)` | `pepper` | 100.0 g |

---

## Hazelnut Soup with Parsnips

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 tablespoons unsalted butter` | `unsalted butter` | 36.0 g |
| `2 cups sliced leeks` | `leeks` | 360.0 g |
| `1 1/2 tablespoons minced garlic (approximately 3 large cloves)` | `garlic` | 16.88 g |
| `2 teaspoons minced fresh thyme` | `fresh thyme` | 7.5 g |
| `1 cup roughly chopped hazelnuts (roasted or not)` | `hazelnuts` | 132.0 g |
| `2 teaspoons salt (more or less to taste)` | `salt` | 12.0 g |
| `1/4 teaspoon freshly cracked black pepper (plus more to taste)` | `black pepper` | 0.94 g |
| `1/2 cup sherry (or additional broth)` | `sherry` | 90.0 g |
| `2 cups roughly chopped parsnips (peeled first, approximately 3 parsnips)` | `parsnips` | 360.0 g |
| `1 cup chopped red potatoes (approximately 1 6-ounce red potato)` | `red potatoes` | 180.0 g |
| `4 cups chicken broth (or vegetable broth)` | `chicken broth` | 960.0 ml |
| `1 cup half-and-half (at room temperature)` | `half-and-half` | 180.0 g |
| `2 tablespoons sherry` | `sherry` | 22.5 g |
| `chopped fresh thyme` | `fresh thyme` | 100.0 g |
| `chopped hazelnuts` | `hazelnuts` | 100.0 g |

---

## Healthy Chicken Tinga Tostadas

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 1/2 cups salsa` | `salsa` | 270.0 g |
| `1  chipotle pepper` | `chipotle pepper` | 100.0 g |
| `1/2 tablespoon adobo sauce` | `adobo sauce` | 7.5 ml |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `1/2 teaspoon cumin` | `cumin` | 1.25 g |
| `1/2 teaspoon Mexican oregano` | `mexican oregano` | 1.88 g |
| `1 tablespoon olive oil` | `olive oil` | 15.0 ml |
| `1 1/2 cups cooked shredded chicken` | `chicken` | 270.0 g |
| `1  can refried beans` | `refried beans` | 400.0 g |
| `8  corn tortillas` | `corn tortillas` | 800.0 g |
| `oil (to brush tortillas)` | `oil` | 100.0 ml |
| `2  avocados` | `avocados` | 200.0 g |
| `1  Lime (juiced)` | `lime` | 100.0 g |
| `Salt` | `salt` | 100.0 g |
| `Fresh salsa (to top)` | `fresh salsa` | 100.0 g |
| `Shredded lettuce (to top)` | `lettuce` | 100.0 g |
| `Shredded cheese or crumbled queso fresco (to top)` | `cheese or queso fresco` | 100.0 g |

---

## Healthy No Knead Cinnamon Rolls with Cream Cheese Frosting

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 3/4 cups all-purpose flour` | `all-purpose flour` | 210.0 g |
| `1 tablespoon baking powder` | `baking powder` | 13.5 g |
| `1 1/4 teaspoons salt (optional)` | `salt` | 7.5 g |
| `1 1/4 cups plain Greek yogurt` | `greek yogurt` | 225.0 g |
| `1/2 cup brown sweetener (like Swerve)` | `brown sweetener` | 90.0 g |
| `1 1/2 tablespoons cinnamon` | `cinnamon` | 11.25 g |
| `3 tablespoons coconut oil (melted, or softened butter)` | `coconut oil` | 45.0 ml |
| `1/2 cup cream cheese` | `cream cheese` | 120.0 ml |
| `2 tablespoons powdered sweetener (like Swerve)` | `powdered sweetener` | 15.0 g |
| `milk (to thin)` | `milk` | 100.0 ml |

---

## Creamy Chicken Tortilla Soup

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 tablespoons avocado oil (or neutral oil)` | `avocado oil` | 30.0 ml |
| `1  small yellow onion (finely chopped)` | `yellow onion` | 50.0 g |
| `1  red bell pepper (finely chopped)` | `red bell pepper` | 100.0 g |
| `3-4  cloves garlic (minced)` | `garlic` | 9.0 g |
| `1 tablespoon chili powder (optional, but adds depth)` | `chili powder` | 7.5 g |
| `3 tablespoons cornstarch` | `cornstarch` | 27.0 g |
| `6 cups chicken broth` | `chicken broth` | 1440.0 ml |
| `2 cups cooked chicken (chopped or shredded)` | `chicken` | 360.0 g |
| `4  soft corn tortillas (cut into small squares)` | `soft corn tortillas` | 400.0 g |
| `14.5 ounce can diced tomatoes (undrained)` | `tomatoes` | 400.0 g |
| `4 ounce can diced green chiles (undrained)` | `green chiles` | 400.0 g |
| `1 teaspoon ground cumin` | `ground cumin` | 2.5 g |
| `1/2 teaspoon dried oregano` | `dried oregano` | 1.88 g |
| `1/2-1 teaspoon cayenne pepper (optional for heat)` | `cayenne pepper` | 1.88 g |
| `3/4-1 teaspoon salt (to taste)` | `salt` | 4.5 g |
| `3 tablespoons fresh lime juice` | `fresh lime juice` | 45.0 ml |
| `1 can black beans (drained)` | `black beans` | 400.0 g |
| `1 1/2- 2 cups shedded cheese (like Mexican blend, Monterey, mild cheddar - optional)` | `shedded cheese` | 169.2 g |
| `Fresh cilantro (chopped, for serving)` | `fresh cilantro` | 100.0 g |
| `Tortilla strips or crushed tortilla chips (for serving)` | `tortilla strips or crushed tortilla chips` | 100.0 g |
| `splash  heavy cream or half-and-half (optional, for extra richness)` | `splash heavy cream or half-and-half` | 100.0 ml |

---

## Healthy Lemon Muffins

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 3/4 cup gluten-free flour` | `gluten-free flour` | 210.0 g |
| `1 cup coconut sugar` | `coconut sugar` | 204.0 g |
| `3  eggs` | `eggs` | 150.0 g |
| `1 cup ricotta cheese` | `ricotta cheese` | 112.8 g |
| `2 tablespoons olive oil` | `olive oil` | 30.0 ml |
| `1 tablespoon lemon zest (grated)` | `lemon zest` | 11.25 g |
| `1 tablespoon lemon juice (fresh)` | `lemon juice` | 15.0 ml |
| `1/2 cup butter (softened)` | `butter` | 90.0 g |
| `1/2 teaspoon baking powder` | `baking powder` | 2.25 g |
| `1/2 teaspoon baking soda` | `baking soda` | 2.25 g |
| `1/2 teaspoon salt` | `salt` | 3.0 g |

---

## Healthy Taco Bowls (Chicken or Beef!)

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 1/2 pounds boneless skinless chicken thighs (or breasts if you prefer, but thighs give loads of flavor - OR ground beef)` | `chicken thighs` | 680.38 g |
| `1 tablespoon olive oil` | `olive oil` | 15.0 ml |
| `2 tablespoon taco seasoning` | `taco seasoning` | 22.5 g |
| `juice of 1/2 lime` | `juice of 1/2 lime` | 100.0 ml |
| `1/4 cup water (if using beef)` | `water` | 60.0 ml |
| `3 cups cooked rice (white, jasmine, brown, or cilantro-lime rice)` | `rice (white, jasmine, brown, or cilantro-lime rice)` | 612.0 g |
| `1 1/2 cups frozen or canned corn (drained)` | `frozen or canned corn` | 270.0 g |
| `1 cup cherry tomatoes (halved)` | `cherry tomatoes` | 180.0 g |
| `1 cup shredded sharp cheddar (or Monterey Jack)` | `sharp cheddar` | 180.0 g |
| `Fresh cilantro (chopped)` | `fresh cilantro` | 100.0 g |
| `Lime wedges` | `lime wedges` | 100.0 g |
| `2  large avocados (mashed)` | `avocados` | 200.0 g |
| `Juice of 1 lime` | `juice of 1 lime` | 100.0 ml |
| `1/4 cup chopped red onion (optional)` | `red onion` | 45.0 g |
| `2 tablespoons chopped fresh cilantro (optional)` | `fresh cilantro` | 22.5 g |
| `1/2 cup ranch dressing` | `ranch dressing` | 90.0 g |
| `1/4 cup salsa` | `salsa` | 45.0 g |
| `1 teaspoon taco seasoning` | `taco seasoning` | 3.75 g |

---

## High Protein Blueberry Muffins

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 1/2 cups all purpose flour (spooned and leveled, plus 1 tsp)` | `all purpose flour` | 180.0 g |
| `1 cup fresh blueberries (plus more for topping muffins)` | `fresh blueberries` | 180.0 g |
| `pinch cinnamon` | `cinnamon` | 1.0 g |
| `1/2 cup vanilla whey protein powder` | `vanilla whey protein powder` | 60.0 g |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `1/2 teaspoon baking soda` | `baking soda` | 2.25 g |
| `2 teaspoons lemon zest` | `lemon zest` | 7.5 g |
| `1 teaspoon baking powder` | `baking powder` | 4.5 g |
| `1 cup cottage cheese (mashed with potato masher, if desired)` | `cottage cheese` | 112.8 g |
| `1/3 cup maple syrup` | `maple syrup` | 80.0 ml |
| `1/3 cup oil of choice (preferably avocado, or other neutral oil)` | `oil (preferably avocado, or other neutral oil)` | 80.0 ml |
| `1 tablespoon vanilla extract` | `vanilla extract` | 15.0 ml |
| `2  eggs` | `eggs` | 100.0 g |
| `1/2 cup white sugar (or swerve)` | `white sugar` | 102.0 g |
| `1/3 cup all-purpose flour` | `all-purpose flour` | 40.0 g |
| `1/4 cup butter (cubed)` | `butter` | 45.0 g |
| `1 1/2 teaspoons ground cinnamon` | `ground cinnamon` | 3.75 g |
| `pinch salt` | `salt` | 1.0 g |

---

## High Protein Buffalo Chicken Dip

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 cup cottage cheese` | `cottage cheese` | 112.8 g |
| `1 tablespoon ranch seasoning` | `ranch seasoning` | 11.25 g |
| `1/4 cup buffalo sauce (plus more to serve)` | `buffalo sauce` | 60.0 ml |
| `1/4 cup shredded cheddar cheese (plus more to serve)` | `cheddar cheese` | 28.2 g |
| `1 cup shredded chicken breast (about 1/2 lb or 1 boneless, skinless chicken breast)` | `chicken breast` | 180.0 g |
| `2  green onions (sliced green and white separated )` | `green onions` | 200.0 g |
| `crumbled blue cheese (optional, to serve)` | `blue cheese` | 100.0 g |

---

## Homemade Pickles

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 gallon pickling cucumbers (about 4 pounds)` | `gallon pickling cucumbers` | 100.0 g |
| `1/3 cup dried minced onion` | `dried onion` | 60.0 g |
| `6  garlic cloves (minced)` | `garlic cloves` | 600.0 g |
| `1/2 tablespoon mustard seed` | `mustard seed` | 4.88 g |
| `6 heads fresh dill (see notes)` | `fresh dill` | 900.0 g |
| `1 1/2 quart water` | `water` | 1440.0 ml |
| `2 cups apple cider vinegar` | `apple cider vinegar` | 480.0 ml |
| `1/2 cup salt (canning or kosher)` | `salt` | 144.0 g |

---

## Homemade Pita Chips

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4  pitas` | `pitas` | 400.0 g |
| `1/3 cup olive oil` | `olive oil` | 80.0 ml |
| `1/2 teaspoon sea salt` | `sea salt` | 3.0 g |
| `za&#39;atar (optional)` | `za&#39;atar` | 100.0 g |

---

## Homemade Taco Sauce

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 8-ounce cans tomato sauce` | `tomato sauce` | 800.0 ml |
| `2/3 cup water` | `water` | 160.0 ml |
| `2 tablespoons white vinegar` | `white vinegar` | 30.0 ml |
| `1 tablespoon cumin (more or less to taste)` | `cumin` | 7.5 g |
| `2 teaspoons garlic powder (more or less to taste)` | `garlic powder` | 5.0 g |
| `2 teaspoons onion powder (more or less to taste)` | `onion powder` | 5.0 g |
| `1 teaspoon white sugar (more or less to taste)` | `white sugar` | 4.25 g |
| `1/2 teaspoon chili powder (more or less to taste)` | `chili powder` | 1.25 g |
| `1/2 teaspoon paprika (more or less to taste)` | `paprika` | 1.25 g |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `1/4 teaspoon cayenne pepper (more or less to taste)` | `cayenne pepper` | 0.94 g |

---

## Crispy Baked Hot Honey Chicken

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 cup buttermilk` | `buttermilk` | 240.0 ml |
| `1 teaspoon salt` | `salt` | 6.0 g |
| `2 pounds boneless, skinless chicken breasts (or boneless, skinless chicken thighs)` | `chicken breasts` | 907.18 g |
| `3 cups cornflakes (finely crushed, or panko breadcrumbs)` | `cornflakes` | 540.0 g |
| `1/2 cup all-purpose flour` | `all-purpose flour` | 60.0 g |
| `2 teaspoons salt` | `salt` | 12.0 g |
| `2 teaspoons paprika` | `paprika` | 5.0 g |
| `1 1/2 teaspoons garlic powder` | `garlic powder` | 3.75 g |
| `1 teaspoon ground mustard powder` | `ground mustard powder` | 2.5 g |
| `1 teaspoon freshly ground black pepper` | `black pepper` | 3.75 g |
| `1/2 cup honey` | `honey` | 120.0 ml |
| `1-2 teaspoons crushed red pepper flakes (to taste)` | `crushed red pepper flakes` | 3.75 g |
| `1/2 tablespoon apple cider vinegar` | `apple cider vinegar` | 7.5 ml |

---

## How to Blanch Potatoes (Step-By-Step with Photos and Video)

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3 pounds whole potatoes (any variety)` | `potatoes` | 1360.77 g |
| `room-temperature water` | `room-temperature water` | 100.0 ml |
| `1 big pinch salt (more or less to taste)` | `big pinch salt` | 100.0 g |

---

## Perfect Boiled Artichokes (with 3 Dipping Sauces)

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3 tablespoons salt` | `salt` | 54.0 g |
| `1 medium lemon (halved)` | `lemon` | 80.0 g |
| `2 medium fresh artichokes` | `fresh artichokes` | 160.0 g |
| `1/4 cup Greek yogurt` | `greek yogurt` | 45.0 g |
| `1/4 cup mayonnaise` | `mayonnaise` | 45.0 g |
| `1 teaspoon Cajun seasoning` | `cajun seasoning` | 3.75 g |
| `1/8 teaspoon smoked paprika (plus more to taste)` | `smoked paprika` | 0.31 g |
| `salt (to taste, optional)` | `salt` | 100.0 g |
| `1/4 cup Greek yogurt` | `greek yogurt` | 45.0 g |
| `1/4 cup mayonnaise` | `mayonnaise` | 45.0 g |
| `1-2 cloves garlic (minced)` | `garlic` | 3.0 g |
| `1/2 tablespoon minced fresh dill` | `fresh dill` | 5.62 g |
| `salt (to taste, optional)` | `salt` | 100.0 g |
| `1/4 cup butter (at room temperature)` | `butter` | 45.0 g |
| `1/4 cup mayonnaise` | `mayonnaise` | 45.0 g |

---

## How To Boil Sweet Potatoes

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3 pounds sweet potatoes (washed, peeled, cubed)` | `sweet potatoes` | 1360.77 g |
| `cold water (enough to cover potatoes)` | `cold water` | 100.0 ml |
| `1 big pinch salt` | `big pinch salt` | 100.0 g |

---

## How to Cook Turkey Bacon in the Oven

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 12-ounce package turkey bacon` | `turkey bacon` | 300.0 g |

---

## How to Make Cucumber Water

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2  cucumbers (thinly sliced)` | `cucumbers` | 200.0 g |
| `10 cups water (roughly, this was for an 80 oz pitcher)` | `water` | 2400.0 ml |

---

## How to Make Oat Milk

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 cups rolled oats` | `rolled oats` | 172.8 g |
| `8 cups water (plus more)` | `water` | 1920.0 ml |
| `3  dates (pitted)` | `dates` | 300.0 g |
| `2 teaspoons vanilla extract` | `vanilla extract` | 10.0 ml |
| `1 pinch salt` | `salt` | 1.0 g |
| `1 teaspoon cinnamon (optional)` | `cinnamon` | 2.5 g |

---

## How to Reheat Fried Chicken in The Air Fryer

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4 pieces leftover fried chicken (or more, if desired)` | `leftover fried chicken` | 400.0 g |

---

## How to Reheat Fries in the Air Fryer

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `leftover fries` | `leftover fries` | 100.0 g |

---

## How to Steam Potatoes

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `water` | `water` | 100.0 ml |
| `1 1/2 pounds petite potatoes (washed, unpeeled)` | `petite potatoes` | 680.38 g |
| `3 tablespoons butter` | `butter` | 33.75 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly ground black pepper (to taste)` | `black pepper` | 100.0 g |
| `fresh parsley (chopped, to taste)` | `fresh parsley` | 100.0 g |

---

## Chocolate-Covered Infused Strawberries

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 pounds strawberries (stems intact)` | `strawberries` | 907.18 g |
| `3 cups alcohol of choice (plus more if needed, see Notes for suggestions)` | `alcohol` | 540.0 g |
| `6 ounces dark chocolate (chips or bar)` | `dark chocolate` | 100.0 g |
| `6 ounces white chocolate (chips or bar)` | `white chocolate` | 100.0 g |
| `2 teaspoons coconut oil (if needed to help chocolate melt )` | `coconut oil` | 10.0 ml |

---

## Instant Pot Asparagus

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 pound asparagus (ends trimmed)` | `asparagus` | 453.59 g |
| `1 cup water` | `water` | 240.0 ml |
| `1/4 cup butter` | `butter` | 45.0 g |
| `3  garlic cloves (minced)` | `garlic cloves` | 300.0 g |
| `1 tablespoon lemon juice` | `lemon juice` | 15.0 ml |
| `1/2 teaspoon salt` | `salt` | 3.0 g |

---

## Instant Pot Bacon

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `6  slices bacon (cut in half)` | `bacon` | 120.0 g |

---

## Instant Pot Basmati Rice

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 cups basmati rice` | `basmati rice` | 408.0 g |
| `2 1/2 cups water` | `water` | 600.0 ml |

---

## Instant Pot Black Rice (aka Forbidden Rice)

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 cup uncooked black rice` | `uncooked black rice` | 204.0 g |
| `1 cup cold water (or 1 cup broth of choice)` | `cold water` | 240.0 ml |

---

## Instant Pot Boiled Peanuts

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 pound peanuts (raw, shelled, and unsalted)` | `peanuts` | 453.59 g |
| `1/2 cup salt` | `salt` | 144.0 g |
| `water` | `water` | 100.0 ml |

---

## Instant Pot Brats

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 tablespoons butter` | `butter` | 22.5 g |
| `5  bratwursts (1 package, see Notes)` | `bratwursts` | 500.0 g |
| `1 cup light beer (or beef broth)` | `light beer` | 240.0 ml |

---

## Instant Pot Broccoli

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 pound broccoli florets (uncooked)` | `broccoli florets` | 453.59 g |
| `1/2 cup water` | `water` | 120.0 ml |

---

## Instant Pot Buffalo Chicken Dip

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 pound boneless skinless chicken breasts` | `chicken breasts` | 453.59 g |
| `1 cup hot sauce (such as Frank&#39;s Hot Sauce)` | `hot sauce` | 240.0 ml |
| `1/2 cup ranch dressing` | `ranch dressing` | 90.0 g |
| `4 tablespoons butter` | `butter` | 45.0 g |
| `8 ounces cream cheese` | `cream cheese` | 100.0 ml |
| `1 cup shredded cheddar cheese` | `cheddar cheese` | 112.8 g |
| `1 cup shredded mozzarella cheese` | `mozzarella cheese` | 112.8 g |

---

## Instant Pot Burrito Bowls with Chicken

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 tablespoon avocado oil` | `avocado oil` | 15.0 ml |
| `2 pounds boneless, skinless chicken breasts (trimed, cut into bite-sized pieces)` | `chicken breasts` | 907.18 g |
| `1/2 cup diced white onion (approximately 1 small onion)` | `white onion` | 90.0 g |
| `1 1/2 tablespoons minced garlic (approximately 3 large cloves)` | `garlic` | 16.88 g |
| `2 whole chipotle peppers (from canned chipotle peppers in adobo sauce)` | `chipotle peppers` | 200.0 g |
| `1 tablespoon adobo sauce (from canned chipotle peppers in adobo sauce)` | `adobo sauce` | 15.0 ml |
| `2 tablespoons taco seasoning (store-bought or make your own)` | `taco seasoning` | 22.5 g |
| `1 1/2 cups chicken broth (low sodium if preferred)` | `chicken broth` | 360.0 ml |
| `1 1/2 cups salsa (any brand, any flavor)` | `salsa` | 270.0 g |
| `1 cup long-grain rice (rinsed, drained)` | `long-grain rice` | 204.0 g |
| `1 15.25-ounce can black beans (drained, rinsed)` | `black beans` | 400.0 g |
| `1 15.25-ounce can whole corn kernels (drained, rinsed; or 2 cups fresh or frozen corn kernels)` | `corn kernels` | 400.0 g |
| `1 tablespoon lime juice` | `lime juice` | 15.0 ml |
| `salt (to taste)` | `salt` | 100.0 g |

---

## Instant Pot Carne Asada

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 teaspoon salt` | `salt` | 6.0 g |
| `1/2 teaspoon pepper` | `pepper` | 1.88 g |
| `1 teaspoon chili powder` | `chili powder` | 2.5 g |
| `1 teaspoon onion powder` | `onion powder` | 2.5 g |
| `1 teaspoon cumin` | `cumin` | 2.5 g |
| `1 2-pound flank steak` | `2-pound flank steak` | 100.0 g |
| `2 tablespoons olive oil` | `olive oil` | 30.0 ml |
| `1/2 cup low-sodium beef broth` | `low-sodium beef broth` | 120.0 ml |
| `1/4 cup lime juice` | `lime juice` | 60.0 ml |
| `1/4 cup orange juice (see Notes)` | `orange juice` | 60.0 ml |
| `3 cloves garlic (minced)` | `garlic` | 9.0 g |
| `1/2 cup chopped fresh cilantro` | `fresh cilantro` | 90.0 g |
| `1/2 packed cup onion slices (half of 1 small onion)` | `cup onion slices` | 50.0 g |
| `chopped fresh cilantro` | `fresh cilantro` | 100.0 g |
| `prepared chimichurri sauce` | `prepared chimichurri sauce` | 100.0 ml |

---

## Instant Pot Carrots with a Maple Butter Sauce

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `16 ounces baby carrots (defrosted if frozen)` | `baby carrots` | 100.0 g |
| `2 cups water` | `water` | 480.0 ml |
| `2 tablespoons unsalted butter` | `unsalted butter` | 36.0 g |
| `1 tablespoon minced garlic (approximately 3 cloves)` | `garlic` | 11.25 g |
| `1 teaspoon Italian seasoning` | `italian seasoning` | 3.75 g |
| `1/8 teaspoon chili powder (more or less to taste)` | `chili powder` | 0.31 g |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `3 tablespoons pure maple syrup` | `maple syrup` | 45.0 ml |

---

## Instant Pot Cauliflower Recipe

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 medium head cauliflower (approximately 3 pounds)` | `head cauliflower` | 80.0 g |
| `1/2 cup water` | `water` | 120.0 ml |

---

## Instant Pot Cheesy Potatoes

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 pounds potatoes (peeled, cut into 1-inch cubes)` | `potatoes` | 907.18 g |
| `1 cup chicken broth (see Notes)` | `chicken broth` | 240.0 ml |
| `1 teaspoon salt` | `salt` | 6.0 g |
| `1 teaspoon garlic powder` | `garlic powder` | 2.5 g |
| `1/2 teaspoon freshly ground black pepper` | `black pepper` | 1.88 g |
| `2 cups freshly shredded cheddar cheese` | `cheddar cheese` | 225.6 g |
| `1/2 cup sour cream` | `sour cream` | 120.0 ml |
| `green onions (sliced, for garnish)` | `green onions` | 100.0 g |

---

## Instant Pot Chicken and Noodles

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 pounds boneless, skinless chicken breasts (approximately 3-6 chicken breasts depending on size)` | `chicken breasts` | 907.18 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly cracked black pepper (to taste)` | `black pepper` | 100.0 g |
| `1/4 cup unsalted butter (cut into smaller pieces)` | `unsalted butter` | 72.0 g |
| `2 cups low-sodium chicken broth` | `low-sodium chicken broth` | 480.0 ml |
| `2 10.5-ounce cans cream of chicken soup (21 ounces total)` | `cream of chicken soup` | 800.0 ml |
| `1 teaspoon Italian seasoning` | `italian seasoning` | 3.75 g |
| `2-3 cloves garlic (minced)` | `garlic` | 6.0 g |
| `12 ounces wide egg noodles` | `wide egg noodles` | 100.0 g |
| `1/2 cup heavy cream (at room temperature)` | `heavy cream` | 120.0 ml |

---

## Instant Pot Chicken Paprikash

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 pounds chicken pieces (see note)` | `chicken pieces` | 907.18 g |
| `salt and pepper (to taste)` | `salt and pepper` | 100.0 g |
| `2 tablespoons ghee (see note)` | `ghee` | 22.5 g |
| `1  onion (finely chopped)` | `onion` | 100.0 g |
| `2  garlic cloves (minced)` | `garlic cloves` | 200.0 g |
| `1  tomato (finely diced)` | `tomato` | 100.0 g |
| `2 tablespoons paprika` | `paprika` | 15.0 g |
| `1 cup chicken broth` | `chicken broth` | 240.0 ml |
| `1/2 cup sour cream (plus extra to serve)` | `sour cream` | 120.0 ml |
| `1/2 cup heavy cream` | `heavy cream` | 120.0 ml |
| `fresh dill (optional, to serve)` | `fresh dill` | 100.0 g |

---

## Instant Pot Chicken and Rice Soup

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 tablespoons olive oil` | `olive oil` | 30.0 ml |
| `1 pound boneless, skinless chicken breasts` | `chicken breasts` | 453.59 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `pepper (to taste)` | `pepper` | 100.0 g |
| `1 stalks celery (sliced)` | `celery` | 40.0 g |
| `2  carrots (sliced into coins)` | `carrots` | 200.0 g |
| `1 medium onion (diced)` | `onion` | 80.0 g |
| `4 cloves garlic (minced)` | `garlic` | 12.0 g |
| `1 teaspoon fresh rosemary (chopped)` | `fresh rosemary` | 3.75 g |
| `1 teaspoon fresh thyme (chopped)` | `fresh thyme` | 3.75 g |
| `3/4 cup uncooked long-grain white rice` | `uncooked long-grain white rice` | 153.0 g |
| `5 cups chicken broth (or vegetable broth)` | `chicken broth` | 1200.0 ml |

---

## Instant Pot Chickpeas (No Soak!)

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `6 cups chicken stock (or vegetable broth, low sodium if desired)` | `chicken stock` | 1440.0 ml |
| `1 pound dry chickpeas` | `dry chickpeas` | 453.59 g |
| `1 teaspoon salt (more or less to taste)` | `salt` | 6.0 g |

---

## Instant Pot Clam Chowder

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4  slices bacon (chopped)` | `bacon` | 80.0 g |
| `1  yellow onion (chopped)` | `yellow onion` | 100.0 g |
| `2  celery stalks (chopped)` | `celery stalks` | 200.0 g |
| `1 tablespoon fresh thyme leaves` | `fresh thyme leaves` | 11.25 g |
| `3  garlic cloves (minced)` | `garlic cloves` | 300.0 g |
| `1 teaspoon salt` | `salt` | 6.0 g |
| `1/4 teaspoon black pepper` | `black pepper` | 0.94 g |
| `4  medium potatoes (cubed)` | `potatoes` | 320.0 g |
| `1 (8-ounce) bottle clam juice` | `clam juice` | 350.0 ml |
| `1 1/2 cups chicken broth` | `chicken broth` | 360.0 ml |
| `2 tablespoons all purpose flour (see Notes for gluten-free)` | `all purpose flour` | 15.0 g |
| `1 cup heavy whipping cream` | `heavy whipping cream` | 240.0 ml |
| `2 (6.5-ounce) cans chopped clams (drained)` | `clams` | 800.0 g |

---

## Instant Pot Cornbread

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 large eggs (at room temperature)` | `eggs` | 200.0 g |
| `1 1/2 cups buttermilk (at room temperature)` | `buttermilk` | 360.0 ml |
| `1/4 cup melted butter` | `butter` | 45.0 g |
| `1 cup all-purpose flour (see Notes)` | `all-purpose flour` | 120.0 g |
| `1 1/2 cups yellow cornmeal` | `yellow cornmeal` | 270.0 g |
| `1/2 cup granulated sugar (see Notes)` | `granulated sugar` | 102.0 g |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `2 teaspoons baking powder` | `baking powder` | 9.0 g |
| `1 cup water (for the Instant Pot)` | `water` | 240.0 ml |
| `honey (optional, to serve)` | `honey` | 100.0 ml |
| `butter (optional, to serve)` | `butter` | 100.0 g |

---

## Instant Pot Crab Legs

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4  snow crab leg clusters (see Notes)` | `snow crab leg clusters` | 400.0 g |
| `1 cup water` | `water` | 240.0 ml |
| `1/3 cup unsalted butter` | `unsalted butter` | 96.0 g |
| `1/2 teaspoon minced garlic` | `garlic` | 1.88 g |
| `1 teaspoon Old Bay seasoning` | `old bay seasoning` | 3.75 g |
| `1/2-1 tablespoon lemon juice (to taste)` | `lemon juice` | 7.5 ml |

---

## Instant Pot Italian Sausage

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 tablespoon olive oil` | `olive oil` | 15.0 ml |
| `5  Italian sausage links` | `italian sausage links` | 500.0 g |
| `1/2 cup water` | `water` | 120.0 ml |

---

## Instant Pot Lobster Tails

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2  lobster tails (approximately 4-6 ounces each, see Notes)` | `lobster tails` | 200.0 g |
| `1/4 teaspoon salt (plus more to taste)` | `salt` | 1.5 g |
| `1/4 teaspoon garlic powder` | `garlic powder` | 0.62 g |
| `1/8 teaspoon freshly cracked black pepper` | `black pepper` | 0.47 g |
| `1/4 teaspoon paprika` | `paprika` | 0.62 g |
| `1 cup water (or seafood stock)` | `water` | 240.0 ml |
| `fresh parsley (chopped, for garnish; optional)` | `fresh parsley` | 100.0 g |
| `drawn butter (for serving, see Notes)` | `drawn butter` | 100.0 g |
| `lemon wedges (for serving)` | `lemon wedges` | 100.0 g |

---

## Instant Pot Oatmeal

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3 cups water` | `water` | 720.0 ml |
| `2 cups almond milk (sweetened or unsweetened)` | `almond milk` | 480.0 ml |
| `1 tablespoon unsalted butter` | `unsalted butter` | 18.0 g |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `2 cups old fashioned oats` | `old fashioned oats` | 172.8 g |

---

## Instant Pot Paella

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 tablespoon olive oil` | `olive oil` | 15.0 ml |
| `1  yellow onion (chopped)` | `yellow onion` | 100.0 g |
| `1  bell pepper (chopped)` | `bell pepper` | 100.0 g |
| `3  garlic cloves (minced)` | `garlic cloves` | 300.0 g |
| `1 cup roma tomatoes (diced)` | `roma tomatoes` | 180.0 g |
| `1 teaspoon paprika` | `paprika` | 2.5 g |
| `1 teaspoon salt` | `salt` | 6.0 g |
| `pinch of saffron threads` | `saffron threads` | 1.0 g |
| `1 pound boneless skinless chicken thighs (cut into bite-sized pieces)` | `chicken thighs` | 453.59 g |
| `1 1/2 cups short grain white rice (see Notes)` | `short grain white rice` | 306.0 g |
| `2 cups chicken broth` | `chicken broth` | 480.0 ml |
| `1/2 pound shrimp (peeled, tail-on)` | `shrimp` | 226.79 g |
| `1/2 pound mussels` | `mussels` | 226.79 g |
| `1/2 pound calamari rings` | `calamari rings` | 226.79 g |
| `1 cup frozen peas` | `frozen peas` | 180.0 g |

---

## Instant Pot Potato Leek Soup

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 pounds Yukon gold potatoes (peeled if desired, diced)` | `yukon gold potatoes` | 907.18 g |
| `3 cups thinly sliced leeks (white and tender green parts only)` | `leeks` | 540.0 g |
| `6 cups  vegetable stock` | `vegetable stock` | 1440.0 ml |
| `1  tablespoon whipping cream (at room temperature, or 2-3 tablespoons softened butter)` | `whipping cream` | 15.0 ml |
| `1 1/2 teaspoons salt (more or less to taste)` | `salt` | 9.0 g |
| `2-3 tablespoons minced fresh chives (optional)` | `fresh chives` | 22.5 g |

---

## Easy Instant Pot Quinoa

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 cup quinoa (white, black, brown, red, or tri-color)` | `quinoa (white, black, brown, red, or tri-color)` | 172.8 g |
| `1 1/2 cups water` | `water` | 360.0 ml |
| `1 teaspoon salt (more or less to taste)` | `salt` | 6.0 g |
| `freshly cracked black pepper (to taste)` | `black pepper` | 100.0 g |

---

## Instant Pot Sausage and Peppers

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `6  (4-ounce) links sweet Italian sausage` | `links sweet italian sausage` | 600.0 g |
| `2 tablespoons olive oil` | `olive oil` | 30.0 ml |
| `1  yellow onion (sliced)` | `yellow onion` | 100.0 g |
| `4 cloves garlic (minced)` | `garlic` | 12.0 g |
| `1/4 cup marsala wine (or red wine, optional)` | `marsala wine` | 60.0 ml |
| `3  bell peppers (sliced)` | `bell peppers` | 300.0 g |
| `1 teaspoon dried basil` | `dried basil` | 3.75 g |
| `1 teaspoon dried oregano` | `dried oregano` | 3.75 g |
| `1  (14-ounce) can crushed tomatoes` | `crushed tomatoes` | 400.0 g |
| `1 teaspoon salt` | `salt` | 6.0 g |

---

## Instant Pot Scrambled Eggs

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 tablespoons butter (or ghee)` | `butter` | 22.5 g |
| `4 large eggs` | `eggs` | 400.0 g |
| `1/4 cup milk (see Notes)` | `milk` | 60.0 ml |
| `salt (to taste)` | `salt` | 100.0 g |
| `pepper (to taste)` | `pepper` | 100.0 g |
| `chopped chives (optional, for serving)` | `chives` | 100.0 g |
| `chopped parsley (optional, for serving)` | `parsley` | 100.0 g |

---

## Instant Pot Sushi Rice

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 cup Japanese sushi rice` | `japanese sushi rice` | 204.0 g |
| `1 1/4 cups water` | `water` | 300.0 ml |
| `3 tablespoons rice vinegar (unseasoned)` | `rice vinegar` | 45.0 ml |
| `1 teaspoon salt` | `salt` | 6.0 g |
| `1 tablespoon white sugar` | `white sugar` | 12.75 g |
| `1 tablespoon avocado oil` | `avocado oil` | 15.0 ml |

---

## Instant Pot Turkey Stock

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1  turkey carcass ( or 3 pounds turkey wings)` | `turkey carcass` | 100.0 g |
| `1 stalk celery (sliced in half)` | `celery` | 40.0 g |
| `1 large carrot (cut into 3 or 4 pieces)` | `carrot` | 100.0 g |
| `1  onion (unpeeled and cut into quarter)` | `onion` | 100.0 g |
| `2  bay leaves` | `bay leaves` | 200.0 g |
| `2 sprigs fresh thyme` | `fresh thyme` | 6.0 g |
| `2 sprigs fresh rosemary` | `fresh rosemary` | 6.0 g |
| `1 teaspoon salt` | `salt` | 6.0 g |
| `1 teaspoon whole black peppercorns` | `black peppercorns` | 3.75 g |

---

## Irish Potato Soup

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 tablespoons unsalted butter` | `unsalted butter` | 36.0 g |
| `1 1/2 cups chopped white onion (approximately 1 medium onion)` | `white onion` | 270.0 g |
| `2 stalks celery (sliced in half lengthwise, then each half sliced into small pieces)` | `celery` | 80.0 g |
| `4 pounds russet potatoes (approximately 4 large potatoes; peeled, cut into 1/2-inch cubes)` | `russet potatoes` | 1814.36 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly ground black pepper (to taste)` | `black pepper` | 100.0 g |
| `4 cups low-sodium chicken stock (or vegetable broth)` | `low-sodium chicken stock` | 960.0 ml |
| `1/2 cup whole milk (or heavy cream, at room temperature)` | `milk` | 120.0 ml |
| `cooked, crumbled bacon` | `bacon` | 100.0 g |
| `chopped chives` | `chives` | 100.0 g |
| `shredded sharp cheddar cheese` | `sharp cheddar cheese` | 100.0 g |
| `fresh parsley` | `fresh parsley` | 100.0 g |

---

## Italian Green Beans

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 tablespoons olive oil` | `olive oil` | 30.0 ml |
| `2 cloves garlic (minced)` | `garlic` | 6.0 g |
| `1/2 cup Italian breadcrumbs` | `italian breadcrumbs` | 54.0 g |
| `1/2 cup grated fresh parmesan cheese` | `fresh parmesan cheese` | 56.4 g |
| `salt  (to taste)` | `salt` | 100.0 g |
| `freshly cracked black pepper (to taste)` | `black pepper` | 100.0 g |
| `1 12-ounce bag green beans (cooked according to package instructions)` | `green beans` | 300.0 g |

---

## Instant Pot Japanese Curry

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 1/2 tablespoons neutral cooking oil (avocado oil, olive oil, etc.)` | `neutral cooking oil (avocado oil, olive oil, etc.)` | 22.5 ml |
| `1 cup chopped white onion (approximately 1 medium onion)` | `white onion` | 180.0 g |
| `2 pounds boneless, skinless chicken thighs (approximately 8 chicken thighs, cut into bite-sized cubes)` | `chicken thighs` | 907.18 g |
| `1 teaspoon minced garlic (approximately 2 large cloves)` | `garlic` | 3.75 g |
| `1 teaspoon grated fresh ginger` | `fresh ginger` | 3.75 g |
| `2 medium Yukon gold potatoes (approximately 3-4 ounces each; peeled, cubed)` | `yukon gold potatoes` | 160.0 g |
| `2 medium carrots (approximately 2 ounces each; peeled, chopped)` | `carrots` | 160.0 g |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `freshly cracked black pepper (to taste)` | `black pepper` | 100.0 g |
| `2 cups low-sodium chicken broth` | `low-sodium chicken broth` | 480.0 ml |
| `1 cup grated apple (approximately 1 small apple; honey crisp, gala, fuji, or Granny Smith)` | `apple` | 180.0 g |
| `1 tablespoon ketchup` | `ketchup` | 11.25 g |
| `1 tablespoon honey` | `honey` | 15.0 ml |
| `1 tablespoon low-sodium soy sauce` | `low-sodium soy sauce` | 15.0 ml |
| `1 3.5-ounce container Japanese curry roux` | `container japanese curry roux` | 100.0 g |

---

## Jellied Cranberry Sauce

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `12 ounces fresh cranberries (1 bag)` | `fresh cranberries` | 100.0 g |
| `1 cup sugar` | `sugar` | 204.0 g |
| `1/2 cup water ( or 100% unsweetened cranberry juice or orange juice)` | `water` | 120.0 ml |
| `pinch cinnamon` | `cinnamon` | 1.0 g |

---

## Viral Jennifer Aniston Salad Recipe

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 cups cooked quinoa (cooled)` | `quinoa` | 345.6 g |
| `1 15-ounce can chickpeas (drained, rinsed)` | `chickpeas` | 400.0 g |
| `1 cup diced English cucumber (approximately 1 8-ounce cucumber)` | `english cucumber` | 180.0 g |
| `3/4 cup finely diced red onion (approximately 1 4-ounce onion)` | `red onion` | 135.0 g |
| `1/2 cup finely chopped fresh flat-leaf parsley (approximately 1/2 of 1 bunch)` | `fresh flat-leaf parsley` | 90.0 g |
| `1/4 cup finely chopped fresh mint leaves (approximately 1/2 of 1 bunch)` | `fresh mint leaves` | 45.0 g |
| `2 tablespoons minced fresh dill (approximately 1/4 of 1 bunch)` | `fresh dill` | 22.5 g |
| `1/2 cup chopped roasted pistachios` | `roasted pistachios` | 90.0 g |
| `1 cup feta cheese crumbles` | `feta cheese crumbles` | 112.8 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly ground black pepper (to taste)` | `black pepper` | 100.0 g |
| `2 tablespoons fresh lemon juice (juice of approximately 1 medium lemon)` | `fresh lemon juice` | 30.0 ml |
| `1/4 cup olive oil` | `olive oil` | 60.0 ml |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly ground black pepper (to taste)` | `black pepper` | 100.0 g |

---

## Jungle Juice Recipe

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 medium orange (thinly sliced)` | `orange` | 80.0 g |
| `1 medium lemon (thinly sliced)` | `lemon` | 80.0 g |
| `2 cups chopped strawberries (stems removed)` | `strawberries` | 360.0 g |
| `2 cups diced pineapple` | `pineapple` | 360.0 g |
| `3 cups orange juice` | `orange juice` | 720.0 ml |
| `3 cups  fruit punch` | `fruit punch` | 540.0 g |
| `3 cups cranberry juice` | `cranberry juice` | 720.0 ml |
| `3 cups pineapple juice` | `pineapple juice` | 720.0 ml |
| `1  12-ounce can  sparkling water (lemon-lime flavor preferred)` | `sparkling water` | 400.0 ml |
| `3 cups vodka (plain or fruit-flavored, see Notes)` | `vodka` | 540.0 g |
| `2 cups rum  (light, white, or silver; see Notes)` | `rum` | 360.0 g |
| `1 cup triple sec (or other orange liqueur, see Notes)` | `triple sec` | 180.0 g |
| `fresh mint leaves (optional, for garnish)` | `fresh mint leaves` | 100.0 g |
| `ice (for serving)` | `ice` | 100.0 g |

---

## Kale and White Bean Soup

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 tablespoons olive oil` | `olive oil` | 30.0 ml |
| `1 cup chopped onions (approximately 1 medium onion)` | `onions` | 180.0 g |
| `1 tablespoon minced garlic (approximately 3 cloves)` | `garlic` | 11.25 g |
| `1 teaspoon minced fresh rosemary leaves (from 1 6-inch-long sprig)` | `fresh rosemary leaves` | 3.75 g |
| `1 15-ounce can white beans (or great northern beans)` | `white beans` | 400.0 g |
| `4 cups vegetable broth` | `vegetable broth` | 960.0 ml |
| `1 tablespoon fresh lemon juice (zest lemon before juicing)` | `fresh lemon juice` | 15.0 ml |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly cracked black pepper (to taste)` | `black pepper` | 100.0 g |
| `5 cups chopped lacinato kale` | `lacinato kale` | 900.0 g |
| `1/2 cup finely chopped fresh parsley` | `fresh parsley` | 90.0 g |
| `1 teaspoon lemon zest` | `lemon zest` | 3.75 g |
| `1 large pinch red pepper flakes` | `pinch red pepper flakes` | 100.0 g |
| `1/4 teaspoon salt (more or less to taste)` | `salt` | 1.5 g |
| `1/4 cup olive oil` | `olive oil` | 60.0 ml |
| `3 large cloves fresh garlic (grated)` | `cloves fresh garlic` | 300.0 g |
| `1 large pinch salt` | `pinch salt` | 100.0 g |

---

## Kardashian Salad (La Scala Chopped Salad)

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 medium head iceberg lettuce (approximately 1 pound)` | `head iceberg lettuce` | 80.0 g |
| `1/4 pound salami (thinly sliced)` | `salami` | 113.4 g |
| `1 19-ounce can chickpeas (drained, rinsed well)` | `chickpeas` | 400.0 g |
| `1 cup shredded mozzarella` | `mozzarella` | 180.0 g |
| `1/3 cup extra-virgin olive oil` | `extra-virgin olive oil` | 80.0 ml |
| `1/4 cup red wine vinegar` | `red wine vinegar` | 60.0 ml |
| `2 teaspoons Dijon mustard (or 1 teaspoon dry mustard)` | `dijon mustard` | 7.5 g |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `1/2 teaspoon fresh black pepper (more or less to taste)` | `fresh black pepper` | 1.88 g |
| `1/4 cup grated parmesan` | `parmesan` | 22.8 g |
| `grated parmesan` | `parmesan` | 100.0 g |
| `fresh black pepper` | `fresh black pepper` | 100.0 g |

---

## Keto Bread Pudding

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/2 cup melted butter` | `butter` | 90.0 g |
| `1/2 cup water` | `water` | 120.0 ml |
| `2 large eggs` | `eggs` | 200.0 g |
| `1/4 cup Granular Swerve Sweetener (Granular or Confectioners)` | `granular swerve sweetener` | 45.0 g |
| `2 cups almond flour` | `almond flour` | 240.0 g |
| `2 teaspoons baking powder` | `baking powder` | 9.0 g |
| `1 teaspoon cinnamon` | `cinnamon` | 2.5 g |
| `1 pinch salt` | `salt` | 1.0 g |
| `2 large eggs` | `eggs` | 200.0 g |
| `1/4 cup Granular Swerve Sweetener (Granular or Confectioners)` | `granular swerve sweetener` | 45.0 g |
| `1/4 teaspoon salt` | `salt` | 1.5 g |
| `1 teaspoon vanilla extract` | `vanilla extract` | 5.0 ml |
| `3 tablespoons butter (softened)` | `butter` | 33.75 g |
| `1 cup heavy cream` | `heavy cream` | 240.0 ml |
| `2 tablespoons butter (softened)` | `butter` | 22.5 g |
| `2 tablespoons Granular Swerve Sweetener (Granular or Confectioners)` | `granular swerve sweetener` | 22.5 g |
| `1/2 cup heavy cream` | `heavy cream` | 120.0 ml |
| `1 teaspoon vanilla extract` | `vanilla extract` | 5.0 ml |

---

## Sausage &amp; Egg Keto Breakfast Casserole

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3 cups spinach leaves (fresh, uncooked)` | `spinach leaves` | 540.0 g |
| `4  scallions (sliced, white and green parts separated)` | `scallions` | 400.0 g |
| `1/4 cup chopped fresh parsley` | `fresh parsley` | 45.0 g |
| `16 ounces breakfast sausage (see Notes)` | `breakfast sausage` | 100.0 g |
| `12 large eggs` | `eggs` | 1200.0 g |
| `3/4 cup heavy cream` | `heavy cream` | 180.0 ml |
| `1/2 teaspoon garlic powder` | `garlic powder` | 1.25 g |
| `1/2 teaspoon kosher salt` | `kosher salt` | 3.0 g |
| `1/4 teaspoon freshly cracked black pepper` | `black pepper` | 0.94 g |
| `2 cups freshly shredded cheddar cheese (see Notes)` | `cheddar cheese` | 225.6 g |

---

## Keto Broccoli Cauliflower Casserole

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 small head fresh broccoli (chopped into florets, approximately 2-3 cups)` | `head fresh broccoli` | 50.0 g |
| `1 small head fresh cauliflower (chopped into florets, approximately 2-3 cups)` | `head fresh cauliflower` | 50.0 g |
| `1/2 cup full-fat sour cream` | `full-fat sour cream` | 120.0 ml |
| `4 ounces full-fat cream cheese (softened but not hot)` | `full-fat cream cheese` | 100.0 ml |
| `1/4 cup heavy whipping cream (at room temperature)` | `heavy whipping cream` | 60.0 ml |
| `1/2 cup shredded fresh mozzarella (see Notes)` | `fresh mozzarella` | 90.0 g |
| `1/2 cup shredded fresh cheddar (see Notes)` | `fresh cheddar` | 90.0 g |
| `2 ounces sweet onion (half of 1 small onion, diced; optional)` | `sweet onion` | 100.0 g |
| `8 slices bacon (cooked, crumbled)` | `bacon` | 160.0 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly cracked black pepper (to taste)` | `black pepper` | 100.0 g |
| `1/2 cup shredded fresh mozzarella (see Notes)` | `fresh mozzarella` | 90.0 g |
| `1/2 cup shredded fresh cheddar (see Notes)` | `fresh cheddar` | 90.0 g |

---

## Keto Broccoli Salad

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3/4 cup full-fat mayonnaise` | `full-fat mayonnaise` | 135.0 g |
| `2 tablespoons Granular Swerve Sweetener (up to 4 tablespoons if desired)` | `granular swerve sweetener` | 22.5 g |
| `1 tablespoon white vinegar` | `white vinegar` | 15.0 ml |
| `1 teaspoon garlic powder (plus more if desired)` | `garlic powder` | 2.5 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly cracked black pepper (to taste)` | `black pepper` | 100.0 g |
| `5 cups chopped broccoli florets (defrosted if frozen)` | `broccoli florets` | 900.0 g |
| `1 cup cooked, crumbled bacon` | `bacon` | 180.0 g |
| `1 cup shredded cheddar cheese` | `cheddar cheese` | 112.8 g |
| `1/4 cup diced red onion` | `red onion` | 45.0 g |
| `1/2 cup roasted sunflower seeds (optional)` | `roasted sunflower seeds` | 78.0 g |

---

## Keto Buffalo Chicken Dip

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `8 ounces full-fat cream cheese (at room temperature, cubed)` | `full-fat cream cheese` | 100.0 ml |
| `3/4 cup buffalo sauce (like Frank's Red Hot Buffalo Sauce)` | `buffalo sauce` | 180.0 ml |
| `3/4 cup blue cheese dressing (at room temperature)` | `blue cheese dressing` | 84.6 g |
| `1/2 cup full-fat sour cream (at room temperature)` | `full-fat sour cream` | 120.0 ml |
| `3 cups cooked, shredded chicken` | `chicken` | 540.0 g |
| `3/4 cup shredded fresh mozzarella (at room temperature)` | `fresh mozzarella` | 135.0 g |
| `1/4 cup shredded fresh mozzarella (at room temperature)` | `fresh mozzarella` | 45.0 g |
| `ranch dressing` | `ranch dressing` | 100.0 g |
| `diced green onions` | `green onions` | 100.0 g |
| `celery sticks` | `celery sticks` | 100.0 g |
| `lettuce cups` | `lettuce cups` | 100.0 g |
| `bell pepper strips` | `bell pepper strips` | 100.0 g |
| `keto tortilla chips` | `keto tortilla chips` | 100.0 g |

---

## Keto Chicken &amp; Dumplings

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 tablespoon avocado oil` | `avocado oil` | 15.0 ml |
| `1/8 teaspoon black pepper` | `black pepper` | 0.47 g |
| `1/4 teaspoon salt` | `salt` | 1.5 g |
| `1/2  onion (chopped)` | `onion` | 50.0 g |
| `2 stalks celery (chopped)` | `celery` | 80.0 g |
| `2 cloves garlic` | `garlic` | 6.0 g |
| `1/2 teaspoon garlic powder` | `garlic powder` | 1.25 g |
| `1/2 teaspoon onion powder` | `onion powder` | 1.25 g |
| `1/2 teaspoon dried thyme (plus more for garnish)` | `dried thyme` | 1.88 g |
| `4-5  chicken thighs  (boneless, skinless, shredded or cut into chunks)` | `chicken thighs` | 400.0 g |
| `8 cups chicken broth` | `chicken broth` | 1920.0 ml |
| `1  bay leaf` | `bay leaf` | 100.0 g |
| `1 cup almond flour` | `almond flour` | 120.0 g |
| `2 tablespoons coconut flour` | `coconut flour` | 15.0 g |
| `1 teaspoon baking powder` | `baking powder` | 4.5 g |
| `1/4 teaspoon xanthan gum  (optional, but recommended)` | `xanthan gum` | 0.94 g |
| `1/2 teaspoon garlic powder` | `garlic powder` | 1.25 g |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `2 large eggs` | `eggs` | 200.0 g |
| `1 tablespoon  sour cream (or Greek yogurt)` | `sour cream` | 15.0 ml |
| `1/2 cup shredded mozzarella` | `mozzarella` | 90.0 g |

---

## Chick-fil-A Style Keto Chicken Nuggets (with Keto Chick-fil-A Sauce)

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 large boneless, skinless chicken breasts (approximately 8-10 ounces each, cut into bite-sized chunks)` | `chicken breasts` | 200.0 g |
| `1/2 cup dill pickle juice (from jar of dill pickles)` | `dill pickle juice` | 120.0 ml |
| `2 large eggs (at room temperature)` | `eggs` | 200.0 g |
| `1 cup almond flour` | `almond flour` | 120.0 g |
| `1/4 cup grated fresh parmesan (at room temperature)` | `fresh parmesan` | 22.8 g |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `1/2 teaspoon garlic powder` | `garlic powder` | 1.25 g |
| `1/4 teaspoon onion powder` | `onion powder` | 0.62 g |
| `1/4 teaspoon paprika` | `paprika` | 0.62 g |
| `avocado oil (or other neutral oil, for frying)` | `avocado oil (or other neutral oil, for frying)` | 100.0 ml |
| `1/4 cup mayonnaise` | `mayonnaise` | 45.0 g |
| `2 tablespoons keto barbecue sauce (store-bought or make your own)` | `keto barbecue sauce` | 30.0 ml |
| `1 tablespoon yellow mustard` | `yellow mustard` | 11.25 g |
| `1 tablespoon keto honey (or similar honey-flavored liquid keto sweetener)` | `keto honey` | 15.0 ml |

---

## Keto Chocolate Milk

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 tablespoon hot water (see Notes)` | `hot water` | 15.0 ml |
| `2-3 tablespoons unsweetened cocoa powder (see Notes)` | `unsweetened cocoa powder` | 15.0 g |
| `2-3 tablespoons Confectioners Swerve Sweetener (or erythritol see Notes)` | `confectioners swerve sweetener` | 22.5 g |
| `1/2 cup almond milk (or any nut milk, unsweetened)` | `almond milk` | 120.0 ml |
| `1/2 cup heavy cream` | `heavy cream` | 120.0 ml |

---

## Keto Chocolate Mousse

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 1/2 cups heavy whipping cream (very cold)` | `heavy whipping cream` | 360.0 ml |
| `1/4 cup cocoa powder (dutch preferred, sifted)` | `cocoa powder` | 30.0 g |
| `1/2 cup Confectioners Swerve` | `confectioners swerve` | 90.0 g |
| `1/2 teaspoon pure vanilla extract (optional)` | `vanilla extract` | 2.5 ml |
| `keto whipped cream (store-bought or make your own)` | `keto whipped cream` | 100.0 ml |
| `keto chocolate shavings` | `keto chocolate shavings` | 100.0 g |

---

## Keto Chocolate Pudding

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2/3 cup Swerve Confectioners Sweetener` | `swerve confectioners sweetener` | 120.0 g |
| `1/2 cup cocoa powder` | `cocoa powder` | 60.0 g |
| `1 teaspoon xanthan gum` | `xanthan gum` | 3.75 g |
| `1/4 teaspoon salt` | `salt` | 1.5 g |
| `2 1/4 cups heavy cream` | `heavy cream` | 540.0 ml |
| `1 teaspoon vanilla extract` | `vanilla extract` | 5.0 ml |
| `1 cup heavy cream` | `heavy cream` | 240.0 ml |
| `1 teaspoon vanilla extract` | `vanilla extract` | 5.0 ml |
| `2 tablespoons Swerve Confectioners Sweetener` | `swerve confectioners sweetener` | 22.5 g |

---

## Keto Churros

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/2 cup Brown Swerve Sweetener (100 grams or 3.5 ounces)` | `brown swerve sweetener` | 90.0 g |
| `2 teaspoons cinnamon` | `cinnamon` | 5.0 g |
| `enough virgin coconut oil or ghee for frying` | `enough virgin coconut oil or ghee for frying` | 100.0 ml |
| `1 1/2 cups shredded mozzarella (170 grams or 6 ounces, see Notes)` | `mozzarella` | 270.0 g |
| `3 tablespoons Philadelphia cream cheese (45 grams or 1.6 ounces)` | `philadelphia cream cheese` | 45.0 ml |
| `1 cup almond flour (100 grams or 3.5 ounces)` | `almond flour` | 120.0 g |
| `2  eggs (large)` | `eggs` | 100.0 g |
| `1 tablespoon Granular Swerve Sweetener (10 grams or 0.4 ounces)` | `granular swerve sweetener` | 11.25 g |
| `1/4 teaspoon cinnamon` | `cinnamon` | 0.62 g |
| `2 teaspoons gluten-free baking powder` | `gluten-free baking powder` | 9.0 g |

---

## Keto Cookie Dough

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/2 cup Brown Swerve Sweetener` | `brown swerve sweetener` | 90.0 g |
| `1/2 cup butter (softened)` | `butter` | 90.0 g |
| `2 teaspoons vanilla extract` | `vanilla extract` | 10.0 ml |
| `1/4 teaspoon salt` | `salt` | 1.5 g |
| `1 cup almond flour (plus more as needed)` | `almond flour` | 120.0 g |
| `1 tablespoon heavy cream (plus more as needed)` | `heavy cream` | 15.0 ml |
| `1/2-1 cup keto chocolate chips (mini preferred)` | `keto chocolate chips` | 90.0 g |

---

## Keto Crab Rangoon

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/4 cup coconut oil (or avocado oil, to pan-fry rangoon; plus more as needed)` | `coconut oil` | 60.0 ml |
| `5 ounces full-fat cream cheese (softened)` | `full-fat cream cheese` | 100.0 ml |
| `4 ounces crab meat (chopped, see Notes)` | `crab meat` | 100.0 g |
| `1  green onion (thinly sliced)` | `green onion` | 100.0 g |
| `1 teaspoon Worcestershire sauce (see Notes)` | `worcestershire sauce` | 5.0 ml |
| `1/3 teaspoon garlic powder` | `garlic powder` | 0.83 g |
| `3 cups freshly shredded mozzarella cheese` | `mozzarella cheese` | 338.4 g |
| `1 1/2 cups almond flour` | `almond flour` | 180.0 g |
| `2 large eggs` | `eggs` | 200.0 g |
| `1/2 teaspoon xanthan gum` | `xanthan gum` | 1.88 g |
| `1 pinch salt` | `salt` | 1.0 g |

---

## Keto Cranberry Sauce

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 12-ounce bag fresh cranberries (see Notes)` | `fresh cranberries` | 300.0 g |
| `1 cup water` | `water` | 240.0 ml |
| `1 cup Granular Swerve Sweetener` | `granular swerve sweetener` | 180.0 g |
| `1 teaspoon orange zest (optional)` | `orange zest` | 3.75 g |

---

## Keto Cream Cheese Frosting

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/2 cup butter (softened)` | `butter` | 90.0 g |
| `8 ounces cream cheese` | `cream cheese` | 100.0 ml |
| `3 cups powdered erythritol` | `powdered erythritol` | 360.0 g |
| `2 teaspoons vanilla extract` | `vanilla extract` | 10.0 ml |
| `1-3 tablespoons heavy cream (for consistency)` | `heavy cream` | 15.0 ml |

---

## Keto Creme Brûlée

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 cups heavy cream` | `heavy cream` | 480.0 ml |
| `4 large egg yolks` | `egg yolks` | 400.0 g |
| `1/2 cup sugar-free sweetener (such as granular Swerve, divided)` | `sugar-free sweetener` | 102.0 g |
| `1 teaspoon vanilla bean paste` | `vanilla bean paste` | 3.75 g |

---

## Keto Egg Drop Soup

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4 cups low-sodium chicken broth` | `low-sodium chicken broth` | 960.0 ml |
| `1/2 cup sliced green onions (white parts only)` | `green onions` | 90.0 g |
| `1 tablespoon low-sodium soy sauce  (or liquid aminos)` | `low-sodium soy sauce` | 15.0 ml |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `1/2 teaspoon ground ginger (more or less to taste)` | `ground ginger` | 1.88 g |
| `1/4 teaspoon freshly cracked black pepper (more or less to taste)` | `black pepper` | 0.94 g |
| `2 large eggs (whole eggs)` | `eggs` | 200.0 g |
| `1 large egg yolk (yolk from 1 large egg)` | `egg yolk` | 100.0 g |
| `1/4 cup sliced green onions (green parts only)` | `green onions` | 45.0 g |

---

## Baked Keto Empanadas

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 tablespoon butter` | `butter` | 11.25 g |
| `1/2 pound ground beef` | `ground beef` | 226.79 g |
| `1/2 of one yellow onion (chopped)` | `yellow onion` | 50.0 g |
| `1/2 of one green bell pepper (chopped)` | `green bell pepper` | 50.0 g |
| `2 tablespoons taco seasoning` | `taco seasoning` | 22.5 g |
| `1 tablespoon tomato paste` | `tomato paste` | 11.25 g |
| `1/2 cup water` | `water` | 120.0 ml |
| `3 cups shredded mozzarella` | `mozzarella` | 540.0 g |
| `2 ounces cream cheese` | `cream cheese` | 100.0 ml |
| `2 large eggs` | `eggs` | 200.0 g |
| `1 3/4 cups almond flour` | `almond flour` | 210.0 g |
| `3/4 teaspoon xanthan gum` | `xanthan gum` | 2.81 g |
| `1 large egg (beaten with 1 tablespoon water)` | `egg` | 100.0 g |

---

## Keto English Muffin (Gluten Free)

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 tablespoon butter` | `butter` | 11.25 g |
| `1  egg` | `egg` | 50.0 g |
| `2 1/2 tablespoons almond flour` | `almond flour` | 18.75 g |
| `1/2 tablespoon coconut flour` | `coconut flour` | 3.75 g |
| `1 pinch salt` | `salt` | 1.0 g |

---

## Keto Flour Mix

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 cups almond flour` | `almond flour` | 240.0 g |
| `1/3 cup coconut flour` | `coconut flour` | 40.0 g |
| `1/3 cup oat fiber (see Notes for gluten free)` | `oat fiber` | 28.8 g |
| `1 teaspoon xanthan gum` | `xanthan gum` | 3.75 g |

---

## Keto French Toast Sticks

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `8 slices keto bread` | `keto bread` | 160.0 g |
| `2 large eggs` | `eggs` | 200.0 g |
| `1/2 teaspoon pure vanilla extract` | `vanilla extract` | 2.5 ml |
| `1 cup milk of choice (whole milk, heavy cream, almond milk, low-carb milk, etc.)` | `milk (whole milk, heavy cream, almond milk, low-carb milk, etc.)` | 240.0 ml |
| `1 large pinch salt` | `pinch salt` | 100.0 g |
| `2 tablespoons unsalted butter` | `unsalted butter` | 36.0 g |
| `1 tablespoon unsalted butter` | `unsalted butter` | 18.0 g |
| `6 tablespoons granular Swerve (or keto sweetener of choice)` | `granular swerve` | 67.5 g |
| `1 1/2 teaspoons ground cinnamon` | `ground cinnamon` | 3.75 g |
| `maple-flavored keto syrup` | `maple-flavored keto syrup` | 100.0 ml |

---

## Keto French Toast

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 tablespoons butter (melted)` | `butter` | 22.5 g |
| `2 tablespoons heavy cream` | `heavy cream` | 30.0 ml |
| `1  egg` | `egg` | 50.0 g |
| `2 tablespoons coconut flour` | `coconut flour` | 15.0 g |
| `1/2 teaspoon baking powder` | `baking powder` | 2.25 g |
| `butter (for frying the bread)` | `butter` | 100.0 g |
| `1  egg` | `egg` | 50.0 g |
| `1 tablespoon heavy cream` | `heavy cream` | 15.0 ml |
| `1/4 teaspoon powdered cinnamon` | `powdered cinnamon` | 0.62 g |
| `1/2 teaspoon vanilla extract` | `vanilla extract` | 2.5 ml |

---

## Keto Rutabaga Fries

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 medium rutabagas` | `rutabagas` | 160.0 g |
| `1/4 cup avocado oil` | `avocado oil` | 60.0 ml |
| `1/2 teaspoon paprika` | `paprika` | 1.25 g |
| `1 teaspoon garlic salt` | `garlic salt` | 6.0 g |
| `1 teaspoon sea salt` | `sea salt` | 6.0 g |
| `1/4 teaspoon black pepper` | `black pepper` | 0.94 g |

---

## Keto German Chocolate Cake

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3/4 cup cocoa powder (unsweetened)` | `cocoa powder` | 90.0 g |
| `2 cups Granular Swerve Sweetener` | `granular swerve sweetener` | 360.0 g |
| `2 1/4 cups super-fine blanched almond flour` | `super-fine blanched almond flour` | 270.0 g |
| `1 teaspoon xanthan gum` | `xanthan gum` | 3.75 g |
| `2 teaspoons fresh baking powder` | `fresh baking powder` | 9.0 g |
| `1 teaspoon fresh baking soda` | `fresh baking soda` | 4.5 g |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `1 teaspoon pure vanilla extract` | `vanilla extract` | 5.0 ml |
| `1/2 cup unsalted butter (at room temperature)` | `unsalted butter` | 144.0 g |
| `4 large eggs (at room temperature)` | `eggs` | 400.0 g |
| `2/3 cup milk of choice (divided)` | `milk` | 160.0 ml |
| `2 cups heavy cream` | `heavy cream` | 480.0 ml |
| `6 large egg yolks` | `egg yolks` | 600.0 g |
| `1 cup Brown Swerve Sweetener` | `brown swerve sweetener` | 180.0 g |
| `1 cup unsalted butter (at room temperature)` | `unsalted butter` | 288.0 g |
| `1 teaspoon pure vanilla extract` | `vanilla extract` | 5.0 ml |
| `2 cups unsweetened shredded coconut` | `unsweetened coconut` | 264.0 g |
| `1 1/2 cups chopped pecans` | `pecans` | 270.0 g |
| `1 pinch coconut flour` | `coconut flour` | 1.0 g |

---

## Cheesy Keto Green Beans

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `16 ounces fresh green beans` | `fresh green beans` | 100.0 g |
| `2 tablespoons avocado oil or olive oil` | `avocado oil or olive oil` | 30.0 ml |
| `3 cloves garlic (minced)` | `garlic` | 9.0 g |
| `1 teaspoon sea salt` | `sea salt` | 6.0 g |
| `1/4 teaspoon black pepper` | `black pepper` | 0.94 g |
| `1/2 cup parmesan cheese (grated)` | `parmesan cheese` | 56.4 g |
| `1 cup mozzarella cheese (shredded)` | `mozzarella cheese` | 112.8 g |

---

## Keto Grilled Cheese

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 tablespoons butter (melted)` | `butter` | 22.5 g |
| `2 tablespoons heavy cream` | `heavy cream` | 30.0 ml |
| `1  egg` | `egg` | 50.0 g |
| `1 1/2 tablespoons coconut flour` | `coconut flour` | 11.25 g |
| `1/2 teaspoon baking powder` | `baking powder` | 2.25 g |
| `2 slices cheese (American or cheddar)` | `cheese` | 40.0 g |
| `butter` | `butter` | 100.0 g |

---

## Keto Gumbo

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/2 cup canola or avocado oil` | `canola or avocado oil` | 120.0 ml |
| `2 teaspoons xanthan gum (plus more)` | `xanthan gum` | 7.5 g |
| `2 cloves garlic` | `garlic` | 6.0 g |
| `1/2 cup onion (chopped)` | `onion` | 90.0 g |
| `1/2 cup celery (finely chopped)` | `celery` | 90.0 g |
| `1 medium green bell pepper (chopped)` | `green bell pepper` | 80.0 g |
| `1 medium red bell pepper (chopped)` | `red bell pepper` | 80.0 g |
| `1 pound chicken (chopped into 1&quot; pieces)` | `chicken` | 453.59 g |
| `1/2 teaspoon dried thyme` | `dried thyme` | 1.88 g |
| `1 tablespoon salt` | `salt` | 18.0 g |
| `1 tablespoon cajun seasoning` | `cajun seasoning` | 11.25 g |
| `1 1/2 teaspoons gumbo filé powder` | `gumbo filé powder` | 3.75 g |
| `1 pound andouille sausage (sliced into discs)` | `andouille sausage` | 453.59 g |
| `8 cups chicken broth` | `chicken broth` | 1920.0 ml |
| `1 14.5-ounce can diced tomatoes (optional)` | `tomatoes` | 400.0 g |
| `1 10-ounce package okra (thawed)` | `okra` | 300.0 g |
| `1 pound shrimp (peeled, deveined)` | `shrimp` | 453.59 g |
| `3  bay leaves` | `bay leaves` | 300.0 g |
| `2 tablespoons hot sauce (plus more if desired)` | `hot sauce` | 30.0 ml |
| `cauliflower rice (for serving)` | `cauliflower rice` | 100.0 g |
| `fresh parsley (for garnish)` | `fresh parsley` | 100.0 g |
| `green onions (for garnish)` | `green onions` | 100.0 g |

---

## Creamy Keto Lemon Curd

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `water` | `water` | 100.0 ml |
| `4 large egg yolks (at room temperature)` | `egg yolks` | 400.0 g |
| `1/2 cup Granular Swerve Sweetener (or other keto sweetener)` | `granular swerve sweetener` | 90.0 g |
| `1/3 cup freshly squeezed lemon juice` | `freshly squeezed lemon juice` | 80.0 ml |
| `1 tablespoon fresh lemon zest (optional)` | `fresh lemon zest` | 11.25 g |
| `5 tablespoons butter (divided)` | `butter` | 56.25 g |

---

## Keto Meat Pie

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `125 grams almond flour (scant 1/2 cup)` | `almond flour` | 125.0 g |
| `50 grams coconut flour (1 cup + 4 teaspoons)` | `coconut flour` | 50.0 g |
| `3/4 teaspoon xanthan gum` | `xanthan gum` | 2.81 g |
| `1 teaspoon onion powder` | `onion powder` | 2.5 g |
| `1 teaspoon garlic powder` | `garlic powder` | 2.5 g |
| `1/4 teaspoon kosher salt` | `kosher salt` | 1.5 g |
| `130 grams unsalted grass-fed butter (cold, about 1 stick + 1 1/2 tablespoons)` | `unsalted grass-fed butter` | 130.0 g |
| `70 grams cream cheese (cold, about 2 1/3 ounces)` | `cream cheese` | 70.0 ml |
| `1  egg (lightly beaten)` | `egg` | 50.0 g |
| `2 1/2 teaspoons apple cider vinegar` | `apple cider vinegar` | 12.5 ml |
| `1/2  onion (finely chopped)` | `onion` | 50.0 g |
| `2 cloves garlic (minced)` | `garlic` | 6.0 g |
| `2 tablespoons butter (or oil)` | `butter` | 22.5 g |
| `8 ounces mushrooms (sliced)` | `mushrooms` | 100.0 g |
| `1 pound ground beef` | `ground beef` | 453.59 g |
| `1 teaspoon salt` | `salt` | 6.0 g |
| `black pepper (to taste)` | `black pepper` | 100.0 g |
| `2 tablespoons tomato paste` | `tomato paste` | 22.5 g |
| `2 cups mozzarella (divided)` | `mozzarella` | 360.0 g |

---

## Keto Mug Brownie

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 tablespoons unsalted butter` | `unsalted butter` | 36.0 g |
| `1 large egg` | `egg` | 100.0 g |
| `1/2 teaspoon pure vanilla extract` | `vanilla extract` | 2.5 ml |
| `2 tablespoons Granular Swerve Sweetener` | `granular swerve sweetener` | 22.5 g |
| `2 tablespoons super-fine blanched almond flour` | `super-fine blanched almond flour` | 15.0 g |
| `2 teaspoons coconut flour` | `coconut flour` | 5.0 g |
| `2 tablespoons unsweetened cocoa powder` | `unsweetened cocoa powder` | 15.0 g |
| `1/2 teaspoon fresh baking powder` | `fresh baking powder` | 2.25 g |
| `1 pinch salt (optional)` | `salt` | 1.0 g |
| `keto-friendly chocolate chips (optional)` | `keto-friendly chocolate chips` | 100.0 g |

---

## Keto Orange Chicken

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 tablespoons milk of choice (or heavy cream)` | `milk` | 30.0 ml |
| `2 large eggs` | `eggs` | 200.0 g |
| `2/3 cup coconut flour` | `coconut flour` | 80.0 g |
| `1 teaspoon salt` | `salt` | 6.0 g |
| `1/2 teaspoon freshly ground black pepper` | `black pepper` | 1.88 g |
| `1 pound chicken breasts (approximately 2 chicken breasts, cut into bite-sized pieces)` | `chicken breasts` | 453.59 g |
| `2 tablespoons soy sauce (or lite tamari)` | `soy sauce` | 30.0 ml |
| `zest from one orange` | `zest from one orange` | 100.0 g |
| `juice from 1/2 of one orange` | `juice from 1/2 of one orange` | 100.0 ml |
| `1/4 cup erythritol (powdered or granulated)` | `erythritol` | 45.0 g |
| `1/4 cup low sodium chicken broth` | `low sodium chicken broth` | 60.0 ml |
| `1 1-inch piece fresh ginger (grated)` | `1-inch piece fresh ginger` | 100.0 g |
| `1 tablespoon rice vinegar` | `rice vinegar` | 15.0 ml |
| `1/2 teaspoon xanthan gum` | `xanthan gum` | 1.88 g |
| `coconut oil (or avocado oil, for frying)` | `coconut oil (or avocado oil, for frying)` | 100.0 ml |
| `sesame seeds (optional, for garnish)` | `sesame seeds` | 100.0 g |
| `chopped green onions (optional, for garnish)` | `green onions` | 100.0 g |

---

## Keto Peach Cobbler

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4 cups frozen peaches` | `frozen peaches` | 720.0 g |
| `1/4 cup erythritol (granulated )` | `erythritol` | 45.0 g |
| `1 tablespoon cinnamon` | `cinnamon` | 7.5 g |
| `1 teaspoon xanthan gum` | `xanthan gum` | 3.75 g |
| `2 teaspoons lemon juice` | `lemon juice` | 10.0 ml |
| `1 cup almond flour` | `almond flour` | 120.0 g |
| `2 tablespoons coconut flour` | `coconut flour` | 15.0 g |
| `2 tablespoons erythritol (granulated)` | `erythritol` | 22.5 g |
| `1 1/2 teaspoons baking powder` | `baking powder` | 6.75 g |
| `1 large egg` | `egg` | 100.0 g |
| `3 tablespoons heavy cream` | `heavy cream` | 45.0 ml |
| `1/4 cup butter (melted)` | `butter` | 45.0 g |

---

## Keto Red Velvet Cake

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4 cups superfine blanched almond flour` | `superfine blanched almond flour` | 480.0 g |
| `2 teaspoons fresh baking powder` | `fresh baking powder` | 9.0 g |
| `1/2 teaspoon kosher salt` | `kosher salt` | 3.0 g |
| `2 sticks unsalted butter (16 tablespoons, at room temperature)` | `unsalted butter` | 226.0 g |
| `1 cup Granular Swerve Sweetener` | `granular swerve sweetener` | 180.0 g |
| `1 tablespoon pure vanilla extract` | `vanilla extract` | 15.0 ml |
| `8 large eggs (at room temperature)` | `eggs` | 800.0 g |
| `1/2 cup avocado oil` | `avocado oil` | 120.0 ml |
| `2 teaspoons apple cider vinegar` | `apple cider vinegar` | 10.0 ml |
| `5 tablespoons cocoa powder` | `cocoa powder` | 37.5 g |
| `2 tablespoons red food coloring (plus more, see Notes)` | `red food coloring` | 22.5 g |
| `1/2 cup heavy cream` | `heavy cream` | 120.0 ml |
| `2 8-ounce blocks full-fat cream cheese (16 ounces, at room temperature)` | `blocks full-fat cream cheese` | 200.0 ml |
| `3 tablespoons unsalted butter (at room temperature)` | `unsalted butter` | 54.0 g |
| `2 cups Confectioners Swerve Sweetener` | `confectioners swerve sweetener` | 360.0 g |
| `2 teaspoons pure vanilla extract` | `vanilla extract` | 10.0 ml |

---

## Keto Salsa

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3  roma tomatoes` | `roma tomatoes` | 300.0 g |
| `1 15-ounce can whole, peeled tomatoes` | `tomatoes` | 400.0 g |
| `1/3 cup sweet onion (chopped)` | `sweet onion` | 60.0 g |
| `1/2 of one jalapeño (deseeded, chopped)` | `jalapeño` | 50.0 g |
| `2 tablespoons lime juice` | `lime juice` | 30.0 ml |
| `1/3 cup fresh cilantro (chopped)` | `fresh cilantro` | 60.0 g |
| `1/3 teaspoon cumin` | `cumin` | 0.83 g |
| `1/3 teaspoon oregano` | `oregano` | 1.25 g |
| `1 clove garlic (crushed)` | `garlic` | 3.0 g |
| `salt and pepper (to taste)` | `salt and pepper` | 100.0 g |

---

## Keto Sloppy Joes

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 tablespoon butter` | `butter` | 11.25 g |
| `1 pound ground beef` | `ground beef` | 453.59 g |
| `1/2 of one yellow onion (see Notes)` | `yellow onion` | 50.0 g |
| `2 cloves garlic (minced)` | `garlic` | 6.0 g |
| `1 tablespoon no-sugar-added tomato paste` | `no-sugar-added tomato paste` | 12.75 g |
| `1/2 cup sugar-free ketchup` | `sugar-free ketchup` | 102.0 g |
| `1/3 cup beef broth` | `beef broth` | 80.0 ml |
| `1 tablespoon Brown Swerve Sweetener (optional)` | `brown swerve sweetener` | 11.25 g |
| `1/2 teaspoon chili powder` | `chili powder` | 1.25 g |
| `1 teaspoon yellow mustard` | `yellow mustard` | 3.75 g |
| `1 teaspoon Worcestershire (see Notes)` | `worcestershire` | 3.75 g |
| `1/4 teaspoon salt` | `salt` | 1.5 g |
| `1/4 teaspoon black pepper` | `black pepper` | 0.94 g |

---

## Keto Smothered Pork Chops

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4 medium bone-in pork chops (approximately 6 ounces each, 3/4-1 inch thick)` | `pork chops` | 320.0 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly cracked black pepper (to taste)` | `black pepper` | 100.0 g |
| `5 strips bacon (chopped)` | `bacon` | 75.0 g |
| `8 ounces mushrooms (chopped)` | `mushrooms` | 100.0 g |
| `1 medium leek (chopped, approximately 1 cup )` | `leek` | 80.0 g |
| `1 tablespoon salted butter` | `salted butter` | 18.0 g |
| `3-4 cloves garlic (minced)` | `garlic` | 9.0 g |
| `1/2 cup low-sodium chicken broth` | `low-sodium chicken broth` | 120.0 ml |
| `1/2 cup heavy cream (at room temperature)` | `heavy cream` | 120.0 ml |
| `2 ounces full-fat cream cheese (softened)` | `full-fat cream cheese` | 100.0 ml |
| `1 teaspoon finely chopped fresh parsley` | `fresh parsley` | 3.75 g |
| `1/2 teaspoon finely chopped fresh thyme` | `fresh thyme` | 1.88 g |

---

## Keto Spaghetti and Meatballs

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 pound ground beef (see Notes)` | `ground beef` | 453.59 g |
| `1  garlic clove (minced)` | `garlic clove` | 100.0 g |
| `2 tablespoons heavy cream` | `heavy cream` | 30.0 ml |
| `1/4 cup freshly grated parmesan cheese (see Notes)` | `parmesan cheese` | 28.2 g |
| `1/4 cup freshly shredded mozzarella cheese` | `mozzarella cheese` | 28.2 g |
| `1 teaspoon Italian seasoning` | `italian seasoning` | 3.75 g |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `1/4 teaspoon black pepper` | `black pepper` | 0.94 g |
| `1 tablespoon olive oil` | `olive oil` | 15.0 ml |
| `2  garlic cloves (minced)` | `garlic cloves` | 200.0 g |
| `1 14.5-ounce can diced tomatoes (no sugar added)` | `tomatoes` | 400.0 g |
| `1 teaspoon Italian seasoning` | `italian seasoning` | 3.75 g |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `24 ounces Palmini noodles (see Notes)` | `palmini noodles` | 100.0 g |

---

## Keto Tamales

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `10  corn husks (rinsed)` | `corn husks` | 1000.0 g |
| `1 pound ground beef` | `ground beef` | 453.59 g |
| `2 tablespoons keto taco seasoning` | `keto taco seasoning` | 22.5 g |
| `3 tablespoons water` | `water` | 45.0 ml |
| `2 cups almond flour` | `almond flour` | 240.0 g |
| `1/2 cup butter (melted)` | `butter` | 90.0 g |
| `1/4 cup ground flax` | `ground flax` | 45.0 g |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `1 teaspoon baking powder` | `baking powder` | 4.5 g |
| `2 tablespoons water` | `water` | 30.0 ml |
| `salsa` | `salsa` | 100.0 g |
| `diced avocado` | `avocado` | 100.0 g |
| `sour cream` | `sour cream` | 100.0 ml |
| `lime juice` | `lime juice` | 100.0 ml |
| `chopped cilantro` | `cilantro` | 100.0 g |

---

## Keto Teriyaki Sauce

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/2 cup coconut aminos` | `coconut aminos` | 66.0 g |
| `2 tablespoons sugar-free brown sugar (such as granular Swerve)` | `sugar-free brown sugar` | 25.5 g |
| `2 teaspoon fresh ginger (grated)` | `fresh ginger` | 7.5 g |
| `1  garlic clove (grated)` | `garlic clove` | 100.0 g |
| `3 tablespoons apple cider vinegar` | `apple cider vinegar` | 45.0 ml |
| `1/4 teaspoon xanthan gum` | `xanthan gum` | 0.94 g |

---

## Keto Truffles

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `9 ounces Lily's chocolate chips (dark, milk, or semi-sweet)` | `lily's chocolate chips (dark, milk, or semi-sweet)` | 100.0 ml |
| `2/3 cup heavy whipping cream` | `heavy whipping cream` | 160.0 ml |
| `1/4 teaspoon vanilla` | `vanilla` | 0.94 g |
| `1/2 cup Lily&#039;s chocolate chips (dark, milk, or semi-sweet)` | `lily&#039;s chocolate chips (dark, milk, or semi-sweet)` | 120.0 ml |
| `1 tablespoon coconut oil` | `coconut oil` | 15.0 ml |
| `cocoa powder` | `cocoa powder` | 100.0 g |
| `chocolate sprinkles (sugar-free)` | `chocolate sprinkles` | 100.0 g |
| `sea salt` | `sea salt` | 100.0 g |

---

## Keto Whipped Cream

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 cup heavy cream` | `heavy cream` | 240.0 ml |
| `1 teaspoon vanilla extract` | `vanilla extract` | 5.0 ml |
| `2 tablespoons powdered erythritol` | `powdered erythritol` | 15.0 g |

---

## Keto White Chicken Chili

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4 cups shredded chicken` | `chicken` | 720.0 g |
| `1 1/2 teaspoons chili powder` | `chili powder` | 3.75 g |
| `1 1/2 teaspoons onion powder` | `onion powder` | 3.75 g |
| `1 teaspoon garlic powder` | `garlic powder` | 2.5 g |
| `1 tablespoon cumin` | `cumin` | 7.5 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `pepper (to taste)` | `pepper` | 100.0 g |
| `6 tablespoons butter` | `butter` | 67.5 g |
| `1-2 cloves garlic (minced)` | `garlic` | 3.0 g |
| `1/2 cup green onion (chopped, white and green parts separated)` | `green onion` | 90.0 g |
| `3/4 cup chicken broth` | `chicken broth` | 180.0 ml |
| `2 cups heavy cream` | `heavy cream` | 480.0 ml |
| `4 ounces cream cheese (softened)` | `cream cheese` | 100.0 ml |
| `1 teaspoon sriracha` | `sriracha` | 3.75 g |
| `1 1/2 cup Monterey Jack cheese (shredded, at room temperature)` | `monterey jack cheese` | 169.2 g |
| `2 4-ounce cans diced green chilies (8 ounces total, undrained)` | `green chilies` | 800.0 g |

---

## Kielbasa and Cabbage Skillet

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 tablespoon avocado oil (or vegetable oil, plus more as needed)` | `avocado oil` | 15.0 ml |
| `14 ounces kielbasa (sliced into 1/2-inch-thick pieces)` | `kielbasa` | 100.0 g |
| `1 cup finely chopped white onion (approximately 1 medium white onion)` | `white onion` | 180.0 g |
| `1 1/2 tablespoons minced garlic (approximately 3 large cloves)` | `garlic` | 16.88 g |
| `8 cups thinly sliced green cabbage (approximately 1 medium head)` | `green cabbage` | 1440.0 g |
| `1 teaspoon paprika` | `paprika` | 2.5 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly cracked black pepper (to taste)` | `black pepper` | 100.0 g |

---

## Lactation Brownies

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/2 cup refined coconut oil` | `refined coconut oil` | 120.0 ml |
| `1 1/2 cups chocolate chips  (dark, semi-sweet, or milk; divided)` | `chocolate chips` | 270.0 g |
| `1 cup coconut sugar (or granulated sugar, see Notes)` | `coconut sugar` | 204.0 g |
| `2 large eggs (at room temperature)` | `eggs` | 200.0 g |
| `1 teaspoon pure vanilla extract` | `vanilla extract` | 5.0 ml |
| `1/4 cup unsweetened cocoa powder` | `unsweetened cocoa powder` | 30.0 g |
| `1/4 cup oat flour (or all-purpose flour)` | `oat flour` | 21.6 g |
| `1 cup old-fashioned rolled oats` | `old-fashioned rolled oats` | 86.4 g |
| `1/4 cup brewer&#39;s yeast` | `brewer&#39;s yeast` | 45.0 g |
| `2 tablespoons ground flaxseed` | `ground flaxseed` | 19.5 g |
| `1/4 teaspoon salt` | `salt` | 1.5 g |

---

## Lima Bean Soup

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `6 cups chicken stock ( or water, plus more if needed)` | `chicken stock` | 1440.0 ml |
| `1 pound dried lima beans` | `dried lima beans` | 453.59 g |
| `1 tablespoon avocado oil (or vegetable oil)` | `avocado oil` | 15.0 ml |
| `3  stalks celery (diced)` | `celery` | 120.0 g |
| `1  onion (diced)` | `onion` | 100.0 g |
| `3  carrots (peeled and sliced)` | `carrots` | 300.0 g |
| `4 cloves garlic (minced or pressed)` | `garlic` | 12.0 g |
| `8 ounces cooked ham (diced)` | `ham` | 100.0 g |
| `1 1/2 teaspoons salt` | `salt` | 9.0 g |
| `1 teaspoon ground black pepper` | `ground black pepper` | 3.75 g |
| `2 tablespoons fresh parsley chopped` | `fresh parsley` | 22.5 g |

---

## Loaded Baked Potato Dip

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `12 ounces bacon (finely chopped)` | `bacon` | 100.0 g |
| `8 ounces cream cheese` | `cream cheese` | 100.0 ml |
| `8 ounces sour cream` | `sour cream` | 100.0 ml |
| `2 tablespoons milk` | `milk` | 30.0 ml |
| `1 cup shredded cheddar cheese` | `cheddar cheese` | 112.8 g |
| `1 tablespoon onion powder` | `onion powder` | 7.5 g |
| `1 teaspoon garlic powder` | `garlic powder` | 2.5 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `pepper (to taste)` | `pepper` | 100.0 g |
| `4  green onions (thin sliced)` | `green onions` | 400.0 g |

---

## Lobster Fried Rice

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 teaspoon sesame oil` | `sesame oil` | 5.0 ml |
| `1/2 cup diced white onions` | `white onions` | 90.0 g |
| `1 cup frozen mixed vegetables` | `frozen mixed vegetables` | 180.0 g |
| `2 large eggs` | `eggs` | 200.0 g |
| `3 tablespoons butter (divided)` | `butter` | 33.75 g |
| `4 cups cooked white rice (cool to touch)` | `white rice` | 816.0 g |
| `3 tablespoons soy sauce (divided)` | `soy sauce` | 45.0 ml |
| `1 pound cooked lobster (cut into 1/2-inch-long pieces)` | `lobster` | 453.59 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly ground black pepper (to taste)` | `black pepper` | 100.0 g |
| `sesame seeds (optional, to garnish)` | `sesame seeds` | 100.0 g |

---

## Lobster Mashed Potatoes

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3  pounds russet or Yukon gold potatoes (washed, peeled, cut into 2-inch cubes)` | `russet or yukon gold potatoes` | 1360.77 g |
| `salt (more or less to taste)` | `salt` | 100.0 g |
| `freshly ground black pepper (more or less to taste)` | `black pepper` | 100.0 g |
| `3 cloves garlic (whole, peeled)` | `garlic` | 9.0 g |
| `1 tablespoon butter (sliced in 4)` | `butter` | 11.25 g |
| `2/3 cup heavy cream` | `heavy cream` | 160.0 ml |
| `1/2 cup milk (whole or 2%)` | `milk` | 120.0 ml |
| `8 ounces pre-cooked lobster meat (chopped into bite-sized pieces)` | `pre-cooked lobster meat` | 100.0 g |
| `1 tablespoon butter` | `butter` | 11.25 g |
| `1 clove garlic (minced)` | `garlic` | 3.0 g |
| `2 teaspoons fresh lemon juice` | `fresh lemon juice` | 10.0 ml |
| `1 tablespoon butter (melted, more or less to taste)` | `butter` | 11.25 g |
| `finely chopped fresh chives` | `fresh chives` | 100.0 g |

---

## Lollipop Chicken Legs

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 cup ketchup` | `ketchup` | 180.0 g |
| `1/4 cup white wine vinegar (or apple cider vinegar)` | `white wine vinegar` | 60.0 ml |
| `2 packed tablespoons brown sugar` | `tablespoons brown sugar` | 200.0 g |
| `1 teaspoon Worcestershire sauce` | `worcestershire sauce` | 5.0 ml |
| `1 teaspoon Dijon mustard` | `dijon mustard` | 3.75 g |
| `1 clove garlic (minced)` | `garlic` | 3.0 g |
| `1/2 teaspoon onion powder` | `onion powder` | 1.25 g |
| `1 pinch salt (more or less to taste)` | `salt` | 1.0 g |
| `1 pinch freshly ground black pepper (more or less to taste)` | `black pepper` | 1.0 g |
| `8 medium bone-in, skin-on chicken drumsticks (approximately 4 to 6 ounces each)` | `chicken drumsticks` | 640.0 g |
| `1/2 tablespoon garlic powder` | `garlic powder` | 3.75 g |
| `1/2 tablespoon onion powder` | `onion powder` | 3.75 g |
| `1/2 tablespoon smoked paprika` | `smoked paprika` | 3.75 g |
| `1 teaspoon chili powder` | `chili powder` | 2.5 g |
| `1 teaspoon mustard powder` | `mustard powder` | 2.5 g |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `1/4 teaspoon freshly ground black pepper (more or less to taste)` | `black pepper` | 0.94 g |

---

## Low Carb Chili (No Beans!)

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1-2 tablespoons neutral oil (avocado oil, olive oil, etc.)` | `neutral oil (avocado oil, olive oil, etc.)` | 15.0 ml |
| `1 cup finely chopped onion (white or red onion, approximately 1/2 of 1 medium onion)` | `onion` | 180.0 g |
| `1 1/2 tablespoons finely minced fresh garlic (more or less to taste)` | `fresh garlic` | 16.88 g |
| `2 pounds ground beef (85/15 recommended)` | `ground beef` | 907.18 g |
| `1 28-ounce can diced tomatoes (do not drain)` | `tomatoes` | 400.0 g |
| `1/4 cup tomato paste` | `tomato paste` | 45.0 g |
| `1/4 cup chili powder (more or less to taste)` | `chili powder` | 30.0 g |
| `2 tablespoons ground cumin (more or less to taste)` | `ground cumin` | 15.0 g |
| `1 tablespoon salt (more or less to taste)` | `salt` | 18.0 g |
| `1 teaspoon freshly cracked black pepper (more or less to taste)` | `black pepper` | 3.75 g |
| `1/2 teaspoon smoked paprika (more or less to taste)` | `smoked paprika` | 1.25 g |
| `1 cup low-sodium beef broth` | `low-sodium beef broth` | 240.0 ml |
| `shredded cheddar cheese` | `cheddar cheese` | 100.0 g |
| `chopped onion` | `onion` | 100.0 g |
| `sour cream` | `sour cream` | 100.0 ml |
| `low carb cornbread (or keto cornbread)` | `low carb cornbread` | 100.0 g |

---

## Mango Habanero Sauce

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1  mango` | `mango` | 100.0 g |
| `3  habanero peppers (2 seeded, see notes)` | `habanero peppers` | 300.0 g |
| `3 cloves garlic` | `garlic` | 9.0 g |
| `2 tablespoons white vinegar` | `white vinegar` | 30.0 ml |
| `3 tablespoons lime juice` | `lime juice` | 45.0 ml |
| `3 tablespoons maple syrup` | `maple syrup` | 45.0 ml |
| `1/2 teaspoon paprika` | `paprika` | 1.25 g |
| `1 teaspoon salt` | `salt` | 6.0 g |

---

## Mango Habanero Wings

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 large mango (peeled, pit removed, diced)` | `mango` | 100.0 g |
| `3 medium habanero peppers (see Notes)` | `habanero peppers` | 240.0 g |
| `3 cloves garlic (roughly chopped)` | `garlic` | 9.0 g |
| `2 tablespoons white vinegar` | `white vinegar` | 30.0 ml |
| `3 tablespoons freshly squeezed lime juice` | `freshly squeezed lime juice` | 45.0 ml |
| `3 tablespoons pure maple syrup` | `maple syrup` | 45.0 ml |
| `1/2 teaspoon paprika (plus more to taste)` | `paprika` | 1.25 g |
| `1 teaspoon salt (more or less to taste)` | `salt` | 6.0 g |
| `1 tablespoon aluminum-free baking powder` | `aluminum-free baking powder` | 13.5 g |
| `1/2 teaspoon garlic powder (plus more to taste)` | `garlic powder` | 1.25 g |
| `1/2 teaspoon paprika (plus more to taste)` | `paprika` | 1.25 g |
| `1/4 teaspoon freshly cracked black pepper (plus more to taste)` | `black pepper` | 0.94 g |
| `1/2 teaspoon salt (plus more to taste)` | `salt` | 3.0 g |
| `10 whole bone-in chicken wings (cut into 10 flats and 10 drumettes)` | `chicken wings` | 1000.0 g |

---

## Mango Pineapple Smoothie

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 cup cubed mango (frozen)` | `mango` | 180.0 g |
| `1 cup cubed pineapple (frozen)` | `pineapple` | 180.0 g |
| `1 1/4 cup almond milk (or other milk of choice)` | `almond milk` | 300.0 ml |
| `1/4 cup Greek yogurt (plain or vanilla)` | `greek yogurt` | 45.0 g |
| `2 tablespoons maple syrup or honey (optional, for sweetness)` | `maple syrup or honey` | 30.0 ml |

---

## Matcha Brownies with White Chocolate Chips

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/2 cup unsalted butter (melted but not bubbling)` | `unsalted butter` | 144.0 g |
| `3/4 cup white sugar (see Notes)` | `white sugar` | 153.0 g |
| `1/4 packed cup brown sugar (see Notes)` | `cup brown sugar` | 25.0 g |
| `3 large eggs (at room temperature)` | `eggs` | 300.0 g |
| `1 teaspoon pure vanilla extract` | `vanilla extract` | 5.0 ml |
| `1 cup all-purpose flour (see Notes)` | `all-purpose flour` | 120.0 g |
| `2 tablespoons ceremonial-grade matcha powder` | `ceremonial-grade matcha powder` | 15.0 g |
| `1/4 teaspoon salt` | `salt` | 1.5 g |
| `1 cup high-quality white chocolate chips (Ghirardelli, Godiva, Hershey&#39;s, etc.)` | `high-quality white chocolate chips` | 180.0 g |

---

## Mesquite Grilled Chicken

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 pounds boneless, skinless chicken (breasts and/or thighs)` | `chicken` | 907.18 g |
| `1/4 cup olive oil` | `olive oil` | 60.0 ml |
| `1/4 cup white wine vinegar (or apple cider vinegar)` | `white wine vinegar` | 60.0 ml |
| `3 packed tablespoons brown sugar` | `tablespoons brown sugar` | 300.0 g |
| `1 teaspoon  mesquite liquid smoke (see Notes)` | `mesquite liquid smoke` | 3.75 g |
| `1 teaspoon Worcestershire sauce` | `worcestershire sauce` | 5.0 ml |
| `4-5 cloves garlic (minced)` | `garlic` | 12.0 g |
| `1/2 teaspoon onion powder` | `onion powder` | 1.25 g |
| `1/2 teaspoon smoked paprika` | `smoked paprika` | 1.25 g |
| `juice of half a lemon (1-2 tablespoons)` | `juice of half a lemon` | 100.0 ml |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `1/2 teaspoon pepper (more or less to taste)` | `pepper` | 1.88 g |

---

## Mexican Chili

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 tablespoon avocado oil (or other neutral oil)` | `avocado oil` | 15.0 ml |
| `1 small yellow onion (chopped)` | `yellow onion` | 50.0 g |
| `2 tablespoons minced garlic` | `garlic` | 22.5 g |
| `2 pounds ground beef (lean preferred)` | `ground beef` | 907.18 g |
| `1 tablespoon tomato paste` | `tomato paste` | 11.25 g |
| `3 tablespoons chili powder` | `chili powder` | 22.5 g |
| `1/2 tablespoon dried Mexican oregano` | `dried mexican oregano` | 5.62 g |
| `2 teaspoons cumin` | `cumin` | 5.0 g |
| `1 teaspoon salt (more or less to taste)` | `salt` | 6.0 g |
| `1 pinch cayenne pepper (optional)` | `cayenne pepper` | 1.0 g |
| `2 14-ounce cans fire-roasted diced tomatoes (do not drain)` | `fire-roasted tomatoes` | 800.0 g |
| `1/2 cup red enchilada sauce` | `red enchilada sauce` | 120.0 ml |
| `2 15-ounce cans red kidney beans (drained)` | `red kidney beans` | 800.0 g |
| `sour cream` | `sour cream` | 100.0 ml |
| `shredded cheddar cheese` | `cheddar cheese` | 100.0 g |
| `tortilla strips` | `tortilla strips` | 100.0 g |

---

## Mexican Omelette

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3 large eggs` | `eggs` | 300.0 g |
| `1/4 cup milk of choice` | `milk` | 60.0 ml |
| `1 tablespoon olive oil (or other neutral oil)` | `olive oil` | 15.0 ml |
| `3 tablespoons chopped yellow onion` | `yellow onion` | 33.75 g |
| `1/4 cup chopped bell pepper (green, red, yellow, or orange)` | `bell pepper (green, red, yellow, or orange)` | 45.0 g |
| `half of one Roma tomato (diced)` | `half of one roma tomato` | 100.0 g |
| `1/4 cup shredded Mexican cheese` | `mexican cheese` | 28.2 g |
| `sour cream` | `sour cream` | 100.0 ml |
| `salsa (or pico de gallo)` | `salsa` | 100.0 g |
| `chopped fresh cilantro` | `fresh cilantro` | 100.0 g |
| `sliced avocado` | `avocado` | 100.0 g |
| `diced jalapeños` | `jalapeños` | 100.0 g |

---

## Mexican Stuffed Peppers

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `6 medium bell peppers (approximately 8 ounces each)` | `bell peppers` | 480.0 g |
| `1 cup water` | `water` | 240.0 ml |
| `1 tablespoon avocado oil (or other neutral-flavored oil)` | `avocado oil` | 15.0 ml |
| `1/2 cup chopped onion (white onion or yellow onion)` | `onion` | 90.0 g |
| `1 tablespoon minced garlic (approximately 2 large cloves)` | `garlic` | 11.25 g |
| `1 pound ground turkey` | `ground turkey` | 453.59 g |
| `1 10-ounce can diced tomatoes and green chilies` | `tomatoes and green chilies` | 400.0 g |
| `2 tablespoons taco seasoning (store-bought or make your own)` | `taco seasoning` | 22.5 g |
| `salt (optional, to taste)` | `salt` | 100.0 g |
| `3/4 cup water` | `water` | 180.0 ml |
| `1 cup shredded Mexican cheese blend (at room temperature)` | `mexican cheese blend` | 112.8 g |
| `1 cup cooked rice` | `rice` | 204.0 g |
| `1 cup frozen corn kernels` | `frozen corn kernels` | 180.0 g |
| `1 15-ounce can black beans (drained, rinsed)` | `black beans` | 400.0 g |
| `1 cup shredded Mexican cheese blend (at room temperature)` | `mexican cheese blend` | 112.8 g |

---

## Mini Corn Dogs in the Air Fryer with Smoky Mustard Sauce

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 box frozen mini corn dogs (approximately 30 ounces)` | `frozen mini corn dogs` | 300.0 g |
| `1/4 cup yellow mustard` | `yellow mustard` | 45.0 g |
| `2 tablespoons honey` | `honey` | 30.0 ml |
| `2 teaspoons smoked paprika` | `smoked paprika` | 5.0 g |
| `1 teaspoon cajun seasoning` | `cajun seasoning` | 3.75 g |
| `salt (to taste)` | `salt` | 100.0 g |

---

## Mock Chicken Legs

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 lb pork (cut into 2-inch cubes)` | `pork` | 453.59 g |
| `salt &amp; black pepper (to taste)` | `salt &amp; black pepper` | 100.0 g |
| `2  eggs` | `eggs` | 100.0 g |
| `1/4 cup milk` | `milk` | 60.0 ml |
| `1 cup panko breadcrumbs` | `panko breadcrumbs` | 108.0 g |
| `2 tsp salt` | `salt` | 12.0 g |
| `1 tsp garlic powder` | `garlic powder` | 2.5 g |
| `1 tsp onion powder` | `onion powder` | 2.5 g |
| `1/2 tsp black pepper` | `black pepper` | 1.88 g |
| `vegetable oil (for frying)` | `vegetable oil` | 100.0 ml |

---

## Mushroom Stroganoff

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 quarts water` | `water` | 1920.0 ml |
| `1 tablespoon sea salt` | `sea salt` | 18.0 g |
| `2 cups wide egg noodles (uncooked)` | `wide egg noodles` | 360.0 g |
| `4 tablespoons butter (at room temperature)` | `butter` | 45.0 g |
| `1 cup minced onion (approximately 1 medium onion)` | `onion` | 180.0 g |
| `7 cups sliced fresh mushrooms (16 ounces, baby bella mushrooms preferred)` | `fresh mushrooms` | 1260.0 g |
| `1 tablespoon minced garlic` | `garlic` | 11.25 g |
| `1/4 cup all-purpose flour` | `all-purpose flour` | 30.0 g |
| `1 teaspoon salt` | `salt` | 6.0 g |
| `1/2 teaspoon cracked fresh black pepper` | `fresh black pepper` | 1.88 g |
| `1 1/4 cups vegetable broth` | `vegetable broth` | 300.0 ml |
| `1/4 cup dry white wine (or sherry, or additional vegetable broth)` | `dry white wine (or sherry, or additional vegetable broth)` | 60.0 ml |
| `1 1/2 teaspoons Worcestershire sauce (or 1 tablespoon soy sauce)` | `worcestershire sauce` | 7.5 ml |
| `1 cup full-fat sour cream (at room temperature)` | `full-fat sour cream` | 240.0 ml |

---

## Oatmeal Cranberry Cookies

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 cup dried cranberries` | `dried cranberries` | 180.0 g |
| `hot water (enough to cover cranberries)` | `hot water` | 100.0 ml |
| `1 1/2 cups gluten-free flour (see Notes)` | `gluten-free flour` | 180.0 g |
| `1 teaspoon baking soda` | `baking soda` | 4.5 g |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `1 teaspoon cinnamon` | `cinnamon` | 2.5 g |
| `1/2 cup unsalted butter (at room temperature, cut into small pieces)` | `unsalted butter` | 144.0 g |
| `1/2 packed cup brown sugar` | `cup brown sugar` | 50.0 g |
| `1/3 cup granulated sugar` | `granulated sugar` | 68.0 g |
| `2 large eggs (at room temperature)` | `eggs` | 200.0 g |
| `2 teaspoons pure vanilla extract` | `vanilla extract` | 10.0 ml |
| `2 1/4 cups old-fashioned oats (or rolled oats)` | `old-fashioned oats` | 194.4 g |

---

## Juicy Oven Roasted Turkey Legs

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4  turkey legs (drumsticks or drumstick &amp; thigh portions, NOT smoked)` | `turkey legs (drumsticks or drumstick &amp; thigh portions, not smoked)` | 400.0 g |
| `2 tablespoons olive oil (or melted butter)` | `olive oil` | 30.0 ml |
| `1 teaspoon kosher salt  (plus more to taste)` | `kosher salt` | 6.0 g |
| `1 teaspoon smoked paprika` | `smoked paprika` | 2.5 g |
| `1 teaspoon garlic powder` | `garlic powder` | 2.5 g |
| `1 teaspoon onion powder` | `onion powder` | 2.5 g |
| `1 teaspoon dried thyme (rosemary, or sage)` | `dried thyme (rosemary, or sage)` | 3.75 g |
| `1/2 teaspoon black pepper` | `black pepper` | 1.88 g |
| `1/2 teaspoon crushed red pepper flakes (optional, for a little kick)` | `crushed red pepper flakes` | 1.88 g |
| `1/2 cup chicken broth (or turkey stock)` | `chicken broth` | 120.0 ml |
| `2 tablespoons soy sauce (or Worcestershire sauce)` | `soy sauce` | 30.0 ml |
| `pan drippings and juices from roasted turkey legs (leave everything in the pan!)` | `pan drippings and juices from roasted turkey legs` | 100.0 ml |
| `2 tablespoons butter (or skimmed fat from the pan if you have enough)` | `butter` | 22.5 g |
| `2 tablespoons all-purpose flour` | `all-purpose flour` | 15.0 g |
| `1 1/2 cups chicken broth (or turkey broth, warm)` | `chicken broth (or turkey broth, warm)` | 360.0 ml |

---

## No Bake Peanut Butter Energy Balls

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 cup rolled oats` | `rolled oats` | 86.4 g |
| `1/2 cup creamy peanut butter` | `creamy peanut butter` | 120.0 ml |
| `1/3 cup pure maple syrup` | `maple syrup` | 80.0 ml |
| `2 teaspoons pure vanilla extract` | `vanilla extract` | 10.0 ml |
| `1/2 cup mini chocolate chips` | `mini chocolate chips` | 90.0 g |
| `1/4 cup ground flaxseed (plus more as needed)` | `ground flaxseed` | 39.0 g |
| `1/2 cup unsweetened shredded coconut (optional)` | `unsweetened coconut` | 66.0 g |

---

## Peanut Butter Maple Syrup

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/2 cup maple syrup` | `maple syrup` | 120.0 ml |
| `1/4 cup peanut butter (creamy)` | `peanut butter` | 33.0 g |

---

## Peanut Butter Overnight Oats

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 tablespoon creamy peanut butter` | `creamy peanut butter` | 30.0 ml |
| `3/4 cup almond milk` | `almond milk` | 180.0 ml |
| `1 cup rolled oats` | `rolled oats` | 86.4 g |
| `1 tablespoon maple syrup` | `maple syrup` | 15.0 ml |
| `2 teaspoons pure vanilla extract` | `vanilla extract` | 10.0 ml |
| `1/4 cup Greek yogurt (or 1/4 cup almond milk)` | `greek yogurt` | 45.0 g |
| `1 tablespoon chia seeds` | `chia seeds` | 10.8 g |
| `1 pinch salt (to taste)` | `salt` | 1.0 g |
| `banana slices` | `banana slices` | 100.0 g |
| `melted peanut butter` | `peanut butter` | 100.0 g |
| `cacao nibs` | `cacao nibs` | 100.0 g |

---

## Peanut Butter Pancakes

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 large egg` | `egg` | 100.0 g |
| `1 cup all-purpose flour (regular or gluten free)` | `all-purpose flour` | 120.0 g |
| `3 tablespoons creamy peanut butter` | `creamy peanut butter` | 45.0 ml |
| `1 1/4 cup milk of choice (whole milk, 2%, unsweetened almond milk, etc.)` | `milk` | 300.0 ml |
| `1 tablespoon granulated sugar` | `granulated sugar` | 12.75 g |
| `2 teaspoons fresh baking powder` | `fresh baking powder` | 9.0 g |
| `1/4 teaspoon salt (more or less to taste)` | `salt` | 1.5 g |
| `2 teaspoons neutral-flavored oil (avocado oil, vegetable oil, etc.)` | `neutral-flavored oil (avocado oil, vegetable oil, etc.)` | 10.0 ml |
| `butter` | `butter` | 100.0 g |
| `maple syrup` | `maple syrup` | 100.0 ml |
| `chocolate chips` | `chocolate chips` | 100.0 g |

---

## Pecan Crusted Chicken with Honey Mustard Yogurt Sauce

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 cup pecans (whole or halved; unsalted, unflavored)` | `pecans` | 180.0 g |
| `1 teaspoon paprika (smoked or sweet)` | `paprika` | 2.5 g |
| `1 dash cayenne pepper` | `cayenne pepper` | 1.0 g |
| `4 medium boneless, skinless chicken breasts (approximately 6 ounces each, pounded thin)` | `chicken breasts` | 320.0 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly cracked black pepper (to taste)` | `black pepper` | 100.0 g |
| `4 tablespoons Dijon mustard` | `dijon mustard` | 45.0 g |
| `1 cup plain Greek yogurt` | `greek yogurt` | 180.0 g |
| `2 tablespoons yellow mustard` | `yellow mustard` | 22.5 g |
| `2 tablespoons Dijon mustard` | `dijon mustard` | 22.5 g |
| `1/4 cup local honey` | `local honey` | 60.0 ml |

---

## Perfect Avocado Omelette

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3 large eggs` | `eggs` | 300.0 g |
| `1/4 cup milk of choice` | `milk` | 60.0 ml |
| `1/4 cup shredded cheese of choice (plus more for topping (optional))` | `cheese` | 28.2 g |
| `1/4 of one red onion (thinly sliced, plus more for topping (optional))` | `red onion` | 25.0 g |
| `1/2 cup cherry tomatoes (sliced or chopped, plus more for topping (optional))` | `cherry tomatoes` | 90.0 g |
| `1/2 of one ripe avocado (peeled, pit removed, sliced or chopped;  plus more for topping (optional))` | `avocado` | 50.0 g |
| `fresh herbs (chopped, for topping (optional))` | `fresh herbs` | 100.0 g |

---

## Vegan Pound Cake

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 cup plant-based milk (i.e. soy or almond milk)` | `plant-based milk` | 240.0 ml |
| `1 tablespoon lemon juice` | `lemon juice` | 15.0 ml |
| `2 cups all-purpose flour (see Notes)` | `all-purpose flour` | 240.0 g |
| `1 tablespoon baking powder` | `baking powder` | 13.5 g |
| `1/4 teaspoon salt` | `salt` | 1.5 g |
| `1/2 cup vegan butter (melted)` | `vegan butter` | 90.0 g |
| `1 cup granulated sugar (see Notes)` | `granulated sugar` | 204.0 g |
| `1 cup powdered sugar (see Notes)` | `powdered sugar` | 204.0 g |
| `2 tablespoons plant-based milk (or lemon juice for a lemon glaze)` | `plant-based milk` | 30.0 ml |

---

## Poached Shrimp

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4 cups water` | `water` | 960.0 ml |
| `3 cloves garlic (smashed)` | `garlic` | 9.0 g |
| `1/2 teaspoon whole peppercorns` | `peppercorns` | 1.88 g |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `juice of 1 medium lemon (approximately 2 tablespoons)` | `juice of 1 medium lemon` | 100.0 ml |
| `1 pound peeled, tail-on jumbo shrimp (deveined; or peeled, tail-on extra-large shimp, deveined)` | `tail-on jumbo shrimp` | 453.59 g |
| `3-4 sprigs fresh parsley` | `fresh parsley` | 9.0 g |
| `3-4 sprigs fresh thyme` | `fresh thyme` | 9.0 g |

---

## Pork Chops with Apples

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4 large bone-in pork chops (approximately 10-12 ounces each)` | `pork chops` | 400.0 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly cracked black pepper (to taste)` | `black pepper` | 100.0 g |
| `1-2 tablespoons neutral oil (avocado oil, olive oil, etc.)` | `neutral oil (avocado oil, olive oil, etc.)` | 15.0 ml |
| `3 small gala apples (cored, sliced)` | `gala apples` | 150.0 g |
| `1 tablespoon unsalted butter` | `unsalted butter` | 18.0 g |
| `1/2 cup diced shallots` | `shallots` | 90.0 g |
| `1 cup dry white wine (or low-sodium chicken broth)` | `dry white wine` | 240.0 ml |
| `10 tablespoons apple cider (1/2 cup + 2 tablespoons)` | `apple cider` | 112.5 g |
| `5 leaves fresh sage (minced, approximately 1 tablespoon)` | `leaves fresh sage` | 500.0 g |
| `1 tablespoon unsalted butter` | `unsalted butter` | 18.0 g |

---

## Pork Stroganoff

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `water (enough to cover noodles by 1-2 inches)` | `water` | 100.0 ml |
| `2-4 large pinches salt` | `pinches salt` | 200.0 g |
| `8 ounces dry egg noodles` | `dry egg noodles` | 100.0 g |
| `1/4 cup unsalted butter` | `unsalted butter` | 72.0 g |
| `1 large white onion (chopped, approximately 1 cup)` | `white onion` | 100.0 g |
| `8 ounces mushrooms (sliced)` | `mushrooms` | 100.0 g |
| `4 cloves garlic (minced)` | `garlic` | 12.0 g |
| `1 pound pork tenderloin (sliced in half lengthwise, then cut into 1/4-inch strips)` | `pork tenderloin` | 453.59 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly ground black pepper (to taste)` | `black pepper` | 100.0 g |
| `3 tablespoons all-purpose flour` | `all-purpose flour` | 22.5 g |
| `1/2 cup dry sherry (or 1/2 cup beef broth)` | `dry sherry` | 90.0 g |
| `1 1/2 cups beef broth` | `beef broth` | 360.0 ml |
| `1 cup sour cream (at room temperature)` | `sour cream` | 240.0 ml |
| `2 tablespoons fresh parsley (finely chopped)` | `fresh parsley` | 22.5 g |

---

## Potato Asparagus Soup

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 tablespoon neutral oil (avocado oil, olive oil, etc.)` | `neutral oil (avocado oil, olive oil, etc.)` | 15.0 ml |
| `1 cup diced white onion` | `white onion` | 180.0 g |
| `4 cloves garlic (minced)` | `garlic` | 12.0 g |
| `1 pound fresh asparagus (trimmed, cut into 1-inch long pieces)` | `fresh asparagus` | 453.59 g |
| `1 cup peeled, cubed Yukon Gold potatoes` | `yukon gold potatoes` | 180.0 g |
| `1 teaspoon salt (more or less to taste)` | `salt` | 6.0 g |
| `1/4 teaspoon freshly cracked black pepper (more or less to taste)` | `black pepper` | 0.94 g |
| `3 cups low-sodium chicken broth (or vegetable broth)` | `low-sodium chicken broth` | 720.0 ml |
| `1 cup heavy cream (at room temperature)` | `heavy cream` | 240.0 ml |
| `additional heavy cream (at room temperature)` | `additional heavy cream` | 100.0 ml |
| `blanched asparagus tips` | `blanched asparagus tips` | 100.0 g |

---

## Potato Galette

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 pounds yukon gold potatoes (unpeeled and thinly sliced)` | `yukon gold potatoes` | 907.18 g |
| `1/4 cup butter (4 tablespoons)` | `butter` | 45.0 g |
| `2 tablespoons olive oil` | `olive oil` | 30.0 ml |
| `4 cloves garlic (minced)` | `garlic` | 12.0 g |
| `1/4 cup freshly grated parmesan (plus more as desired)` | `parmesan` | 22.8 g |
| `1 teaspoon fresh rosemary (finely chopped)` | `fresh rosemary` | 3.75 g |
| `1 1/2 teaspoon salt` | `salt` | 9.0 g |
| `1/4 teaspoon freshly cracked black pepper` | `black pepper` | 0.94 g |

---

## Potato Mousseline

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3 pounds Yukon gold or russet potatoes (washed, peeled, cut into 2-inch cubes)` | `yukon gold or russet potatoes` | 1360.77 g |
| `3-4 cloves garlic (whole, peeled)` | `garlic` | 9.0 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `6 tablespoons cold butter (cut into small pieces, divided)` | `cold butter` | 67.5 g |
| `1/2 cup milk of choice (whole milk preferred, at (or close to) room temperature)` | `milk room temperature` | 120.0 ml |
| `1 1/2 cups heavy cream (at (or close to) room temperature)` | `heavy cream room temperature` | 360.0 ml |
| `freshly cracked white pepper (to taste, or black pepper)` | `white pepper` | 100.0 g |
| `1/3 cup shredded gruyère, Swiss, comté, or mozzarella  (optional, see Notes)` | `gruyère, swiss, comté, or mozzarella` | 60.0 g |
| `finely chopped fresh chives (for garnish)` | `fresh chives` | 100.0 g |

---

## Puking Pumpkin with Guacamole "Vomit"

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1  pumpkin (wiped clean, then dried)` | `pumpkin` | 100.0 g |
| `guacamole (or other thick dip of choice)` | `guacamole` | 100.0 g |
| `tortilla chips (optional, for serving)` | `tortilla chips` | 100.0 g |

---

## Pumpkin Bisque

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 tablespoons butter` | `butter` | 22.5 g |
| `1 medium onion (chopped)` | `onion` | 80.0 g |
| `3  garlic cloves (minced)` | `garlic cloves` | 300.0 g |
| `3 cups chicken broth` | `chicken broth` | 720.0 ml |
| `2 14-ounce cans solid-pack pumpkin` | `solid-pack pumpkin` | 800.0 g |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `Pinch ground nutmeg` | `ground nutmeg` | 1.0 g |
| `Pinch black pepper` | `black pepper` | 1.0 g |
| `1 cup heavy cream` | `heavy cream` | 240.0 ml |
| `1 cup shredded cheese (Gouda, white cheddar, or gruyere)` | `cheese (gouda, white cheddar, or gruyere)` | 112.8 g |
| `2 tablespoons chives (chopped, for garnish, optional)` | `chives` | 22.5 g |

---

## Pumpkin Ice Cream (No Ice Cream Machine Needed!)

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 cup heavy whipping cream (8 fluid ounces, very cold)` | `heavy whipping cream` | 240.0 ml |
| `1 14-ounce can sweetened condensed milk` | `sweetened condensed milk` | 400.0 ml |
| `1/2 teaspoon pure vanilla extract` | `vanilla extract` | 2.5 ml |
| `3/4 cup 100% pure canned pumpkin purée` | `100% pure canned pumpkin purée` | 135.0 g |
| `1 teaspoon pumpkin pie spice (store-bought or make your own)` | `pumpkin pie spice` | 2.5 g |

---

## Pumpkin Seed Butter

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3 cups pumpkin seeds (raw and shelled)` | `pumpkin seeds` | 468.0 g |
| `1/4 teaspoon cinnamon (optional)` | `cinnamon` | 0.62 g |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `2 tablespoons neutral oil` | `neutral oil` | 30.0 ml |
| `2 tablespoons honey (optional, or maple syrup, optional)` | `honey` | 30.0 ml |

---

## Ratatouille Soup

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 tablespoon avocado oil (or olive oil)` | `avocado oil` | 15.0 ml |
| `1 medium onion (chopped; approximately 1 cup)` | `onion` | 80.0 g |
| `2-3 cloves garlic (minced)` | `garlic` | 6.0 g |
| `2 cups chopped bell pepper (approximately 1 large bell pepper, yellow or orange; core removed, seeds removed)` | `bell pepper` | 360.0 g |
| `2 cups chopped zucchini (approximately 2 small zucchinis or 1 large zucchini)` | `zucchini` | 360.0 g |
| `2 cups chopped eggplant (approximately 1 small eggplant or half of 1 large eggplant)` | `eggplant` | 360.0 g |
| `1 28-ounce can tomatoes (whole or crushed, San Marzano preferred; undrained)` | `tomatoes` | 400.0 g |
| `1 28-ounce carton vegetable stock` | `carton vegetable stock` | 100.0 ml |
| `1 teaspoon salt (more or less to taste)` | `salt` | 6.0 g |
| `2 teaspoons dried basil (or 2 tablespoons finely chopped fresh basil)` | `dried basil` | 7.5 g |
| `1 teaspoon dried parsley (or 1 tablespoon finely chopped fresh parsey)` | `dried parsley` | 3.75 g |
| `freshly cracked black pepper (to taste)` | `black pepper` | 100.0 g |
| `pesto` | `pesto` | 100.0 g |
| `2 tablespoons chiffonaded basil leaves` | `chiffonaded basil leaves` | 22.5 g |
| `shaved fresh parmesan` | `shaved fresh parmesan` | 100.0 g |
| `baguettes` | `baguettes` | 100.0 g |

---

## Red Cabbage Soup

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 tablespoon olive oil` | `olive oil` | 15.0 ml |
| `1 tablespoon unsalted butter (optional, for richness)` | `unsalted butter` | 18.0 g |
| `1  large yellow onion (diced)` | `yellow onion` | 100.0 g |
| `2  shallots (finely chopped, sweet onion can work too)` | `shallots` | 200.0 g |
| `3 cloves garlic (minced)` | `garlic` | 9.0 g |
| `1  large carrot (diced)` | `carrot` | 100.0 g |
| `2  ribs celery (diced)` | `ribs celery` | 200.0 g |
| `1 1/2 pounds red cabbage (thinly sliced)` | `red cabbage` | 680.38 g |
| `2  medium Yukon Gold potatoes (peeled and cubed)` | `yukon gold potatoes` | 160.0 g |
| `4-5 cups vegetable broth (or chicken broth)` | `vegetable broth` | 960.0 ml |
| `1 tablespoons tomato paste` | `tomato paste` | 11.25 g |
| `1 teaspoon smoked paprika` | `smoked paprika` | 2.5 g |
| `1/2 teaspoon ground cumin` | `ground cumin` | 1.25 g |
| `1  bay leaf` | `bay leaf` | 100.0 g |
| `salt and freshly ground black pepper` | `salt and black pepper` | 100.0 g |
| `1 tablespoon apple cider vinegar` | `apple cider vinegar` | 15.0 ml |
| `1 tablespoon red wine vinegar (or balsamic)` | `red wine vinegar` | 15.0 ml |
| `15 ounces canned white beans (cannellini or navy beans, drained and rinsed)` | `canned white beans` | 100.0 g |
| `Optional: pinch of red pepper flakes or 1/4 tsp cayenne for heat` | `optional: pinch of red pepper flakes or 1/4 tsp cayenne for heat` | 100.0 g |
| `Garnish: chopped fresh dill or parsley + optional swirl of sour cream, yogurt, or cream` | `garnish: fresh dill or parsley + optional swirl of sour cream, yogurt, or cream` | 100.0 ml |

---

## Red Skin Mashed Potatoes

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 pounds red skin potatoes (cubed)` | `red skin potatoes` | 907.18 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `1/2 cup milk of choice` | `milk` | 120.0 ml |
| `1/4 cup butter (melted)` | `butter` | 45.0 g |
| `fresh chopped chives (for serving)` | `fresh chives` | 100.0 g |

---

## How to Reheat Mashed Potatoes

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4 cups mashed potatoes` | `mashed potatoes` | 720.0 g |
| `butter (as needed)` | `butter` | 100.0 g |
| `milk (as needed)` | `milk` | 100.0 ml |
| `1/2 cup milk` | `milk` | 120.0 ml |
| `3 tablespoons butter` | `butter` | 33.75 g |
| `1/2 cup milk` | `milk` | 120.0 ml |
| `1 tablespoon butter` | `butter` | 11.25 g |

---

## How to Reheat Pizza in an Air Fryer

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 slice leftover pizza` | `leftover pizza` | 20.0 g |

---

## Dairy Free Brownies

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3/4 cup coconut oil (melted, or avocado oil)` | `coconut oil` | 180.0 ml |
| `1 1/4 cup granulated sugar` | `granulated sugar` | 255.0 g |
| `1 teaspoon pure vanilla extract` | `vanilla extract` | 5.0 ml |
| `2 large eggs (at room temperature)` | `eggs` | 200.0 g |
| `3/4 cup unsweetened cocoa powder` | `unsweetened cocoa powder` | 90.0 g |
| `1/2 cup all-purpose flour` | `all-purpose flour` | 60.0 g |
| `1/4 teaspoon salt (plus more to top brownies if desired)` | `salt` | 1.5 g |
| `1/2 cup dairy-free chocolate chips (or chopped chocolate bar)` | `dairy-free chocolate chips` | 90.0 g |

---

## Air Fryer Carrots

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 pound carrots (peeled and chopped)` | `carrots` | 453.59 g |
| `1 teaspoon olive oil (see Notes)` | `olive oil` | 5.0 ml |
| `1 sprig fresh thyme` | `fresh thyme` | 3.0 g |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `1/4 teaspoon black pepper` | `black pepper` | 0.94 g |

---

## Roasted Cauliflower Steaks

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 medium head cauliflower (approximately 2-3 pounds)` | `head cauliflower` | 80.0 g |
| `1/4 cup olive oil` | `olive oil` | 60.0 ml |
| `1 teaspoon sea salt (more or less to taste)` | `sea salt` | 6.0 g |
| `1 teaspoon garlic powder (more or less to taste)` | `garlic powder` | 2.5 g |
| `1 teaspoon onion powder (more or less to taste)` | `onion powder` | 2.5 g |
| `1 teaspoon smoked paprika (more or less to taste)` | `smoked paprika` | 2.5 g |
| `1/2 teaspoon chili powder (more or less to taste)` | `chili powder` | 1.25 g |
| `chopped fresh parsley (for garnish, optional)` | `fresh parsley` | 100.0 g |

---

## Roasted Chili Corn Salsa

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 large poblano pepper (approximately 4 ounces)` | `poblano pepper` | 100.0 g |
| `2 tablespoons lime juice` | `lime juice` | 30.0 ml |
| `2-3 tablespoons finely chopped jalapeño pepper` | `jalapeño pepper` | 22.5 g |
| `1/3 cup finely chopped cilantro` | `cilantro` | 60.0 g |
| `1/2 cup chopped red onion` | `red onion` | 90.0 g |
| `10 ounces frozen whole corn kernels (defrosted)` | `frozen whole corn kernels` | 100.0 g |
| `1/4 teaspoon cumin` | `cumin` | 0.62 g |
| `1 teaspoon salt (more or less to taste)` | `salt` | 6.0 g |

---

## Roasted Grape Tomatoes

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4 cups grape tomatoes` | `grape tomatoes` | 720.0 g |
| `4 cloves garlic (smashed)` | `garlic` | 12.0 g |
| `2 tablespoons extra virgin olive oil` | `virgin olive oil` | 30.0 ml |
| `1 teaspoon kosher salt (more or less to taste)` | `kosher salt` | 6.0 g |
| `1/3 teaspoon freshly cracked black pepper (more or less to taste)` | `black pepper` | 1.25 g |

---

## Rosemary Roasted Potato Wedges

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 1/2 pounds petite gold potatoes (or a similar potato variety)` | `petite gold potatoes` | 680.38 g |
| `2 tablespoons avocado oil` | `avocado oil` | 30.0 ml |
| `1 tablespoons rosemary (minced)` | `rosemary` | 11.25 g |
| `1 tablespoon salt (adjust as needed)` | `salt` | 18.0 g |
| `1 teaspoon pepper (adjust as needed)` | `pepper` | 3.75 g |

---

## Salmon Hibachi Meal

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 1/2 teaspoons sesame oil` | `sesame oil` | 7.5 ml |
| `1 tablespoons avocado oil` | `avocado oil` | 15.0 ml |
| `1 pound salmon (skin removed and cut into bite sized chunks)` | `salmon` | 453.59 g |
| `2 tablespoons low-sodium soy sauce` | `low-sodium soy sauce` | 30.0 ml |
| `1 tablespoon butter (at room temperature )` | `butter` | 11.25 g |
| `2 teaspoons fresh lemon juice` | `fresh lemon juice` | 10.0 ml |
| `salt and freshly cracked black pepper (to taste)` | `salt and black pepper` | 100.0 g |
| `2 tbsp neutral-flavored oil (avocado oil, refined coconut oil, etc.)` | `neutral-flavored oil (avocado oil, refined coconut oil, etc.)` | 30.0 ml |
| `1/2 cup diced white onion (approximately 1 small white onion)` | `white onion` | 90.0 g |
| `1 cup frozen mixed vegetables (peas, carrots, corn, etc.)` | `frozen mixed vegetables (peas, carrots, corn, etc.)` | 180.0 g |
| `2  large eggs` | `eggs` | 200.0 g |
| `4 cups cooked rice (cooled completely, day-old rice preferred)` | `rice` | 816.0 g |
| `4 tablespoons butter (at room temperature, cut into small pieces)` | `butter` | 45.0 g |
| `4 tablespoons low-sodium soy sauce` | `low-sodium soy sauce` | 60.0 ml |
| `1 1/2 teaspoons sesame oil` | `sesame oil` | 7.5 ml |
| `1 tablespoon avocado oil` | `avocado oil` | 15.0 ml |
| `8-10 ounces zucchini (approximately 1 large zucchini; sliced into 2-inch-thick half moons)` | `-zucchini` | 800.0 g |
| `2 cups white onion (approximately 1 large white onion; halved, cut into 1/2-inch-long slices)` | `white onion` | 360.0 g |
| `2 cups quartered mushrooms (approximately 8 ounces, baby bella or white)` | `quartered mushrooms` | 360.0 g |
| `1 tablespoon butter` | `butter` | 11.25 g |
| `1 tablespoon low-sodium soy sauce` | `low-sodium soy sauce` | 15.0 ml |
| `salt and freshly cracked black pepper (to taste)` | `salt and black pepper` | 100.0 g |

---

## Smoked Salmon Omelette

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/4 cup  cream cheese (softened)` | `cream cheese` | 60.0 ml |
| `1 tablespoon chopped fresh chives` | `fresh chives` | 11.25 g |
| `1 tablespoon chopped fresh dill` | `fresh dill` | 11.25 g |
| `1/2 teaspoon onion powder` | `onion powder` | 1.25 g |
| `3 large eggs` | `eggs` | 300.0 g |
| `1/4 cup milk of choice` | `milk` | 60.0 ml |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly ground black pepper (to taste)` | `black pepper` | 100.0 g |
| `1 teaspoon neutral oil (avocado oil, olive oil, etc.)` | `neutral oil (avocado oil, olive oil, etc.)` | 5.0 ml |
| `1/4 cup smoked salmon (approximately 1 ounce)` | `smoked salmon` | 45.0 g |
| `1 tablespoon capers (optional)` | `capers` | 11.25 g |

---

## Salmon Piccata

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4 8-ounce salmon fillets` | `salmon fillets` | 400.0 g |
| `1 teaspoon salt (more or less to taste)` | `salt` | 6.0 g |
| `1/2 teaspoon freshly cracked black pepper (more or less to taste)` | `black pepper` | 1.88 g |
| `4 tablespoons butter (divided)` | `butter` | 45.0 g |
| `1/4 cup fresh lemon juice (juice from approximately 2 medium lemons)` | `fresh lemon juice` | 60.0 ml |
| `1/2 cup low-sodium chicken broth` | `low-sodium chicken broth` | 120.0 ml |
| `1 teaspoon cornstarch` | `cornstarch` | 3.0 g |
| `3 tablespoons capers (drained)` | `capers` | 33.75 g |
| `1/4 cup chopped fresh parsley (plus more to garnish)` | `fresh parsley` | 45.0 g |
| `thinly sliced lemon coins (optional, to garnish)` | `lemon coins` | 100.0 g |

---

## Salmon Tacos

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 small head cabbage (green or purple, finely shredded; approximately 4-6 cups)` | `head cabbage` | 50.0 g |
| `1 tablespoon fresh lime juice (juice from approximately half of 1 medium lime)` | `fresh lime juice` | 15.0 ml |
| `1/4 cup white wine vinegar (or white vinegar, apple cider vinegar, or lime juice)` | `white wine vinegar (or white vinegar, apple cider vinegar, or lime juice)` | 60.0 ml |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `1/4 teaspoon freshly cracked black pepper (more or less to taste)` | `black pepper` | 0.94 g |
| `1 24-ounce boneless salmon fillet (1 1/2 pounds boneless salmon)` | `salmon fillet` | 100.0 g |
| `2 teaspoons chili powder (more or less to taste)` | `chili powder` | 5.0 g |
| `1 teaspoon paprika (more or less to taste)` | `paprika` | 2.5 g |
| `1 teaspoon salt (more or less to taste)` | `salt` | 6.0 g |
| `1 large avocado (pit removed, peeled, diced; approximately 1 1/4 cups)` | `avocado` | 100.0 g |
| `1 large mango (pit removed, peeled, diced; approximately 1 cup)` | `mango` | 100.0 g |
| `1 small jalapeño pepper (stem removed, seeds removed, pepper finely diced)` | `jalapeño pepper` | 50.0 g |
| `1 cup finely chopped cilantro` | `cilantro` | 180.0 g |
| `1/2 cup diced red onion` | `red onion` | 90.0 g |
| `1 tablespoon fresh lime juice (juice from approximately half of 1 medium lime)` | `fresh lime juice` | 15.0 ml |
| `1 teaspoon fresh lime zest` | `fresh lime zest` | 3.75 g |
| `8 8-inch flour tortillas (or 8-inch corn tortillas)` | `8-inch flour tortillas` | 800.0 g |
| `tortilla chips` | `tortilla chips` | 100.0 g |

---

## Salt and Pepper Tofu

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 16-ounce block tofu (firm or extra firm, drained)` | `block tofu` | 100.0 g |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `1/4 teaspoon white pepper` | `white pepper` | 0.94 g |
| `1/4 cup cornstarch (if cooking in skillet)` | `cornstarch` | 36.0 g |
| `2-4 tablespoons vegetable oil (plus more more as needed)` | `vegetable oil` | 30.0 ml |
| `2 tablespoons vegetable oil` | `vegetable oil` | 30.0 ml |
| `1 tablespoon Shaoxing wine (or dry sherry)` | `shaoxing wine` | 15.0 ml |
| `1 tablespoon cornstarch` | `cornstarch` | 9.0 g |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `1 tablespoon vegetable oil (plus more as needed)` | `vegetable oil` | 15.0 ml |
| `thinly sliced green onions` | `green onions` | 100.0 g |
| `thinly sliced bird&#39;s eye chiles` | `bird&#39;s eye chiles` | 100.0 g |
| `cooked rice` | `rice` | 100.0 g |

---

## Sausage in the Air Fryer

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `5  sausage links (like Italian sausage or bratwurst, about 18 ounces)` | `sausage links` | 500.0 g |

---

## Sausage Stuffed Mushrooms

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `24 large whole baby bella mushrooms (cleaned, patted dry)` | `baby bella mushrooms` | 2400.0 g |
| `1 tablespoon unsalted butter` | `unsalted butter` | 18.0 g |
| `1 tablespoon minced garlic` | `garlic` | 11.25 g |
| `1/2 cup diced onion` | `onion` | 90.0 g |
| `1 pound ground sausage` | `ground sausage` | 453.59 g |
| `4 ounces full-fat cream cheese (at room temperature)` | `full-fat cream cheese` | 100.0 ml |
| `1 large egg` | `egg` | 100.0 g |
| `1/2 cup shredded parmesan (or grated parmesan)` | `parmesan` | 45.6 g |
| `1/2 teaspoon garlic powder` | `garlic powder` | 1.25 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly ground black pepper (to taste)` | `black pepper` | 100.0 g |
| `chopped fresh parsley` | `fresh parsley` | 100.0 g |

---

## Creamy Scalloped Sweet Potatoes

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3 pounds sweet potatoes (peeled, sliced into uniform 1/8-inch thick discs)` | `sweet potatoes` | 1360.77 g |
| `1/2 cup butter` | `butter` | 90.0 g |
| `3 cloves garlic (minced)` | `garlic` | 9.0 g |
| `1/4 cup all-purpose flour (see Notes)` | `all-purpose flour` | 30.0 g |
| `2 1/2 cups heavy cream (at or close to room temperature)` | `heavy cream` | 600.0 ml |
| `1 tablespoon chopped fresh thyme ()` | `fresh thyme` | 11.25 g |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `1/4 teaspoon freshly cracked black pepper (more or less to taste)` | `black pepper` | 0.94 g |
| `1/2 cup freshly grated parmesan cheese (see Notes)` | `parmesan cheese` | 56.4 g |
| `sprigs of fresh thyme (optional, for garnish)` | `fresh thyme` | 3.0 g |

---

## Seafood Baked Potatoes

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4 large russet potatoes (approximately 8 ounces each)` | `russet potatoes` | 400.0 g |
| `2 tablespoons unsalted butter` | `unsalted butter` | 36.0 g |
| `1 pound shrimp (peeled, deveined, tails removed; see Notes)` | `shrimp` | 453.59 g |
| `1 tablespoon Cajun seasoning (Tony Chachere&#39;s, etc.)` | `cajun seasoning` | 11.25 g |
| `1 teaspoon garlic powder` | `garlic powder` | 2.5 g |
| `1 teaspoon onion powder` | `onion powder` | 2.5 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly cracked black pepper (to taste)` | `black pepper` | 100.0 g |
| `8 ounces cooked lump crabmeat` | `lump crabmeat` | 100.0 g |
| `1 cup shredded Monterey Jack cheese (divided)` | `monterey jack cheese` | 112.8 g |
| `1/2 cup cream cheese (at room temperature)` | `cream cheese` | 120.0 ml |
| `1/2 cup sour cream` | `sour cream` | 120.0 ml |
| `1 teaspoon Old Bay seasoning` | `old bay seasoning` | 3.75 g |
| `2 teaspoons fresh lemon juice` | `fresh lemon juice` | 10.0 ml |
| `chopped fresh chives (to serve)` | `fresh chives` | 100.0 g |

---

## Seafood Chili

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 teaspoons neutral oil (avocado oil, olive oil, etc.)` | `neutral oil (avocado oil, olive oil, etc.)` | 10.0 ml |
| `1 medium onion (finely chopped, approximately 1 1/2 cups)` | `onion` | 80.0 g |
| `2 stalks celery (finely chopped, approximately 1 cup)` | `celery` | 80.0 g |
| `1 large carrot (finely chopped, approximately 1 cup)` | `carrot` | 100.0 g |
| `4 cloves garlic (minced)` | `garlic` | 12.0 g |
| `1 14.5-ounce can petite diced tomatoes (drained)` | `petite tomatoes` | 400.0 g |
| `1 4-ounce can diced green chiles (drained)` | `green chiles` | 400.0 g |
| `1 15.5-ounce can great northern beans (drained, rinsed)` | `great northern beans` | 400.0 g |
| `1 15.5-ounce can black beans (drained, rinsed)` | `black beans` | 400.0 g |
| `1 15.5-ounce can red kidney beans (drained, rinsed)` | `red kidney beans` | 400.0 g |
| `2 cups vegetable broth (or chicken broth, or shrimp stock)` | `vegetable broth (or chicken broth, or shrimp stock)` | 480.0 ml |
| `2 tablespoons tomato paste` | `tomato paste` | 22.5 g |
| `1/2 cup corn kernels (canned or frozen)` | `corn kernels` | 90.0 g |
| `1 1/2 tablespoons chili powder blend (see Notes)` | `chili powder blend` | 11.25 g |
| `1 teaspoon cumin` | `cumin` | 2.5 g |
| `1 teaspoon salt (more or less to taste)` | `salt` | 6.0 g |
| `1/2 teaspoon freshly cracked black pepper (more or less to taste)` | `black pepper` | 1.88 g |
| `1 pound shrimp (raw, peeled, deveined)` | `shrimp` | 453.59 g |
| `1 pound bay scallops (see Notes)` | `bay scallops` | 453.59 g |
| `juice from 1 medium lemon (approximately 2 tablespoons, divided)` | `juice from 1 medium lemon` | 100.0 ml |
| `8 ounces fresh crab meat (claw, lump, or both; see Notes)` | `fresh crab meat` | 100.0 g |
| `1/3 cup heavy cream (see Notes)` | `heavy cream` | 80.0 ml |
| `1 handful finely chopped cilantro` | `handful cilantro` | 100.0 g |
| `sour cream or Greek yogurt` | `sour cream or greek yogurt` | 100.0 ml |
| `shredded cheddar cheese` | `cheddar cheese` | 100.0 g |
| `diced avocado` | `avocado` | 100.0 g |
| `sliced or chopped jalapeños` | `or jalapeños` | 100.0 g |
| `hot sauce` | `hot sauce` | 100.0 ml |

---

## Seafood Jambalaya

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 pound andouille sausage (or smoked sausage, sliced on 45 degrees  diagonals)` | `andouille sausage` | 453.59 g |
| `2 tablespoons butter (or chicken fat, or lard)` | `butter (or chicken fat, or lard)` | 22.5 g |
| `2 tablespoons minced garlic (approximately 4 large cloves, plus more to taste)` | `garlic` | 22.5 g |
| `1 1/2 cups chopped white onion (approximately 1 large onion)` | `white onion` | 270.0 g |
| `1 cup chopped green bell pepper (approximately 1 large bell pepper)` | `green bell pepper` | 180.0 g |
| `1 cup chopped celery (approximately 4 stalks)` | `celery` | 180.0 g |
| `2 tablespoons tomato paste` | `tomato paste` | 22.5 g |
| `2 cups chicken stock (or seafood stock)` | `chicken stock` | 480.0 ml |
| `1 28-ounce can diced tomatoes` | `tomatoes` | 400.0 g |
| `2-3 tablespoons Creole seasoning (more or less to taste)` | `creole seasoning` | 22.5 g |
| `2  bay leaves` | `bay leaves` | 200.0 g |
| `salt (optional, to taste)` | `salt` | 100.0 g |
| `6 cups chicken stock (or seafood stock)` | `chicken stock` | 1440.0 ml |
| `4 cups long-grain white rice (uncooked)` | `long-grain white rice` | 816.0 g |
| `1 pound shrimp (large (31-40 per pound) or extra-large (26-30 per pound); peeled, deveined)` | `shrimp or extra-large ; , deveined` | 453.59 g |
| `8 ounces jumbo lump crab meat (drained)` | `jumbo lump crab meat` | 100.0 g |

---

## Seitan Wings

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 cups vital wheat gluten` | `vital wheat gluten` | 360.0 g |
| `1/4 cup nutritional yeast` | `nutritional yeast` | 33.0 g |
| `1 teaspoon garlic powder` | `garlic powder` | 2.5 g |
| `1 teaspoon onion powder` | `onion powder` | 2.5 g |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `1/4 teaspoon black pepper` | `black pepper` | 0.94 g |
| `2 cups vegetable broth` | `vegetable broth` | 480.0 ml |
| `2 tablespoons olive oil` | `olive oil` | 30.0 ml |
| `5 cups vegetable broth` | `vegetable broth` | 1200.0 ml |
| `3 tablespoons olive oil` | `olive oil` | 45.0 ml |
| `1/2 cup Frank&#039;s red hot sauce` | `frank&#039;s red hot sauce` | 120.0 ml |
| `1/4 cup vegan butter (melted)` | `vegan butter` | 45.0 g |
| `1 teaspoon garlic powder` | `garlic powder` | 2.5 g |

---

## Shrimp and Corn Soup

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4 tablespoons butter` | `butter` | 45.0 g |
| `1/2 cup celery (chopped)` | `celery` | 90.0 g |
| `4  green onions (sliced, white and green parts separated)` | `green onions` | 400.0 g |
| `4 cloves garlic (minced)` | `garlic` | 12.0 g |
| `1/2 teaspoon salt (plus more to taste)` | `salt` | 3.0 g |
| `1/4 teaspoon black pepper (plus more to taste)` | `black pepper` | 0.94 g |
| `1/4 cup all-purpose flour` | `all-purpose flour` | 30.0 g |
| `2  cups whole milk` | `milk` | 480.0 ml |
| `1 cup heavy whipping cream` | `heavy whipping cream` | 240.0 ml |
| `1 15-ounce can cream-style corn` | `cream-style corn` | 400.0 ml |
| `1 1/2 cups corn kernels (fresh or frozen)` | `corn kernels` | 270.0 g |
| `1 pound shrimp (peeled, deveined, uncooked)` | `shrimp` | 453.59 g |
| `2 teaspoons Old Bay seasoning (plus more to taste)` | `old bay seasoning` | 7.5 g |

---

## Shrimp Francese

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 1/2 pounds  extra-large shrimp (or jumbo shrimp; peeled, deveined, tails on)` | `extra-large shrimp` | 680.38 g |
| `salt  (to taste)` | `salt` | 100.0 g |
| `freshly ground black pepper (to taste)` | `black pepper` | 100.0 g |
| `3 tablespoons avocado oil` | `avocado oil` | 45.0 ml |
| `1/2 cup all-purpose flour` | `all-purpose flour` | 60.0 g |
| `3 large eggs` | `eggs` | 300.0 g |
| `1/4 teaspoon salt (more or less to taste)` | `salt` | 1.5 g |
| `1/4 teaspoon freshly ground black pepper (more or less to taste)` | `black pepper` | 0.94 g |
| `1/4 teaspoon garlic powder` | `garlic powder` | 0.62 g |
| `2 tablespoons finely chopped fresh parsley (divided)` | `fresh parsley` | 22.5 g |
| `3 tablespoons butter` | `butter` | 33.75 g |
| `2-3 cloves garlic (minced)` | `garlic` | 6.0 g |
| `1/3 cup chicken broth` | `chicken broth` | 80.0 ml |
| `1/3 cup dry white wine (see Notes)` | `dry white wine` | 80.0 ml |
| `2 tablespoons fresh lemon juice (juice from approximately 1 lemon)` | `fresh lemon juice` | 30.0 ml |
| `1 medium lemon (thinly sliced)` | `lemon` | 80.0 g |

---

## Shrimp Omelette

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 teaspoon neutral oil (plus more if needed)` | `neutral oil` | 5.0 ml |
| `1/4 pound small shrimp (peeled, deveined)` | `small shrimp` | 113.4 g |
| `1  green onion (finely chopped, plus more for topping if desired)` | `green onion` | 100.0 g |
| `1 teaspoon soy sauce` | `soy sauce` | 5.0 ml |
| `1/2 teaspoon rice wine vinegar` | `rice wine vinegar` | 2.5 ml |
| `3 large eggs` | `eggs` | 300.0 g |
| `1/4 cup milk of choice` | `milk` | 60.0 ml |

---

## Shrimp Parmesan

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/2 cup all-purpose flour` | `all-purpose flour` | 60.0 g |
| `1 large egg` | `egg` | 100.0 g |
| `3/4 cup Panko breadcrumbs` | `panko breadcrumbs` | 81.0 g |
| `1/2 cup grated fresh parmesan` | `fresh parmesan` | 45.6 g |
| `1 teaspoon Italian seasoning` | `italian seasoning` | 3.75 g |
| `1 teaspoon garlic powder` | `garlic powder` | 2.5 g |
| `1 teaspoon salt` | `salt` | 6.0 g |
| `1/2 teaspoon freshly cracked black pepper` | `black pepper` | 1.88 g |
| `4 tablespoons olive oil` | `olive oil` | 60.0 ml |
| `1 pound shrimp (peeled, deveined)` | `shrimp` | 453.59 g |
| `1 cup marinara sauce` | `marinara sauce` | 240.0 ml |
| `2 tablespoons  chopped fresh parsley` | `fresh parsley` | 22.5 g |
| `1/2 cup shredded mozzarella cheese` | `mozzarella cheese` | 56.4 g |
| `12 ounces cooked pasta of choice` | `pasta` | 100.0 g |
| `side salad` | `side salad` | 100.0 g |

---

## Shrimp Remoulade

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/2 cup mayonnaise (see Notes)` | `mayonnaise` | 90.0 g |
| `1/2 teaspoon Cajun seasoning` | `cajun seasoning` | 1.88 g |
| `1/2 teaspoon paprika` | `paprika` | 1.25 g |
| `1 tablespoon whole-grain dijon mustard (see Notes)` | `whole-grain dijon mustard` | 11.25 g |
| `2 cloves garlic (minced)` | `garlic` | 6.0 g |
| `2 tablespoons finely chopped baby pickles` | `baby pickles` | 22.5 g |
| `1 teaspoon hot sauce (to taste)` | `hot sauce` | 5.0 ml |
| `1 teaspoon horseradish` | `horseradish` | 3.75 g |
| `1 tablespoon lemon juice` | `lemon juice` | 15.0 ml |
| `1  green onion (chopped)` | `green onion` | 100.0 g |
| `1 tablespoon parsley (chopped)` | `parsley` | 11.25 g |
| `1/2 teaspoon  salt (to taste)` | `salt` | 3.0 g |
| `1/4 teaspoon black pepper (to taste)` | `black pepper` | 0.94 g |
| `1 tablespoon neutral oil` | `neutral oil` | 15.0 ml |
| `1 pound medium shrimp (peeled, deveined )` | `medium shrimp` | 453.59 g |
| `1 tablespoon lemon juice` | `lemon juice` | 15.0 ml |
| `1 pinch salt (to taste)` | `salt` | 1.0 g |
| `1 pinch freshly ground black pepper (to taste)` | `black pepper` | 1.0 g |
| `butter lettuce cups` | `butter lettuce cups` | 100.0 g |

---

## Shrimp Scampi With Rice

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3 cups cooked rice` | `rice` | 612.0 g |
| `1 1/2 pounds large shrimp (peeled, deveined)` | `large shrimp` | 680.38 g |
| `2 tablespoons olive oil (divided)` | `olive oil` | 30.0 ml |
| `4 cloves garlic (minced, divided)` | `garlic` | 12.0 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `1/3 cup dry white wine` | `dry white wine` | 80.0 ml |
| `2 tablespoons fresh lemon juice (juice of approximately 1 lemon)` | `fresh lemon juice` | 30.0 ml |
| `4 tablespoons butter (cut into 4-5 slices, at room temperature)` | `butter` | 45.0 g |
| `freshly cracked black pepper (to taste)` | `black pepper` | 100.0 g |
| `1/4 teaspoon red pepper flakes` | `red pepper flakes` | 0.94 g |
| `1 tablespoon chopped fresh parsley` | `fresh parsley` | 11.25 g |
| `4  lemon wedges` | `lemon wedges` | 400.0 g |

---

## Shrimp Stock

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 teaspoon avocado oil (or olive oil)` | `avocado oil` | 5.0 ml |
| `shrimp shells  (from 2 pounds of raw shrimp)` | `shrimp shells` | 100.0 g |
| `3 medium carrots (roughly chopped)` | `carrots` | 240.0 g |
| `3 large celery stalks (roughly chopped)` | `celery stalks` | 300.0 g |
| `1 medium yellow onion (roughly chopped)` | `yellow onion` | 80.0 g |
| `3 cloves garlic (smashed)` | `garlic` | 9.0 g |
| `half of one lemon` | `half of one lemon` | 100.0 g |
| `2  bay leaves` | `bay leaves` | 200.0 g |
| `3-4 sprigs fresh thyme` | `fresh thyme` | 9.0 g |
| `4-5 sprigs fresh parsley` | `fresh parsley` | 12.0 g |
| `1 teaspoon whole peppercorns` | `peppercorns` | 3.75 g |
| `8 cups cold water` | `cold water` | 1920.0 ml |
| `1 teaspoon  salt (more or less to taste)` | `salt` | 6.0 g |

---

## Asian Cucumber and Toasted Sesame Salad

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2  English cucumbers (medium)` | `english cucumbers` | 200.0 g |
| `1/4 cup rice vinegar` | `rice vinegar` | 60.0 ml |
| `1 tablespoon dark sesame oil` | `dark sesame oil` | 15.0 ml |
| `1 tablespoon maple syrup (or sugar)` | `maple syrup` | 15.0 ml |
| `1 teaspoon salt (plus extra)` | `salt` | 6.0 g |
| `2 tablespoons sesame seeds (toasted)` | `sesame seeds` | 19.5 g |

---

## Sliced Potatoes in the Air Fryer (with an Irresistible Creamy Herb Sauce)

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 pounds baking potatoes (russet or Yukon gold)` | `baking potatoes` | 907.18 g |
| `cold water (enough to cover potatoes)` | `cold water` | 100.0 ml |
| `2 tablespoons high-quality oil (avocado oil, olive oil, etc.)` | `high-quality oil (avocado oil, olive oil, etc.)` | 30.0 ml |
| `1/2 teaspoon garlic powder` | `garlic powder` | 1.25 g |
| `1/2 teaspoon onion powder` | `onion powder` | 1.25 g |
| `1/2 teaspoon freshly ground black pepper` | `black pepper` | 1.88 g |
| `1/2 teaspoon paprika (or smoked paprika)` | `paprika` | 1.25 g |
| `1 pinch cayenne pepper` | `cayenne pepper` | 1.0 g |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `1 cup full-fat sour cream` | `full-fat sour cream` | 240.0 ml |
| `1 tablespoon dried onion flakes` | `dried onion flakes` | 11.25 g |
| `1/2 teaspoon garlic powder` | `garlic powder` | 1.25 g |
| `1 tablespoon chopped fresh herbs of choice (chives, parsley, dill, etc.)` | `fresh herbs (chives, parsley, dill, etc.)` | 11.25 g |
| `1/4 teaspoon salt (more or less to taste)` | `salt` | 1.5 g |

---

## Slow Cooker Pinto Beans

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 pound pinto beans (soaked overnight)` | `pinto beans` | 453.59 g |
| `4 cups water` | `water` | 960.0 ml |
| `1 tablespoon salt` | `salt` | 18.0 g |
| `1/4 tablespoon black pepper` | `black pepper` | 2.81 g |
| `1 teaspoon smoked paprika` | `smoked paprika` | 2.5 g |
| `1 teaspoon garlic powder` | `garlic powder` | 2.5 g |

---

## Slow Cooker Turkey Breast Tenderloin

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2  turkey breast tenderloins (approximately 24 ounces)` | `turkey breast tenderloins` | 200.0 g |
| `1 cup low-sodium chicken broth` | `low-sodium chicken broth` | 240.0 ml |
| `2 teaspoons poultry seasoning` | `poultry seasoning` | 7.5 g |
| `1 1/2 teaspoons salt (or more)` | `salt` | 9.0 g |
| `1 teaspoon garlic powder` | `garlic powder` | 2.5 g |
| `1 teaspoon onion powder` | `onion powder` | 2.5 g |
| `1 teaspoon paprika` | `paprika` | 2.5 g |
| `1/2 teaspoon pepper` | `pepper` | 1.88 g |
| `fresh thyme` | `fresh thyme` | 100.0 g |
| `3 tablespoons butter` | `butter` | 33.75 g |
| `2 cups turkey drippings from slow cooker (add chicken or turkey broth if you don&#39;t have enough)` | `turkey drippings from slow cooker` | 360.0 g |
| `1/3 cup flour` | `flour` | 40.0 g |
| `salt and freshly ground pepper to taste` | `salt and pepper to taste` | 100.0 g |

---

## Cranberry Quick Jam

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `12 ounces fresh cranberries (1 bag)` | `fresh cranberries` | 100.0 g |
| `3/4 cup sugar` | `sugar` | 153.0 g |
| `2 tablespoons lemon juice` | `lemon juice` | 30.0 ml |
| `1/4 teaspoon ground cinnamon (optional)` | `ground cinnamon` | 0.62 g |
| `zest of 1/2 orange (optional)` | `zest of 1/2 orange` | 100.0 g |

---

## Smoked Asparagus

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 pound fresh asparagus (thick stalks preferred)` | `fresh asparagus` | 453.59 g |
| `1 tablespoon olive oil (or other neutral-flavored oil)` | `olive oil` | 15.0 ml |
| `1 teaspoon salt (more or less to taste)` | `salt` | 6.0 g |
| `1/4 teaspoon freshly cracked black pepper (more or less to taste)` | `black pepper` | 0.94 g |
| `2 tablespoons unsalted butter` | `unsalted butter` | 36.0 g |
| `1 teaspoon minced fresh garlic (approximately 2 large cloves)` | `fresh garlic` | 3.75 g |
| `2 tablespoons fresh lemon juice (juice from approximately 1 medium lemon)` | `fresh lemon juice` | 30.0 ml |

---

## Smoked Baked Beans

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `5-6 slices bacon (chopped)` | `bacon` | 100.0 g |
| `1 medium yellow onion (finely chopped, about 1 cup)` | `yellow onion` | 80.0 g |
| `2-3 cloves garlic (minced)` | `garlic` | 6.0 g |
| `3 tablespoons tomato paste` | `tomato paste` | 33.75 g |
| `2 15-ounce cans pinto beans (drained and rinsed)` | `pinto beans` | 800.0 g |
| `1 15-ounce can great northern beans (drained and rinsed)` | `great northern beans` | 400.0 g |
| `1 15-ounce can kidney beans (or navy beans, drained and rinsed)` | `kidney beans` | 400.0 g |
| `1/4 cup ketchup` | `ketchup` | 45.0 g |
| `1/4 packed cup brown sugar` | `cup brown sugar` | 25.0 g |
| `1 tablespoon yellow mustard` | `yellow mustard` | 11.25 g |
| `2 tablespoons apple cider vinegar` | `apple cider vinegar` | 30.0 ml |
| `1 tablespoon Worcestershire sauce` | `worcestershire sauce` | 15.0 ml |
| `2 tablespoons molasses` | `molasses` | 30.0 g |
| `1 teaspoon smoked paprika` | `smoked paprika` | 2.5 g |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `1/4 teaspoon freshly cracked black pepper (more or less to taste)` | `black pepper` | 0.94 g |
| `1/2 cup water (plus more as needed)` | `water` | 120.0 ml |

---

## Smoked Baked Potato

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 teaspoon salt (more or less to taste)` | `salt` | 6.0 g |
| `1 teaspoon garlic powder` | `garlic powder` | 2.5 g |
| `1/2 teaspoon onion powder` | `onion powder` | 1.25 g |
| `1/2 teaspoon freshly ground black pepper (more or less to taste)` | `black pepper` | 1.88 g |
| `4 large russet potatoes (approximately 4 pounds total; skins scrubbed under running water)` | `russet potatoes` | 400.0 g |
| `1 tablespoon olive oil` | `olive oil` | 15.0 ml |
| `butter (or ghee)` | `butter` | 100.0 g |
| `sour cream` | `sour cream` | 100.0 ml |
| `cheddar cheese` | `cheddar cheese` | 100.0 g |
| `crumbled bacon` | `bacon` | 100.0 g |
| `finely chopped fresh chives` | `fresh chives` | 100.0 g |

---

## Smoked Pineapple Recipe

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 large pineapple (approximately 4-5 pounds)` | `pineapple` | 100.0 g |
| `1/2 cup packed brown sugar (light or dark)` | `brown sugar` | 102.0 g |
| `1 1/2 teaspoons ground cinnamon` | `ground cinnamon` | 3.75 g |
| `1/2 teaspoon sea salt` | `sea salt` | 3.0 g |

---

## Smoked Potato

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4 medium russet potatoes (approximately 6 ounces each)` | `russet potatoes` | 320.0 g |
| `olive oil (or other neutral-flavored oil)` | `olive oil` | 100.0 ml |
| `coarse salt (to taste)` | `coarse salt` | 100.0 g |
| `freshly cracked black pepper (to taste)` | `black pepper` | 100.0 g |

---

## Smoked Scallops

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2-1 1/2 lbs large sea scallops (dry-packed preferred)` | `1/2 lbs large sea scallops` | 200.0 g |
| `1 tbsp olive oil` | `olive oil` | 15.0 ml |
| `1 tsp salt` | `salt` | 6.0 g |
| `1 tsp lemon zest` | `lemon zest` | 3.75 g |
| `1/2 tsp black pepper` | `black pepper` | 1.88 g |
| `1/2 tsp paprika  (optional for extra color/flavor)` | `paprika` | 1.25 g |
| `1/2 cup unsalted butter (1 stick)` | `unsalted butter` | 144.0 g |
| `3 cloves garlic (minced)` | `garlic` | 9.0 g |
| `1 tbsp lemon juice` | `lemon juice` | 15.0 ml |
| `1/2 tsp crushed red pepper flakes (optional)` | `crushed red pepper flakes` | 1.88 g |
| `1 tbsp chopped parsley (plus extra for garnish)` | `parsley` | 11.25 g |

---

## Smoked Tofu (Oven and Smoker Options)

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 16-ounce blocks extra-firm tofu` | `blocks extra-firm tofu` | 200.0 g |
| `2 tablespoons olive oil` | `olive oil` | 30.0 ml |
| `1 tablespoon seasoning blend of choice` | `seasoning blend` | 11.25 g |
| `1 16-ounce block extra-firm tofu` | `block extra-firm tofu` | 100.0 g |
| `1 tablespoon olive oil` | `olive oil` | 15.0 ml |
| `1/2 teaspoon garlic powder` | `garlic powder` | 1.25 g |
| `1 tablespoon soy sauce (or tamari)` | `soy sauce` | 15.0 ml |
| `1 teaspoon liquid smoke` | `liquid smoke` | 3.75 g |

---

## Smoked Turkey Soup

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 tablespoon oil` | `oil` | 15.0 ml |
| `2 cloves garlic (minced)` | `garlic` | 6.0 g |
| `1  onion (roughly chopped)` | `onion` | 100.0 g |
| `1 teaspoon thyme` | `thyme` | 3.75 g |
| `1 teaspoon garlic powder` | `garlic powder` | 2.5 g |
| `1 teaspoon onion powder` | `onion powder` | 2.5 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `1/4 teaspoon pepper` | `pepper` | 0.94 g |
| `2  celery stalks` | `celery stalks` | 200.0 g |
| `1 cup carrots (thinly sliced)` | `carrots` | 180.0 g |
| `2  smoked turkey legs` | `smoked turkey legs` | 200.0 g |
| `1 can Great Northern beans (drained)` | `great northern beans` | 400.0 g |
| `4 1/2 cups chicken broth` | `chicken broth` | 1080.0 ml |
| `1 cup cooked rice (see Note)` | `rice` | 204.0 g |

---

## Smothered Potatoes

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3 medium yellow potatoes (approximately 5-6 ounces each, thinly sliced)` | `yellow potatoes` | 240.0 g |
| `1 medium onion (approximately 6 ounces, thinly sliced)` | `onion` | 80.0 g |
| `2 cloves garlic (chopped)` | `garlic` | 6.0 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `pepper (to taste)` | `pepper` | 100.0 g |
| `2 tablespoons all-purpose flour (see Notes)` | `all-purpose flour` | 15.0 g |
| `3 tablespoons unsalted butter (see Notes)` | `unsalted butter` | 54.0 g |
| `1/3 cup low-sodium chicken broth (see Notes)` | `low-sodium chicken broth` | 80.0 ml |

---

## Vegan Sugar Cookies

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/2 cup vegan butter (we used Miyoko's)` | `vegan butter` | 90.0 g |
| `3/4 cup white sugar` | `white sugar` | 153.0 g |
| `1 teaspoon vanilla extract` | `vanilla extract` | 5.0 ml |
| `1 3/4 cups all-purpose flour` | `all-purpose flour` | 210.0 g |
| `2 tbsp vegan milk of choice` | `vegan milk` | 30.0 ml |
| `1 teaspoon baking soda` | `baking soda` | 4.5 g |
| `1/4 teaspoon salt` | `salt` | 1.5 g |

---

## Sourdough Grilled Cheese

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4 slices sourdough bread` | `sourdough bread` | 80.0 g |
| `4 tablespoons butter (softened, divided)` | `butter` | 45.0 g |
| `4 slices cheddar cheese` | `cheddar cheese` | 80.0 g |
| `4 slices swiss cheese` | `swiss cheese` | 80.0 g |
| `2 tablespoons  mayonnaise (divided)` | `mayonnaise` | 22.5 g |

---

## Sous Vide Asparagus

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 bunch fresh asparagus (trimmed, approximately 1 pound)` | `bunch fresh asparagus` | 100.0 g |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `1/4 teaspoon freshly cracked black pepper (more or less to taste)` | `black pepper` | 0.94 g |
| `3 tablespoons unsalted butter (cut into multiple pieces)` | `unsalted butter` | 54.0 g |
| `1 tablespoon fresh lemon zest (zest from approximately 1 medium lemon)` | `fresh lemon zest` | 11.25 g |
| `lemon wedges` | `lemon wedges` | 100.0 g |

---

## Sous Vide Broccoli

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 head broccoli (cut into florets)` | `broccoli` | 150.0 g |
| `1 tablespoon olive oil` | `olive oil` | 15.0 ml |
| `salt and black pepper (to taste)` | `salt and black pepper` | 100.0 g |

---

## Sous Vide Flank Steak

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 1/2-2  pounds flank steak` | `flank steak` | 680.38 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly ground black pepper (to taste)` | `black pepper` | 100.0 g |
| `1 tablespoon neutral oil  (avocado oil, olive oil, etc.)` | `neutral oil (avocado oil, olive oil, etc.)` | 15.0 ml |
| `1/4 cup olive oil` | `olive oil` | 60.0 ml |
| `1/4 cup soy sauce (see Notes)` | `soy sauce` | 60.0 ml |
| `2 cloves garlic (minced)` | `garlic` | 6.0 g |
| `2 tablespoons honey` | `honey` | 30.0 ml |
| `1 tablespoon red wine vinegar` | `red wine vinegar` | 15.0 ml |

---

## Sous Vide Mashed Potatoes

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 pounds russet or Yukon gold potatoes` | `russet or yukon gold potatoes` | 907.18 g |
| `6 tablespoons butter` | `butter` | 67.5 g |
| `4  garlic cloves (minced)` | `garlic cloves` | 400.0 g |
| `1 cup whole milk (see Notes for vegan)` | `milk` | 240.0 ml |
| `salt (to taste)` | `salt` | 100.0 g |

---

## Sous Vide Potatoes

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 pound baby potatoes (sliced in half)` | `baby potatoes` | 453.59 g |
| `2 tablespoons butter (see Notes for vegan option)` | `butter` | 22.5 g |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `2-3 tablespoons fresh herbs (such as chives or parsley)` | `fresh herbs` | 22.5 g |

---

## Southern Fried Potatoes

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 tablespoons butter` | `butter` | 22.5 g |
| `2 tablespoons oil (olive oil, avocado oil, vegetable oil, etc.)` | `oil (olive oil, avocado oil, vegetable oil, etc.)` | 30.0 ml |
| `4 medium russet potatoes (chopped into bite-sized cubes, skin optional)` | `russet potatoes` | 320.0 g |
| `1 medium onion (diced)` | `onion` | 80.0 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `pepper (to taste)` | `pepper` | 100.0 g |

---

## Southwest Salad Dressing

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3/4 cup full-fat sour cream` | `full-fat sour cream` | 180.0 ml |
| `1/4 cup mayonnaise` | `mayonnaise` | 45.0 g |
| `1/4 cup water` | `water` | 60.0 ml |
| `4 teaspoons fresh lime juice` | `fresh lime juice` | 20.0 ml |
| `2 teaspoons chipotle chili powder (or 1 tablespoon ancho chili powder)` | `chipotle chili powder` | 5.0 g |
| `1 teaspoon smoked paprika` | `smoked paprika` | 2.5 g |
| `1/2 teaspoon cumin` | `cumin` | 1.25 g |
| `1 tablespoon minced garlic (approximately 2 large cloves)` | `garlic` | 11.25 g |
| `1/2 teaspoon salt (plus more to taste)` | `salt` | 3.0 g |
| `freshly cracked black pepper` | `black pepper` | 100.0 g |
| `2 tablespoons fresh cilantro leaves (or 1 tablespoon chopped fresh cilantro, see Notes)` | `fresh cilantro leaves` | 22.5 g |

---

## Spicy Chicken Ramen

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 inch fresh ginger (grated, see Notes)` | `inch fresh ginger` | 100.0 g |
| `3  garlic cloves (grated, see Notes)` | `garlic cloves` | 300.0 g |
| `8 cups chicken broth` | `chicken broth` | 1920.0 ml |
| `3 tablespoons soy sauce` | `soy sauce` | 45.0 ml |
| `2 tablespoons mirin` | `mirin` | 22.5 g |
| `2 tablespoons Sriracha` | `sriracha` | 22.5 g |
| `1 pound boneless skinless chicken breasts` | `chicken breasts` | 453.59 g |
| `9 ounces ramen noodles (see Notes for gluten-free option)` | `ramen noodles` | 100.0 g |
| `2  boiled eggs` | `boiled eggs` | 200.0 ml |
| `1/2 cup scallions (sliced)` | `scallions` | 90.0 g |
| `3  nori sheets (torn in half)` | `nori sheets` | 300.0 g |
| `1/2 cup sliced bamboo shoots` | `bamboo shoots` | 90.0 g |

---

## Steamed Cauliflower

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 head cauliflower` | `cauliflower` | 150.0 g |
| `1/2 cup water` | `water` | 120.0 ml |
| `2 tablespoons olive oil` | `olive oil` | 30.0 ml |
| `1/2 teaspoon kosher salt` | `kosher salt` | 3.0 g |
| `3-4 tablespoons fresh herbs (chopped, optional)` | `fresh herbs` | 33.75 g |
| `1 teaspoon lemon zest (optional)` | `lemon zest` | 3.75 g |

---

## Steamed Potatoes with Herbs

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 1/2 pounds baby potatoes` | `baby potatoes` | 680.38 g |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `1 tablespoon butter (see Notes)` | `butter` | 11.25 g |
| `2-3 tablespoons fresh herbs (see Notes)` | `fresh herbs` | 22.5 g |
| `Additional salt (to taste)` | `additional salt` | 100.0 g |

---

## Stewed Potatoes

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 pounds potatoes (peeled and cut into 1-inch cubes, see Notes)` | `potatoes` | 907.18 g |
| `1/2 cup butter` | `butter` | 90.0 g |
| `1 teaspoon salt` | `salt` | 6.0 g |
| `1/2 teaspoon black pepper` | `black pepper` | 1.88 g |

---

## Sweet Potato Casserole

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3 cups mashed sweet potatoes (about 4 medium sweet potatoes baked or boiled)` | `mashed sweet potatoes` | 540.0 g |
| `1/2 cup half and half (or milk of choice)` | `half and half` | 120.0 g |
| `1/4 cup brown sugar` | `brown sugar` | 51.0 g |
| `1/4 cup sugar` | `sugar` | 51.0 g |
| `2 tablespoons butter` | `butter` | 22.5 g |
| `1 tablespoon vanilla extract` | `vanilla extract` | 15.0 ml |
| `1 teaspoon cinnamon` | `cinnamon` | 2.5 g |
| `pinch nutmeg` | `nutmeg` | 1.0 g |
| `pinch salt` | `salt` | 1.0 g |
| `3/4 cup pecans (chopped)` | `pecans` | 135.0 g |
| `2 tablespoons butter (melted)` | `butter` | 22.5 g |
| `1/4 cup brown sugar` | `brown sugar` | 51.0 g |
| `1/3 cup all-purpose flour` | `all-purpose flour` | 40.0 g |
| `1/2 teaspoon cinnamon` | `cinnamon` | 1.25 g |
| `salt` | `salt` | 100.0 g |

---

## Sweet Potato Pudding

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/3 cup all-purpose flour (see Notes)` | `all-purpose flour` | 40.0 g |
| `1/3 cup brown sugar (or Brown Swerve or coconut sugar)` | `brown sugar` | 68.0 g |
| `3 tablespoons cold butter (cubed)` | `cold butter` | 33.75 g |
| `1/2 cup chopped pecans` | `pecans` | 90.0 g |
| `2 pounds sweet potatoes (rinsed, peeled, and diced into even 1&quot; chunks; see Notes)` | `sweet potatoes` | 907.18 g |
| `1 cup evaporated milk` | `evaporated milk` | 240.0 ml |
| `1/2 cup sugar (or granular Swerve or coconut sugar)` | `sugar` | 102.0 g |
| `1 teaspoon vanilla extract` | `vanilla extract` | 5.0 ml |
| `3 large eggs` | `eggs` | 300.0 g |

---

## Sweet Potato Rice

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 pounds sweet potatoes (approximately 4)` | `sweet potatoes` | 907.18 g |
| `3 teaspoons olive or avocado oil` | `olive or avocado oil` | 15.0 ml |
| `1 teaspoon kosher salt` | `kosher salt` | 6.0 g |
| `1/2 teaspoon ground black pepper` | `ground black pepper` | 1.88 g |

---

## Sweet Potato Waffles

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 cups all-purpose flour` | `all-purpose flour` | 240.0 g |
| `1 teaspoon fresh baking soda` | `fresh baking soda` | 4.5 g |
| `2 teaspoons fresh baking powder` | `fresh baking powder` | 9.0 g |
| `1 teaspoon pumpkin pie spice (store-bought or make your own)` | `pumpkin pie spice` | 2.5 g |
| `1/2 teaspoon ground cinnamon` | `ground cinnamon` | 1.25 g |
| `2 large egg yolks (yolks from 2 large eggs)` | `egg yolks` | 200.0 g |
| `2 large egg whites (whites from 2 large eggs)` | `egg whites` | 200.0 g |
| `2 cups mashed sweet potatoes` | `mashed sweet potatoes` | 360.0 g |
| `1/4 cup melted butter (or neutral-tasting oil)` | `butter` | 45.0 g |
| `1 teaspoon pure vanilla extract` | `vanilla extract` | 5.0 ml |
| `3/4 cup milk of choice` | `milk` | 180.0 ml |
| `1/4 cup packed brown sugar (dark or light)` | `brown sugar` | 51.0 g |

---

## Easy Taco Pie Recipe

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 9-inch ready-to-bake pie crust` | `9-inch ready-to-bake pie crust` | 100.0 g |
| `1 pound ground beef` | `ground beef` | 453.59 g |
| `1 teaspoon avocado oil` | `avocado oil` | 5.0 ml |
| `1 cup diced green bell pepper (approximately 1 medium green bell pepper)` | `green bell pepper` | 180.0 g |
| `1/2 cup diced white onion (approximately half of 1 medium white onion)` | `white onion` | 90.0 g |
| `1 2-ounce packet taco seasoning (or make your own)` | `taco seasoning` | 30.0 g |
| `1/2-3/4 cup water (according to instructions on packet of taco seasoning)` | `/4 cup water` | 50.0 ml |
| `1/2 cup jarred salsa of choice` | `jarred salsa` | 90.0 g |
| `1 16-ounce can refried beans (or make your own)` | `refried beans` | 400.0 g |
| `3/4 cup corn kernels (defrosted if frozen, drained and rinsed if canned)` | `corn kernels` | 135.0 g |
| `1 cup shredded Mexican cheese` | `mexican cheese` | 112.8 g |
| `shredded lettuce` | `lettuce` | 100.0 g |
| `diced tomatoes` | `tomatoes` | 100.0 g |
| `sour cream (or Greek yogurt)` | `sour cream` | 100.0 ml |
| `avocado (sliced or diced)` | `avocado` | 100.0 g |

---

## Tart Cherry Gummies

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 1/2 cups tart cherry juice (organic or unsweetened)` | `tart cherry juice` | 360.0 ml |
| `2 tablespoons fresh lemon juice (strained)` | `fresh lemon juice` | 30.0 ml |
| `2 tablespoons fresh lime juice (strained)` | `fresh lime juice` | 30.0 ml |
| `3 tablespoons honey (see Notes)` | `honey` | 45.0 ml |
| `1/4 cup gelatin powder (unflavored)` | `gelatin powder` | 30.0 g |

---

## Taylor Swift Chai Cookies

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/2 cup unsalted butter (1 full stick butter, at room temperature)` | `unsalted butter` | 144.0 g |
| `1/2 cup vegetable oil (or refined coconut oil)` | `vegetable oil` | 120.0 ml |
| `1/2 cup granulated white sugar (or light brown sugar)` | `granulated white sugar` | 102.0 g |
| `1/2 cup powdered sugar` | `powdered sugar` | 102.0 g |
| `1  chai tea bag (any brand; contents only, bag discarded)` | `chai tea bag` | 100.0 g |
| `1 large egg (at room temperature)` | `egg` | 100.0 g |
| `2 teaspoons pure vanilla extract` | `vanilla extract` | 10.0 ml |
| `2 cups all-purpose flour (spooned and leveled, see Notes)` | `all-purpose flour` | 240.0 g |
| `1/2 teaspoon fresh baking soda` | `fresh baking soda` | 2.25 g |
| `1/4 teaspoon salt` | `salt` | 1.5 g |
| `granulated white sugar (to taste)` | `granulated white sugar` | 100.0 g |
| `1 1/2 cups powdered sugar` | `powdered sugar` | 306.0 g |
| `1 small pinch ground nutmeg` | `pinch ground nutmeg` | 50.0 g |
| `1 small pinch ground cinnamon` | `pinch ground cinnamon` | 50.0 g |
| `3 tablespoons whole milk (or eggnog)` | `milk` | 45.0 ml |
| `ground nutmeg (to taste)` | `ground nutmeg` | 100.0 g |
| `ground cinnamon (to taste)` | `ground cinnamon` | 100.0 g |

---

## Teriyaki Shrimp

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 tablespoon cornstarch` | `cornstarch` | 9.0 g |
| `2 tablespoons cold water` | `cold water` | 30.0 ml |
| `2 tablespoons low-sodium soy sauce` | `low-sodium soy sauce` | 30.0 ml |
| `1/2 cup water` | `water` | 120.0 ml |
| `1/4 teaspoon salt (more or less to taste)` | `salt` | 1.5 g |
| `1/4 teaspoon ground ginger` | `ground ginger` | 0.94 g |
| `1/4 teaspoon garlic powder` | `garlic powder` | 0.62 g |
| `3 packed tablespoons light brown sugar` | `tablespoons light brown sugar` | 300.0 g |
| `1 tablespoon avocado oil (or other neutral oil with high smoke-point)` | `avocado oil` | 15.0 ml |
| `1 pound large shrimp (peeled, deveined)` | `large shrimp` | 453.59 g |

---

## Texas Roadhouse Chili Recipe

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 tablespoons neutral oil (olive oil, avocado oil, etc.)` | `neutral oil (olive oil, avocado oil, etc.)` | 30.0 ml |
| `1 medium yellow onion (diced, approximately 2 cups)` | `yellow onion` | 80.0 g |
| `2 tablespoons minced fresh garlic` | `fresh garlic` | 22.5 g |
| `2 pounds lean ground beef (90/10 or higher)` | `ground beef` | 907.18 g |
| `3 1/2 teaspoons cumin` | `cumin` | 8.75 g |
| `2 packed tablespoons brown sugar` | `tablespoons brown sugar` | 200.0 g |
| `2 tablespoons chili powder` | `chili powder` | 15.0 g |
| `1 1/2 tablespoons smoked paprika` | `smoked paprika` | 11.25 g |
| `1/2 teaspoon freshly cracked black pepper (more or less to taste)` | `black pepper` | 1.88 g |
| `3 1/2 teaspoons salt (more or less to taste)` | `salt` | 21.0 g |
| `2 14-ounce cans crushed tomatoes` | `crushed tomatoes` | 800.0 g |
| `3 tablespoons tomato paste` | `tomato paste` | 33.75 g |
| `1 14-ounce can kidney beans (rinsed well, drained well; optional, see Notes)` | `kidney beans` | 400.0 g |
| `1 cup low-sodium beef broth` | `low-sodium beef broth` | 240.0 ml |
| `1/8 teaspoon crushed red pepper flakes (more or less to taste, optional)` | `crushed red pepper flakes` | 0.47 g |
| `shredded fresh cheddar cheese` | `fresh cheddar cheese` | 100.0 g |
| `finely chopped red onions` | `red onions` | 100.0 g |
| `thinly sliced green onions` | `green onions` | 100.0 g |
| `sour cream` | `sour cream` | 100.0 ml |
| `tortilla chips` | `tortilla chips` | 100.0 g |
| `yeast rolls` | `yeast rolls` | 100.0 g |

---

## Copycat Texas Roadhouse Cinnamon Honey Butter Recipe

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 cup unsalted butter (at room temperature)` | `unsalted butter` | 288.0 g |
| `1/2 cup confectioners&#39; sugar` | `confectioners&#39; sugar` | 102.0 g |
| `3 tablespoons honey` | `honey` | 45.0 ml |
| `1/2 teaspoon pure vanilla extract` | `vanilla extract` | 2.5 ml |
| `2 teaspoons ground cinnamon` | `ground cinnamon` | 5.0 g |
| `1/4 teaspoon kosher salt (or coarse sea salt)` | `kosher salt` | 1.5 g |

---

## Texas Roadhouse Green Beans

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `6 slices bacon (chopped)` | `bacon` | 120.0 g |
| `1/2 cup diced white onion (approximately half of 1 medium onion)` | `white onion` | 90.0 g |
| `2 16-ounce cans green beans (drained, rinsed)` | `green beans` | 800.0 g |
| `1/2 cup low-sodium chicken broth` | `low-sodium chicken broth` | 120.0 ml |
| `1 tablespoon minced garlic (approximately 3 large cloves)` | `garlic` | 11.25 g |
| `1 tablespoon butter` | `butter` | 11.25 g |
| `1 tablespoon red wine vinegar` | `red wine vinegar` | 15.0 ml |
| `1 teaspoon granulated sugar (see Notes)` | `granulated sugar` | 4.25 g |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `1/4 teaspoon freshly cracked black pepper (more or less to taste)` | `black pepper` | 0.94 g |

---

## Texas Roadhouse Herb Crusted Chicken

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 tablespoons dried dill` | `dried dill` | 22.5 g |
| `2 tablespoons dried basil` | `dried basil` | 22.5 g |
| `2 tablespoons dried oregano` | `dried oregano` | 22.5 g |
| `2 tablespoons garlic powder` | `garlic powder` | 15.0 g |
| `1 teaspoon paprika (smoked or regular)` | `paprika` | 2.5 g |
| `2 teaspoons salt` | `salt` | 12.0 g |
| `2 teaspoons freshly cracked black pepper` | `black pepper` | 7.5 g |
| `4 large boneless, skinless chicken breasts (approximately 8-10 ounces each)` | `chicken breasts` | 400.0 g |
| `2 tablespoons extra-virgin olive oil (for stovetop method)` | `extra-virgin olive oil` | 30.0 ml |
| `1 large lemon (halved)` | `lemon` | 100.0 g |

---

## Texas Roadhouse Ranch Dressing

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 1/4 cups mayonnaise` | `mayonnaise` | 225.0 g |
| `3/4 cup buttermilk` | `buttermilk` | 180.0 ml |
| `2 Tbsp ranch seasoning mix` | `ranch seasoning mix` | 22.5 g |

---

## Copycat Texas Roadhouse Rice Recipe

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 cups long-grain white rice (rinsed)` | `long-grain white rice` | 408.0 g |
| `1/2 cup butter` | `butter` | 90.0 g |
| `1  medium onion (diced)` | `onion` | 80.0 g |
| `2 tablespoons paprika` | `paprika` | 15.0 g |
| `1 tablespoons garlic powder` | `garlic powder` | 7.5 g |
| `2 tablespoons dried parsley (or 1/4 cup fresh chopped)` | `dried parsley` | 22.5 g |
| `1/4 teaspoon red pepper flakes (optional for a little heat)` | `red pepper flakes` | 0.94 g |
| `4 1/2 cups chicken stock (or broth)` | `chicken stock` | 1080.0 ml |
| `1/4 cup low-sodium soy sauce` | `low-sodium soy sauce` | 60.0 ml |
| `salt and black pepper (to taste)` | `salt and black pepper` | 100.0 g |

---

## Texas Roadhouse Smothered Chicken Recipe

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2  chicken breasts (choose large ones)` | `chicken breasts` | 200.0 g |
| `salt and fresh cracked black pepper` | `salt and fresh black pepper` | 100.0 g |
| `3 tbsp butter (plus extra if needed)` | `butter` | 33.75 g |
| `1  medium onion (cut into 1/4 inch slices)` | `onion` | 80.0 g |
| `1/2 lb button mushrooms (sliced)` | `button mushrooms` | 226.79 g |
| `2 tsp seasoning blend (like Kinder steakhouse)` | `seasoning blend` | 7.5 g |
| `2 tbsp red wine` | `red wine` | 30.0 ml |
| `1/4 lb Monterey Jack cheese (shredded, or as needed)` | `monterey jack cheese` | 113.4 g |

---

## How to Thicken Mashed Potatoes (5 Ways)

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4 cups runny mashed potatoes` | `runny mashed potatoes` | 720.0 g |
| `cornstarch (optional)` | `cornstarch` | 100.0 g |
| `dehydrated potatoes (optional)` | `dehydrated potatoes` | 100.0 g |
| `additional potatoes (peeled, boiled, and mashed; optional)` | `additional potatoes` | 100.0 g |

---

## Toasted Grilled Cheese (No Stove Needed)

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 slices bread of choice (potato bread, buttermilk bread, whole wheat bread, etc.)` | `bread (potato bread, buttermilk bread, whole wheat bread, etc.)` | 40.0 ml |
| `1/2 tablespoon salted butter (softened)` | `salted butter` | 9.0 g |
| `3 slices cheese of choice (Swiss, cheddar, muenster, havarti, etc.)` | `cheese (swiss, cheddar, muenster, havarti, etc.)` | 60.0 g |
| `1 pinch garlic powder (optional)` | `garlic powder` | 1.0 g |

---

## Easy Vegan Tofu Cream Cheese (4 Flavors)

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 14.5-ounce block firm tofu (at room temperature )` | `block firm tofu` | 100.0 g |
| `1 tablespoon fresh lemon juice` | `fresh lemon juice` | 15.0 ml |
| `1 tablespoon apple cider vinegar` | `apple cider vinegar` | 15.0 ml |
| `1/4 cup melted refined coconut oil` | `refined coconut oil` | 60.0 ml |
| `1 teaspoon nutritional yeast` | `nutritional yeast` | 2.75 g |
| `1 teaspoon salt (more or less to taste)` | `salt` | 6.0 g |
| `1 14.5-ounce block firm tofu (at room temperature)` | `block firm tofu` | 100.0 g |
| `1 tablespoon fresh lemon juice` | `fresh lemon juice` | 15.0 ml |
| `1 tablespoon apple cider vinegar` | `apple cider vinegar` | 15.0 ml |
| `1/4 cup melted refined coconut oil` | `refined coconut oil` | 60.0 ml |
| `1 teaspoon nutritional yeast` | `nutritional yeast` | 2.75 g |
| `1 teaspoon salt (more or less to taste)` | `salt` | 6.0 g |
| `1 cup berries of choice (fresh or frozen, see Notes)` | `berries` | 180.0 g |
| `1/4 cup confectioners&#39; sugar` | `confectioners&#39; sugar` | 51.0 g |
| `1 14.5-ounce block firm tofu  (at room temperature)` | `block firm tofu` | 100.0 g |
| `1 tablespoon fresh lemon juice` | `fresh lemon juice` | 15.0 ml |
| `1 tablespoon apple cider vinegar` | `apple cider vinegar` | 15.0 ml |
| `1/4 cup melted refined coconut oil` | `refined coconut oil` | 60.0 ml |
| `1 teaspoon nutritional yeast` | `nutritional yeast` | 2.75 g |
| `1 teaspoon salt (more or less to taste)` | `salt` | 6.0 g |
| `1 teaspoon onion powder` | `onion powder` | 2.5 g |
| `1/4 cup chopped chives` | `chives` | 45.0 g |
| `1 14.5-ounce block firm tofu (at room temperature)` | `block firm tofu` | 100.0 g |
| `1 tablespoon fresh lemon juice` | `fresh lemon juice` | 15.0 ml |
| `1 tablespoon apple cider vinegar` | `apple cider vinegar` | 15.0 ml |
| `1/4 cup melted refined coconut oil` | `refined coconut oil` | 60.0 ml |
| `1 teaspoon nutritional yeast` | `nutritional yeast` | 2.75 g |
| `1 teaspoon salt (more or less to taste)` | `salt` | 6.0 g |
| `2 tablespoons chopped green onions (green parts only)` | `green onions` | 22.5 g |

---

## Tomatillo Red Chili Salsa

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 pounds whole tomatillos` | `tomatillos` | 907.18 g |
| `5 cloves garlic (peeled, crushed)` | `garlic` | 15.0 g |
| `2-3 tablespoons New Mexico red chile powder` | `new mexico red chile powder` | 15.0 g |
| `2 teaspoons ground cumin` | `ground cumin` | 5.0 g |
| `2 tablespoons lime juice` | `lime juice` | 30.0 ml |
| `Tabasco (to taste)` | `tabasco` | 100.0 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly cracked black pepper (to taste)` | `black pepper` | 100.0 g |

---

## Tomato Florentine Soup

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 tablespoon olive oil` | `olive oil` | 15.0 ml |
| `1 medium onion (chopped)` | `onion` | 80.0 g |
| `2 large carrots (peeled, chopped)` | `carrots` | 200.0 g |
| `1 stalk  celery (chopped)` | `celery` | 40.0 g |
| `2 cloves garlic  (minced)` | `garlic` | 6.0 g |
| `1 teaspoon Italian seasoning` | `italian seasoning` | 3.75 g |
| `1 teaspoon salt (more or less to taste)` | `salt` | 6.0 g |
| `1/4 teaspoon freshly cracked black pepper (more or less to taste)` | `black pepper` | 0.94 g |
| `2 tablespoons tomato paste` | `tomato paste` | 22.5 g |
| `1 28-ounce can diced tomatoes` | `tomatoes` | 400.0 g |
| `32 ounces chicken broth (or vegetable broth)` | `chicken broth` | 100.0 ml |
| `1 cup dry macaroni` | `dry macaroni` | 180.0 g |
| `2 cups chopped spinach` | `spinach` | 360.0 g |
| `freshly grated parmesan` | `parmesan` | 100.0 g |
| `freshly chopped parsley` | `parsley` | 100.0 g |

---

## Truffle Honey Chicken with Asparagus

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4 medium boneless, skinless chicken breasts (approximately 6 to 8 ounces each)` | `chicken breasts` | 320.0 g |
| `1 cup buttermilk (see Notes)` | `buttermilk` | 240.0 ml |
| `2 cups all-purpose flour` | `all-purpose flour` | 240.0 g |
| `1 tablespoon onion powder` | `onion powder` | 7.5 g |
| `1 tablespoon garlic powder` | `garlic powder` | 7.5 g |
| `1/2 tablespoon paprika` | `paprika` | 3.75 g |
| `1 teaspoon salt (more or less to taste)` | `salt` | 6.0 g |
| `1/2 teaspoon freshly ground black pepper (more or less to taste)` | `black pepper` | 1.88 g |
| `neutral cooking oil (avocado oil, olive oil, etc.; enough to fill skillet 33%)` | `neutral cooking oil` | 100.0 ml |
| `2 tablespoons truffle honey` | `truffle honey` | 30.0 ml |
| `1 bunch asparagus (approximately 1/2 to 3/4 pound, ends trimmed)` | `bunch asparagus` | 100.0 g |
| `1 tablespoon olive oil` | `olive oil` | 15.0 ml |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly ground black pepper (to taste)` | `black pepper` | 100.0 g |
| `1/2 teaspoon garlic powder` | `garlic powder` | 1.25 g |

---

## Truffle Mashed Potatoes

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3 pounds Yukon gold potatoes (or russet potatoes; washed, peeled, cubed)` | `yukon gold potatoes` | 1360.77 g |
| `1 big pinch salt (plus more to taste)` | `big pinch salt` | 100.0 g |
| `1/4 cup butter` | `butter` | 45.0 g |
| `1/2 cup milk of choice` | `milk` | 120.0 ml |
| `1/2 cup full-fat sour cream` | `full-fat sour cream` | 120.0 ml |
| `1/4 cup freshly grated parmesan (see Notes)` | `parmesan` | 22.8 g |
| `2 tablespoons truffle oil (plus more for serving, see Notes)` | `truffle oil` | 30.0 ml |
| `fresh chopped parsley (for serving)` | `fresh parsley` | 100.0 g |

---

## Tuna Carpaccio

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `8-12 ounces frozen tuna steaks` | `-frozen tuna steaks` | 800.0 g |
| `half of one large avocado (peeled, pit removed, sliced)` | `half of one large avocado` | 100.0 g |
| `half of one medium red onion (thinly sliced)` | `half of one medium red onion` | 100.0 g |
| `2 tablespoons  capers` | `capers` | 22.5 g |
| `1/3 cup high-quality olive oil` | `high-quality olive oil` | 80.0 ml |
| `1 teaspoon fresh lemon zest` | `fresh lemon zest` | 3.75 g |
| `salt (to taste)` | `salt` | 100.0 g |

---

## Tuna Ceviche

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 pound sushi-grade ahi tuna` | `sushi-grade ahi tuna` | 453.59 g |
| `1/2 cup fresh lime juice (juice from approximately 3 limes)` | `fresh lime juice` | 120.0 ml |
| `2 tablespoons finely diced jalapeños (seeds removed, approximately 1 small jalapeño)` | `jalapeños` | 22.5 g |
| `1/2 cup diced red onion (approximately half of one medium onion)` | `red onion` | 90.0 g |
| `1/2 cup finely diced cucumber (seeds removed, approximately half of one cucumber)` | `cucumber` | 90.0 g |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `1 large avocado (diced, approximately 1 cup)` | `avocado` | 100.0 g |
| `1/3 cup chopped fresh cilantro` | `fresh cilantro` | 60.0 g |
| `tortilla chips` | `tortilla chips` | 100.0 g |

---

## Canned Tuna Nachos

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `12 ounces tortilla chips of choice` | `tortilla chips` | 100.0 g |
| `2 cups shredded Mexican-style cheese blend` | `mexican-style cheese blend` | 225.6 g |
| `3 large avocados (halved, peeled, pitted)` | `avocados` | 300.0 g |
| `2 tablespoons  fresh lime juice (juice from approximately 1 lime)` | `fresh lime juice` | 30.0 ml |
| `1 teaspoon salt (more or less to taste)` | `salt` | 6.0 g |
| `1 5-ounce can solid white tuna in water (drained, flaked)` | `solid white tuna in water` | 400.0 ml |
| `1 cup quartered cherry tomatoes` | `quartered cherry tomatoes` | 180.0 g |
| `1/2 cup diced red onion` | `red onion` | 90.0 g |
| `1/4 cup roughly chopped fresh cilantro` | `fresh cilantro` | 45.0 g |
| `1/4 cup sour cream` | `sour cream` | 60.0 ml |
| `jalapeño slices` | `jalapeño slices` | 100.0 g |

---

## Tuna Tostadas

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `6 6-inch corn tortillas` | `6-inch corn tortillas` | 600.0 g |
| `1 teaspoon neutral-flavored oil (avocado oil, olive oil, etc.)` | `neutral-flavored oil (avocado oil, olive oil, etc.)` | 5.0 ml |
| `salt (optional, to taste)` | `salt` | 100.0 g |
| `2 large avocados (halved, pit removed, peel removed)` | `avocados` | 200.0 g |
| `1/4 cup diced red onion` | `red onion` | 45.0 g |
| `2 tablespoons chopped fresh cilantro` | `fresh cilantro` | 22.5 g |
| `2 teaspoons fresh lime juice` | `fresh lime juice` | 10.0 ml |
| `1 pinch salt (more or less to taste)` | `salt` | 1.0 g |
| `3 5-ounce cans tuna packed in water (drained)` | `tuna in water` | 1200.0 ml |
| `2  green onions (thinly sliced)` | `green onions` | 200.0 g |
| `1 tablespoon fresh lime juice` | `fresh lime juice` | 15.0 ml |
| `1 tablespoon chopped fresh cilantro` | `fresh cilantro` | 11.25 g |
| `2-3 dashes hot sauce (more or less to taste)` | `hot sauce` | 2.0 ml |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly ground black pepper (to taste)` | `black pepper` | 100.0 g |
| `1/4 cup mayonnaise` | `mayonnaise` | 45.0 g |
| `1/2 teaspoon garlic powder` | `garlic powder` | 1.25 g |
| `1 teaspoon chipotle pepper powder` | `chipotle pepper powder` | 2.5 g |
| `1-2 tablespoons  water (more or less as needed)` | `water` | 15.0 ml |

---

## Turkey and Dumplings

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 tablespoons butter` | `butter` | 22.5 g |
| `1/2  onion (chopped)` | `onion` | 50.0 g |
| `2  celery stalks (chopped)` | `celery stalks` | 200.0 g |
| `1  carrot (chopped)` | `carrot` | 100.0 g |
| `2  garlic cloves (minced)` | `garlic cloves` | 200.0 g |
| `2 quarts chicken or turkey broth` | `chicken or turkey broth` | 1920.0 ml |
| `1  bay leaf` | `bay leaf` | 100.0 g |
| `1/4 teaspoon dried thyme` | `dried thyme` | 0.94 g |
| `2 cups cooked turkey (chopped)` | `turkey` | 360.0 g |
| `1 cup all purpose flour (see Notes)` | `all purpose flour` | 120.0 g |
| `1/4 cup yellow cornmeal` | `yellow cornmeal` | 45.0 g |
| `1/2 tablespoon baking powder` | `baking powder` | 6.75 g |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `3/4 cup half and half (see Notes)` | `half and half` | 180.0 g |

---

## Turkey Melt with Cheddar, Spinach, and Bacon

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4 slices sourdough (or thick, crusty bread of choice)` | `sourdough (or thick, crusty bread )` | 80.0 g |
| `2 tablespoons honey mustard` | `honey mustard` | 30.0 ml |
| `2 slices white cheddar cheese` | `white cheddar cheese` | 40.0 g |
| `4 slices deli turkey` | `deli turkey` | 80.0 g |
| `thin tomato slices (from 1 medium red tomato)` | `thin tomato slices` | 100.0 g |
| `1/2 cup fresh baby spinach` | `fresh baby spinach` | 90.0 g |
| `4 strips cooked bacon` | `bacon` | 60.0 g |
| `2 tablespoons butter (softened)` | `butter` | 22.5 g |

---

## Turkey Spaghetti

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 tablespoon olive oil` | `olive oil` | 15.0 ml |
| `1 pound ground turkey (93/7 preferred)` | `ground turkey` | 453.59 g |
| `1 small onion (diced)` | `onion` | 50.0 g |
| `3 cloves garlic (minced)` | `garlic` | 9.0 g |
| `2 teaspoons Italian seasoning` | `italian seasoning` | 7.5 g |
| `2 teaspoons red wine vinegar` | `red wine vinegar` | 10.0 ml |
| `1 cup chicken broth` | `chicken broth` | 240.0 ml |
| `1 24-ounce jar marinara sauce` | `marinara sauce` | 400.0 ml |
| `1 teaspoon sugar (optional)` | `sugar` | 4.25 g |
| `freshly cracked black pepper (to taste)` | `black pepper` | 100.0 g |
| `8 ounces dry spaghetti noodles (see Notes)` | `dry spaghetti noodles` | 100.0 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `chopped fresh basil` | `fresh basil` | 100.0 g |
| `freshly grated parmesan cheesee` | `parmesan cheesee` | 100.0 g |

---

## Turkey Stuffed Peppers

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4  bell peppers` | `bell peppers` | 400.0 g |
| `1 pound ground turkey` | `ground turkey` | 453.59 g |
| `2 tablespoons chopped onion` | `onion` | 22.5 g |
| `1 cup rice (cooked)` | `rice` | 204.0 g |
| `salt` | `salt` | 100.0 g |
| `pepper` | `pepper` | 100.0 g |
| `1 clove garlic` | `garlic` | 3.0 g |
| `15 ounces tomato sauce` | `tomato sauce` | 100.0 ml |
| `3/4 cup mozzarella cheese (shredded)` | `mozzarella cheese` | 84.6 g |

---

## Vegan Apple Crisp

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `10 cups apples (peeled and sliced into 1/2" slices or chunks, about 6-8 medium apples)` | `apples` | 1800.0 g |
| `1/2 cup packed brown sugar (light or dark)` | `brown sugar` | 102.0 g |
| `1/4 cup all-purpose flour` | `all-purpose flour` | 30.0 g |
| `1 teaspoon pure vanilla extract` | `vanilla extract` | 5.0 ml |
| `1 teaspoon ground cinnamon` | `ground cinnamon` | 2.5 g |
| `1/4 teaspoon salt` | `salt` | 1.5 g |
| `3/4 cup all-purpose flour (spooned and levelled)` | `all-purpose flour` | 90.0 g |
| `3/4 cup packed light brown sugar (or dark brown sugar)` | `light brown sugar` | 153.0 g |
| `1 teaspoon ground cinnamon` | `ground cinnamon` | 2.5 g |
| `1/2 cup vegan butter (cold and cubed)` | `vegan butter` | 90.0 g |
| `1 cup old-fashioned whole rolled oats` | `old-fashioned whole rolled oats` | 86.4 g |
| `Vanilla ice cream` | `vanilla ice cream` | 100.0 ml |
| `Caramel sauce` | `caramel sauce` | 100.0 ml |

---

## Vegan Apple Pie

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 1/2 cups all-purpose flour (spooned &amp; leveled, see Notes)` | `all-purpose flour` | 300.0 g |
| `1 tablespoon granulated sugar (see Notes)` | `granulated sugar` | 12.75 g |
| `1 teaspoon salt` | `salt` | 6.0 g |
| `1 cup vegetable shortening (cold, cut into cubes)` | `vegetable shortening` | 180.0 g |
| `4 tablespoons cold water (plus 1 additional tablespoon if needed)` | `cold water` | 60.0 ml |
| `10 cups 1/4-inch-thick apple slices (approximately 8 large Granny Smith apples, peeled, cored, sliced)` | `1/4-inch-thick apple slices` | 1800.0 g |
| `1 tablespoon lemon juice` | `lemon juice` | 15.0 ml |
| `1 1/2 teaspoons ground cinnamon` | `ground cinnamon` | 3.75 g |
| `1/4 teaspoon salt` | `salt` | 1.5 g |
| `2/3 packed cup brown sugar (light or dark; or 2/3 cup granulated sugar)` | `cup brown sugar` | 66.67 g |
| `1/2 cup vegan butter` | `vegan butter` | 90.0 g |
| `1/4 cup all-purpose flour (spooned &amp; leveled, see Notes)` | `all-purpose flour` | 30.0 g |
| `1/4 cup water` | `water` | 60.0 ml |
| `almond milk (or plant-based milk of choice, enough to brush on pie crust)` | `almond milk (or plant-based milk , enough to brush on pie crust)` | 100.0 ml |
| `turbinado sugar (or brown sugar, or white sugar; enough to sprinkle onto pie crust)` | `turbinado sugar (or brown sugar, or white sugar; enough to sprinkle onto pie crust)` | 100.0 g |

---

## Vegan Banana Pudding

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3/4 cup unsweetened almond milk` | `unsweetened almond milk` | 180.0 ml |
| `3 tablespoons cornstarch (or arrowroot starch)` | `cornstarch` | 27.0 g |
| `1 15-ounce can full-fat coconut milk` | `full-fat coconut milk` | 400.0 ml |
| `1 teaspoon pure vanilla extract` | `vanilla extract` | 5.0 ml |
| `1/4 cup maple syrup` | `maple syrup` | 60.0 ml |
| `1 pinch salt` | `salt` | 1.0 g |
| `1 pinch  turmeric (optional, for color)` | `turmeric` | 1.0 g |
| `1 9-ounce container vegan whipped topping (divided, see Notes)` | `container vegan whipped topping` | 100.0 g |
| `4-5  medium bananas (peeled, sliced into discs)` | `bananas` | 320.0 g |
| `vegan vanilla cookies (to taste)` | `vegan vanilla cookies` | 100.0 g |

---

## Vegan BBQ Sauce

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 cup ketchup` | `ketchup` | 180.0 g |
| `1/4 cup maple syrup` | `maple syrup` | 60.0 ml |
| `3 tablespoons apple cider vinegar` | `apple cider vinegar` | 45.0 ml |
| `1 tablespoon vegan Worcestershire sauce` | `vegan worcestershire sauce` | 15.0 ml |
| `2 tablespoons soy sauce (or coconut aminos, or tamari)` | `soy sauce (or coconut aminos, or tamari)` | 30.0 ml |
| `1 teaspoon smoked paprika` | `smoked paprika` | 2.5 g |
| `1/2 teaspoon mustard powder` | `mustard powder` | 1.25 g |
| `1/2 teaspoon garlic powder` | `garlic powder` | 1.25 g |
| `1/2 teaspoon onion powder` | `onion powder` | 1.25 g |
| `1/3 teaspoon chili powder (or a heaping 1/4 teaspoon)` | `chili powder` | 0.83 g |
| `1/3 teaspoon black pepper (or a heaping 1/4 teaspoon)` | `black pepper` | 1.25 g |
| `2 tablespoons water` | `water` | 30.0 ml |

---

## Magic Vegan Birria Tacos

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `8 cups water (more or less as needed)` | `water` | 1920.0 ml |
| `4 large whole jalapeño peppers (approximately 75 grams or 1 1/2 ounces each)` | `jalapeño peppers` | 400.0 g |
| `2 large cloves garlic (approximately 6-8 grams each)` | `cloves garlic` | 200.0 g |
| `1/2 cup neutral-flavored oil (avocado oil, vegetable oil, etc.)` | `neutral-flavored oil (avocado oil, vegetable oil, etc.)` | 120.0 ml |
| `1 teaspoon salt (more or less to taste)` | `salt` | 6.0 g |
| `1/4 of one medium white onion (optional, approximately 2 ounces)` | `medium white onion` | 25.0 g |
| `2 tablespoons fresh cilantro (optional)` | `fresh cilantro` | 22.5 g |
| `3 14-ounce cans young jackfruit in brine` | `young jackfruit in brine` | 1200.0 g |
| `1/2 of one medium yellow onion (approximately 3 ounces)` | `medium yellow onion` | 50.0 g |
| `1  bay leaf` | `bay leaf` | 100.0 g |
| `1/2 of one medium yellow onion (approximately 3 ounces)` | `medium yellow onion` | 50.0 g |
| `1/2 tablespoon salt (more or less to taste)` | `salt` | 9.0 g |
| `1/2 tablespoon freshly ground black pepper (more or less to taste)` | `black pepper` | 5.62 g |
| `12  guajillo chile peppers (rinsed, stems and seeds removed)` | `guajillo chile peppers` | 1200.0 g |
| `6  ancho chile peppers (rinsed, stems and seeds removed)` | `ancho chile peppers` | 600.0 g |
| `2 large Roma tomatoes (approximately 3 ounces each)` | `roma tomatoes` | 200.0 g |
| `1 4-inch stick Mexican cinnamon (a.k.a. canela, or 1/2 teaspoon ground cinnamon)` | `4-inch stick mexican cinnamon` | 100.0 g |
| `2 whole bay leaves` | `bay leaves` | 200.0 g |
| `1/2 teaspoon whole black peppercorns` | `black peppercorns` | 1.88 g |
| `4 cups no-beef broth` | `no-beef broth` | 960.0 ml |
| `2 tablespoons distilled white vinegar` | `distilled white vinegar` | 30.0 ml |
| `5 large cloves garlic (approximately 6-8 grams each)` | `cloves garlic` | 500.0 g |
| `1 teaspoon ground cumin` | `ground cumin` | 2.5 g |
| `1 teaspoon dried Mexican oregano (or 1 teaspoon dried marjoram)` | `dried mexican oregano` | 3.75 g |
| `1/4 teaspoon ground cloves` | `ground cloves` | 0.94 g |
| `1 1/2 tablespoons olive oil (divided)` | `olive oil` | 22.5 ml |
| `12  corn tortillas (divided)` | `corn tortillas` | 1200.0 g |
| `vegan shredded mozzarella (or pourable vegan mozzarella)` | `vegan mozzarella` | 100.0 g |
| `chopped white onion` | `white onion` | 100.0 g |
| `chopped fresh cilantro` | `fresh cilantro` | 100.0 g |

---

## Vegan Biscuits and Gravy

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 cups all-purpose flour` | `all-purpose flour` | 240.0 g |
| `1 tablespoon fresh baking powder` | `fresh baking powder` | 13.5 g |
| `1 teaspoon salt` | `salt` | 6.0 g |
| `1/3 cup vegan butter (chilled in freezer at least 10 minutes)` | `vegan butter` | 60.0 g |
| `1 cup unsweetened plant-based milk` | `unsweetened plant-based milk` | 240.0 ml |
| `5 tablespoons avocado oil (or vegan butter)` | `avocado oil` | 75.0 ml |
| `5 tablespoons all-purpose flour` | `all-purpose flour` | 37.5 g |
| `1 pinch salt` | `salt` | 1.0 g |
| `1/8 teaspoon freshly ground black pepper` | `black pepper` | 0.47 g |
| `1/4 teaspoon garlic powder (plus more to taste)` | `garlic powder` | 0.62 g |
| `1/2 teaspoon poultry seasoning` | `poultry seasoning` | 1.88 g |
| `3 cups unsweetened plant-based milk` | `unsweetened plant-based milk` | 720.0 ml |
| `thinly sliced green onions` | `green onions` | 100.0 g |
| `freshly ground black pepper` | `black pepper` | 100.0 g |

---

## Vegan Buffalo Chicken Dip

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 14-ounce can young jackfruit in brine` | `young jackfruit in brine` | 400.0 g |
| `1 tablespoon neutral-flavored oil (avocado oil, olive oil, refined coconut oil, etc.)` | `neutral-flavored oil (avocado oil, olive oil, refined coconut oil, etc.)` | 15.0 ml |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly cracked black pepper (to taste)` | `black pepper` | 100.0 g |
| `8 ounces vegan cream cheese` | `vegan cream cheese` | 100.0 ml |
| `1 1/2 cups vegan ranch dressing (at room temperature)` | `vegan ranch dressing` | 270.0 g |
| `3/4 cup vegan buffalo sauce (at room temperature)` | `vegan buffalo sauce` | 180.0 ml |
| `1 teaspoon garlic powder` | `garlic powder` | 2.5 g |
| `1 teaspoon salt (more or less to taste)` | `salt` | 6.0 g |
| `sliced green onions` | `green onions` | 100.0 g |
| `tortilla chips (or crostini)` | `tortilla chips` | 100.0 g |
| `celery sticks` | `celery sticks` | 100.0 g |
| `carrot sticks` | `carrot sticks` | 100.0 g |

---

## Vegan Chicken Sandwich

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 cups vital wheat gluten` | `vital wheat gluten` | 360.0 g |
| `1/4 cup nutritional yeast` | `nutritional yeast` | 33.0 g |
| `1 teaspoon garlic powder` | `garlic powder` | 2.5 g |
| `1 teaspoon onion powder` | `onion powder` | 2.5 g |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `1/4 teaspoon freshly cracked black pepper` | `black pepper` | 0.94 g |
| `2 tablespoons olive oil` | `olive oil` | 30.0 ml |
| `7 cups vegetable broth (divided)` | `vegetable broth` | 1680.0 ml |
| `1 1/4 cups unsweetened non-dairy milk` | `unsweetened non-dairy milk` | 300.0 ml |
| `1 teaspoon apple cider vinegar` | `apple cider vinegar` | 5.0 ml |
| `1 cup all-purpose flour` | `all-purpose flour` | 120.0 g |
| `1 teaspoon cornstarch` | `cornstarch` | 3.0 g |
| `1 teaspoon salt` | `salt` | 6.0 g |
| `1/2 teaspoon freshly cracked black pepper` | `black pepper` | 1.88 g |
| `1 teaspoon garlic powder` | `garlic powder` | 2.5 g |
| `1 teaspoon onion powder` | `onion powder` | 2.5 g |
| `1 teaspoon dried oregano` | `dried oregano` | 3.75 g |
| `1/2 teaspoon cajun seasoning` | `cajun seasoning` | 1.88 g |
| `neutral oil (as needed)` | `neutral oil` | 100.0 ml |
| `4  vegan burger buns` | `vegan burger buns` | 400.0 g |
| `butter lettuce leaves` | `butter lettuce leaves` | 100.0 g |
| `pickle chips` | `pickle chips` | 100.0 g |
| `vegan mayonnaise (or your preferred condiments)` | `vegan mayonnaise` | 100.0 g |

---

## Vegan Christmas Cut-Out Sugar Cookies

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/2 cup vegan butter (softened)` | `vegan butter` | 90.0 g |
| `3/4 cups sugar` | `sugar` | 153.0 g |
| `3/4 teaspoons vanilla extract` | `vanilla extract` | 3.75 ml |
| `1 3/4 cups all-purpose flour` | `all-purpose flour` | 210.0 g |
| `4 tablespoons vegan milk of choice` | `vegan milk` | 60.0 ml |
| `1 teaspoon baking powder` | `baking powder` | 4.5 g |
| `1/4 teaspoon salt` | `salt` | 1.5 g |
| `3 cups sifted confectioners' sugar (the sugar MUST be sifted)` | `sifted confectioners' sugar` | 612.0 g |
| `1-2 tablespoons vegan milk of choice (adding in more if needed for proper spreading consistency)` | `vegan milk` | 15.0 ml |
| `1 tablespoon light corn syrup` | `light corn syrup` | 15.0 ml |
| `1/2 teaspoon vanilla` | `vanilla` | 1.88 g |
| `food coloring as needed` | `food coloring as needed` | 100.0 g |
| `colored granulated sugar and holiday sprinkles (if desired, for topping)` | `colored granulated sugar and holiday sprinkles` | 100.0 g |
| `1/2 cup vegan butter (softened)` | `vegan butter` | 90.0 g |
| `16 ounces powdered sugar (16-ounce package)` | `powdered sugar` | 100.0 g |
| `3 tablespoons vegan milk of choice` | `vegan milk` | 45.0 ml |
| `1 teaspoon vanilla extract` | `vanilla extract` | 5.0 ml |
| `food coloring as needed` | `food coloring as needed` | 100.0 g |
| `colored granulated sugar and holiday sprinkles (if desired, for topping)` | `colored granulated sugar and holiday sprinkles` | 100.0 g |

---

## Vegan Coconut Cream Pie (Dairy Free, Egg Free)

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 13.5-ounce cans full-fat coconut milk (yields 1 1/2 cups prepared coconut whipped cream)` | `full-fat coconut milk` | 800.0 ml |
| `2/3 cup white sugar (see Notes)` | `white sugar` | 136.0 g |
| `1/3 cup + 2 tablespoons cornstarch` | `+ 2 tablespoons cornstarch` | 48.0 g |
| `2 13.5-ounce cans full-fat coconut milk` | `full-fat coconut milk` | 800.0 ml |
| `1 teaspoon vanilla extract` | `vanilla extract` | 5.0 ml |
| `1 8-inch vegan pie crust (store-bought or homemade, fully baked)` | `8-inch vegan pie crust` | 100.0 g |
| `toasted coconut (optional, for garnish)` | `coconut` | 100.0 g |

---

## Vegan Coffee Cake with Streusel Topping

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3/4 packed cup brown sugar (see Notes)` | `cup brown sugar` | 75.0 g |
| `1/2 cup all-purpose flour` | `all-purpose flour` | 60.0 g |
| `1 tablespoon cinnamon` | `cinnamon` | 7.5 g |
| `6 tablespoons vegan butter` | `vegan butter` | 67.5 g |
| `1 packed cup light brown sugar (see Notes)` | `cup light brown sugar` | 100.0 g |
| `1 cup all-purpose flour` | `all-purpose flour` | 120.0 g |
| `3 cups all-purpose flour` | `all-purpose flour` | 360.0 g |
| `1 1/2 cups granulated sugar (see Notes)` | `granulated sugar` | 306.0 g |
| `3 teaspoons baking powder` | `baking powder` | 13.5 g |
| `1 teaspoon salt` | `salt` | 6.0 g |
| `1/4 cup unsweetened applesauce` | `unsweetened applesauce` | 60.0 ml |
| `2 teaspoons vanilla extract` | `vanilla extract` | 10.0 ml |
| `1/2 cup coconut oil (melted)` | `coconut oil` | 120.0 ml |
| `1 3/4 cup unsweetened non-dairy milk` | `unsweetened non-dairy milk` | 420.0 ml |
| `1 tablespoon apple cider vinegar` | `apple cider vinegar` | 15.0 ml |
| `1/4 cup powdered sugar (see Notes)` | `powdered sugar` | 51.0 g |
| `1 tablespoon unsweetened non-dairy milk` | `unsweetened non-dairy milk` | 15.0 ml |
| `1 teaspoon vanilla` | `vanilla` | 3.75 g |

---

## Vegan Coleslaw

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 cup vegan mayonnaise` | `vegan mayonnaise` | 180.0 g |
| `1/4 cup granulated sugar (or granulated sugar substitute of choice)` | `granulated sugar` | 51.0 g |
| `4 teaspoons white vinegar` | `white vinegar` | 20.0 ml |
| `1/2 teaspoon Dijon mustard` | `dijon mustard` | 1.88 g |
| `1/4 teaspoon kosher salt` | `kosher salt` | 1.5 g |
| `2 14-ounce bags shredded coleslaw mix` | `coleslaw mix` | 600.0 g |

---

## Vegan Cookie Dough

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 cup all-purpose flour` | `all-purpose flour` | 120.0 g |
| `3/4 cup packed brown sugar (light or dark)` | `brown sugar` | 153.0 g |
| `1/2 cup vegan butter (or refined coconut oil)` | `vegan butter` | 90.0 g |
| `1 teaspoon pure vanilla extract` | `vanilla extract` | 5.0 ml |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `2 tablespoons milk of choice (almond milk, coconut milk, etc.)` | `milk (almond milk, coconut milk, etc.)` | 30.0 ml |
| `1 cup vegan mini chocolate chips` | `vegan mini chocolate chips` | 180.0 g |

---

## Vegan Crème Brûlée

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 cans coconut milk` | `coconut milk` | 800.0 ml |
| `4 tablespoons arrowroot powder` | `arrowroot powder` | 30.0 g |
| `2 cups raw cashews` | `cashews` | 264.0 g |
| `3/4 cup vegan granulated sugar (see Notes)` | `vegan granulated sugar` | 153.0 g |
| `2 tablespoons vanilla extract` | `vanilla extract` | 30.0 ml |
| `pinch of turmeric (see Notes)` | `turmeric` | 1.0 g |
| `2 teaspoons vegan granulated sugar (for topping)` | `vegan granulated sugar` | 8.5 g |

---

## Vegan Empanadas

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `neutral oil (optional, for top of empanadas)` | `neutral oil` | 100.0 ml |
| `2 1/2 cups all-purpose flour` | `all-purpose flour` | 300.0 g |
| `1 pinch salt` | `salt` | 1.0 g |
| `1/2 cup cold vegan butter (cut into 1/4-inch cubes)` | `cold vegan butter` | 90.0 g |
| `1/2 cup cold water` | `cold water` | 120.0 ml |
| `1 large russet potato (peeled and cut into 1/4-inch cubes)` | `russet potato` | 100.0 g |
| `1 tablespoon olive oil` | `olive oil` | 15.0 ml |
| `1/2 of one onion (finely chopped)` | `onion` | 50.0 g |
| `1  carrot (grated)` | `carrot` | 100.0 g |
| `1  celery stalk (finely chopped)` | `celery stalk` | 100.0 g |
| `3 cloves garlic (minced)` | `garlic` | 9.0 g |
| `1 15.25-ounce can black beans (drained and rinsed well)` | `black beans` | 400.0 g |
| `1/2 cup frozen peas` | `frozen peas` | 90.0 g |
| `1 teaspoon cumin` | `cumin` | 2.5 g |
| `1 teaspoon paprika` | `paprika` | 2.5 g |
| `1/2 teaspoon onion powder` | `onion powder` | 1.25 g |
| `1/2 teaspoon garlic powder` | `garlic powder` | 1.25 g |
| `salt and black pepper (to taste)` | `salt and black pepper` | 100.0 g |

---

## Easy 10-Minute Vegan Garlic Bread

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4  garlic cloves (minced)` | `garlic cloves` | 400.0 g |
| `1/2 cup vegan butter (softened)` | `vegan butter` | 90.0 g |
| `2 tablespoons fresh parsley (finely chopped)` | `fresh parsley` | 22.5 g |
| `1  baguette (sliced into 1-inch thick pieces)` | `baguette` | 100.0 g |
| `3 tablespoons vegan parmesan cheese (optional)` | `vegan parmesan cheese` | 21.15 g |

---

## Vegan Key Lime Pie

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 1/2 cups vegan graham crackers (crushed, see Notes)` | `vegan graham crackers` | 270.0 g |
| `1/3 cup vegan butter (melted, see Notes)` | `vegan butter` | 60.0 g |
| `1 13.5-ounce can full-fat coconut milk (see Notes)` | `full-fat coconut milk` | 400.0 ml |
| `1 7.4-ounce can sweetened condensed coconut milk` | `sweetened condensed coconut milk` | 400.0 ml |
| `1/2 cup key lime juice` | `key lime juice` | 120.0 ml |
| `1 tablespoon key lime zest` | `key lime zest` | 11.25 g |
| `5 tablespoons cornstarch` | `cornstarch` | 45.0 g |

---

## Vegan Latkes

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 pound russet potatoes (approximately 2 medium potatoes)` | `russet potatoes` | 453.59 g |
| `1 large white onion (approximately 6 ounces; peeled, quartered)` | `white onion` | 100.0 g |
| `1/2 cup unbleached all-purpose flour` | `unbleached all-purpose flour` | 60.0 g |
| `3 tablespoons non-dairy milk of choice (unsweetened, unflavored)` | `non-dairy milk` | 45.0 ml |
| `1 1/2 tablespoons cornstarch` | `cornstarch` | 13.5 g |
| `1 teaspoon kosher salt` | `kosher salt` | 6.0 g |
| `2 teaspoons fresh baking powder` | `fresh baking powder` | 9.0 g |
| `1 teaspoon freshly cracked black pepper (more or less to taste)` | `black pepper` | 3.75 g |
| `avocado oil (or other neutral-flavored oil)` | `avocado oil` | 100.0 ml |
| `vegan sour cream (or plain vegan yogurt)` | `vegan sour cream` | 100.0 ml |
| `chopped fresh dill` | `fresh dill` | 100.0 g |
| `applesauce` | `applesauce` | 100.0 ml |

---

## Vegan Lemon Bars

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 cups all-purpose flour` | `all-purpose flour` | 240.0 g |
| `1/2 cup granulated white sugar` | `granulated white sugar` | 102.0 g |
| `1 teaspoon pure vanilla extract` | `vanilla extract` | 5.0 ml |
| `1/4 teaspoon salt` | `salt` | 1.5 g |
| `1 cup vegan butter (melted but not bubbling)` | `vegan butter` | 180.0 g |
| `1 14-ounce can unsweetened, full-fat coconut cream (at room temperature)` | `unsweetened, full-fat coconut cream` | 400.0 ml |
| `2/3 cup fresh lemon juice (juice from approximately 4 large lemons)` | `fresh lemon juice` | 160.0 ml |
| `1/4 cup lemon zest` | `lemon zest` | 45.0 g |
| `1 teaspoon pure vanilla extract` | `vanilla extract` | 5.0 ml |
| `1 1/2 cups granulated white sugar` | `granulated white sugar` | 306.0 g |
| `1/4 teaspoon salt` | `salt` | 1.5 g |
| `1/3 cup cornstarch` | `cornstarch` | 48.0 g |
| `1/4 teaspoon ground turmeric` | `ground turmeric` | 0.94 g |
| `1/3 cup powdered sugar` | `powdered sugar` | 68.0 g |

---

## Vegan Mushroom Gravy

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/4 cup refined coconut oil (or avocado oil)` | `refined coconut oil` | 60.0 ml |
| `2 teaspoons minced garlic (approximately 2 large cloves, more or less to taste)` | `garlic` | 7.5 g |
| `16 ounces sliced mushrooms (white mushrooms or baby bella mushrooms)` | `mushrooms` | 100.0 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly ground black pepper (to taste)` | `black pepper` | 100.0 g |
| `1/4 cup all-purpose flour` | `all-purpose flour` | 30.0 g |
| `4 cups low-sodium vegetable broth (or vegetable stock, divided)` | `low-sodium vegetable broth` | 960.0 ml |

---

## Vegan Oatmeal Chocolate Chip Cookies

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 cup quick oats` | `quick oats` | 86.4 g |
| `3/4 cup all-purpose flour` | `all-purpose flour` | 90.0 g |
| `1 teaspoon cinnamon` | `cinnamon` | 2.5 g |
| `1/2 teaspoon fresh baking soda` | `fresh baking soda` | 2.25 g |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `1/2 cup vegan butter (at room temperature)` | `vegan butter` | 90.0 g |
| `1/2 packed cup light brown sugar` | `cup light brown sugar` | 50.0 g |
| `1/4 cup granulated white sugar` | `granulated white sugar` | 51.0 g |
| `1 teaspoon pure vanilla extract` | `vanilla extract` | 5.0 ml |
| `1 teaspoon apple cider vinegar` | `apple cider vinegar` | 5.0 ml |
| `1 tablespoon vegan milk of choice` | `vegan milk` | 15.0 ml |
| `1/3 cup vegan chocolate chips` | `vegan chocolate chips` | 60.0 g |

---

## Vegan Oatmeal Cookies

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 1/4 cups all-purpose flour` | `all-purpose flour` | 150.0 g |
| `1 cup Old Fashioned Oats` | `old fashioned oats` | 86.4 g |
| `1 teaspoon baking powder` | `baking powder` | 4.5 g |
| `1 teaspoon baking soda` | `baking soda` | 4.5 g |
| `1/2 teaspoon cinnamon` | `cinnamon` | 1.25 g |
| `1/4 teaspoon nutmeg` | `nutmeg` | 0.69 g |
| `1/4 teaspoon salt` | `salt` | 1.5 g |
| `1/2 cup vegan butter (at room temperature)` | `vegan butter` | 90.0 g |
| `1/2 cup granulated sugar` | `granulated sugar` | 102.0 g |
| `1/2 packed cup  dark brown sugar` | `cup dark brown sugar` | 50.0 g |
| `1/3 cup almond milk (or oat milk)` | `almond milk` | 80.0 ml |
| `1/2 cup raisins` | `raisins` | 90.0 g |

---

## How to Make Vegan Overnight Oats: 4 Ways

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3/4 cup rolled oats` | `rolled oats` | 64.8 g |
| `1 cup minus 1 tbsp unsweetened almond milk` | `minus 1 tbsp unsweetened almond milk` | 240.0 ml |
| `1 tablespoon maple syrup` | `maple syrup` | 15.0 ml |
| `1 teaspoon vanilla extract` | `vanilla extract` | 5.0 ml |
| `pinch of salt` | `salt` | 1.0 g |
| `Top with : Fresh berries and hemp seeds` | `top with : fresh berries and hemp seeds` | 100.0 g |
| `3/4 cup rolled oats` | `rolled oats` | 64.8 g |
| `2 tbsp peanut butter` | `peanut butter` | 16.5 g |
| `1 scant cup unsweetened almond milk` | `scant cup unsweetened almond milk` | 100.0 ml |
| `1 tablespoon maple syrup` | `maple syrup` | 15.0 ml |
| `1 teaspoon vanilla extract` | `vanilla extract` | 5.0 ml |
| `pinch of salt` | `salt` | 1.0 g |
| `Top with : Peanut butter, banana and chia seeds` | `top with : peanut butter, banana and chia seeds` | 100.0 g |
| `3/4 cup rolled oats` | `rolled oats` | 64.8 g |
| `1 1/2 tbsp cocoa powder` | `cocoa powder` | 11.25 g |
| `1 scant cup unsweetened almond milk` | `scant cup unsweetened almond milk` | 100.0 ml |
| `1 1/2 to 2 tablespoons maple syrup` | `to 2 tablespoons maple syrup` | 150.0 ml |
| `teaspoon vanilla extract` | `vanilla extract` | 5.0 ml |
| `pinch of salt` | `salt` | 1.0 g |
| `Top with : Chocolate shavings and frozen raspberries` | `top with : chocolate shavings and frozen raspberries` | 100.0 g |
| `3/4  cup rolled oats` | `rolled oats` | 64.8 g |
| `3 tbsp dried fruit (like raisins, see Note)` | `dried fruit` | 33.75 g |
| `Dash cinnamon if desired` | `cinnamon if desired` | 1.0 g |
| `1 scant cup unsweetened almond milk` | `scant cup unsweetened almond milk` | 100.0 ml |
| `1 tablespoon maple syrup` | `maple syrup` | 15.0 ml |
| `1 teaspoon vanilla extract` | `vanilla extract` | 5.0 ml |
| `pinch of salt` | `salt` | 1.0 g |
| `Top with: Yogurt dollop, brown sugar, raisins and cinnamon` | `top with: yogurt dollop, brown sugar, raisins and cinnamon` | 100.0 g |

---

## Vegan Peach Cobbler

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3 pounds peaches (peeled and sliced)` | `peaches` | 1360.77 g |
| `2/3 cup sugar (see Notes)` | `sugar` | 136.0 g |
| `3 tablespoons cornstarch` | `cornstarch` | 27.0 g |
| `1 tablespoon lemon juice` | `lemon juice` | 15.0 ml |
| `1 teaspoon cinnamon` | `cinnamon` | 2.5 g |
| `1/4 cup vegan butter` | `vegan butter` | 45.0 g |
| `1 1/4 cups all purpose flour (see Notes)` | `all purpose flour` | 150.0 g |
| `3/4 cup sugar` | `sugar` | 153.0 g |
| `1 cup unsweetened almond milk (or any non-dairy milk)` | `unsweetened almond milk` | 240.0 ml |
| `1 teaspoon baking powder` | `baking powder` | 4.5 g |

---

## Vegan Pecan Pie

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `6 tablespoons coconut oil` | `coconut oil` | 90.0 ml |
| `1 1/4 cups coconut sugar` | `coconut sugar` | 255.0 g |
| `2 tablespoons maple syrup` | `maple syrup` | 30.0 ml |
| `2 teaspoons vanilla extract` | `vanilla extract` | 10.0 ml |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `2 cups pecans (halved)` | `pecans` | 360.0 g |
| `2 tablespoons tapioca starch` | `tapioca starch` | 22.5 g |
| `1 1/3 cup all purpose flour` | `all purpose flour` | 160.0 g |
| `1/2 cup shortening` | `shortening` | 90.0 g |
| `1/2 teaspoon salt` | `salt` | 3.0 g |
| `3-6 tablespoons ice water` | `ice water` | 45.0 ml |
| `9 tablespoons water` | `water` | 135.0 ml |
| `3 tablespoons flax meal  (equivalent to 3 large eggs )` | `flax meal` | 33.75 g |

---

## Vegan Pineapple Upside Down Cake

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/4 cup vegan butter (melted)` | `vegan butter` | 45.0 g |
| `1/2 cup brown sugar` | `brown sugar` | 102.0 g |
| `6-8 slices canned pineapple (patted dry; juice reserved)` | `canned pineapple` | 120.0 g |
| `15-20  maraschino cherries` | `maraschino cherries` | 1500.0 g |
| `2 cups all-purpose flour` | `all-purpose flour` | 240.0 g |
| `1 1/2 teaspoons baking powder` | `baking powder` | 6.75 g |
| `1/4 teaspoon salt` | `salt` | 1.5 g |
| `1/2 cup vegan butter (melted)` | `vegan butter` | 90.0 g |
| `1/2 cup  non-dairy milk (almond, cashew, or coconut; unsweetened)` | `non-dairy milk` | 120.0 ml |
| `1/2 cup pineapple juice (from can of pineapple slices)` | `pineapple juice` | 120.0 ml |
| `1/2 cup white sugar (see Notes)` | `white sugar` | 102.0 g |
| `1/2 cup brown sugar` | `brown sugar` | 102.0 g |
| `vegan whipped cream` | `vegan whipped cream` | 100.0 ml |
| `additional maraschino cherries` | `additional maraschino cherries` | 100.0 g |

---

## Vegan Potato Soup

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 tablespoons vegan butter` | `vegan butter` | 22.5 g |
| `1 cup finely chopped white onion (approximately 1 medium onion)` | `white onion` | 180.0 g |
| `1 cup diced celery (approximately 2 medium ribs celery)` | `celery` | 180.0 g |
| `2 cups chopped carrots (approximately 2 large carrots)` | `carrots` | 360.0 g |
| `1 tablespoon minced fresh garlic (approximately 4 cloves garlic)` | `fresh garlic` | 11.25 g |
| `1 1/2 pounds Yukon gold potatoes (washed, dried, cut into bite-sized pieces)` | `yukon gold potatoes` | 680.38 g |
| `2 cups low-sodium vegetable broth` | `low-sodium vegetable broth` | 480.0 ml |
| `2 cups unsweetened non-dairy milk (at room temperature, see Notes)` | `unsweetened non-dairy milk` | 480.0 ml |
| `1  fresh bay leaf` | `fresh bay leaf` | 100.0 g |
| `1/2 teaspoon salt (plus more to taste)` | `salt` | 3.0 g |
| `freshly ground black pepper` | `black pepper` | 100.0 g |
| `chopped fresh chives` | `fresh chives` | 100.0 g |
| `vegan bacon crumbles` | `vegan bacon crumbles` | 100.0 g |
| `crusty bread` | `crusty bread` | 100.0 g |

---

## Vegan Pound Cake

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/2 cup vegan butter (softened to room temperature)` | `vegan butter` | 90.0 g |
| `1 Tablespoon apple cider vinegar` | `apple cider vinegar` | 15.0 ml |
| `scant 1 cup plant milk` | `scant 1 cup plant milk` | 100.0 ml |
| `1 1/2 cups granulated sugar` | `granulated sugar` | 306.0 g |
| `2 Teaspoons pure vanilla extract` | `vanilla extract` | 10.0 ml |
| `1/2 cup vegan cream cheese` | `vegan cream cheese` | 120.0 ml |
| `2 cups cake flour` | `cake flour` | 240.0 g |
| `1 1/2 Teaspoons baking powder` | `baking powder` | 6.75 g |
| `1/2 Teaspoon baking soda` | `baking soda` | 2.25 g |
| `1/4 Teaspoon salt` | `salt` | 1.5 g |

---

## Vegan Shrimp

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `8 ounces king oyster mushroom stalks` | `king oyster mushroom stalks` | 100.0 g |
| `1/2 cup almond milk (see Notes)` | `almond milk` | 120.0 ml |
| `1/2 cup all purpose flour` | `all purpose flour` | 60.0 g |
| `1 cup Panko breadcrumbs` | `panko breadcrumbs` | 108.0 g |
| `2 teaspoon Old Bay seasoning` | `old bay seasoning` | 7.5 g |
| `1/4 cup vegan mayonnaise` | `vegan mayonnaise` | 45.0 g |
| `1/2 - 1 tablespoon Sriracha` | `sriracha` | 5.62 g |
| `1/2 teaspoon lemon juice` | `lemon juice` | 2.5 ml |
| `1 clove garlic (minced)` | `garlic` | 3.0 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `vegetable oil (for frying)` | `vegetable oil` | 100.0 ml |

---

## Vegan Strawberry Shortcake

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4 cups sliced fresh strawberries` | `fresh strawberries` | 720.0 g |
| `1/4 cup granulated sugar` | `granulated sugar` | 51.0 g |
| `2 1/3 cups Bisquick(TM) Original Pancake &amp; Baking Mix` | `bisquick original pancake &amp; baking mix` | 420.0 g |
| `2/3 cup unsweetened vegan milk of choice (oat milk, almond milk, soy milk, etc.)` | `unsweetened vegan milk (oat milk, almond milk, soy milk, etc.)` | 160.0 ml |
| `3 tablespoons granulated sugar` | `granulated sugar` | 38.25 g |
| `3 tablespoons vegan butter (melted)` | `vegan butter` | 33.75 g |
| `3/4 cup vegan heavy whipping cream (very cold, see Notes)` | `vegan heavy whipping cream` | 180.0 ml |
| `1 tablespoon powdered sugar` | `powdered sugar` | 12.75 g |
| `fresh mint leaves` | `fresh mint leaves` | 100.0 g |

---

## Vegan Tartar Sauce

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1/2 cup vegan mayo` | `vegan mayo` | 90.0 g |
| `1/2 cup dill pickles (finely chopped)` | `dill pickles` | 90.0 g |
| `1 tablespoon fresh parsley (chopped)` | `fresh parsley` | 11.25 g |
| `1/2 teaspoon sugar (see Notes)` | `sugar` | 2.12 g |
| `1 teaspoon lemon juice` | `lemon juice` | 5.0 ml |
| `1 teaspoon dijon mustard` | `dijon mustard` | 3.75 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `pepper (to taste)` | `pepper` | 100.0 g |

---

## Vegan Vodka Sauce

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `2 tbsp vegan butter` | `vegan butter` | 22.5 g |
| `1  small yellow onion (finely chopped)` | `yellow onion` | 50.0 g |
| `3  garlic cloves (pressed or minced)` | `garlic cloves` | 300.0 g |
| `2/3 cup tomato paste` | `tomato paste` | 120.0 g |
| `3 tbsp vodka` | `vodka` | 33.75 g |
| `1 cup vegan heavy whipping cream (plus 1/2 cup more to taste)` | `vegan heavy whipping cream` | 240.0 ml |
| `1/2 cup vegan parmesan cheese (optional)` | `vegan parmesan cheese` | 56.4 g |
| `plenty of salt and pepper (to taste)` | `plenty of salt and pepper` | 100.0 g |

---

## Vegetarian Stuffed Mushrooms

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `16  button mushrooms` | `button mushrooms` | 1600.0 g |
| `1/2 cup butter` | `butter` | 90.0 g |
| `1  onion (chopped)` | `onion` | 100.0 g |
| `2 cloves garlic (minced)` | `garlic` | 6.0 g |
| `6 tablespoons bread crumbs` | `bread crumbs` | 67.5 g |
| `1/3 cup Parmesan cheese` | `parmesan cheese` | 37.6 g |
| `salt` | `salt` | 100.0 g |
| `pepper` | `pepper` | 100.0 g |

---

## Walking Taco Casserole

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 tablespoon neutral oil (avocado oil, olive oil, etc)` | `neutral oil (avocado oil, olive oil, etc)` | 15.0 ml |
| `1 pound lean ground beef` | `ground beef` | 453.59 g |
| `1 large yellow onion (chopped, approximately 2 cups)` | `yellow onion` | 100.0 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `1  1-ounce packet taco seasoning` | `taco seasoning` | 30.0 g |
| `1  15-ounce can black beans (drained, rinsed)` | `black beans` | 400.0 g |
| `1 15-ounce can corn kernels (drained, rinsed)` | `corn kernels` | 400.0 g |
| `1 4-ounce can diced green chiles` | `green chiles` | 400.0 g |
| `1 cup sour cream (at room temperature)` | `sour cream` | 240.0 ml |
| `3 cups Fritos original corn chips` | `fritos original corn chips` | 540.0 g |
| `3 cups shredded Mexican cheese` | `mexican cheese` | 338.4 g |
| `sour cream` | `sour cream` | 100.0 ml |
| `avocado slices` | `avocado slices` | 100.0 g |
| `chopped cilantro` | `cilantro` | 100.0 g |
| `diced tomatoes (or pico de gallo)` | `tomatoes` | 100.0 g |
| `salsa` | `salsa` | 100.0 g |
| `queso` | `queso` | 100.0 g |

---

## Whipped Potatoes

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3 pounds Yukon gold potatoes (or russet potatoes; washed, peeled, cubed)` | `yukon gold potatoes` | 1360.77 g |
| `cold water (enough to cover potatoes)` | `cold water` | 100.0 ml |
| `1 large pinch salt (plus more to taste)` | `pinch salt` | 100.0 g |
| `1 cup milk of choice (at or near room temperature)` | `milk` | 240.0 ml |
| `1/2 cup cream cheese (at room temperature, cut into small pieces)` | `cream cheese` | 120.0 ml |
| `1/4 cup butter (at room temperature, cut into small pieces)` | `butter` | 45.0 g |
| `freshly cracked black pepper (to taste)` | `black pepper` | 100.0 g |

---

## Whipped Sweet Potatoes

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `4 large sweet potatoes (approximately 3 pounds)` | `sweet potatoes` | 400.0 g |
| `1/4 teaspoon cinnamon` | `cinnamon` | 0.62 g |
| `1/2 teaspoon salt (more or less to taste)` | `salt` | 3.0 g |
| `1/4 teaspoon freshly ground black pepper (more or less to taste)` | `black pepper` | 0.94 g |
| `2 tablespoons orange juice` | `orange juice` | 30.0 ml |
| `1 packed tablespoon brown sugar (see Notes)` | `tablespoon brown sugar` | 100.0 g |
| `2 tablespoons butter (plus more if desired)` | `butter` | 22.5 g |
| `1/3 cup heavy cream` | `heavy cream` | 80.0 ml |
| `chopped fresh parsley (for garnish)` | `fresh parsley` | 100.0 g |

---

## White Bean Salad

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `1 14-ounce can cooked white beans` | `white beans` | 400.0 g |
| `1 medium tomato (approximately 6 ounces)` | `tomato` | 80.0 g |
| `1 small white onion (or red onion, approximately 4 ounces)` | `white onion` | 50.0 g |
| `1/4 cup fresh parsley` | `fresh parsley` | 45.0 g |
| `salt (to taste)` | `salt` | 100.0 g |
| `freshly cracked black pepper (to taste)` | `black pepper` | 100.0 g |
| `1 tablespoon olive oil` | `olive oil` | 15.0 ml |
| `2 tablespoons fresh lemon juice` | `fresh lemon juice` | 30.0 ml |
| `1 tablespoon red wine vinegar` | `red wine vinegar` | 15.0 ml |
| `1/4 teaspoon dijon mustard` | `dijon mustard` | 0.94 g |

---

## Crispy Baked Whole Chicken Wings

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3 pounds whole bone-in, skin-on chicken wings (approximately 12-15 whole wings)` | `chicken wings` | 1360.77 g |
| `2 tablespoons avocado oil (or olive oil)` | `avocado oil` | 30.0 ml |
| `1 1/2 teaspoons smoked paprika` | `smoked paprika` | 3.75 g |
| `1 teaspoon salt (more or less to taste)` | `salt` | 6.0 g |
| `1 teaspoon garlic powder` | `garlic powder` | 2.5 g |
| `1 teaspoon onion powder` | `onion powder` | 2.5 g |
| `1/2 teaspoon freshly cracked black pepper (more or less to taste)` | `black pepper` | 1.88 g |
| `ranch dressing (or blue cheese dressing)` | `ranch dressing` | 100.0 g |
| `buffalo sauce (or BBQ sauce)` | `buffalo sauce` | 100.0 ml |

---

## Zucchini Salad

| Original CSV line | Parsed name | Amount |
| --- | --- | --- |
| `3 medium zucchini (each approximately 8 inches long and 5 ounces)` | `zucchini` | 240.0 g |
| `2 tablespoons lemon zest (zest from approximately 1 large lemon)` | `lemon zest` | 22.5 g |
| `2 tablespoons lemon juice (juice from approximately 1 large lemon)` | `lemon juice` | 30.0 ml |
| `1 teaspoon kosher salt` | `kosher salt` | 6.0 g |
| `1/2 teaspoon freshly ground pepper (black or white)` | `pepper` | 1.88 g |
| `1/4 cup pine nuts` | `pine nuts` | 33.0 g |
| `1 cup crumbled feta cheese` | `feta cheese` | 112.8 g |

---

## Conversion Reference

### Volume → ml (liquids) or g (dry via density)
| Unit | ml/unit |
| --- | --- |
| teaspoon/tsp | 5 |
| tablespoon/tbsp | 15 |
| cup | 240 |
| fl oz | 30 |
| pint | 480 |
| quart | 960 |

### Dry densities (g/ml)
| Ingredient | g/ml |
| --- | --- |
| oats | 0.36 |
| flour | 0.5 |
| sugar | 0.85 |
| brown sugar | 0.93 |
| salt | 1.2 |
| rice | 0.85 |
| chia/seeds | 0.65 |
| nuts/almonds | 0.55 |
| cheese | 0.47 |
| breadcrumbs/panko | 0.45 |
| spices/powder | 0.5 |
| other dry | 0.75 |

### Weight → g
| Unit | g/unit |
| --- | --- |
| ounce/oz | 28.35 |
| pound/lb | 453.59 |
| gram | 1 |
| kilogram | 1000 |

### Count → g
| Unit | g/unit |
| --- | --- |
| clove | 3 |
| egg | 50 |
| can/jar | 400 |
| bag/box/package | 300 |
| loaf | 450 |
| pinch/dash | 1 |
| slice | 20 |
| piece/whole | 100 |
| stalk | 40 |
| head | 150 |
| stick | 113 |