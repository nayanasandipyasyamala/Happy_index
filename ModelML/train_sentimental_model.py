import joblib
import pandas as pd
import re
import nltk
from nltk.corpus import stopwords
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

nltk.download('stopwords')

# -------------------------
# Slang dictionary
# -------------------------
slang_dict = {
    "gr8": "great", "grt": "great", "gud": "good", "nyc": "nice",
    "awsm": "awesome", "luv": "love", "omg": "surprised",
    "lol": "funny", "idk": "confused", "thx": "thanks",
    "tnx": "thanks", "pls": "please", "plz": "please",
    "btw": "by the way"
}

# -------------------------
# REMOVE LABEL WORDS FROM TEXT (FIX LEAKAGE)
# -------------------------
def remove_label_leakage(text):
    text = re.sub(r"\bpositive\b", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\bnegative\b", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\bneutral\b", "", text, flags=re.IGNORECASE)
    return text.strip()


# -------------------------
# Clean text function
# -------------------------
def clean_text(text):
    text = text.lower()
    text = remove_label_leakage(text)  # <<<<<<<<<<<<<< IMPORTANT FIX
    text = re.sub(r"http\S+|www\S+|https\S+", "", text)

    # Slang replacement
    for slang, meaning in slang_dict.items():
        text = text.replace(slang, meaning)

    # Keep only letters
    text = re.sub(r"[^a-z\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    stop_words = set(stopwords.words("english"))
    text = " ".join(w for w in text.split() if w not in stop_words)

    return text


# -------------------------
# LOAD DATASET
# -------------------------
df = pd.read_csv("sentiment_feedback_data.csv")
print("Dataset loaded!")
print("Columns found:", df.columns.tolist())

text_col = "text"
label_col = "label"

# REMOVE LABEL LEAKAGE FIRST
df[text_col] = df[text_col].astype(str).apply(remove_label_leakage)

# CLEAN AFTER REMOVAL
df["clean_text"] = df[text_col].apply(clean_text)


# -------------------------
# TRAIN/TEST SPLIT (80/20)
# -------------------------
X = df["clean_text"]
y = df[label_col]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)

print(f"\nTraining samples: {len(X_train)}")
print(f"Testing samples: {len(X_test)}")

# -------------------------
# TF-IDF
# -------------------------
vectorizer = TfidfVectorizer(max_features=3000)
X_train_tfidf = vectorizer.fit_transform(X_train)
X_test_tfidf = vectorizer.transform(X_test)

# -------------------------
# TRAIN SVM
# -------------------------
print("\nTraining SVM...")
svm_model = SVC(kernel="linear", C=0.1, probability=True)
svm_model.fit(X_train_tfidf, y_train)

y_pred = svm_model.predict(X_test_tfidf)
acc = accuracy_score(y_test, y_pred)

print(f"SVM Accuracy: {acc * 100:.2f}%")
print("\nClassification Report:")
print(classification_report(y_test, y_pred))
print("Confusion Matrix:")
print(confusion_matrix(y_test, y_pred))

# -------------------------
# SAVE MODEL
# -------------------------
import os
os.makedirs("models", exist_ok=True)

joblib.dump(svm_model, "models/svm_model.pkl")
joblib.dump(vectorizer, "models/tfidf_vectorizer.pkl")

print("\n💾 Model saved: models/svm_model.pkl")
print("💾 Vectorizer saved: models/tfidf_vectorizer.pkl")
