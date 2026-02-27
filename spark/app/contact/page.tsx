"use client";

import * as React from "react";
import { useState } from "react";
import { Container, TextField, Button, Stack, Alert } from "@mui/material";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<null | "sending" | "success" | "error">(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (res.ok) {
        setStatus("success");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <h1>Contact</h1>
          {status === "success" && <Alert severity="success">Message sent.</Alert>}
          {status === "error" && <Alert severity="error">Failed to send message.</Alert>}

          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />

          <TextField
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            multiline
            rows={6}
            fullWidth
          />

          <Button type="submit" variant="contained" disabled={status === "sending"}>
            {status === "sending" ? "Sending…" : "Send Message"}
          </Button>
        </Stack>
      </form>
    </Container>
  );
}
