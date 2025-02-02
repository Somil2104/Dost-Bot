from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import requests
from typing import List
from transformers import pipeline
from fastapi import Query

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to frontend URL for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
sentiment_analyzer = pipeline("sentiment-analysis")

# Initialize FAISS index
d = 384  # Embedding dimension
index = faiss.IndexFlatL2(d)

journal_entries = []  # Stores journal text
sentiment_entries = []  # Stores sentiment labels

HUGGINGFACE_API_KEY = os.getenv("HF_API_KEY")
MODEL_NAME = "google/flan-t5-large"  # LLM for responses

class JournalEntry(BaseModel):
    text: str

class QueryRequest(BaseModel):
    query: str

@app.get("/get_journals/")
def get_journals():
    """Retrieves all past journal entries along with their sentiment."""
    if not journal_entries:
        raise HTTPException(status_code=404, detail="No journal entries available.")
    
    # Create a list of journal entries and their sentiments
    journal_with_sentiment = [{"text": entry, "sentiment": sentiment} 
                              for entry, sentiment in zip(journal_entries, sentiment_entries)]
    
    return {"journals": journal_with_sentiment}

@app.post("/add_entry/")
def add_entry(entry: JournalEntry):
    """Adds a journal entry and stores its sentiment + embedding."""
    global journal_entries, sentiment_entries

    # Analyze sentiment
    sentiment = sentiment_analyzer(entry.text)[0]['label']
    journal_entries.append(entry.text)
    sentiment_entries.append(sentiment)

    # Store embedding
    embedding = embedding_model.encode([entry.text])
    index.add(np.array(embedding, dtype=np.float32))

    return {"message": "Journal entry added successfully.", "sentiment": sentiment}

@app.get("/get_emotions/")
def query_emotions(query: str = Query(..., description="User query to analyze mood")):
    """Retrieves the mood based on past journal entries."""
    if not journal_entries:
        return {"mood": "neutral"}  # Return neutral if no entries exist

    query_embedding = embedding_model.encode([query])
    _, result_idx = index.search(np.array(query_embedding, dtype=np.float32), k=2)
    
    retrieved_sentiments = [sentiment_entries[i] for i in result_idx[0] if i < len(sentiment_entries)]

    # Determine mood
    if "NEGATIVE" in retrieved_sentiments:
        mood = "NEGATIVE"
    elif "POSITIVE" in retrieved_sentiments:
        mood = "POSITIVE"
    else:
        mood = "NEUTRAL"

    return {"mood": mood}

@app.post("/query/")
def query_journal(request: QueryRequest):
    """Retrieves journal context and generates response."""
    if not journal_entries:
        raise HTTPException(status_code=400, detail="No journal entries available.")

    query_embedding = embedding_model.encode([request.query])
    _, result_idx = index.search(np.array(query_embedding, dtype=np.float32), k=2)

    retrieved_entries = [journal_entries[i] for i in result_idx[0] if i < len(journal_entries)]
    retrieved_sentiments = [sentiment_entries[i] for i in result_idx[0] if i < len(sentiment_entries)]

    # Determine overall mood
    if "NEGATIVE" in retrieved_sentiments:
        mood = "bad"
    elif "POSITIVE" in retrieved_sentiments:
        mood = "good"
    else:
        mood = "neutral"


    if mood == "bad":
        response_style = (
            "It looks like you've had a tough time. I want you to know that setbacks are just part of the journey. "
            "You're stronger than you think, and this moment doesn't define you. "
            "I believe in you, and I know you'll come out of this even better. 💙"
        )
    elif mood == "good":
        response_style = (
            "It sounds like you've had a great time! 🎉 Keep up the good vibes, and don't forget to celebrate your wins. "
            "If there's anything on your mind, I'm always here to chat!"
        )
    else:
        response_style = (
            "Seems like it was an okay day. If there's something on your mind, I'm here to listen. "
            "Let's talk about what's next and how I can help!"
        )
    # Create prompt
    prompt = f"""
    You are a supportive and caring friend. 
    Based on the user’s past journal entries:
    {retrieved_entries}
    The user’s mood is {mood}.
    Response Style: {response_style}
    Now answer this query with warmth and encouragement: {request.query}
    """

    print(prompt)

    # Generate response
    headers = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}
    payload = {"inputs": prompt, "parameters": {"max_new_tokens": 250}}
    
    response = requests.post(f"https://api-inference.huggingface.co/models/{MODEL_NAME}", json=payload, headers=headers)

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail=f"Hugging Face API error: {response.json()}.")

    result = response.json()
    generated_text = result[0]['generated_text'] if isinstance(result, list) else "Error generating response."

    return {"response": generated_text, "mood": mood}
