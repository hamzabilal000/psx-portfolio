def score_stock(stock: dict, profile: dict) -> float:
    """
    Score a stock 0-100 against an investor profile using 8 weighted factors.
    Continuous scoring (no hard 0/1 cutoffs) gives meaningful rank separation.
    """
    score = 0.0

    risk       = profile.get("riskTolerance", "Medium")
    goal       = profile.get("investmentGoal", "Wealth Building")
    div_pref   = profile.get("dividendPreference", "Balanced")
    horizon    = int(profile.get("timeHorizonYears", 1))
    age        = profile.get("ageRange", "25-40")

    # ── 1. Risk match (22 pts) ────────────────────────────────────────────
    suitable_risk = stock.get("suitableRisk", [])
    if risk in suitable_risk:
        score += 22
    elif suitable_risk:
        # partial credit: adjacent risk level
        adjacent = {"Low": "Medium", "Medium": "High", "High": "Medium"}
        if adjacent.get(risk) in suitable_risk:
            score += 10

    # ── 2. Goal match (18 pts) ────────────────────────────────────────────
    suitable_goals = stock.get("suitableGoals", [])
    if goal in suitable_goals:
        score += 18
    elif suitable_goals:
        score += 6

    # ── 3. Dividend preference (16 pts) ──────────────────────────────────
    stock_div = stock.get("dividendPreference", "Balanced")
    div_yield = stock.get("avgDividendYield", 0) or 0
    if div_pref == stock_div:
        score += 16
    elif div_pref == "Balanced":
        score += 8
    elif div_pref == "High Dividend" and div_yield >= 5:
        score += 10   # yields high even if not labelled "High Dividend"
    elif div_pref == "Growth" and stock_div in ["Growth", "Balanced"]:
        score += 8

    # ── 4. Time horizon (12 pts) ──────────────────────────────────────────
    min_horizon = stock.get("minHorizonYears", 1)
    if horizon >= min_horizon:
        # bonus for stocks that match horizon well (not just minimum)
        score += 12
    elif horizon >= min_horizon - 1:
        score += 6

    # ── 5. Valuation — P/E ratio (10 pts) ────────────────────────────────
    pe = stock.get("avgPeRatio")
    if pe and pe > 0:
        # Sweet spot 6–15x; penalty above 25x
        if pe <= 15:
            score += 10
        elif pe <= 20:
            score += 7
        elif pe <= 25:
            score += 4
        else:
            score += max(0, 10 - (pe - 25) * 0.5)

    # ── 6. Historical return (10 pts) ────────────────────────────────────
    ret = stock.get("avgAnnualReturn5yr")
    if ret and ret > 0:
        score += min(ret / 3.0, 10)  # 30%+ return → full 10 pts

    # ── 7. Quality — ROE (8 pts) ─────────────────────────────────────────
    roe = stock.get("avgRoe")
    if roe and roe > 0:
        score += min(roe / 3.75, 8)  # 30%+ ROE → full 8 pts

    # ── 8. Volatility penalty — riskier investors get a bonus (4 pts) ────
    vol = stock.get("volatilityScore", 50)
    if risk == "Low":
        # reward low-vol stocks
        score += max(0, 4 - vol * 0.04)
    elif risk == "High":
        # aggressive investors welcome higher volatility
        score += min(vol * 0.04, 4)
    else:
        # medium: neutral, slight reward for moderate vol
        score += max(0, 4 - abs(vol - 50) * 0.06)

    return round(min(score, 100), 2)


def generate_explanation(stock: dict, profile: dict) -> str:
    reasons = []
    risk = profile.get("riskTolerance", "Medium")
    goal = profile.get("investmentGoal", "Wealth Building")

    if risk in stock.get("suitableRisk", []):
        reasons.append(f"Matches {risk.lower()}-risk profile")

    if goal in stock.get("suitableGoals", []):
        reasons.append(f"Aligned with {goal.lower()} goal")

    div_yield = stock.get("avgDividendYield", 0) or 0
    if div_yield >= 7:
        reasons.append(f"Strong dividend yield ({div_yield}%)")
    elif div_yield >= 4:
        reasons.append(f"Steady dividend ({div_yield}%)")

    ret = stock.get("avgAnnualReturn5yr", 0) or 0
    if ret >= 25:
        reasons.append(f"Excellent 5yr return ({ret}% p.a.)")
    elif ret >= 15:
        reasons.append(f"Good 5yr return ({ret}% p.a.)")

    roe = stock.get("avgRoe", 0) or 0
    if roe >= 25:
        reasons.append(f"High ROE ({roe}%) — quality business")

    pe = stock.get("avgPeRatio")
    if pe and pe <= 10:
        reasons.append(f"Attractive valuation (P/E {pe}x)")

    beta = stock.get("beta", 1)
    if beta and beta < 0.8:
        reasons.append("Defensive — lower market sensitivity")

    strengths = stock.get("strengths", [])
    for s in strengths[:2]:
        if s not in " ".join(reasons):
            reasons.append(s)

    return " • ".join(reasons[:4]) if reasons else f"{stock.get('sector', '')} sector exposure"


