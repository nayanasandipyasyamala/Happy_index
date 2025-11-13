import pandas as pd
import re
import nltk
from nltk.corpus import stopwords
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer


nltk.download('stopwords')

df = pd.read_csv("sentiment_feedback_data.csv")
print("Data loaded successfully!")
print(df.head())

def clean_text(text):
    text = text.lower()
    text = re.sub(r"http\S+|www\S+|https\S+", '', text)
    text = re.sub(r'[^a-z\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    
    
    stop_words = set(stopwords.words('english'))
    text = ' '.join([word for word in text.split() if word not in stop_words])
    return text


df['clean_text'] = df['text'].apply(clean_text)

print("\n🔹 Sample after cleaning:")
print(df[['text', 'clean_text', 'sentiment']].head())

vectorizer = TfidfVectorizer(max_features=2000)
X = vectorizer.fit_transform(df['clean_text']).toarray()
y = df['sentiment']

from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("\n Preprocessing complete!")
print(f"Training samples: {len(X_train)}, Testing samples: {len(X_test)}")

import joblib
joblib.dump((X_train, X_test, y_train, y_test, vectorizer), "preprocessed_data.pkl")
print(" Preprocessed data saved as 'preprocessed_data.pkl'")
