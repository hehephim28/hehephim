-- HeHePhim Database Schema for Cloudflare D1
-- Run with: npx wrangler d1 execute hehephim_db --file=./schema.sql

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

-- Favorites (user <-> movie relationship)
CREATE TABLE IF NOT EXISTS favorites (
  user_id TEXT NOT NULL,
  movie_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, movie_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Watch party rooms metadata
CREATE TABLE IF NOT EXISTS rooms (
  room_id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  movie_id TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
