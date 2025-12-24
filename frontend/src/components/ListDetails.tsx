import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../context/useAuth.tsx";
import type {
  ListDetailsProps,
  WishlistItem,
  Wishlist,
  User,
} from "../types.ts";

export default function ListDetails({
  list,
  isOpen,
  onClose,
  onCreated,
  onDeleted,
  onUpdated,
}: ListDetailsProps) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editIsPrivate, setEditIsPrivate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingList, setDeletingList] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemLink, setNewItemLink] = useState("");
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editItemTitle, setEditItemTitle] = useState("");
  const [editItemPrice, setEditItemPrice] = useState("");
  const [editItemLink, setEditItemLink] = useState("");

  const { user: currentUser } = useAuth();
  const isOwner = currentUser && list?.user_id === currentUser.id;
  const [newListTitle, setNewListTitle] = useState("");
  const [newListIsPrivate, setNewListIsPrivate] = useState(false);
  const [ownerName, setOwnerName] = useState<string | null>(null);

  const handleSave = async () => {
    if (!list) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/wishlists/${list.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          list_title: editTitle,
          is_private: editIsPrivate,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const updated: Wishlist = await res.json();
      if (onUpdated) onUpdated(updated);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update list", err);
      setError("Kunde inte uppdatera listan");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/wishlist-items/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setItems(items.filter((item) => item.id !== itemId));
    } catch (err) {
      console.error("Failed to delete item", err);
      setError("Kunde inte ta bort föremålet");
    }
  };

  const handleAddItem = async () => {
    if (!list) return;
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/wishlist-items/${list.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          item_title: newItemTitle,
          price: newItemPrice || null,
          product_link: newItemLink || null,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const created: WishlistItem = await res.json();
      setItems((s) => [created, ...s]);
      setNewItemTitle("");
      setNewItemPrice("");
      setNewItemLink("");
    } catch (err) {
      console.error("Failed to add item", err);
      setError("Kunde inte lägga till föremålet");
    }
  };

  const handleStartEditItem = (item: WishlistItem) => {
    setEditingItemId(item.id);
    setEditItemTitle(item.item_title || "");
    setEditItemPrice(item.price?.toString() || "");
    setEditItemLink(item.product_link || "");
  };

  const handleCancelEditItem = () => {
    setEditingItemId(null);
    setEditItemTitle("");
    setEditItemPrice("");
    setEditItemLink("");
  };

  const handleUpdateItem = async (itemId: number) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/wishlist-items/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          item_title: editItemTitle,
          price: editItemPrice || null,
          product_link: editItemLink || null,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated: WishlistItem = await res.json();
      setItems((s) => s.map((it) => (it.id === itemId ? updated : it)));
      handleCancelEditItem();
    } catch (err) {
      console.error("Failed to update item", err);
      setError("Kunde inte uppdatera föremålet");
    }
  };

  useEffect(() => {
    if (isEditing && list) {
      setEditTitle(list.list_title || "");
      setEditIsPrivate(list.is_private || false);
    }
  }, [isEditing, list]);

  useEffect(() => {
    async function fetchItems() {
      if (!isOpen) return;
      if (!list) {
        setItems([]);
        setLoading(false);
        setError(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(`/api/wishlist-items/wishlist/${list.id}`, {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              }
            : { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: WishlistItem[] = await res.json();
        setItems(data || []);
      } catch (err) {
        console.error("Failed to load list items", err);
        setError("Kunde inte ladda föremål");
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, [list, isOpen]);

  useEffect(() => {
    let mounted = true;
    async function fetchOwner() {
      if (!isOpen || !list || list.username) {
        setOwnerName(null);
        return;
      }
      if (!list.user_id) return;
      const token = localStorage.getItem("authToken");
      if (!token) return;
      try {
        const res = await fetch(`/api/users/${list.user_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const user: User = await res.json();
        if (!mounted) return;
        setOwnerName(
          user.username ||
            `${user.firstname || ""} ${user.lastname || ""}`.trim() ||
            null
        );
      } catch (err) {
        console.debug("Could not fetch owner username", err);
        setOwnerName(null);
      }
    }
    fetchOwner();
    return () => {
      mounted = false;
    };
  }, [list, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (!list) {
      setEditingItemId(null);
      setEditItemTitle("");
      setEditItemPrice("");
      setEditItemLink("");
      setNewItemTitle("");
      setNewItemPrice("");
      setNewItemLink("");
    }
  }, [list, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: "var(--surface)",
          borderRadius: 12,
          padding: "1.5rem",
          width: "100%",
          maxWidth: 800,
          maxHeight: "90vh",
          overflow: "auto",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: "1rem",
            top: "1rem",
            display: "flex",
            gap: "1rem",
          }}
        >
          {isOwner && (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                background: "none",
                border: "none",
                fontSize: "1rem",
                cursor: "pointer",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              ✎ Redigera
            </button>
          )}
          {isOwner && (
            <button
              onClick={async () => {
                if (!list) return;
                const ok = window.confirm(
                  "Vill du verkligen ta bort listan? Detta går inte att ångra."
                );
                if (!ok) return;
                setDeletingList(true);
                try {
                  const token = localStorage.getItem("authToken");
                  const res = await fetch(`/api/wishlists/${list.id}`, {
                    method: "DELETE",
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                  });
                  if (!res.ok) throw new Error(`HTTP ${res.status}`);
                  if (onDeleted) onDeleted(list.id);
                  onClose();
                } catch (err) {
                  console.error("Failed to delete wishlist", err);
                  setError("Kunde inte ta bort listan");
                } finally {
                  setDeletingList(false);
                }
              }}
              disabled={deletingList}
              style={{
                background: "none",
                border: "1px solid var(--error, #c00)",
                color: "var(--error, #c00)",
                borderRadius: 6,
                padding: "0.25rem 0.5rem",
                cursor: "pointer",
              }}
            >
              {deletingList ? "Tar bort..." : "Ta bort lista"}
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "var(--text-light)",
              display: "flex",
              alignItems: "center",
            }}
          >
            ×
          </button>
        </div>

        {!list ? (
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ color: "var(--primary)", marginTop: 0 }}>
              Skapa ny lista
            </h2>
            <input
              type='text'
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              placeholder='Listans namn'
              style={{
                width: "100%",
                padding: "0.5rem",
                fontSize: "1.25rem",
                marginBottom: "1rem",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                background: "var(--background)",
                color: "var(--text)",
              }}
            />
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              <input
                type='checkbox'
                checked={newListIsPrivate}
                onChange={(e) => setNewListIsPrivate(e.target.checked)}
              />
              <span style={{ color: "var(--text)" }}>Privat lista</span>
            </label>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={async () => {
                  if (!currentUser) {
                    setError("Du måste vara inloggad för att skapa en lista");
                    return;
                  }
                  setSaving(true);
                  try {
                    const token = localStorage.getItem("authToken");
                    const res = await fetch(
                      `/api/wishlists/${currentUser.id}`,
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                          list_title: newListTitle,
                          is_private: newListIsPrivate,
                        }),
                      }
                    );
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    const created: Wishlist = await res.json();
                    if (onCreated) onCreated(created);
                    setNewListTitle("");
                    setNewListIsPrivate(false);
                  } catch (err) {
                    console.error("Failed to create list", err);
                    setError("Kunde inte skapa listan");
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
                style={{
                  padding: "0.5rem 1rem",
                  background: "var(--primary)",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                {saving ? "Skapar..." : "Skapa lista"}
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: "0.5rem 1rem",
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Avbryt
              </button>
            </div>
          </div>
        ) : isEditing ? (
          <div style={{ marginBottom: "1.5rem" }}>
            <input
              type='text'
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder='Listans namn'
              style={{
                width: "100%",
                padding: "0.5rem",
                fontSize: "1.5rem",
                marginBottom: "1rem",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                background: "var(--background)",
                color: "var(--text)",
              }}
            />
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              <input
                type='checkbox'
                checked={editIsPrivate}
                onChange={(e) => setEditIsPrivate(e.target.checked)}
              />
              <span style={{ color: "var(--text)" }}>Privat lista</span>
            </label>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "0.5rem 1rem",
                  background: "var(--primary)",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                {saving ? "Sparar..." : "Spara ändringar"}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  padding: "0.5rem 1rem",
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Avbryt
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 style={{ color: "var(--primary)", marginTop: 0 }}>
              {list.list_title || "Namnlös lista"}
            </h2>

            <div
              style={{
                fontSize: "0.9rem",
                color: "var(--text-light)",
                marginBottom: "1.5rem",
              }}
            >
              <div>
                Ägare:{" "}
                {list.username || ownerName || `Inget användarnamn hittades`}
              </div>
              <div>Typ: {list.is_private ? "Privat" : "Offentlig"}</div>
              <div>
                Skapad:{" "}
                {list.created_at
                  ? new Date(list.created_at).toLocaleString()
                  : "—"}
              </div>
            </div>
          </>
        )}

        <h3 style={{ color: "var(--primary)" }}>Föremål</h3>

        {loading ? (
          <p>Laddar föremål...</p>
        ) : error ? (
          <p style={{ color: "var(--error, #c00)" }}>{error}</p>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {isOwner && (
              <section
                style={{
                  padding: "0.5rem",
                  background: "var(--background)",
                  borderRadius: 8,
                }}
              >
                <h4 style={{ margin: "0 0 0.5rem", color: "var(--text)" }}>
                  Lägg till föremål
                </h4>
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  <input
                    placeholder='Namn på föremål'
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    style={{ flex: 2, padding: "0.4rem" }}
                  />
                  <input
                    placeholder='Pris'
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    style={{ flex: 1, padding: "0.4rem" }}
                  />
                  <input
                    placeholder='Produktlänk'
                    value={newItemLink}
                    onChange={(e) => setNewItemLink(e.target.value)}
                    style={{ flex: 2, padding: "0.4rem" }}
                  />
                  <button
                    onClick={handleAddItem}
                    style={{
                      padding: "0.4rem 0.6rem",
                      background: "var(--primary)",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                    }}
                  >
                    Lägg till
                  </button>
                </div>
              </section>
            )}

            {items.length === 0 ? (
              <p style={{ color: "var(--text-light)" }}>
                Inga föremål i listan än.
              </p>
            ) : (
              items.map((item) => (
                <article
                  key={item.id}
                  style={{
                    padding: "1rem",
                    background: "var(--background)",
                    borderRadius: 8,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      flex: 1,
                    }}
                  >
                    {editingItemId === item.id ? (
                      <>
                        <input
                          value={editItemTitle}
                          onChange={(e) => setEditItemTitle(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "0.4rem",
                            marginBottom: "0.5rem",
                          }}
                        />
                        <div
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <input
                            value={editItemPrice}
                            onChange={(e) => setEditItemPrice(e.target.value)}
                            placeholder='Pris'
                            style={{ padding: "0.4rem" }}
                          />
                          <input
                            value={editItemLink}
                            onChange={(e) => setEditItemLink(e.target.value)}
                            placeholder='Produktlänk'
                            style={{ padding: "0.4rem", flex: 1 }}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <h4
                          style={{
                            margin: "0 0 0.25rem",
                            color: "var(--text)",
                            textAlign: "left",
                          }}
                        >
                          {item.item_title}
                        </h4>
                        <div
                          style={{
                            fontSize: "0.9rem",
                            color: "var(--text-light)",
                            textAlign: "left",
                          }}
                        >
                          {item.price && <span>Pris: {item.price} kr</span>}
                        </div>
                      </>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      marginLeft: "1rem",
                    }}
                  >
                    {editingItemId === item.id ? (
                      <>
                        <button
                          onClick={() => handleUpdateItem(item.id)}
                          style={{
                            padding: "0.4rem 0.6rem",
                            background: "var(--primary)",
                            color: "white",
                            border: "none",
                            borderRadius: 6,
                          }}
                        >
                          Spara
                        </button>
                        <button
                          onClick={handleCancelEditItem}
                          style={{
                            padding: "0.4rem 0.6rem",
                            border: "1px solid var(--border)",
                            borderRadius: 6,
                          }}
                        >
                          Avbryt
                        </button>
                      </>
                    ) : (
                      <>
                        {item.product_link && (
                          <a
                            href={item.product_link}
                            target='_blank'
                            rel='noopener noreferrer'
                            style={{
                              color: "var(--primary)",
                              textDecoration: "none",
                              fontSize: "0.9rem",
                              padding: "0.4rem 0.75rem",
                              borderRadius: 6,
                              border: "1px solid var(--primary)",
                            }}
                          >
                            Visa produkt →
                          </a>
                        )}
                        {isOwner && (
                          <>
                            <button
                              onClick={() => handleStartEditItem(item)}
                              style={{
                                background: "none",
                                border: "1px solid var(--border)",
                                borderRadius: 6,
                                padding: "0.4rem 0.75rem",
                                cursor: "pointer",
                              }}
                            >
                              Redigera
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              style={{
                                background: "none",
                                border: "1px solid var(--error, #c00)",
                                color: "var(--error, #c00)",
                                borderRadius: 6,
                                padding: "0.4rem 0.75rem",
                                fontSize: "0.9rem",
                                cursor: "pointer",
                              }}
                            >
                              Ta bort
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
