import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth.tsx";
import type { FormEvent } from "react";
import type { EditUserProps, User } from "../types.ts";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function EditUser({
  isOpen,
  onClose,
  onUpdated,
  onDeleted,
}: EditUserProps) {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setPassword("");
      setError(null);
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setSaving(true);

    try {
      const body: Record<string, string> = {
        username,
        email,
      };

      if (password) {
        body.password = password;
      }

      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE}/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (onUpdated) onUpdated(data.user || data);
      onClose();
    } catch (err) {
      console.error("Failed to update user", err);
      setError("Kunde inte uppdatera profilen");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    const isConfirmed = window.confirm(
      "Är du säker på att du vill radera ditt konto? Detta kan inte ångras."
    );

    if (!isConfirmed) return;

    setDeleting(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE}/api/users/${user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (onDeleted) onDeleted();
    } catch (err) {
      console.error("Failed to delete user", err);
      setError("Kunde inte radera kontot.");
    } finally {
      setDeleting(false);
    }
  };

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
          maxWidth: 500,
          maxHeight: "90vh",
          overflow: "auto",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            right: "1rem",
            top: "1rem",
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

        <h2 style={{ color: "var(--primary)", marginTop: 0 }}>
          Redigera profil
        </h2>

        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", marginBottom: "1rem" }}>
            <span style={{ color: "var(--text)", fontSize: "0.9rem" }}>
              Användarnamn
            </span>
            <input
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder='Användarnamn'
              autoComplete='username'
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                marginTop: "0.4rem",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                background: "var(--background)",
                color: "var(--text)",
                boxSizing: "border-box",
              }}
            />
          </label>

          <label style={{ display: "block", marginBottom: "1rem" }}>
            <span style={{ color: "var(--text)", fontSize: "0.9rem" }}>
              E-post
            </span>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='E-post'
              autoComplete='email'
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                marginTop: "0.4rem",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                background: "var(--background)",
                color: "var(--text)",
                boxSizing: "border-box",
              }}
            />
          </label>

          <label style={{ display: "block", marginBottom: "1rem" }}>
            <span style={{ color: "var(--text)", fontSize: "0.9rem" }}>
              Nytt lösenord (lämna tomt för att inte ändra)
            </span>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Nytt lösenord'
              autoComplete='new-password'
              style={{
                width: "100%",
                padding: "0.5rem",
                marginTop: "0.4rem",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                background: "var(--background)",
                color: "var(--text)",
                boxSizing: "border-box",
              }}
            />
          </label>

          {error && (
            <div
              style={{
                color: "var(--error, #c00)",
                marginBottom: "1rem",
                padding: "0.5rem",
                backgroundColor: "rgba(200, 0, 0, 0.1)",
                borderRadius: "4px",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              type='submit'
              disabled={saving}
              style={{
                flex: 1,
                padding: "0.5rem 1rem",
                background: "var(--primary)",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {saving ? "Sparar..." : "Spara ändringar"}
            </button>
            <button
              type='button'
              onClick={onClose}
              style={{
                flex: 1,
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

          <div
            style={{
              marginTop: "2rem",
              paddingTop: "1rem",
              borderTop: "1px solid var(--border)",
            }}
          >
            <button
              type='button'
              onClick={handleDelete}
              disabled={deleting}
              style={{
                width: "100%",
                padding: "0.5rem 1rem",
                background: "var(--error, #c00)",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {deleting ? "Raderar konto..." : "Radera konto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
