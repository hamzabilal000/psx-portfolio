def calculate_portfolio_risk(holdings: list) -> dict:
    if not holdings:
        return {"riskScore": 0, "riskLabel": "Low", "warnings": [], "breakdown": {}}

    weighted_vol = sum(
        h.get("allocationPct", 0) / 100 * h.get("volatilityScore", 50)
        for h in holdings
    )
    hhi = sum((h.get("allocationPct", 0) / 100) ** 2 for h in holdings)
    concentration_penalty = hhi * 20

    sectors = {}
    for h in holdings:
        sector = h.get("sector", "Unknown")
        sectors[sector] = sectors.get(sector, 0) + h.get("allocationPct", 0)

    max_sector = max(sectors.values()) if sectors else 0
    max_sector_name = max(sectors, key=sectors.get) if sectors else "Unknown"
    sector_penalty = max(0, (max_sector - 40) * 0.3)

    total_risk = min(100, weighted_vol + concentration_penalty + sector_penalty)

    warnings = []
    if max_sector > 50:
        warnings.append(f"High concentration in {max_sector_name} sector ({max_sector:.0f}%)")
    if hhi > 0.35:
        warnings.append("Portfolio too concentrated — consider diversifying across more stocks")
    if total_risk > 65:
        warnings.append("Overall portfolio risk is High — review your allocations")

    label = "Low" if total_risk < 35 else "Medium" if total_risk < 65 else "High"

    return {
        "riskScore": round(total_risk),
        "riskLabel": label,
        "warnings": warnings,
        "breakdown": {
            "weightedVolatility": round(weighted_vol, 1),
            "concentrationPenalty": round(concentration_penalty, 1),
            "sectorPenalty": round(sector_penalty, 1),
            "sectorBreakdown": sectors
        }
    }
