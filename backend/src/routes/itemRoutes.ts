import express from "express";
import {
  getItems,
  getItemsByUser,
  createItem,
  updateItem,
  deleteItem,
} from "../controllers/itemController.ts";
import requireAuth from "../middleware/auth.ts";

const router = express.Router();

router.get("/wishlist/:wishlist_id", getItems);
router.get("/user/:user_id", requireAuth, getItemsByUser);
router.post("/:wishlist_id", requireAuth, createItem);
router.put("/:id", requireAuth, updateItem);
router.delete("/:id", requireAuth, deleteItem);

export default router;
