# api.py (Python ML service) — put in ModelML/api.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
import traceback
import numpy as np

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(__file__)
MODEL_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "sentiment_model.pkl")
VECT_PATH = os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl")

model = None
vectorizer = None

def safe_load():
    global model, vectorizer
    # load model
    try:
        model = joblib.load(MODEL_PATH)
        print("Loaded model type:", type(model))
        print("model.classes_:", getattr(model, "classes_", None))
        print("model n_features_in_:", getattr(model, "n_features_in_", None))
    except Exception as e:
        print("Failed to load model from", MODEL_PATH, ":", e)
        traceback.print_exc()
        model = None

    # load vectorizer
    try:
        vectorizer = joblib.load(VECT_PATH)
        print("Loaded vectorizer type:", type(vectorizer))
        print("vocab length:", len(getattr(vectorizer, "vocabulary_", {}) ))
    except Exception as e:
        print("Failed to load vectorizer from", VECT_PATH, ":", e)
        traceback.print_exc()
        vectorizer = None

safe_load()

@app.route("/predict", methods=["POST"])
def predict():
    global model, vectorizer
    try:
        if model is None or vectorizer is None:
            return jsonify({"error": "Model or vectorizer not loaded"}), 500

        data = request.get_json(force=True)
        text = data.get("text", "")
        if not text or not text.strip():
            return jsonify({"error": "No text provided"}), 400

        # Vectorize
        X = vectorizer.transform([text])

        # Some models (SVC trained on dense) need dense input — convert safely
        try:
            # if model expects dense (has n_features_in_) and shape mismatch occurs,
            # convert to dense
            X_to_use = X
            if hasattr(model, "n_features_in_") and getattr(model, "n_features_in_") != X.shape[1]:
                # try dense
                X_to_use = X.toarray()
        except Exception:
            X_to_use = X.toarray() if hasattr(X, "toarray") else X

        # predict label
        try:
            pred = model.predict(X_to_use)
            label = str(pred[0])
        except Exception as e_pred:
            # fallback try with dense
            try:
                pred = model.predict(X.toarray())
                label = str(pred[0])
            except Exception as e:
                return jsonify({"error": "prediction failed", "details": str(e)}), 500

        # probabilities if supported
        probabilities = None
        if hasattr(model, "predict_proba"):
            try:
                probs = model.predict_proba(X_to_use)[0]
                classes = model.classes_.tolist()
                probabilities = {cls: float(prob) for cls, prob in zip(classes, probs)}
            except Exception:
                try:
                    probs = model.predict_proba(X.toarray())[0]
                    classes = model.classes_.tolist()
                    probabilities = {cls: float(prob) for cls, prob in zip(classes, probs)}
                except Exception:
                    probabilities = {"info": "predict_proba exists but failed"}

        # if predict_proba not available, attempt to use decision_function for rough scores
        if probabilities is None and hasattr(model, "decision_function"):
            try:
                dec = model.decision_function(X_to_use)
                # for multiclass sklearn returns shape (n_classes,) or (1, n_classes)
                arr = np.array(dec).ravel()
                # normalize to softmax-like scores (not exact probabilities but interpretable)
                exps = np.exp(arr - np.max(arr))
                soft = exps / exps.sum()
                classes = model.classes_.tolist()
                probabilities = {cls: float(p) for cls, p in zip(classes, soft)}
            except Exception:
                probabilities = None

        return jsonify({"label": label, "probabilities": probabilities})

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    # Use 5001 to avoid conflict with Node backend (if any)
    app.run(host="0.0.0.0", port=5001, debug=True)
