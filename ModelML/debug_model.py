# debug_model.py
import joblib, os
import numpy as np

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
model_path = os.path.join(MODEL_DIR, "svm_model.pkl")
vectorizer_path = os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl")

print("MODEL_DIR:", MODEL_DIR)
print("model_path exists:", os.path.exists(model_path))
print("vectorizer_path exists:", os.path.exists(vectorizer_path))

model = joblib.load(model_path)
vec = joblib.load(vectorizer_path)

print("\nModel type:", type(model))
print("Vectorizer type:", type(vec))

# model classes
try:
    print("model.classes_:", getattr(model, "classes_", None))
except Exception as e:
    print("error reading classes:", e)

# does model support predict_proba?
print("has predict_proba:", hasattr(model, "predict_proba"))
print("has decision_function:", hasattr(model, "decision_function"))

# sample texts to test
samples = [
    "this mess is horrible",
    "I hate this mess, please change",
    "the mess food is bad",
    "the campus is very good",
    "good"
]

print("\n--- feature output for each sample ---")
for s in samples:
    X = vec.transform([s])
    print(f"\nSAMPLE: {s!r}")
    print("  sparse shape:", X.shape, "nnz:", X.nnz)
    # show top nonzero features and their tfidf values
    if X.nnz > 0:
        arr = X.toarray()[0]
        nonz = np.where(arr != 0)[0]
        pairs = [(i, arr[i]) for i in nonz]
        # get feature name by inverse mapping if vectorizer has vocabulary_
        try:
            inv = {v:k for k,v in vec.vocabulary_.items()}
            top = sorted(pairs, key=lambda x: -abs(x[1]))[:12]
            readable = [(inv[idx], val) for idx,val in top]
            print("  top features (feature:tfidf):", readable)
        except Exception as e:
            print("  could not map indices to tokens:", e)

    # convert to dense as your API does
    Xdense = X.toarray()
    try:
        pred = model.predict(Xdense)
        print("  model.predict ->", pred)
    except Exception as e:
        print("  model.predict error:", e)

    # probabilities or decision scores
    if hasattr(model, "predict_proba"):
        try:
            print("  predict_proba ->", model.predict_proba(Xdense)[0])
        except Exception as e:
            print("  predict_proba error:", e)
    if hasattr(model, "decision_function"):
        try:
            print("  decision_function ->", model.decision_function(Xdense))
        except Exception as e:
            print("  decision_function error:", e)
