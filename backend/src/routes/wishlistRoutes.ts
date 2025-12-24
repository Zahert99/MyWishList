import express from "express";
import {
  getAllPubLists,
  getListsByUserId,
  createWishlist,
  updateWishlist,
  deleteWishlist,
} from "../controllers/wishlistController.ts";
import requireAuth from "../middleware/auth.ts";

const router = express.Router();

router.get("/public", getAllPubLists);
router.get("/user/:id", getListsByUserId);
router.post("/:id", requireAuth, createWishlist);
router.post("/me", requireAuth, createWishlist);
router.put("/:id", requireAuth, updateWishlist);
router.delete("/:id", requireAuth, deleteWishlist);

export default router;
