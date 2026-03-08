-- init.sql: run on first container start to create a sample table and data
CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO items (name) VALUES ('example-1') ON CONFLICT DO NOTHING;
