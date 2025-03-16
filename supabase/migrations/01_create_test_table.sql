-- Create a simple table for connection testing
CREATE TABLE IF NOT EXISTS tests (
  id SERIAL PRIMARY KEY,
  status BOOLEAN NOT NULL DEFAULT FALSE
);

-- Insert a test row if none exists
INSERT INTO tests (status)
SELECT FALSE
WHERE NOT EXISTS (SELECT 1 FROM tests); 