import pickle
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.metrics import classification_report, accuracy_score

with open('preprocessed_data.pkl', 'rb') as f:
    data = pickle.load(f)

if isinstance(data, pd.DataFrame):
    df = data
else:
    df = pd.DataFrame(data)

X = df['text']
y = df['label']

vectorizer = TfidfVectorizer(max_features=3000, stop_words='english')
X_vectors = vectorizer.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(X_vectors, y, test_size=0.2, random_state=42)

svm_model = SVC(kernel='linear', C=1.0)
svm_model.fit(X_train, y_train)

y_pred = svm_model.predict(X_test)

print("Model Training Completed")
print("\n🔹 Accuracy:", accuracy_score(y_test, y_pred))
print("\n🔹 Classification Report:\n", classification_report(y_test, y_pred))

with open('sentiment_svm_model.pkl', 'wb') as model_file:
    pickle.dump(svm_model, model_file)

with open('tfidf_vectorizer.pkl', 'wb') as vec_file:
    pickle.dump(vectorizer, vec_file)

print("\nModel and Vectorizer saved successfully.")
