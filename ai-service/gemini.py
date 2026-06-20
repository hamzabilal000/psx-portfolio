import os
from groq import Groq

_KEY = os.getenv("GEMINI_API_KEY", "")
_client = Groq(api_key=_KEY) if _KEY else None
_MODEL = "llama-3.1-8b-instant"


def _available() -> bool:
    return _client is not None


def _call(prompt: str) -> str:
    if not _available():
        raise RuntimeError("GEMINI_API_KEY not set. Add your Groq key to ai-service/.env")
    response = _client.chat.completions.create(
        model=_MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=512,
        temperature=0.7,
    )
    return response.choices[0].message.content.strip()


# ── Public functions ──────────────────────────────────────────────────────────

def analyze_stock(stock: dict) -> str:
    prompt = f"""You are a PSX (Pakistan Stock Exchange) analyst helping a retail investor.
Analyze this stock and give a concise 3-paragraph response:

Symbol: {stock.get('symbol')} — {stock.get('name')}
Sector: {stock.get('sector')}
P/E Ratio: {stock.get('avgPeRatio', 'N/A')}x  |  P/B: {stock.get('avgPbRatio', 'N/A')}x
Dividend Yield: {stock.get('avgDividendYield', 0)}%  |  Payout Ratio: {stock.get('payoutRatio', 'N/A')}%
ROE: {stock.get('avgRoe', 'N/A')}%  |  ROA: {stock.get('avgRoa', 'N/A')}%
Beta: {stock.get('beta', 'N/A')}  |  Volatility Score: {stock.get('volatilityScore', 'N/A')}/100
5-yr Annual Return: {stock.get('avgAnnualReturn5yr', 'N/A')}%
Risk Level: {stock.get('riskLevel', 'N/A')}
Strengths: {', '.join(stock.get('strengths', []))}
Weaknesses: {', '.join(stock.get('weaknesses', []))}

Paragraph 1: Current valuation — is it cheap or expensive? Compare to sector norms.
Paragraph 2: Income potential — dividends, dividend sustainability, payout ratio analysis.
Paragraph 3: Key risks for a Pakistani retail investor today.

Keep it under 200 words. Use PKR context. Be direct and practical."""
    return _call(prompt)


def portfolio_advice(holdings: list, profile: dict) -> str:
    holding_lines = "\n".join(
        f"  - {h.get('symbol')}: {h.get('allocationPct', 0)}% (PKR {h.get('currentValue', 0):,.0f})"
        for h in holdings[:10]
    )
    prompt = f"""You are a PSX portfolio advisor. Give brief, actionable advice.

Investor Profile:
- Risk Tolerance: {profile.get('riskTolerance', 'Medium')}
- Goal: {profile.get('investmentGoal', 'Wealth Building')}
- Time Horizon: {profile.get('timeHorizonYears', 3)} years
- Investment Amount: PKR {profile.get('investmentAmount', 0):,.0f}

Current Holdings:
{holding_lines if holding_lines else "  (no holdings yet)"}

Give 3 short bullet-point recommendations:
1. Diversification: is the portfolio well-diversified?
2. Risk alignment: does it match the stated risk tolerance?
3. One actionable improvement to make this week.

Keep it under 150 words. Be specific to PSX. Use PKR."""
    return _call(prompt)


def news_sentiment(title: str, description: str) -> dict:
    prompt = f"""Classify the sentiment of this Pakistani financial news headline for a PSX stock investor.
Reply with ONLY this JSON (no markdown, no explanation):
{{"label": "Positive|Negative|Neutral", "confidence": 0-100, "impact": "short description under 10 words"}}

Title: {title}
Summary: {description[:200]}"""
    try:
        text = _call(prompt)
        import json, re
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            return json.loads(match.group())
    except Exception:
        pass
    return {"label": "Neutral", "confidence": 50, "impact": "Insufficient data"}


def chat(message: str, context: str = "") -> str:
    prompt = f"""You are an expert PSX (Pakistan Stock Exchange) investment assistant helping Pakistani retail investors.
You know about KSE-100, major PSX sectors (Banking, Fertilizer, Cement, Tech, Oil & Gas),
PKR currency context, State Bank of Pakistan policy rates, and Pakistani financial regulations.

{"Context: " + context if context else ""}

User question: {message}

Answer in 2-4 sentences. Be direct and practical. Use PKR where relevant."""
    return _call(prompt)


def compare_stocks(stock_a: dict, stock_b: dict) -> str:
    prompt = f"""Compare these two PSX stocks for a retail investor. Give a 2-sentence verdict.

Stock A: {stock_a.get('symbol')} — P/E {stock_a.get('avgPeRatio')}x, Div {stock_a.get('avgDividendYield')}%, ROE {stock_a.get('avgRoe')}%, 5yr return {stock_a.get('avgAnnualReturn5yr')}%, Risk: {stock_a.get('riskLevel')}
Stock B: {stock_b.get('symbol')} — P/E {stock_b.get('avgPeRatio')}x, Div {stock_b.get('avgDividendYield')}%, ROE {stock_b.get('avgRoe')}%, 5yr return {stock_b.get('avgAnnualReturn5yr')}%, Risk: {stock_b.get('riskLevel')}

Format: "For [goal] investors, [SYMBOL] is better because [reason]. However, [SYMBOL] suits investors who [alternative scenario]."
Under 60 words."""
    return _call(prompt)
