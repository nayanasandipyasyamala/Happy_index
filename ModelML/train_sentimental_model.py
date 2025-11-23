import joblib
import pandas as pd
import re
import nltk
from nltk.corpus import stopwords
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

nltk.download('stopwords')

slang_dict = {
    "gr8": "great",
    "grt": "great",
    "gud": "good",
    "nyc": "nice",
    "awsm": "awesome",
    "luv": "love",
    "omg": "surprised",
    "lol": "funny",
    "idk": "confused",
    "thx": "thanks",
    "tnx": "thanks",
    "pls": "please",
    "plz": "please",
    "btw": "by the way",
}


def clean_text(text):
    text = text.lower()
    text = re.sub(r"http\S+|www\S+|https\S+", "", text)

    # Slang replacement
    for slang, meaning in slang_dict.items():
        text = text.replace(slang, meaning)

    # Keep only letters & spaces
    text = re.sub(r"[^a-z\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    stop_words = set(stopwords.words("english"))
    text = " ".join([word for word in text.split() if word not in stop_words])

    return text


df = pd.read_csv("sentiment_feedback_data.csv")
print("Dataset loaded!")

df["clean_text"] = df["text"].apply(clean_text)

print("\nSample after preprocessing:")
print(df[["text", "clean_text", "sentiment"]].head())


vectorizer = TfidfVectorizer(max_features=2000)
X = vectorizer.fit_transform(df["clean_text"]).toarray()
y = df["sentiment"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print(f"\nTraining samples: {len(X_train)}")
print(f"Testing samples: {len(X_test)}")

print("\nTraining Logistic Regression...")
log_model = LogisticRegression(max_iter=300)
log_model.fit(X_train, y_train)

log_pred = log_model.predict(X_test)
log_acc = accuracy_score(y_test, log_pred)

print(f"Logistic Regression Accuracy: {log_acc * 100:.2f}%")


print("\nTraining SVM (Linear Kernel)...")
svm_model = SVC(kernel="linear")
svm_model.fit(X_train, y_train)

svm_pred = svm_model.predict(X_test)
svm_acc = accuracy_score(y_test, svm_pred)

print(f"SVM Accuracy: {svm_acc * 100:.2f}%")



if svm_acc >= log_acc:
    best_model = svm_model
    model_name = "svm_model.pkl"
    print("\n🏆 SVM selected as the best model!")
else:
    best_model = log_model
    model_name = "logistic_model.pkl"
    print("\n🏆 Logistic Regression selected as the best model!")

joblib.dump(best_model, f"models/{model_name}")
joblib.dump(vectorizer, "models/tfidf_vectorizer.pkl")

print(f"\n💾 Best model saved as: {model_name}")
print("💾 Vectorizer saved as: tfidf_vectorizer.pkl")

print("\nClassification Report:")
print(classification_report(y_test, best_model.predict(X_test)))

print("Confusion Matrix:")
print(confusion_matrix(y_test, best_model.predict(X_test)))
