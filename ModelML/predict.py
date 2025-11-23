import joblib
import pandas as pd
import re
import nltk
from nltk.corpus import stopwords

nltk.download("stopwords")

slang_dict = {
    "gr8": "great", "grt": "great", "gud": "good", "nyc": "nice",
    "awsm": "awesome", "luv": "love", "lol": "funny", "idk": "confused",
    "omg": "surprised", "thx": "thanks", "pls": "please", "btw": "by the way"
}

def clean_text(text):
    text = text.lower()
    for slang, meaning in slang_dict.items():
        text = text.replace(slang, meaning)
    text = re.sub(r"[^a-z\s]", " ", text)
    text = " ".join(text.split())
    stop_words = set(stopwords.words("english"))
    text = " ".join(w for w in text.split() if w not in stop_words)
    return text

model = joblib.load("models/svm_model.pkl")
vectorizer = joblib.load("models/tfidf_vectorizer.pkl")

user_input = input("Enter feedback: ")
cleaned = clean_text(user_input)

vec = vectorizer.transform([cleaned]).toarray()   # FIXED

prediction = model.predict(vec)[0]

df = pd.DataFrame([[user_input, prediction]], columns=["feedback", "sentiment"])
df.to_csv("predictions.csv", mode="a", header=False, index=False)

print("Predicted Sentiment:", prediction)
