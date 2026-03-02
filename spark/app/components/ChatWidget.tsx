"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../providers/AuthProvider";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Fab from "@mui/material/Fab";
import ChatIcon from "@mui/icons-material/ChatBubbleOutline";

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[] | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await fetch("/api/chat", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        if (data) {
          setMessages(Array.isArray(data) ? data : [data]);
          setVisibleCount(Math.min(10, Array.isArray(data) ? data.length : 1));
        }
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
        // Insert new message row to messages list (append to end)
        setMessages((prev) => {
          const arr = prev ? [...prev] : [];
          arr.push(data ?? { message });
          return arr;
        });
        // ensure the newly sent message is visible
        setVisibleCount((c) => Math.min((messages?.length ?? 0) + 1, Math.max(c, 10)));
        setMessage("");
      } else if (res.status === 401) {
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

  const onScroll = () => {
    const el = containerRef.current;
    if (!el || !messages) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 16) {
      if (visibleCount < messages.length) {
        setVisibleCount((c) => Math.min(messages.length, c + 10));
      }
    }
  };

  return (
    <Box sx={{ position: "fixed", right: 20, bottom: 20, zIndex: 1400 }}>
      {open && (
        <Paper
          elevation={6}
          sx={{
            width: 360,
            maxWidth: "calc(100vw - 40px)",
            mb: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.5, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
            <Typography sx={{ fontWeight: 700 }}>Chat</Typography>
            <IconButton size="small" onClick={() => setOpen(false)} aria-label="Close chat">
              ✕
            </IconButton>
          </Box>

          <Box sx={{ p: 0 }}>
            <Box
              ref={containerRef}
              onScroll={onScroll}
              sx={{ p: 2, minHeight: 96, maxHeight: 320, overflow: "auto" }}
            >
              {messages && messages.length > 0 ? (
                messages.slice(0, visibleCount).map((m: any, i: number) => (
                  <Box key={m.id ?? i} sx={{ mb: 1 }}>
                    {m.assistant_message ? (
                      <>
                        <Typography sx={{ whiteSpace: "pre-wrap", mb: 0.5 }}>{m.assistant_message}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                          {m.assistant_model ? `${m.assistant_model}` : "assistant"}
                          {m.assistant_created_at ? ` · ${new Date(m.assistant_created_at).toLocaleString()}` : ""}
                        </Typography>
                        {m.assistant_response && (
                          <details>
                            <summary style={{ cursor: "pointer", color: "rgba(0,0,0,0.6)", fontSize: 12 }}>Response details</summary>
                            <pre style={{ whiteSpace: "pre-wrap", maxHeight: 200, overflow: "auto", fontSize: 12 }}>{JSON.stringify(m.assistant_response, null, 2)}</pre>
                          </details>
                        )}
                      </>
                    ) : (
                      <Typography sx={{ whiteSpace: "pre-wrap" }}>{m.message}</Typography>
                    )}
                  </Box>
                ))
              ) : user ? (
                <Typography color="text.secondary" sx={{ p: 2 }}>No messages yet. Say hello!</Typography>
              ) : (
                <Typography color="text.secondary" sx={{ p: 2 }}>Sign in to say hello.</Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1, p: 1.5, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <TextField
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={user ? "Message to your assistant..." : "Sign in to message"}
              multiline
              minRows={1}
              maxRows={6}
              fullWidth
              disabled={!user}
              size="small"
            />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, alignItems: "stretch" }}>
              <Button variant="contained" onClick={handleSend} disabled={!user || loading} sx={{ minWidth: 88 }}>
                {loading ? <CircularProgress size={18} color="inherit" /> : "Send"}
              </Button>
              <Button variant="text" onClick={() => setOpen(false)} sx={{ fontSize: 12 }}>
                Close
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      <Fab color="primary" size="medium" onClick={() => setOpen((s) => !s)} aria-label="Open chat">
        <ChatIcon />
      </Fab>
    </Box>
  );
}
