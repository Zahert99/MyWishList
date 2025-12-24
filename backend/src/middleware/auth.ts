import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret";

export function requireAuth(req: any, res: Response, next: NextFunction) {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Missing or invalid Authorization header" });
  }
  const token = auth.split(" ")[1];
  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, username: payload.username };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export default requireAuth;
