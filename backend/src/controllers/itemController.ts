import type { Request, Response } from "express";
import * as itemService from "../services/itemService.js";

export async function getItems(req: Request, res: Response) {
  const { wishlist_id } = req.params;
  try {
    const items = await itemService.getItemsByWishlistId(Number(wishlist_id));
    res.status(200).json(items);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ error: "Couldn't fetch items" });
  }
}

export async function getItemsByUser(req: Request, res: Response) {
  const { user_id } = req.params;
  try {
    const items = await itemService.getItemsByUserId(Number(user_id));
    res.status(200).json(items);
  } catch (err) {
    console.error("Error fetching user items:", err);
    res.status(500).json({ error: "Couldn't fetch items for user" });
  }
}

export async function createItem(req: Request, res: Response) {
  const { wishlist_id } = req.params;
  const { item_title, price, product_link } = req.body;
  try {
    const newItem = await itemService.createItem({
      wishlist_id: Number(wishlist_id),
      item_title,
      price,
      product_link,
    });
    res.status(201).json(newItem);
  } catch (err) {
    console.error("Error creating item:", err);
    res.status(500).json({ error: "Couldn't create item" });
  }
}

export async function updateItem(req: Request, res: Response) {
  const { id } = req.params;
  const { item_title, price, product_link } = req.body;
  try {
    const updatedItem = await itemService.updateItem(Number(id), {
      item_title,
      price,
      product_link,
    });
    res.status(200).json(updatedItem);
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).json({ error: "Couldn't update item" });
  }
}

export async function deleteItem(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const deleted = await itemService.deleteItem(Number(id));
    if (!deleted) return res.status(404).json({ error: "Item not found" });
    res.status(200).json(deleted);
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ error: "Couldn't delete item" });
  }
}
