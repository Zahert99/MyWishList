import express from "express";
import cors from "cors";
import userRoutes from "../src/routes/userRoutes.ts";
import wishlistRoutes from "../src/routes/wishlistRoutes.ts";
import itemRoutes from "../src/routes/itemRoutes.ts";
import { ensureTables } from "./db.ts";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/wishlists", wishlistRoutes);
app.use("/api/wishlist-items", itemRoutes);

ensureTables().then(() => {
  const port = process.env.PORT || 8080;
  app.listen(port, () =>
    console.log(`✅ Server running on http://localhost:${port}`)
  );
});
