import yfinance as yf

def fetch_prices(tickers: list) -> list:
    """
    tickers: [{"symbol": "MEBL", "yahooTicker": "MEBL.KA"}, ...]
    Returns list of price objects.
    """
    prices = []
    for t in tickers:
        try:
            ticker = yf.Ticker(t["yahooTicker"])
            info = ticker.fast_info
            price = getattr(info, 'last_price', None)
            if price and price > 0:
                prev_close = getattr(info, 'previous_close', price)
                change_amt = round(price - prev_close, 2) if prev_close else 0
                change_pct = round((change_amt / prev_close * 100), 2) if prev_close else 0
                prices.append({
                    "symbol": t["symbol"],
                    "price": round(price, 2),
                    "changeAmt": change_amt,
                    "changePct": change_pct,
                    "source": "yfinance"
                })
        except Exception as e:
            print(f"Failed to fetch {t['symbol']}: {e}")
    return prices
