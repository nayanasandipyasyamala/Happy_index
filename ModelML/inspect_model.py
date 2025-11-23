# ModelML/inspect_model.py
import joblib, os
import numpy as np

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
MODEL_PATH = os.path.join(MODEL_DIR, "svm_model.pkl")
VECT_PATH = os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl")

print("Loading model and vectorizer from:", MODEL_PATH, "and", VECT_PATH)
model = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VECT_PATH)

print("\nModel type:", type(model))
# show classes if available
if hasattr(model, "classes_"):
    print("model.classes_:", model.classes_)

# helper to predict and show probs if available
def probe(texts):
    if isinstance(texts, str):
        texts = [texts]
    X = vectorizer.transform(texts)
    print("\nTexts:")
    for t in texts:
        print("  -", t)
    try:
        preds = model.predict(X)
        print("Predictions:", preds)
    except Exception as e:
        print("Predict error:", e)
        # try dense fallback
        Xd = X.toarray()
        preds = model.predict(Xd)
        print("Predictions (dense):", preds)

    # probabilities if available
    if hasattr(model, "predict_proba"):
        try:
            probs = model.predict_proba(X)
            print("Predict_proba (per-class):")
            for i, p in enumerate(probs):
                print("  text[{}] :".format(i), p, "sum=", np.sum(p))
        except Exception as e:
            try:
                probs = model.predict_proba(X.toarray())
                print("Predict_proba (dense fallback):", probs)
            except Exception as e2:
                print("predict_proba error:", e, e2)

# Test a few example sentences
probe([
    "this mess is horrible",
    "I hate the food",
    "I love the campus and teachers",
    "good",
    "bad",
    "it was okay"
])

# Optional: inspect a few training samples if you have them in data/
csv_path = os.path.join(os.path.dirname(__file__), "data", "preprocessed_data.csv")
if os.path.exists(csv_path):
    import pandas as pd
    df = pd.read_csv(csv_path)
    print("\nFound preprocessed_data.csv with", len(df), "rows. Showing sample labels distribution:")
    print(df['label'].value_counts(dropna=False))
else:
    print("\nNo preprocessed_data.csv found at", csv_path)
