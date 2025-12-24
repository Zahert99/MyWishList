import type { Request, Response } from "express";
import * as wishlistService from "../services/wishlistService.ts";

export async function getAllPubLists(_req: Request, res: Response) {
  try {
    const PublicWishlists = await wishlistService.getAllPubWishlists();
    res.json(PublicWishlists);
  } catch (err) {
    console.error(`Couldn't find all public wishlists:`, err);
    res.status(500).json({ error: "failed to find public wishlists" });
  }
}

export async function getListsByUserId(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const privateList = await wishlistService.getUserPrivateWishlists(
      Number(id)
    );
    const publicList = await wishlistService.getUserPubWishlists(Number(id));
    const userLists = [...privateList, ...publicList];
    res.status(200).json(userLists);
  } catch (err) {
    console.error(`Error fetching user's wishlists:`, err);
    res.status(500).json({ error: "Couldn't fetch user's wishlists" });
  }
}

export async function createWishlist(req: Request, res: Response) {
  const { id } = req.params;
  const { list_title, is_private } = req.body;
  try {
    const newList = await wishlistService.createWishlist({
      user_id: Number(id),
      list_title,
      is_private,
    });
    res.status(201).json(newList);
  } catch (err) {
    console.error(`Error Creating wishlist`, err);
    res.status(500).json({ error: `it is not possible to create wishlist` });
  }
}

export async function updateWishlist(req: Request, res: Response) {
  const { id } = req.params;
  const { is_private, list_title } = req.body;
  try {
    const updatedList = await wishlistService.updateWishlist(Number(id), {
      is_private,
      list_title,
    });
    res.status(200).json(updatedList);
  } catch (err) {
    console.error(`Error updating wishlist`, err);
    res.status(500).json({ error: `could't update wishlist` });
  }
}

export async function deleteWishlist(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const deletedWishlist = await wishlistService.deleteWishlist(Number(id));
    if (!deletedWishlist) {
      return res.status(404).json({ error: "wishlist not found" });
    }
    res.status(200).json(deletedWishlist);
  } catch (err) {
    console.error(`Error deleting wishlist`, err);
    res.status(404).json({ error: `Couldn't delete wishlist` });
  }
}
