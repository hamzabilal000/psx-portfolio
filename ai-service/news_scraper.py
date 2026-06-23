import feedparser
import re
from datetime import datetime, timezone

RSS_FEEDS = [
    # ── Pakistani Business / Finance ────────────────────────────────────────
    {"name": "Business Recorder",     "url": "https://www.brecorder.com/feed",                        "intl": False},
    {"name": "Dawn Business",         "url": "https://www.dawn.com/feeds/business-finance",           "intl": False},
    {"name": "The News Business",     "url": "https://www.thenews.com.pk/rss/business/1",             "intl": False},
    {"name": "Express Tribune Biz",   "url": "https://tribune.com.pk/feed/business",                  "intl": False},
    {"name": "Profit Pakistan Today", "url": "https://profit.pakistantoday.com.pk/feed/",             "intl": False},
    {"name": "Geo Business",          "url": "https://www.geo.tv/rss/10",                             "intl": False},
    # ── International ───────────────────────────────────────────────────────
    {"name": "Reuters Business",      "url": "https://feeds.reuters.com/reuters/businessNews",        "intl": True},
    {"name": "Reuters Markets",       "url": "https://feeds.reuters.com/reuters/marketsNews",         "intl": True},
    {"name": "CNBC Markets",          "url": "https://www.cnbc.com/id/10000664/device/rss/rss.html",  "intl": True},
    {"name": "Investing.com",         "url": "https://www.investing.com/rss/news_301.rss",            "intl": True},
]

PSX_KEYWORDS = [
    "PSX", "KSE", "stock", "shares", "dividend", "earnings", "profit", "loss",
    "karachi stock", "pakistan stock", "equity", "investment", "SECP", "SBP",
    "listed company", "IPO", "State Bank", "inflation", "interest rate",
    "GDP", "economy", "fiscal", "budget", "revenue", "exports", "imports",
    "rupee", "PKR", "USD", "oil", "commodity", "emerging market", "Asia",
    "wheat", "fertilizer", "cement", "banking", "telecom", "energy",
]

INTL_FILTER_KEYWORDS = [
    "pakistan", "PSX", "KSE", "rupee", "emerging market", "asia pacific",
    "oil price", "commodity", "crude", "interest rate", "fed", "inflation",
    "global market", "stock market", "equity market", "bonds",
]


def _parse_date(entry) -> str:
    if hasattr(entry, "published_parsed") and entry.published_parsed:
        try:
            dt = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
            return dt.isoformat()
        except Exception:
            pass
    return datetime.now(timezone.utc).isoformat()


def _clean(text: str) -> str:
    return re.sub(r"<[^>]+>", "", text or "").strip()


def _is_psx_relevant(text: str) -> bool:
    t = text.lower()
    return any(kw.lower() in t for kw in PSX_KEYWORDS)


def _is_intl_relevant(text: str) -> bool:
    t = text.lower()
    return any(kw.lower() in t for kw in INTL_FILTER_KEYWORDS)


def fetch_news(symbol: str = None, max_articles: int = 30) -> list:
    """
    Fetch articles from all RSS feeds, balanced across sources.
    For symbol search: filter by symbol name.
    For market news: include all Pakistani feeds + filtered international.
    """
    per_feed = max(3, max_articles // len(RSS_FEEDS) + 2)
    articles = []
    seen_titles = set()

    for feed_meta in RSS_FEEDS:
        try:
            feed = feedparser.parse(feed_meta["url"])
            count = 0
            for entry in feed.entries[:25]:
                title = _clean(getattr(entry, "title", ""))
                if not title or title in seen_titles:
                    continue

                description = _clean(
                    getattr(entry, "summary", "") or
                    getattr(entry, "description", "")
                )[:400]

                combined = f"{title} {description}"

                # Symbol search: must mention the symbol
                if symbol:
                    if symbol.lower() not in combined.lower():
                        continue
                # International feeds: must pass relevance filter
                elif feed_meta["intl"] and not _is_intl_relevant(combined):
                    continue

                seen_titles.add(title)
                articles.append({
                    "title":       title,
                    "description": description,
                    "url":         getattr(entry, "link", ""),
                    "urlToImage":  None,
                    "publishedAt": _parse_date(entry),
                    "source":      {"name": feed_meta["name"], "id": None},
                    "sentiment":   None,
                })
                count += 1
                if count >= per_feed:
                    break

        except Exception as e:
            print(f"[RSS] {feed_meta['name']} failed: {e}", flush=True)

    # Sort newest first, then cap
    articles.sort(key=lambda a: a["publishedAt"], reverse=True)
    return articles[:max_articles]
