# train_new_model.py
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
import joblib
import os

CSV_FILE = "synthetic_feedback_data.csv"   # <-- your renamed file

# Load dataset
df = pd.read_csv(CSV_FILE)
print("Loaded rows:", len(df))

X = df["text"].astype(str)
y = df["label"].astype(str)

pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(
        lowercase=True,
        stop_words='english',
        ngram_range=(1,2),
        max_features=25000
    )),
    ("clf", LogisticRegression(max_iter=2000))
])

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.15, random_state=42, stratify=y
)

pipeline.fit(X_train, y_train)

print("Training complete.")
print("Validation accuracy:", pipeline.score(X_test, y_test))

os.makedirs("models", exist_ok=True)
joblib.dump(pipeline.named_steps["clf"], "models/sentiment_model.pkl")
joblib.dump(pipeline.named_steps["tfidf"], "models/tfidf_vectorizer.pkl")

print("Saved: models/sentiment_model.pkl, models/tfidf_vectorizer.pkl")
