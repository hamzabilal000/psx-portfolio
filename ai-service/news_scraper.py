import feedparser
import time
from datetime import datetime, timezone

RSS_FEEDS = [
    {
        "name": "Dawn Business",
        "url": "https://www.dawn.com/feeds/business-finance",
        "category": "Business"
    },
    {
        "name": "Business Recorder",
        "url": "https://www.brecorder.com/feed",
        "category": "Finance"
    },
    {
        "name": "The News Business",
        "url": "https://www.thenews.com.pk/rss/business/1",
        "category": "Business"
    },
    {
        "name": "Geo Business",
        "url": "https://www.geo.tv/rss/10",
        "category": "Finance"
    },
    {
        "name": "ARY Business",
        "url": "https://arynews.tv/feed/",
        "category": "Business"
    },
]

# PSX-related keywords for filtering
PSX_KEYWORDS = [
    "PSX", "KSE", "stock", "shares", "dividend", "earnings", "profit",
    "karachi stock", "pakistan stock", "equity", "investment", "SECP",
    "listed company", "IPO", "SBP", "State Bank", "inflation", "interest rate",
    "GDP", "economy", "fiscal", "budget", "revenue", "exports", "imports"
]


def _parse_date(entry) -> str:
    """Extract and normalise publish date from a feedparser entry."""
    if hasattr(entry, "published_parsed") and entry.published_parsed:
        try:
            dt = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
            return dt.isoformat()
        except Exception:
            pass
    return datetime.now(timezone.utc).isoformat()


def _is_relevant(text: str, symbol: str = None) -> bool:
    """Return True if article is relevant to PSX / the given symbol."""
    text_lower = text.lower()
    if symbol:
        return symbol.lower() in text_lower
    return any(kw.lower() in text_lower for kw in PSX_KEYWORDS)


def fetch_news(symbol: str = None, max_articles: int = 20) -> list:
    """
    Fetch articles from RSS feeds, optionally filtered by stock symbol.
    Returns a list of article dicts compatible with the existing news UI.
    """
    articles = []
    seen_titles = set()

    for feed_meta in RSS_FEEDS:
        try:
            feed = feedparser.parse(feed_meta["url"])
            for entry in feed.entries[:15]:
                title = getattr(entry, "title", "").strip()
                if not title or title in seen_titles:
                    continue

                description = getattr(entry, "summary", "") or getattr(entry, "description", "") or ""
                # Strip basic HTML tags
                import re
                description = re.sub(r"<[^>]+>", "", description).strip()[:300]

                # For symbol search, filter by symbol. For market news, accept all articles
                # (all feeds are already business/finance sources — no need to filter further)
                if symbol and not _is_relevant(f"{title} {description}", symbol):
                    continue

                seen_titles.add(title)
                articles.append({
                    "title":       title,
                    "description": description,
                    "url":         getattr(entry, "link", ""),
                    "urlToImage":  None,
                    "publishedAt": _parse_date(entry),
                    "source":      {"name": feed_meta["name"], "id": None},
                    "sentiment":   None,   # filled in by caller if needed
                })

                if len(articles) >= max_articles:
                    break

        except Exception as e:
            print(f"[RSS] Feed {feed_meta['name']} failed: {e}")

        if len(articles) >= max_articles:
            break

    # Sort by date descending
    articles.sort(key=lambda a: a["publishedAt"], reverse=True)
    return articles
