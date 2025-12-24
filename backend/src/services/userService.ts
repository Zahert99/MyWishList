import { getClient } from "../db.ts";

export async function getAllUsers() {
  const client = await getClient();
  if (!client) return [];
  const { rows } = await client.query(
    "SELECT id, username, firstname, lastname, email, is_admin FROM users"
  );
  await client.end();
  return rows;
}

export async function getUserById(id: number) {
  const client = await getClient();
  if (!client) return null;
  const { rows } = await client.query("SELECT * FROM users WHERE id = $1", [
    id,
  ]);
  await client.end();
  return rows[0];
}

export async function getUserByUsernameOrEmail(identifier: string) {
  const client = await getClient();
  if (!client) return null;
  try {
    const { rows } = await client.query(
      `SELECT id, username, firstname, lastname, email, is_admin, password_hash
       FROM users
       WHERE username = $1 OR email = $1`,
      [identifier]
    );
    return rows[0];
  } catch (err) {
    console.error("Database error:", err);
    throw err;
  } finally {
    await client.end();
  }
}

export async function createUser({
  username,
  firstname,
  lastname,
  email,
  password_hash,
}: {
  username: string;
  firstname?: string;
  lastname?: string;
  email: string;
  password_hash: string;
}) {
  const client = await getClient();
  if (!client) throw new Error("Database connection failed");
  const q = `
    INSERT INTO users (username, firstname, lastname, email, password_hash)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, username, firstname, lastname, email, is_admin, created_at
  `;
  const { rows } = await client.query(q, [
    username,
    firstname,
    lastname,
    email,
    password_hash,
  ]);
  await client.end();
  return rows[0];
}

export async function updateUser(id: number, updateData: any) {
  const client = await getClient();
  if (!client) throw new Error("Database connection failed");
  const fields = Object.keys(updateData);
  if (fields.length === 0) {
    return getUserById(id);
  }

  const setClauses = fields
    .map((field, index) => `"${field}" = $${index + 1}`)
    .join(", ");
  const values = Object.values(updateData);

  const q = `
    UPDATE users
    SET ${setClauses}
    WHERE id = $${fields.length + 1}
    RETURNING id, username, firstname, lastname, email, is_admin, created_at
  `;

  const { rows } = await client.query(q, [...values, id]);

  await client.end();
  return rows[0];
}

export async function deleteUser(id: number) {
  const client = await getClient();
  if (!client) throw new Error("Database connection failed");
  await client.query("DELETE FROM users WHERE id = $1", [id]);
  await client.end();
  return { success: true };
}
