CREATE TABLE languages (
    id SERIAL PRIMARY KEY,
    code VARCHAR(5) UNIQUE NOT NULL,  -- e.g., 'en', 'es', 'fr'
    name VARCHAR(50) NOT NULL         -- e.g., 'English', 'Spanish'
);