INVESTOR_TYPES = {
    (0,  35): "Conservative",
    (36, 50): "Moderately Conservative",
    (51, 65): "Moderate",
    (66, 80): "Moderately Aggressive",
    (81, 100): "Aggressive"
}

def calculate_profile_score(profile: dict) -> dict:
    score = 0

    # Risk Tolerance (30 pts)
    score += {"Low": 10, "Medium": 20, "High": 30}.get(profile.get("riskTolerance", "Medium"), 20)

    # Time Horizon (25 pts)
    horizon_map = {1: 5, 3: 12, 5: 18, 10: 25}
    years = profile.get("timeHorizonYears", 1)
    score += horizon_map.get(years, 5 if years < 3 else 18 if years < 10 else 25)

    # Age (20 pts)
    score += {"40+": 5, "25-40": 12, "18-25": 20}.get(profile.get("ageRange", "25-40"), 12)

    # Dividend Preference (15 pts)
    score += {"High Dividend": 5, "Balanced": 10, "Growth": 15}.get(profile.get("dividendPreference", "Balanced"), 10)

    # Investment Goal (10 pts)
    score += {
        "Retirement": 2, "Passive Income": 4,
        "Wealth Building": 7, "Capital Growth": 10
    }.get(profile.get("investmentGoal", "Wealth Building"), 7)

    investor_type = "Moderate"
    for (low, high), itype in INVESTOR_TYPES.items():
        if low <= score <= high:
            investor_type = itype
            break

    base_return = 10 + (score / 100) * 20

    return {
        "investor_type": investor_type,
        "profile_score": score,
        "expected_return_min": round(base_return - 2, 1),
        "expected_return_max": round(base_return + 2, 1),
        "suggested_allocation": get_suggested_allocation(score)
    }

def get_suggested_allocation(score: int) -> dict:
    if score <= 35:
        return {"Banking": 40, "Fertilizer": 30, "Power": 20, "Cash": 10}
    elif score <= 50:
        return {"Banking": 35, "Fertilizer": 25, "Cement": 20, "Oil & Gas": 15, "Cash": 5}
    elif score <= 65:
        return {"Banking": 30, "Cement": 25, "Oil & Gas": 20, "Fertilizer": 15, "Technology": 10}
    elif score <= 80:
        return {"Banking": 25, "Cement": 20, "Technology": 25, "Oil & Gas": 15, "Fertilizer": 15}
    else:
        return {"Technology": 40, "Cement": 25, "Banking": 20, "Automobile": 15}
