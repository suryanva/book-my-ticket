CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

CREATE TABLE seats (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    isbooked INT DEFAULT 0,
    user_id INT REFERENCES users(id) -- This links seats to your new users table
);

INSERT INTO seats (isbooked)
SELECT 0 FROM generate_series(1, 20);