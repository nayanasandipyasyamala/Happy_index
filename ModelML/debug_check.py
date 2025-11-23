import joblib, os
model_path = os.path.join("models","sentiment_model.pkl")
vec_path = os.path.join("models","tfidf_vectorizer.pkl")

print("cwd:", os.getcwd())
print("models dir exists:", os.path.exists("models"))
if os.path.exists("models"):
    print("models dir listing (first 50):", os.listdir("models")[:50])

print("model_path exists:", os.path.exists(model_path), model_path)
print("vectorizer_path exists:", os.path.exists(vec_path), vec_path)

try:
    model = joblib.load(model_path)
    print("Loaded model type:", type(model))
    print("model.classes_:", getattr(model, "classes_", None))
    print("model n_features_in_:", getattr(model, "n_features_in_", "NOT FOUND"))
    # if sklearn <1.2 might have attribute, otherwise we show repr
except Exception as e:
    print("Error loading model:", repr(e))

try:
    vec = joblib.load(vec_path)
    print("Loaded vectorizer type:", type(vec))
    vocab = getattr(vec, "vocabulary_", None)
    if vocab is not None:
        print("len(vectorizer.vocabulary_):", len(vocab))
        print("sample vocab keys (first 20):", list(vocab.keys())[:20])
    try:
        names = vec.get_feature_names_out()
        print("len(get_feature_names_out()):", len(names))
    except Exception as e:
        print("get_feature_names_out error:", repr(e))
except Exception as e:
    print("Error loading vectorizer:", repr(e))

print()
print("CSV files in current folder:", [f for f in os.listdir('.') if f.lower().endswith('.csv')])
