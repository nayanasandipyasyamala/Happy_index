import random
import csv
import os

# Number of samples (you can increase this anytime)
num_samples = 300  

# Sentiment distribution (realistic)
dist = {
    "positive": 100,
    "neutral": 130,
    "negative": 70
}

# Topic categories
topics = {
    "canteen": ["canteen", "food court", "mess", "snack corner"],
    "hostel": ["hostel", "dorm", "room", "washroom"],
    "events": ["college fest", "club event", "cultural night", "tech symposium"],
    "transport": ["bus service", "transport", "shuttle", "pickup point"],
    "general": ["college life", "campus", "facilities", "wifi", "library"]
}

# Phrase banks
positive_templates = [
    "I really liked the {topic}! 😄",
    "The {topic} has improved so much recently.",
    "Very satisfied with the {topic} — keep it up!",
    "Loved the atmosphere during the {topic}! ❤️",
    "The {topic} staff were super friendly and helpful.",
    "Honestly, the {topic} exceeded my expectations.",
    "Great job by the management improving the {topic}.",
    "Had an awesome experience with the {topic}.",
    "Everything about the {topic} felt smooth and well-organized.",
    "Kudos to whoever manages the {topic}! 👏"
]

neutral_templates = [
    "The {topic} is okay, nothing much to complain or praise.",
    "It’s fine overall, though {topic} could be better maintained.",
    "Mixed feelings about the {topic}. Some days are good, some aren’t.",
    "The {topic} is manageable. Not great, not bad either.",
    "There’s room for improvement in the {topic}, but it’s fine for now.",
    "Honestly, {topic} seems average to me.",
    "Can’t say much about the {topic}, feels pretty normal.",
    "It’s acceptable. {topic} works as expected.",
    "The {topic} could use slight improvements but it’s not too bad.",
    "The {topic} service isn’t consistent, but nothing major to complain about."
]

negative_templates = [
    "Very disappointed with the {topic}. 😞",
    "The {topic} experience keeps getting worse.",
    "I really hate how the {topic} is managed.",
    "Totally frustrated by the {topic}. Needs serious improvement.",
    "The {topic} service is poor and staff don’t seem to care.",
    "Every time I deal with the {topic}, it’s a bad experience.",
    "Unhappy about the {topic}, nothing ever changes.",
    "The {topic} quality is dropping day by day.",
    "Not satisfied at all with the {topic}. 😠",
    "Wish the management paid more attention to fixing the {topic}."
]

# Slightly longer and multi-sentence additions for realism
extras_positive = [
    "Had doubts at first, but they really improved things.",
    "The new system is faster and more organized.",
    "Would definitely recommend it to other students."
]

extras_neutral = [
    "Not sure how to feel, some parts are fine, some not.",
    "Could go either way depending on the day.",
    "Management is trying, but results aren’t always visible."
]

extras_negative = [
    "It’s been the same issue for months now.",
    "I hope someone actually listens this time.",
    "If this continues, things will only get worse."
]

def create_sentence(template_list, topic_list, extras_list, label, count):
    samples = []
    for _ in range(count):
        topic = random.choice(topic_list)
        base = random.choice(template_list).format(topic=topic)
        
        # 50% chance of adding extra line for realism
        if random.random() < 0.5:
            base += " " + random.choice(extras_list)
        samples.append([base, label])
    return samples


# Generate data for each sentiment
positive_data = create_sentence(positive_templates, sum(topics.values(), []), extras_positive, "positive", dist["positive"])
neutral_data = create_sentence(neutral_templates, sum(topics.values(), []), extras_neutral, "neutral", dist["neutral"])
negative_data = create_sentence(negative_templates, sum(topics.values(), []), extras_negative, "negative", dist["negative"])

# Combine and shuffle all
all_data = positive_data + neutral_data + negative_data
random.shuffle(all_data)

# Output file path (same folder)
filename = "sentiment_feedback_data.csv"
output_path = os.path.join(os.getcwd(), filename)

# Save as CSV
with open(output_path, "w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file)
    writer.writerow(["text", "sentiment"])
    writer.writerows(all_data)

print(f" {len(all_data)} feedback samples generated successfully!")
print(f" Saved to: {output_path}")
