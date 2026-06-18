from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

analyzer = SentimentIntensityAnalyzer()

def analyze_sentiment(text: str) -> dict:
    if not text or not text.strip():
        return {"label": "Neutral", "score": 0.5, "compound": 0.0, "details": {}}

    scores = analyzer.polarity_scores(text)
    compound = scores["compound"]

    if compound >= 0.05:
        label = "Positive"
        confidence = round((compound + 1) / 2 * 100, 1)
    elif compound <= -0.05:
        label = "Negative"
        confidence = round((1 - (compound + 1) / 2) * 100, 1)
    else:
        label = "Neutral"
        confidence = round(50 + abs(compound) * 50, 1)

    return {
        "label": label,
        "score": round((compound + 1) / 2, 3),
        "confidence": confidence,
        "compound": round(compound, 3),
        "details": {
            "positive": scores["pos"],
            "negative": scores["neg"],
            "neutral": scores["neu"]
        }
    }
