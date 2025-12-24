// Den här komponenten används inte längre i MyPage. komponenten har ersätts av ListDetails.

import { useState, useEffect } from "react";
export default function ManageList({ list, onUpdated, onClose, onDelete }) {
  const [title, setTitle] = useState(list.list_title);
  const [items, setItems] = useState([]);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemLink, setNewItemLink] = useState("");
  const [isPrivate, setIsPrivate] = useState(list.is_private);

  const token = localStorage.getItem("authToken");
  useEffect(() => {
    async function loadItems() {
      const res = await fetch(`/api/wishlist-items/wishlist/${list.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setItems(data || []);
    }
    loadItems();
  }, [list.id, token]);

  async function saveListTitle() {
    const res = await fetch(`/api/wishlists/${list.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ list_title: title, is_private: isPrivate }),
    });
    const updated = await res.json();
    onUpdated(updated);
  }
  async function addItem() {
    if (!newItemTitle.trim()) return;

    const body = {
      item_title: newItemTitle.trim(),
      price: newItemPrice ? Number(newItemPrice) : null,
      product_link: newItemLink || null,
    };

    try {
      const res = await fetch(`/api/wishlist-items/${list.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const createdItem = await res.json();
      setItems((prev) => [...prev, createdItem]);

      setNewItemTitle("");
      setNewItemPrice("");
      setNewItemLink("");
    } catch (err) {
      console.error("Failed to add item:", err);
    }
  }

  async function removeItem(id) {
    await fetch(`/api/wishlist-items/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function deleteList() {
    await fetch(`/api/wishlists/${list.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    onDelete(list.id);
    onClose();
  }
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          color: "var(--text)",
          padding: "1.5rem",
          borderRadius: "10px",
          width: "420px",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <h2>Hantera lista</h2>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: "100%",
            marginBottom: "10px",
            padding: "8px",
            borderRadius: "6px",
            background: "var(--background)",
            color: "var(--text)",
            border: "1px solid var(--text-light)",
          }}
        />
        <button
          onClick={saveListTitle}
          style={{
            background: "var(--primary)",
            color: "#fff",
            padding: "8px 14px",
            borderRadius: "6px",
            marginBottom: "16px",
            cursor: "pointer",
            border: "none",
          }}
        >
          Spara ändringar
        </button>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 12,
          }}
        >
          <input
            type='checkbox'
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
          />
          Privat
        </label>
        <h3>Items</h3>

        {items.length === 0 ? (
          <p style={{ color: "var(--text-light)" }}>Inga items ännu.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              style={{
                background: "var(--background)",
                padding: "8px 10px",
                borderRadius: "6px",
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "6px",
              }}
            >
              <div>
                <div>
                  <p>{item.item_title}</p>
                  {item.price && <p>{item.price} kr</p>}
                  {item.product_link && (
                    <a href={item.product_link}>produkt länk</a>
                  )}
                </div>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                style={{
                  background: "var(--error)",
                  color: "#fff",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Ta bort
              </button>
            </div>
          ))
        )}

        <h4>Lägg till nytt item</h4>
        <input
          placeholder='Titel'
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          style={{ width: "100%", marginBottom: "6px", padding: 8 }}
        />
        <input
          placeholder='Pris (valfritt)'
          value={newItemPrice}
          onChange={(e) => setNewItemPrice(e.target.value)}
          type='number'
          style={{ width: "100%", marginBottom: "6px", padding: 8 }}
        />
        <input
          placeholder='Produktlänk (valfritt)'
          value={newItemLink}
          onChange={(e) => setNewItemLink(e.target.value)}
          style={{ width: "100%", marginBottom: "8px", padding: 8 }}
        />

        <button
          onClick={addItem}
          style={{
            background: "var(--primary)",
            color: "#fff",
            padding: "8px 12px",
            width: "100%",
            borderRadius: "6px",
            border: "none",
            marginBottom: "20px",
          }}
        >
          Lägg till item
        </button>

        <button
          onClick={deleteList}
          style={{
            background: "var(--error)",
            color: "#fff",
            padding: "10px",
            width: "100%",
            borderRadius: "6px",
            border: "none",
            marginBottom: "8px",
          }}
        >
          Ta bort lista
        </button>

        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid var(--text-light)",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          Stäng
        </button>
      </div>
    </div>
  );
}
