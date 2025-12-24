import { useState } from "react";
import type { FormEvent, CSSProperties } from "react";
import type { CreateWishlistModalProps, Wishlist } from "../types.ts";

export default function CreateWishlistModal({
  user,
  onClose,
  onCreated,
}: CreateWishlistModalProps) {
  const [title, setTitle] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    if (!token || !user) return;

    const res = await fetch(`/api/wishlists/${user.id}`, {
      method: "POST",
      headers: {
        "content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ list_title: title, is_private: isPrivate }),
    });

    const data: Wishlist = await res.json();

    if (res.ok) {
      onCreated(data);
      onClose();
    }
  }

  return (
    <div onClick={onClose} style={overlay}>
      <div onClick={(e) => e.stopPropagation()} style={modal}>
        <h3>Create Wishlist</h3>
        <form onSubmit={handleSubmit}>
          <input
            placeholder='List title'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: "100%", marginBottom: 12 }}
          />

          <label style={{ display: "flex", gap: 6 }}>
            <input
              type='checkbox'
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            Private
          </label>

          <button type='submit' style={{ width: "100%", marginTop: 12 }}>
            Create
          </button>
        </form>
      </div>
    </div>
  );
}

const overlay: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modal: CSSProperties = {
  background: "#814848ff",
  padding: 18,
  borderRadius: 10,
  minWidth: 300,
};
