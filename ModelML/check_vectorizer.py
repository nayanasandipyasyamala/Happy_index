import joblib, os, traceback
model_p = os.path.join("models", "sentiment_model.pkl")
vec_p   = os.path.join("models", "tfidf_vectorizer.pkl")
print("model_path exists:", os.path.exists(model_p), "->", os.path.abspath(model_p))
print("vectorizer_path exists:", os.path.exists(vec_p), "->", os.path.abspath(vec_p))
print()
try:
    m = joblib.load(model_p)
    print("Loaded model type:", type(m))
    print("model.classes_:", getattr(m, "classes_", None))
    print("model n_features_in_:", getattr(m, "n_features_in_", "NOT FOUND"))
except Exception:
    print("ERROR loading model:")
    traceback.print_exc()

print()
try:
    v = joblib.load(vec_p)
    print("Loaded vectorizer type:", type(v))
    vocab = getattr(v, "vocabulary_", None)
    print("vocab length:", None if vocab is None else len(vocab))
    try:
        names = v.get_feature_names_out()
        print("len(get_feature_names_out()):", len(names))
    except Exception as e:
        print("get_feature_names_out() error:", e)
except Exception:
    print("ERROR loading vectorizer:")
    traceback.print_exc()
