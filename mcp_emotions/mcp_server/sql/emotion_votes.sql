CREATE TABLE emotion_votes (
    id SERIAL PRIMARY KEY,
    feedback_id BIGINT NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    label VARCHAR NOT NULL,
    score FLOAT NOT NULL,
    vote BOOLEAN NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add indexes for better performance
CREATE INDEX idx_emotion_votes_feedback_id ON emotion_votes(feedback_id);
CREATE INDEX idx_emotion_votes_user_id ON emotion_votes(user_id);
CREATE INDEX idx_emotion_votes_label ON emotion_votes(label);
CREATE INDEX idx_emotion_votes_created_at ON emotion_votes(created_at);

-- Add unique constraint to prevent duplicate votes
CREATE UNIQUE INDEX idx_emotion_votes_unique_vote 
ON emotion_votes(feedback_id, user_id, label);