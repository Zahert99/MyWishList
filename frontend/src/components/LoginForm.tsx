import { useState } from "react";
import { Link } from "react-router-dom";
import { PrivacyPolicyScreen } from "../router/Router.tsx";
import type { User, AuthResponse, ApiError, LoginFormProps } from "../types.ts";
import type { FormEvent } from "react";

type Mode = "login" | "register";

export default function LoginForm({
  apiBase = "",
  onLogin,
  isOpen = false,
  onClose,
}: LoginFormProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [policyAgree, setPolicyAgree] = useState(false);

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setMessage(null);
    setMode("login");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const endpoint = mode === "register" ? "/api/users" : "/api/users/login";
      const body =
        mode === "register"
          ? { username, email, password }
          : { username, password };

      console.log("Attempting to:", mode, "at", endpoint);
      console.log("Request body:", { ...body, password: "***" });

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      console.log("Response status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response:", errorText);

        try {
          const errorData = JSON.parse(errorText);
          setMessage(errorData.error || `Fel: ${res.status}`);
        } catch {
          setMessage(`Fel: ${res.status} - ${errorText}`);
        }
        setLoading(false);
        return;
      }

      const data: AuthResponse | ApiError = await res.json();
      console.log("Success response:", data);

      if ("error" in data) {
        setMessage(data.error || "Ett fel uppstod");
      } else {
        if (mode === "register") {
          setMessage("Konto skapat! Logga nu in.");
          setMode("login");
          setUsername("");
          setEmail("");
          setPassword("");
        } else {
          const authData = data as AuthResponse;
          const token = authData.token;

          try {
            if (token) {
              localStorage.setItem("authToken", token);
              console.log("Token saved to localStorage");
            }
          } catch (e) {
            console.warn("Could not persist token to localStorage", e);
          }

          if (onLogin) {
            onLogin(authData.user || ({ username } as User), token);
          }
          setUsername("");
          setPassword("");
          handleClose();
        }
      }
    } catch (err) {
      console.error("Network error:", err);
      setMessage(
        `Nätverksfel: ${err instanceof Error ? err.message : "Okänt fel"}`
      );
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 420,
          width: "90%",
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          position: "relative",
        }}
      >
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "none",
            border: "none",
            fontSize: "1.5rem",
            cursor: "pointer",
            padding: "5px",
          }}
        >
          ×
        </button>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button
            onClick={() => setMode("login")}
            style={{
              flex: 1,
              padding: 8,
              background: mode === "login" ? "#36f" : "#eee",
              color: mode === "login" ? "#fff" : "#000",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Logga in
          </button>
          <button
            onClick={() => setMode("register")}
            style={{
              flex: 1,
              padding: 8,
              background: mode === "register" ? "#36f" : "#eee",
              color: mode === "register" ? "#fff" : "#000",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Registrera
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            {mode === "login" ? "Användarnamn eller Email" : "Användarnamn"}
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              type='text'
              autoComplete={mode === "login" ? "username email" : "username"}
              style={{
                width: "100%",
                padding: 8,
                marginTop: 6,
                marginBottom: 12,
                border: "1px solid #ccc",
                borderRadius: 4,
                boxSizing: "border-box",
              }}
            />
          </label>

          {mode === "register" && (
            <label>
              Email
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete='email'
                style={{
                  width: "100%",
                  padding: 8,
                  marginTop: 6,
                  marginBottom: 12,
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  boxSizing: "border-box",
                }}
              />
            </label>
          )}

          <label>
            Lösenord
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={
                mode === "register" ? "new-password" : "current-password"
              }
              style={{
                width: "100%",
                padding: 8,
                marginTop: 6,
                marginBottom: 12,
                border: "1px solid #ccc",
                borderRadius: 4,
                boxSizing: "border-box",
              }}
            />
          </label>

          {mode === "register" && (
            <label style={{ display: "block", marginBottom: 12 }}>
              <p style={{ fontSize: "0.9rem", color: "#666" }}>
                Vi sparar ditt användarnamn och din e-postadress för att kunna
                hantera ditt konto och dina önskelistor. Läs vår{" "}
                <Link
                  onMouseOver={() => PrivacyPolicyScreen.preload()}
                  to='/policy'
                  style={{ color: "#36f" }}
                >
                  integritetspolicy
                </Link>{" "}
                för mer information
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type='checkbox'
                  checked={policyAgree}
                  onChange={() => setPolicyAgree(!policyAgree)}
                />
                <span>Jag godkänner integritetspolicy.</span>
              </div>
            </label>
          )}

          <button
            type='submit'
            disabled={loading || (mode === "register" && !policyAgree)}
            style={{
              width: "100%",
              padding: 10,
              backgroundColor:
                loading || (mode === "register" && !policyAgree)
                  ? "#ccc"
                  : "#36f",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor:
                loading || (mode === "register" && !policyAgree)
                  ? "not-allowed"
                  : "pointer",
              fontSize: "1rem",
            }}
          >
            {loading
              ? "Väntar..."
              : mode === "login"
              ? "Logga in"
              : "Skapa konto"}
          </button>
        </form>

        {message && (
          <div
            style={{
              marginTop: 12,
              padding: 10,
              background: message.includes("skapat") ? "#d4edda" : "#f8d7da",
              color: message.includes("skapat") ? "#155724" : "#721c24",
              borderRadius: 4,
              fontSize: "0.9rem",
            }}
          >
            {String(message)}
          </div>
        )}
      </div>
    </div>
  );
}
