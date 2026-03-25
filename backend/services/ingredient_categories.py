"""Classify ingredient names into shopping-list categories.

Categories match the frontend ShoppingScreen: proteins, grains, vegetables,
fruits, dairy, pantry, other.
"""

from __future__ import annotations

# Order matters: first match wins.  Each tuple is (category, keywords).
# Keywords are checked against the lowercased ingredient name.
# More specific compound terms come before broad single-word matches.
_RULES: list[tuple[str, list[str]]] = [
    # ── overrides for compound terms that would otherwise be miscategorised ──
    ("vegetables", ["butternut squash"]),
    # ── pantry (checked first so compound terms like "coconut oil", "apple
    #    cider vinegar", "peanut butter" don't fall into fruits/dairy) ──
    ("pantry", [
        # oils & vinegars
        "olive oil", "sesame oil", "coconut oil", "avocado oil", "canola oil",
        "vegetable oil", "cooking oil", "oil", "vinegar",
        # nut butters (before dairy "butter")
        "peanut butter", "almond butter", "tahini", "creamy peanut butter",
        # sauces & condiments
        "soy sauce", "fish sauce", "worcestershire", "hot sauce", "sriracha",
        "ketchup", "mustard", "mayo", "mayonnaise", "hoisin", "tamari",
        "coconut aminos", "miso", "buffalo sauce", "chimichurri",
        "chili garlic sauce", "chili paste", "adobo sauce",
        "tomato paste", "tomato sauce", "marinara", "salsa",
        # sweeteners
        "honey", "maple syrup", "molasses", "agave",
        "sugar", "sweetener", "erythritol", "stevia", "swerve",
        # spices & seasonings (before vegetables catches "pepper", "ginger", etc.)
        "black pepper", "white pepper", "cracked pepper", "freshly pepper",
        "ground pepper", "and pepper", "& pepper",
        "salt", "cumin", "paprika", "turmeric", "cinnamon",
        "nutmeg", "coriander", "cardamom", "allspice",
        "cayenne", "chili powder", "curry", "garam masala",
        "red pepper flake", "crushed red pepper",
        "garlic powder", "garlic salt", "onion powder",
        "seasoning", "spice", "herb",
        "dried basil", "dried thyme", "dried oregano", "dried parsley",
        "dried dill", "dried sage", "dried rosemary",
        "bay leaf", "bay leaves",
        # baking
        "baking powder", "baking soda", "yeast", "gelatin",
        "vanilla", "cocoa", "chocolate", "extract",
        "arrowroot", "confectioners",
        # broths & stocks
        "broth", "stock", "bouillon",
        # nuts & seeds
        "almond", "walnut", "pecan", "cashew", "pistachio",
        "hazelnut", "pine nut", "peanut", "macadamia",
        "sesame", "flax", "chia seed", "sunflower seed",
        "collagen",
        # preserved / canned
        "jam", "jelly", "preserves", "capers", "pickle", "relish",
        # alcohol
        "wine", "beer", "sherry", "brandy", "rum", "vodka", "liqueur",
        "amaretto", "bourbon",
        # misc pantry
        "spray", "cooking spray", "shortening", "lard",
        "cornflake", "water",
        "clove", "cloves",
    ]),
    # ── grains (before proteins so "flour", "bread" don't get caught) ──
    ("grains", [
        "rice", "pasta", "noodle", "spaghetti", "penne", "macaroni",
        "fettuccine", "linguine", "orzo", "couscous", "quinoa",
        "bread", "baguette", "ciabatta", "tortilla", "pita", "naan",
        "wrap", "roll", "bun", "croissant", "crouton", "crostini",
        "flour", "cornmeal", "cornstarch", "corn starch", "oat", "oats",
        "cereal", "granola", "panko", "breadcrumb",
        "barley", "bulgur", "farro", "millet", "amaranth", "polenta",
        "cracker", "biscuit", "waffle", "pancake",
        "dumpling",
    ]),
    # ── proteins ──
    ("proteins", [
        "chicken", "turkey", "beef", "pork", "lamb", "duck", "bison", "veal",
        "venison", "bacon", "sausage", "ham", "prosciutto", "pepperoni",
        "salami", "chorizo", "andouille", "bratwurst", "brats", "meatball",
        "steak", "ribs", "roast", "tenderloin", "sirloin", "flank",
        "ground meat", "ground beef", "ground pork", "ground turkey",
        "salmon", "tuna", "shrimp", "prawn", "crab", "lobster", "scallop",
        "cod", "tilapia", "halibut", "mahi", "swordfish", "catfish", "trout",
        "anchov", "sardine", "clam", "mussel", "oyster", "calamari", "squid",
        "fish", "seafood",
        "tofu", "tempeh", "seitan", "edamame",
        "egg",
        "lentil", "chickpea", "black bean", "kidney bean", "pinto bean",
        "cannellini", "navy bean", "great northern bean", "white bean",
        "protein",
    ]),
    # ── dairy (after pantry so "peanut butter" is already handled) ──
    ("dairy", [
        "milk", "cream", "cheese", "yogurt", "yoghurt", "ghee",
        "butter",  # plain butter — compound "peanut butter" already matched pantry
        "crème", "creme fraiche", "mascarpone", "ricotta",
        "mozzarella", "parmesan", "cheddar", "provolone", "gouda", "brie",
        "feta", "colby", "monterey",
        "half and half", "half-and-half", "whey", "buttermilk",
    ]),
    # ── vegetables (before fruits so "tomato", "pepper" land here) ──
    ("vegetables", [
        "carrot", "celery", "onion", "garlic", "ginger",
        "potato", "sweet potato", "yam",
        "tomato", "pepper", "bell pepper", "jalapeño", "jalapeno",
        "habanero", "chile", "poblano", "serrano",
        "broccoli", "broccolini", "cauliflower", "cabbage", "kale", "spinach",
        "lettuce", "arugula", "chard", "collard", "bok choy", "escarole",
        "zucchini", "squash", "eggplant", "cucumber", "pumpkin",
        "asparagus", "artichoke", "green bean", "snap pea", "snow pea",
        "pea", "peas", "corn", "mushroom", "olive", "beet",
        "radish", "turnip", "parsnip", "rutabaga", "leek", "shallot",
        "scallion", "green onion", "chive", "sprout",
        "bamboo shoot", "water chestnut", "jicama", "fennel",
        "cilantro", "parsley", "basil", "mint", "dill", "thyme",
        "rosemary", "oregano", "sage", "tarragon",
    ]),
    # ── fruits ──
    ("fruits", [
        "apple", "banana", "orange", "lemon", "lime", "grapefruit",
        "berry", "berries", "strawberr", "blueberr", "raspberr", "blackberr",
        "cranberr", "cherry", "cherries", "grape", "peach", "pear", "plum",
        "apricot", "mango", "papaya", "pineapple", "kiwi", "melon",
        "watermelon", "cantaloupe", "honeydew", "fig", "date", "dates",
        "pomegranate", "passion fruit", "guava", "lychee",
        "coconut",  # whole coconut / coconut cream — oils/flour already matched
        "raisin", "currant", "avocado",
    ]),
]


def categorise_ingredient(name: str) -> str:
    """Return the shopping-list category for *name*."""
    low = name.lower().strip()
    for category, keywords in _RULES:
        for kw in keywords:
            if kw in low:
                return category
    return "other"
