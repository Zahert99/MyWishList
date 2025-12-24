import { getClient } from "../db.ts";

export async function getItemsByWishlistId(wishlist_id: number) {
  const client = await getClient();
  if (!client) return [];
  const q = `SELECT * FROM wishlist_items WHERE wishlist_id = $1`;
  const { rows } = await client.query(q, [wishlist_id]);
  await client.end();
  return rows;
}

export async function getItemsByUserId(user_id: number) {
  const client = await getClient();
  if (!client) return [];
  const q = `
   SELECT *
FROM wishlist_items
INNER JOIN wishlists ON wishlist_items.wishlist_id = wishlists.id
WHERE wishlists.user_id = $1;
  `;
  const { rows } = await client.query(q, [user_id]);
  await client.end();
  return rows;
}

export async function createItem({
  wishlist_id,
  item_title,
  price,
  product_link,
}: {
  wishlist_id: number;
  item_title: string;
  price?: number;
  product_link?: string;
}) {
  const client = await getClient();
  if (!client) throw new Error("Database connection failed");
  const q = `
    INSERT INTO wishlist_items (wishlist_id, item_title, price, product_link)
    VALUES ($1, $2, $3, $4)
    RETURNING id, wishlist_id, item_title, price, product_link, created_at
  `;
  const { rows } = await client.query(q, [
    wishlist_id,
    item_title,
    price,
    product_link,
  ]);
  await client.end();
  return rows[0];
}

export async function updateItem(
  id: number,
  {
    item_title,
    price,
    product_link,
  }: { item_title: string; price?: number; product_link?: string }
) {
  const client = await getClient();
  if (!client) throw new Error("Database connection failed");
  const q = `
    UPDATE wishlist_items
    SET item_title = $1, price = $2, product_link = $3
    WHERE id = $4
    RETURNING *
  `;
  const { rows } = await client.query(q, [item_title, price, product_link, id]);
  await client.end();
  return rows[0];
}

export async function deleteItem(id: number) {
  const client = await getClient();
  if (!client) throw new Error("Database connection failed");
  const q = `
    DELETE FROM wishlist_items
    WHERE id = $1
    RETURNING id, wishlist_id, item_title, price, product_link
  `;
  const { rows } = await client.query(q, [id]);
  await client.end();
  return rows[0];
}
