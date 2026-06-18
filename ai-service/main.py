from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Any
import uvicorn
from profiler import calculate_profile_score
from recommender import generate_recommendations
from sentiment import analyze_sentiment
from risk_analyzer import calculate_portfolio_risk
from scheduler import fetch_prices

app = FastAPI(title="PSX AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"]
)

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

@app.get("/health")
def health():
    return {"status": "ok"}

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

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
