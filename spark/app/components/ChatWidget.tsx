"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../providers/AuthProvider";

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    // load existing chat for this user
    (async () => {
      try {
        const res = await fetch("/api/chat", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.message) setSaved(data.message);
      } catch (err) {
        // ignore
      }
    })();
  }, [open]);

  const handleSend = async () => {
    if (!message) return;
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (res.ok) {
        const data = await res.json();
        setSaved(data.message ?? message);
        setMessage("");
      } else if (res.status === 401) {
        // user not authenticated
        alert("Please sign in to use chat.");
      } else {
        const txt = await res.text();
        console.error(txt);
        alert("Failed to send message");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        style={{
          position: "fixed",
          right: 20,
          bottom: 20,
          zIndex: 9999,
        }}
      >
        {open && (
          <div
            style={{
              width: 320,
              maxWidth: "calc(100vw - 40px)",
              background: "white",
              boxShadow: "0 6px 24px rgba(0,0,0,0.15)",
              borderRadius: 8,
              marginBottom: 8,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: 12, borderBottom: "1px solid #eee", fontWeight: 600 }}>Chat</div>
            <div style={{ padding: 12, minHeight: 80 }}>
              {saved ? (
                <div style={{ whiteSpace: "pre-wrap" }}>{saved}</div>
              ) : (
                <div style={{ color: "#666" }}>No messages yet. Say hello!</div>
              )}
            </div>
            <div style={{ padding: 12, borderTop: "1px solid #eee", display: "flex", gap: 8 }}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={user ? "Message to your assistant..." : "Sign in to message"}
                style={{ flex: 1, minHeight: 40, resize: "vertical" }}
                disabled={!user}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button onClick={handleSend} disabled={!user || loading} style={{ padding: "8px 12px" }}>
                  Send
                </button>
                <button onClick={() => setOpen(false)} style={{ padding: "6px 12px", fontSize: 12 }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setOpen((s) => !s)}
          aria-label="Open chat"
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            background: "#1976d2",
            color: "white",
            border: "none",
            boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
          }}
        >
          💬
        </button>
      </div>
    </div>
  );
}
