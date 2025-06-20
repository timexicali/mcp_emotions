CREATE TABLE feedback (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    language_id INTEGER REFERENCES languages(id),
    text TEXT NOT NULL,
    predicted_emotions JSONB NOT NULL,
    suggested_emotions TEXT[],
    comment TEXT,
    created_at TIMESTAMP DEFAULT now()
);