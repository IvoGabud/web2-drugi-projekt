import pool from './db.js';

const initSQL = `
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sensitive_data (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  username VARCHAR(255),
  password TEXT,
  credit_card TEXT,
  is_encrypted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
CREATE INDEX IF NOT EXISTS idx_sensitive_data_created_at ON sensitive_data(created_at);
`;

export async function initializeDatabase() {
  try {
    console.log('Inicijaliziram bazu podataka...');
    await pool.query(initSQL);
    console.log('Baza podataka uspješno inicijalizirana!');
  } catch (error) {
    console.error('Greška pri inicijalizaciji baze');
  }
}

export default initializeDatabase;
