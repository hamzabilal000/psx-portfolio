from dotenv import load_dotenv
load_dotenv()  # must be first — loads ai-service/.env before any os.getenv() calls

import os, logging
if not os.getenv("GEMINI_API_KEY"):
    logging.critical("GEMINI_API_KEY is not set — AI features (chat, compare, analysis) will fail. Set it in Render Environment Variables.")
else:
    logging.info("GEMINI_API_KEY loaded OK — AI features enabled.")

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Any
import uvicorn
import yfinance as yf
import numpy as np

from profiler import calculate_profile_score
from recommender import generate_recommendations
from sentiment import analyze_sentiment
from risk_analyzer import calculate_portfolio_risk
from scheduler import fetch_prices
from news_scraper import fetch_news
import gemini as gem

app = FastAPI(title="PSX AI Service", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# ── Request models ─────────────────────────────────────────────────────────────

class ProfileInput(BaseModel):
    investmentAmount: float
    timeHorizonYears: int
    riskTolerance: str
    dividendPreference: str
    ageRange: str
    monthlyInvestment: Optional[float] = 0
    investmentGoal: str

class RecommendInput(BaseModel):
    profile: dict
    stocks: List[dict]

class SentimentInput(BaseModel):
    text: str

class RiskInput(BaseModel):
    holdings: List[dict]

class PriceInput(BaseModel):
    tickers: List[dict]

class GeminiStockInput(BaseModel):
    stock: dict

class GeminiPortfolioInput(BaseModel):
    holdings: List[dict]
    profile: dict

class GeminiChatInput(BaseModel):
    message: str
    context: Optional[str] = ""

class GeminiCompareInput(BaseModel):
    stock_a: dict
    stock_b: dict

class GeminiNewsInput(BaseModel):
    title: str
    description: Optional[str] = ""

# ── Core endpoints ─────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "service": "PSX AI Service"}

@app.get("/health")
def health():
    return {"status": "ok", "gemini": gem._available()}

@app.post("/profile")
def profile_investor(data: ProfileInput):
    try:
        result = calculate_profile_score(data.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommend")
def recommend_stocks(data: RecommendInput):
    try:
        result = generate_recommendations(data.profile, data.stocks)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/sentiment")
def sentiment_analysis(data: SentimentInput):
    try:
        return analyze_sentiment(data.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/risk")
def portfolio_risk(data: RiskInput):
    try:
        return calculate_portfolio_risk(data.holdings)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/prices/update")
def update_prices(data: PriceInput):
    try:
        prices = fetch_prices(data.tickers)
        return {"prices": prices, "count": len(prices)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── News / RSS endpoint ────────────────────────────────────────────────────────

@app.get("/news/rss")
def get_market_news_rss(symbol: Optional[str] = None, limit: int = 20):
    """Fetch Pakistan business news from free RSS feeds."""
    try:
        articles = fetch_news(symbol=symbol, max_articles=limit)
        return {"success": True, "articles": articles, "count": len(articles)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Stock enrichment via yfinance ──────────────────────────────────────────────

@app.get("/enrich/{yahoo_ticker}")
def enrich_stock(yahoo_ticker: str):
    """Fetch real fundamentals for a PSX stock from Yahoo Finance."""
    try:
        tkr = yf.Ticker(yahoo_ticker)
        info = tkr.info

        hist = tkr.history(period="5y")
        avg_annual_return = None
        volatility_score = 50
        beta_calc = None

        if not hist.empty and len(hist) > 30:
            returns = hist["Close"].pct_change().dropna()
            # Annualised volatility → volatility score (cap 100)
            ann_vol = float(returns.std() * np.sqrt(252) * 100)
            volatility_score = min(100, max(5, int(ann_vol)))

            # CAGR over 5yr
            total_return = (hist["Close"].iloc[-1] / hist["Close"].iloc[0]) - 1
            years = len(hist) / 252
            if years > 0:
                avg_annual_return = round((((1 + total_return) ** (1 / years)) - 1) * 100, 1)

            # Simple beta using variance of own returns as proxy
            beta_calc = round(float(returns.std() * np.sqrt(252) / 0.20), 2)  # normalise vs 20% market vol

        div_yield = (info.get("dividendYield") or 0) * 100

        data = {}
        if info.get("trailingPE"):
            data["avgPeRatio"] = round(info["trailingPE"], 1)
        if info.get("priceToBook"):
            data["avgPbRatio"] = round(info["priceToBook"], 2)
        if div_yield:
            data["avgDividendYield"] = round(div_yield, 2)
        if info.get("returnOnEquity"):
            data["avgRoe"] = round(info["returnOnEquity"] * 100, 1)
        if info.get("returnOnAssets"):
            data["avgRoa"] = round(info["returnOnAssets"] * 100, 1)
        if info.get("beta"):
            data["beta"] = round(info["beta"], 2)
        elif beta_calc:
            data["beta"] = beta_calc
        if avg_annual_return is not None:
            data["avgAnnualReturn5yr"] = avg_annual_return
        data["volatilityScore"] = volatility_score
        if info.get("marketCap"):
            data["marketCapBnPkr"] = round(info["marketCap"] / 1e9, 1)

        return {"success": True, "ticker": yahoo_ticker, "data": data}
    except Exception as e:
        return {"success": False, "ticker": yahoo_ticker, "error": str(e)}

# ── Gemini endpoints ───────────────────────────────────────────────────────────

@app.post("/gemini/analyze-stock")
def gemini_analyze_stock(data: GeminiStockInput):
    try:
        analysis = gem.analyze_stock(data.stock)
        return {"success": True, "analysis": analysis}
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/gemini/portfolio-advice")
def gemini_portfolio_advice(data: GeminiPortfolioInput):
    try:
        advice = gem.portfolio_advice(data.holdings, data.profile)
        return {"success": True, "advice": advice}
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/gemini/chat")
def gemini_chat(data: GeminiChatInput):
    try:
        reply = gem.chat(data.message, data.context)
        return {"success": True, "reply": reply}
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/gemini/compare")
def gemini_compare(data: GeminiCompareInput):
    try:
        verdict = gem.compare_stocks(data.stock_a, data.stock_b)
        return {"success": True, "verdict": verdict}
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/gemini/news-sentiment")
def gemini_news_sentiment(data: GeminiNewsInput):
    try:
        result = gem.news_sentiment(data.title, data.description)
        return {"success": True, **result}
    except RuntimeError as e:
        # Fall back to VADER if Gemini not configured
        vader = analyze_sentiment(f"{data.title} {data.description}")
        return {"success": True, **vader}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
