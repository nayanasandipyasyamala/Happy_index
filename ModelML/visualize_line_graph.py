import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("predictions.csv", names=["feedback", "sentiment"])

sentiment_counts = df["sentiment"].value_counts().reindex(
    ["negative", "neutral", "positive"], fill_value=0
)

plt.plot(sentiment_counts.index, sentiment_counts.values, marker="o")
plt.title("Sentiment Analysis Results (Predictions)")
plt.xlabel("Sentiment")
plt.ylabel("Count")
plt.grid(True)
plt.show()
