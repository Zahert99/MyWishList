import type { Request, Response } from "express";
import * as userService from "../services/userService.ts";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function getUsers(req: Request, res: Response) {
  const users = await userService.getAllUsers();
  res.json({ users });
}

export async function getUser(req: Request, res: Response) {
  const user = await userService.getUserById(Number(req.params.id));
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
}

export async function addUser(req: Request, res: Response) {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const user = await userService.createUser({
      username,
      email,
      password_hash,
    });
    res.status(201).json({ user });
  } catch (err: any) {
    console.error("Registration error:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function updateUser(req: Request, res: Response) {
  const { id } = req.params;
  const { password, ...updateData } = req.body;

  if (password) {
    updateData.password_hash = await bcrypt.hash(password, 10);
  }

  try {
    const updatedUser = await userService.updateUser(Number(id), updateData);
    if (!updatedUser) {
      return res
        .status(404)
        .json({ error: `Sorry couldn't update, please try again.` });
    }
    res.json(updatedUser);
  } catch (err) {
    console.error("updateUser error:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
}

export async function removeUser(req: Request, res: Response) {
  await userService.deleteUser(Number(req.params.id));
  res.json({ deleted: true });
}

export async function loginUser(req: Request, res: Response) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username/Email and password are required" });
  }

  try {
    console.log("Attempting login with identifier:", username);
    const user = await userService.getUserByUsernameOrEmail(username);

    if (!user) {
      console.log("User not found");
      return res
        .status(401)
        .json({ error: "Invalid username/email or password" });
    }

    console.log("User found, checking password");
    if (!user.password_hash) {
      console.error("No password hash found for user");
      return res.status(500).json({ error: "Account configuration error" });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    console.log("Password valid:", validPassword);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const { password_hash, ...userWithoutPassword } = user;
    const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret";
    const token = jwt.sign(
      { id: userWithoutPassword.id, username: userWithoutPassword.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ user: userWithoutPassword, token });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}

export async function me(req: any, res: Response) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const user = await userService.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { password_hash, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (err) {
    console.error("/me error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