def generate_ai_summary(profile: dict, recommendations: list) -> str:
    investor_type  = profile.get("investorType", "Moderate")
    investment     = profile.get("investmentAmount", 0)
    goal           = profile.get("investmentGoal", "Wealth Building")
    horizon        = profile.get("timeHorizonYears", 1)
    risk           = profile.get("riskTolerance", "Medium")

    # Unique sectors in top picks
    sectors = list(dict.fromkeys(r["sector"] for r in recommendations))[:3]

    # Avg expected return
    avg_ret = round(sum(r["expectedReturn"] for r in recommendations) / len(recommendations), 1) if recommendations else 0

    horizon_text = f"{horizon}-year" if horizon != 1 else "1-year"

    return (
        f"As a {investor_type} investor with PKR {investment:,.0f}, "
        f"this {horizon_text} portfolio targets {goal.lower()} "
        f"through {', '.join(sectors)} sectors. "
        f"With {risk.lower()} risk tolerance, the allocation achieves "
        f"an estimated {avg_ret}% weighted annual return while "
        f"staying within your dividend and volatility preferences."
    )


def calculate_portfolio_risk_score(holdings: list, stocks: list = None) -> int:
    """
    Uses actual stock volatilityScore from the stocks list when available,
    falls back to 50 otherwise.
    """
    if not holdings:
        return 0

    # Build a map of symbol → volatilityScore from stocks list
    vol_map = {}
    if stocks:
        for s in stocks:
            sym = s.get("symbol", "")
            if sym:
                vol_map[sym] = s.get("volatilityScore", 50)

    weighted_vol = sum(
        h.get("allocationPct", 0) / 100 * vol_map.get(h.get("symbol", ""), 50)
        for h in holdings
    )
    hhi = sum((h.get("allocationPct", 0) / 100) ** 2 for h in holdings)
    concentration = hhi * 20

    sectors = {}
    for h in holdings:
        sector = h.get("sector", "Unknown")
        sectors[sector] = sectors.get(sector, 0) + h.get("allocationPct", 0)
    max_sector = max(sectors.values()) if sectors else 0
    sector_penalty = max(0, (max_sector - 40) * 0.3)

    return min(100, round(weighted_vol + concentration + sector_penalty))


def generate_recommendations(profile: dict, stocks: list, top_n: int = 6) -> dict:
    # Score every active stock
    scored = [(s, score_stock(s, profile)) for s in stocks]
    scored.sort(key=lambda x: x[1], reverse=True)
    top_stocks = scored[:top_n]

    total_score   = sum(sc for _, sc in top_stocks)
    total_invest  = float(profile.get("investmentAmount", 0))

    recommendations = []
    for stock, sc in top_stocks:
        alloc_pct = round((sc / total_score) * 100, 1) if total_score > 0 else round(100 / top_n, 1)
        alloc_amt = round(total_invest * alloc_pct / 100)
        recommendations.append({
            "symbol":         stock["symbol"],
            "name":           stock["name"],
            "sector":         stock["sector"],
            "allocationPct":  alloc_pct,
            "amountPkr":      alloc_amt,
            "matchScore":     sc,
            "expectedReturn": stock.get("avgAnnualReturn5yr") or 0,
            "dividendYield":  stock.get("avgDividendYield")  or 0,
            "riskLevel":      stock.get("riskLevel", "Medium"),
            "reason":         generate_explanation(stock, profile)
        })

    weighted_return   = sum(r["expectedReturn"] * r["allocationPct"] / 100 for r in recommendations)
    weighted_dividend = sum(r["dividendYield"]   * r["amountPkr"]    / 100 for r in recommendations)
    portfolio_risk    = calculate_portfolio_risk_score(recommendations, stocks)

    return {
        "recommendations":          recommendations,
        "portfolio_expected_return": round(weighted_return, 1),
        "expected_annual_dividend":  round(weighted_dividend),
        "portfolio_risk_score":      portfolio_risk,
        "ai_summary":               generate_ai_summary(profile, recommendations)
    }
