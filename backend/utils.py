import json
import re
from datetime import date, datetime, timedelta
from typing import Any


def get_current_week_start(today: date | None = None) -> str:
    current = today or date.today()
    monday = current - timedelta(days=current.weekday())
    return monday.isoformat()


def parse_json(value: Any, default: Any = None) -> Any:
    if value is None:
        return default
    if isinstance(value, (dict, list)):
        return value
    if isinstance(value, (bytes, bytearray)):
        value = value.decode("utf-8")
    if isinstance(value, str):
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return default
    return default


def parse_float(value: Any, default: float = 0.0) -> float:
    if value is None:
        return default
    if isinstance(value, (int, float)):
        return float(value)
    text = str(value).strip()
    if not text:
        return default
    cleaned = re.sub(r"[^0-9.\-]", "", text)
    if not cleaned or cleaned == "-":
        return default
    try:
        return float(cleaned)
    except ValueError:
        return default


def _parse_ingredient_line(line: str) -> tuple[str, float]:
    """Parse a single ingredient line into (normalised_name, amount_in_grams_or_ml).

    Pipeline:
      1. Strip parentheticals  – "(melted)", "(to taste)", "(approximately 6)", etc.
      2. Extract quantity + unit + name via regex
      3. Convert unit to grams or ml
      4. Return (name, amount)
    """
    # ── Unit conversion tables ──────────────────────────────────────────────
    _VOL_TO_ML: dict[str, float] = {
        "teaspoon": 5.0, "teaspoons": 5.0, "tsp": 5.0,
        "tablespoon": 15.0, "tablespoons": 15.0, "tbsp": 15.0,
        "cup": 240.0, "cups": 240.0,
        "fluid ounce": 30.0, "fluid ounces": 30.0, "fl oz": 30.0,
        "pint": 480.0, "pints": 480.0,
        "quart": 960.0, "quarts": 960.0,
        "liter": 1000.0, "liters": 1000.0, "litre": 1000.0, "litres": 1000.0,
        "ml": 1.0, "milliliter": 1.0, "milliliters": 1.0,
    }
    _WEIGHT_TO_G: dict[str, float] = {
        "ounce": 28.35, "ounces": 28.35, "oz": 28.35,
        "pound": 453.59, "pounds": 453.59, "lb": 453.59, "lbs": 453.59,
        "gram": 1.0, "grams": 1.0, "g": 1.0,
        "kilogram": 1000.0, "kilograms": 1000.0, "kg": 1.0,
    }
    _COUNT_TO_G: dict[str, float] = {
        "clove": 3.0, "cloves": 3.0,
        "egg": 50.0, "eggs": 50.0,
        "can": 400.0, "cans": 400.0,
        "jar": 400.0, "jars": 400.0,
        "bag": 300.0, "bags": 300.0,
        "box": 300.0, "boxes": 300.0,
        "bottle": 350.0, "bottles": 350.0,
        "loaf": 450.0, "loaves": 450.0,
        "package": 300.0, "packages": 300.0,
        "packet": 30.0, "packets": 30.0,
        "pinch": 1.0, "pinches": 1.0,
        "dash": 1.0, "dashes": 1.0,
        "slice": 20.0, "slices": 20.0,
        "piece": 100.0, "pieces": 100.0,
        "stalk": 40.0, "stalks": 40.0,
        "head": 150.0, "heads": 150.0,
        "sprig": 3.0, "sprigs": 3.0,
        "strip": 15.0, "strips": 15.0,
        "sheet": 5.0, "sheets": 5.0,
        "stick": 113.0, "sticks": 113.0,  # butter stick
        "large": 100.0, "medium": 80.0, "small": 50.0,
        "whole": 100.0,
    }

    text = line.lower().strip()
    text = text.lstrip("•-* \u2022").strip()

    # ── Stage 1: handle parentheticals ──────────────────────────────────────
    # Unwrap ONLY simple inline size descriptors: "(14-ounce)", "(10.5 oz)"
    # so "1 (14-ounce) can" → "1 14-ounce can" for unit extraction later.
    text = re.sub(r"\(([\d.]+[-\s]?(?:ounce|oz)s?)\)", r"\1", text)

    # Keep parentheticals that are pure alternative-ingredient lists
    # e.g. "(avocado oil, olive oil, etc.)" — keep
    # e.g. "(finely crushed, or panko breadcrumbs)" — strip (has prep word)
    # e.g. "(seeds removed, approximately half of one cucumber)" — strip (has prep/qty words)
    _PAREN_PREP = re.compile(
        r"\b(?:"
        # quantity / measurement hints
        r"approximately|approx|half|quarter|divided|more|needed|desired|preferred"
        # prep methods
        r"|removed|seeds|stems|rinsed|drained|washed|crushed|ground|chopped|minced"
        r"|halved|peeled|deveined|cleaned|sifted|grated|melted|softened|cut|cored"
        r"|shelled|separated|defrosted|thawed|shredded|crumbled|mashed|trimmed"
        r"|cubed|baked|cooled|uncooked|patted|wiped|discarded"
        # state / condition words
        r"|temperature|taste|room|boneless|skinless"
        r"|unsalted|unbuttered|unflavored|unsweetened|untoasted|unseasoned"
        # usage / serving notes
        r"|optional|serving|garnish|see|notes|any|if"
        r")\b"
    )
    def _filter_paren(m: re.Match) -> str:
        content = m.group(1)
        has_digits = bool(re.search(r"\d", content))
        has_prep = bool(_PAREN_PREP.search(content))
        has_etc = "etc" in content.lower()
        has_comma = "," in content
        is_alt_list = not has_digits and not has_prep and (has_etc or has_comma)
        return f"({content})" if is_alt_list else ""
    # Run twice to handle nested parens like "(or slices, drained (1 jar))"
    text = re.sub(r"\(([^)]*)\)", _filter_paren, text)
    text = re.sub(r"\(([^)]*)\)", _filter_paren, text)
    # Strip only orphaned ")" that have no matching "(" — preserves kept alt-list parens
    def _strip_orphaned_parens(s: str) -> str:
        result, depth = [], 0
        for c in s:
            if c == "(":
                depth += 1
                result.append(c)
            elif c == ")":
                if depth > 0:
                    depth -= 1
                    result.append(c)
                # else: orphaned — skip
            else:
                result.append(c)
        return "".join(result)
    text = _strip_orphaned_parens(text)

    # Strip inline size descriptors like "10.5-ounce" before a unit word
    text = re.sub(r"\b[\d.]+[-\s](?:ounce|oz)s?\b\s*", "", text)

    # Strip leading "approx"/"approximately" so the number is extracted as quantity
    text = re.sub(r"^(?:approximately|approx\.?)\s+", "", text)

    text = re.sub(r"\s{2,}", " ", text).strip()
    text = text.strip(" ,;")

    if not text:
        return ("", 0.0)

    # ── Stage 2: extract leading quantity ───────────────────────────────────
    quantity = 1.0

    # Handle word quantities: "half", "quarter"
    word_qty_match = re.match(r"^(half|quarter)\s+(?:of\s+)?(?:a\s+)?(?:an?\s+)?", text)
    if word_qty_match:
        quantity = 0.5 if word_qty_match.group(1) == "half" else 0.25
        text = text[word_qty_match.end():]

    # Matches: "1", "1/2", "1 1/2", "2.5"
    # Mixed-number pattern only applies to fractions (1 1/2), not decimals (1 10.5).
    qty_pattern = r"^((?:\d+\s+)?\d+/\d+|\d+\.?\d*)\b(?!-[a-z])\s*"
    qty_match = re.match(qty_pattern, text)
    if not word_qty_match and qty_match:
        raw_qty = qty_match.group(1).strip()
        try:
            if "/" in raw_qty:
                if " " in raw_qty:
                    whole, frac = raw_qty.split(" ", 1)
                    num, den = frac.split("/")
                    quantity = float(whole) + float(num) / float(den)
                else:
                    num, den = raw_qty.split("/")
                    quantity = float(num) / float(den)
            else:
                quantity = float(raw_qty)
            text = text[qty_match.end():]
        except ValueError:
            quantity = 1.0

    # Strip range upper bound: "1-2" → qty=1, strip "-2"
    text = re.sub(r"^[-–]\s*\d+\s*", "", text)

    text = text.strip()

    # ── Stage 3: match unit ─────────────────────────────────────────────────
    all_units = (
        list(_VOL_TO_ML.keys()) +
        list(_WEIGHT_TO_G.keys()) +
        list(_COUNT_TO_G.keys())
    )
    # Sort longest first so "tablespoon" matches before "table"
    all_units_sorted = sorted(all_units, key=len, reverse=True)

    matched_unit = None
    for unit in all_units_sorted:
        if re.match(r"^" + re.escape(unit) + r"\b", text):
            matched_unit = unit
            text = text[len(unit):].strip()
            break

    # ── Stage 4: clean up name ───────────────────────────────────────────────
    # Strip leading "of" / "of one" / "one"
    text = re.sub(r"^of\s+one\s+", "", text).strip()
    text = re.sub(r"^of\s+", "", text).strip()
    text = re.sub(r"^one\s+", "", text).strip()

    # Strip "packed" (e.g. "packed brown sugar" → "brown sugar")
    text = re.sub(r"\bpacked\b\s*", "", text)

    # Strip bone/skin prep descriptors anywhere — always describe prep, not the item
    # e.g. "bone-in, skin-on chicken drumsticks" → "chicken drumsticks"
    # e.g. "boneless, skinless chicken thighs"   → "chicken thighs"
    text = re.sub(r"\b(?:boneless|bone-in|skinless|skin-on)\b[,\s]*", "", text)

    # Normalize "-tasting" suffix (e.g. "neutral-tasting oil" → "neutral oil")
    text = re.sub(r"-tasting\b", "", text)

    # Strip adverb + prep-verb combos — e.g. "freshly ground black pepper" → "black pepper"
    # but "fresh chopped parsley" → "fresh parsley" (adverb here is actually adj "fresh", handled below)
    text = re.sub(
        r"\b(?:freshly|finely|coarsely|thinly|roughly|lightly)\s+"
        r"(?:ground|chopped|minced|sliced|grated|shredded|cracked|diced)\b\s*",
        "", text,
    )

    # Strip standalone prep/method words (NOT "ground" — preserves "ground beef";
    # NOT "crushed" — preserves "crushed tomatoes"; NOT "roasted" — preserves "roasted peppers")
    text = re.sub(
        r"\b(?:chopped|minced|diced|sliced|grated|shredded|cracked|"
        r"melted|softened|peeled|cubed|crumbled|toasted|ripe|trimmed|halved)\b\s*",
        "", text,
    )

    # Strip "of choice" / "of your choice"
    text = re.sub(r"\bof\s+(?:your\s+)?choice\b\s*", "", text)

    # Strip leftover quantity/size phrases in the name
    # e.g. "approximately 4-6 ounces each", "about 1 pound total"
    text = re.sub(
        r"\b(?:approximately|approx\.?|about)\s+[\d/.\-–]+\s*"
        r"(?:to\s+[\d]+\s*)?(?:ounce|oz|pound|lb|gram|g)s?\s*(?:each|total|apiece)?\b",
        "", text,
    )

    # Strip leading descriptor words — KEEP "fresh", "dried", "frozen", "canned"
    # Also handle trailing comma e.g. "cooked, shredded chicken" → "chicken"
    text = re.sub(r"^(?:raw|cooked|lean|extra|pure|plain|whole)[,\s]+", "", text)

    # Strip empty or near-empty parens left after prep-word removal
    # e.g. "()" "(, )" "(boneless)" after stripping content words
    text = re.sub(r"\(\s*[,;\s]*\)", "", text)

    text = re.sub(r"\s{2,}", " ", text).strip(" ,;")

    # if unit was the ingredient itself (e.g. "1 egg", "2 slices"), use unit as name
    name = text if text else (matched_unit if matched_unit else "unknown")


    # ── Stage 5: convert to amount ──────────────────────────────────────────
    # For volume units, only keep ml for liquids; convert dry goods to grams
    # using known densities (g per ml).
    _LIQUID_KEYWORDS = {
        "oil", "milk", "water", "broth", "stock", "juice", "sauce", "vinegar",
        "cream", "wine", "beer", "syrup", "honey", "molasses", "extract",
        "buttermilk", "coconut milk", "almond milk", "oat milk", "soy milk",
        "half and half", "whipping cream", "heavy cream", "condensed",
    }
    # Density table for common dry/semi-solid ingredients (g per ml)
    _DRY_DENSITY: dict[str, float] = {
        "oat": 0.36, "oats": 0.36,
        "flour": 0.5, "almond flour": 0.48,
        "sugar": 0.85, "brown sugar": 0.93, "powdered sugar": 0.56,
        "salt": 1.2,
        "cornstarch": 0.6, "corn starch": 0.6, "baking soda": 0.9, "baking powder": 0.9,
        "cocoa": 0.5, "coffee": 0.5,
        "rice": 0.85, "quinoa": 0.72, "couscous": 0.6,
        "breadcrumb": 0.45, "panko": 0.45,
        "chia": 0.72, "seed": 0.65, "seeds": 0.65,
        "nut": 0.55, "nuts": 0.55, "almond": 0.55, "walnut": 0.5, "cashew": 0.55,
        "cheese": 0.47, "parmesan": 0.38,
        "spice": 0.5, "powder": 0.5, "cumin": 0.5, "paprika": 0.5, "cinnamon": 0.5,
    }

    def _is_liquid(ingredient_name: str) -> bool:
        n = ingredient_name.lower()
        return any(kw in n for kw in _LIQUID_KEYWORDS)

    def _dry_density(ingredient_name: str) -> float:
        n = ingredient_name.lower()
        for key, density in _DRY_DENSITY.items():
            if key in n:
                return density
        return 0.75  # generic dry goods fallback (g/ml)

    if matched_unit in _VOL_TO_ML:
        ml = quantity * _VOL_TO_ML[matched_unit]
        if _is_liquid(name):
            amount = ml  # keep as ml
        else:
            amount = round(ml * _dry_density(name), 2)  # convert to grams
    elif matched_unit in _WEIGHT_TO_G:
        amount = quantity * _WEIGHT_TO_G[matched_unit]
    elif matched_unit in _COUNT_TO_G:
        amount = quantity * _COUNT_TO_G[matched_unit]
    else:
        amount = quantity * 100.0  # fallback: treat as grams

    return (name, round(amount, 2))


def parse_ingredients_map(value: Any) -> dict[str, float]:
    parsed = parse_json(value, None)
    if isinstance(parsed, dict):
        return {str(k): float(parse_float(v, 0.0)) for k, v in parsed.items()}

    text = str(value or "").strip()
    if not text:
        return {}

    items: dict[str, float] = {}
    for raw_line in text.replace("\r", "\n").split("\n"):
        raw_line = raw_line.strip()
        if not raw_line:
            continue
        name, amount = _parse_ingredient_line(raw_line)
        if not name:
            continue
        items[name] = items.get(name, 0.0) + amount
    return items


def parse_servings_yield(value: Any) -> int:
    """Extract the integer serving count from the ``servings`` column.

    Handles values like ``'12 cookies'``, ``'4 frozen waffles'``, ``'6'``, ``'8 servings'``.
    Returns 1 if the value is None, empty, or contains no digits.
    """
    text = str(value or "").strip()
    if not text:
        return 1
    m = re.search(r"(\d+)", text)
    if m:
        return max(1, int(m.group(1)))
    return 1


def iso_now() -> str:
    return datetime.utcnow().isoformat() + "Z"
