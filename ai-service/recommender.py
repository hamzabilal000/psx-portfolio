def score_stock(stock: dict, profile: dict) -> float:
    score = 0.0
    risk = profile.get("riskTolerance", "Medium")
    goal = profile.get("investmentGoal", "Wealth Building")
    div_pref = profile.get("dividendPreference", "Balanced")
    horizon = profile.get("timeHorizonYears", 1)

    # 1. Risk match (25 pts)
    suitable_risk = stock.get("suitableRisk", [])
    if risk in suitable_risk:
        score += 25
    elif len(suitable_risk) > 1:
        score += 10

    # 2. Goal match (20 pts)
    suitable_goals = stock.get("suitableGoals", [])
    if goal in suitable_goals:
        score += 20
    elif len(suitable_goals) > 0:
        score += 5

    # 3. Dividend preference match (20 pts)
    stock_div_pref = stock.get("dividendPreference", "Balanced")
    if div_pref == stock_div_pref:
        score += 20
    elif div_pref == "Balanced":
        score += 10

    # 4. Time horizon (15 pts)
    if horizon >= stock.get("minHorizonYears", 1):
        score += 15

    # 5. Valuation (10 pts) — lower PE = better
    pe = stock.get("avgPeRatio")
    if pe:
        pe_score = max(0, 10 - (pe - 6) * 0.5)
        score += min(pe_score, 10)

    # 6. Historical return (10 pts)
    ret = stock.get("avgAnnualReturn5yr")
    if ret:
        score += min(ret / 4, 10)

    return round(score, 2)

def generate_explanation(stock: dict, profile: dict) -> str:
    reasons = []
    risk = profile.get("riskTolerance", "Medium")
    if risk in stock.get("suitableRisk", []):
        reasons.append(f"Suitable for {risk.lower()}-risk investors")
    if stock.get("avgDividendYield", 0) > 6:
        reasons.append(f"High dividend yield of {stock['avgDividendYield']}%")
    if stock.get("avgAnnualReturn5yr", 0) > 20:
        reasons.append(f"Strong 5-year return of {stock['avgAnnualReturn5yr']}%")
    if stock.get("beta", 1) < 0.85:
        reasons.append("Lower market volatility (defensive)")
    if stock.get("avgRoe", 0) > 20:
        reasons.append(f"High ROE of {stock['avgRoe']}%")
    strengths = stock.get("strengths", [])
    reasons.extend(strengths[:2])
    return " • ".join(reasons[:4])

def generate_ai_summary(profile: dict, recommendations: list) -> str:
    investor_type = profile.get("investorType", "Moderate")
    investment = profile.get("investmentAmount", 0)
    goal = profile.get("investmentGoal", "Wealth Building")
    top_sectors = list({r["sector"] for r in recommendations[:3]})
    return (
        f"As a {investor_type} investor with PKR {investment:,} targeting {goal}, "
        f"this portfolio focuses on {', '.join(top_sectors)}. "
        f"The allocation balances your risk tolerance while maximizing returns for your "
        f"{profile.get('timeHorizonYears', 1)}-year investment horizon."
    )

def generate_recommendations(profile: dict, stocks: list, top_n: int = 6) -> dict:
    scored = [(s, score_stock(s, profile)) for s in stocks]
    scored.sort(key=lambda x: x[1], reverse=True)
    top_stocks = scored[:top_n]

    total_score = sum(s for _, s in top_stocks)
    total_investment = profile.get("investmentAmount", 0)

    recommendations = []
    for stock, score in top_stocks:
        alloc_pct = round((score / total_score) * 100, 1) if total_score > 0 else round(100 / top_n, 1)
        alloc_amt = round(total_investment * alloc_pct / 100)
        recommendations.append({
            "symbol": stock["symbol"],
            "name": stock["name"],
            "sector": stock["sector"],
            "allocationPct": alloc_pct,
            "amountPkr": alloc_amt,
            "matchScore": score,
            "expectedReturn": stock.get("avgAnnualReturn5yr", 0),
            "dividendYield": stock.get("avgDividendYield", 0),
            "riskLevel": stock.get("riskLevel", "Medium"),
            "reason": generate_explanation(stock, profile)
        })

    weighted_return = sum(
        r["expectedReturn"] * r["allocationPct"] / 100
        for r in recommendations
    )
    weighted_dividend = sum(
        r["dividendYield"] * r["amountPkr"] / 100
        for r in recommendations
    )

    portfolio_risk = calculate_portfolio_risk_score(recommendations)

    return {
        "recommendations": recommendations,
        "portfolio_expected_return": round(weighted_return, 1),
        "expected_annual_dividend": round(weighted_dividend),
        "portfolio_risk_score": portfolio_risk,
        "ai_summary": generate_ai_summary(profile, recommendations)
    }

def calculate_portfolio_risk_score(holdings: list) -> int:
    if not holdings:
        return 0
    weighted_vol = sum(
        h["allocationPct"] / 100 * 50
        for h in holdings
    )
    hhi = sum((h["allocationPct"] / 100) ** 2 for h in holdings)
    concentration = hhi * 20

    sectors = {}
    for h in holdings:
        sectors[h["sector"]] = sectors.get(h["sector"], 0) + h["allocationPct"]
    max_sector = max(sectors.values()) if sectors else 0
    sector_penalty = max(0, (max_sector - 40) * 0.3)

    return min(100, round(weighted_vol + concentration + sector_penalty))
