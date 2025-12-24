import dotenv from "dotenv";
import { Client } from "pg";

dotenv.config();

export async function getClient(): Promise<Client | null> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return null;
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  return client;
}

export async function ensureTables(): Promise<void> {
  const client = await getClient();
  if (!client) {
    console.warn("No DATABASE_URL provided; cannot ensure tables");
    return;
  }

  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      firstname VARCHAR(50),
      lastname VARCHAR(50),
      email VARCHAR(255) UNIQUE,
      password_hash TEXT NOT NULL,
      is_admin BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Migration: Make firstname and lastname optional (if they were previously NOT NULL)
  try {
    await client.query(`
      ALTER TABLE users 
      ALTER COLUMN firstname DROP NOT NULL;
    `);
  } catch (err) {
    // Ignore error if constraint doesn't exist
  }

  try {
    await client.query(`
      ALTER TABLE users 
      ALTER COLUMN lastname DROP NOT NULL;
    `);
  } catch (err) {
    // Ignore error if constraint doesn't exist
  }

  await client.query(`
    CREATE TABLE IF NOT EXISTS wishlists (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      list_title VARCHAR(255) NOT NULL,
      is_private BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS wishlist_items (
      id SERIAL PRIMARY KEY,
      wishlist_id INTEGER REFERENCES wishlists(id) ON DELETE CASCADE,
      item_title VARCHAR(255) NOT NULL,
      price NUMERIC,
      product_link TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await client.end();
}
