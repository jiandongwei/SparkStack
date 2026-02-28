"use client";

import React, { useState } from "react";
import { loadFirebase } from "@/lib/firebaseClient";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { Box, TextField, Button, Stack, CircularProgress, Alert } from "@mui/material";

export default function EmailLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { auth } = await loadFirebase();
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();
      const res = await fetch("/api/auth/firebase-login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.error ?? `Server error: ${res.status}`);
        return;
      }
    } catch (err: any) {
      console.error("Email sign-in failed", err);
      const message = err?.message ?? String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const register = async () => {
    setError(null);
    setLoading(true);
    try {
      const { auth } = await loadFirebase();
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await userCred.user.getIdToken();
      const res = await fetch("/api/auth/firebase-login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.error ?? `Server error: ${res.status}`);
        return;
      }
    } catch (err: any) {
      console.error("Registration failed", err);
      const message = err?.message ?? String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={signIn} noValidate>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          size="medium"
        />

        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          size="medium"
        />

        <Stack direction="row" spacing={2}>
          <Button type="submit" variant="contained" disabled={loading} size="medium" sx={{ minWidth: 120 }}>
            {loading ? <CircularProgress size={20} color="inherit" /> : "Sign in"}
          </Button>
          <Button type="button" variant="outlined" disabled={loading} onClick={register} size="medium">
            {loading ? <CircularProgress size={20} /> : "Register"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
