# PSX AI Portfolio Platform

A full-stack AI-powered Pakistan Stock Exchange investment advisor.

## Stack
- **Backend:** Node.js + Express + MongoDB
- **AI Service:** Python + FastAPI
- **Frontend:** React + Vite + TailwindCSS

## Modules
1. Authentication & Security (JWT, bcrypt, OTP, Email Verification)
2. User Financial Profile
3. AI Investor Profiling
4. Portfolio Management
5. AI Recommendation Engine
6. Recommendation Explanations
7. Dividend Planner
8. Future Wealth Simulator
9. CAGR Calculator
10. ROI Calculator
11. Goal-Based Investing
12. Watchlist
13. Stock Comparison
14. Risk Analyzer
15. News & Sentiment Analysis
16. Price Alerts
17. Transaction History
18. Admin Dashboard

## Setup

### Server
```bash
cd server
npm install
cp .env.example .env   # fill in your values
npm start
```

### AI Service
```bash
cd ai-service
pip install -r requirements.txt
cp .env.example .env
python main.py
```

### Client
```bash
cd client
npm install
npm run dev
```

### Seed PSX Stocks
```bash
cd server
node seeds/seedStocks.js
```
