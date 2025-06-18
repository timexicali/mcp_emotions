CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,  -- e.g. 'free_user', 'admin'
    name VARCHAR(100) NOT NULL,
    description TEXT
);