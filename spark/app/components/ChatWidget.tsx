"use client";

import React, { useEffect, useState } from "react";
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
  const [saved, setSaved] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
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

          <Box sx={{ p: 2, minHeight: 96 }}>
            {saved ? (
              <Typography sx={{ whiteSpace: "pre-wrap" }}>{saved}</Typography>
            ) : user ? (
              <Typography color="text.secondary">No messages yet. Say hello!</Typography>
            ) : (
              <Typography color="text.secondary">Sign in to say hello.</Typography>
            )}
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
