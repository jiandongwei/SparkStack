"use client";

import React, { useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { loadFirebase } from "@/lib/firebaseClient";
import {
  linkWithPopup,
  linkWithCredential,
  unlink as firebaseUnlink,
  EmailAuthProvider,
} from "firebase/auth";

import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";

function providerName(id: string) {
  if (id === "password") return "Email/Password";
  if (id === "google.com") return "Google";
  return id;
}

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (loading) return <Container sx={{ py: 6 }}>Loading...</Container>;
  if (!user) return <Container sx={{ py: 6 }}>Please sign in to view settings.</Container>;

  const providerIds = user.providerData.map((p) => p.providerId);

  const handleLinkGoogle = async () => {
    setMsg(null);
    setBusy(true);
    try {
      const { auth, googleAuthProvider } = await loadFirebase();
      await linkWithPopup(user as any, googleAuthProvider);
      setMsg("Google account linked successfully. Refreshing...");
      setTimeout(() => window.location.reload(), 600);
    } catch (err: any) {
      console.error("Linking failed", err);
      const code = err?.code ?? "unknown";
      if (code === "auth/account-exists-with-different-credential" || code === "auth/credential-already-in-use") {
        setMsg(
          "An account with the same email already exists under a different sign-in method. Sign into that provider first, then link accounts from settings."
        );
      } else {
        setMsg(String(err?.message ?? err));
      }
    } finally {
      setBusy(false);
    }
  };

  const handleLinkEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!user?.email) return setMsg("No email available on your account to link.");
    if (password.length < 6) return setMsg("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setMsg("Passwords do not match.");

    setBusy(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await linkWithCredential(user as any, credential);
      setMsg("Email/password linked successfully. Refreshing...");
      setTimeout(() => window.location.reload(), 600);
    } catch (err: any) {
      console.error("Linking email failed", err);
      const code = err?.code ?? "unknown";
      if (code === "auth/email-already-in-use" || code === "auth/account-exists-with-different-credential") {
        setMsg(
          "An account with this email already exists. Sign into that account and link providers from settings."
        );
      } else {
        setMsg(String(err?.message ?? err));
      }
    } finally {
      setBusy(false);
    }
  };

  const handleUnlink = async (providerId: string) => {
    setMsg(null);
    setBusy(true);
    try {
      await firebaseUnlink(user as any, providerId);
      setMsg("Provider unlinked. Refreshing...");
      setTimeout(() => window.location.reload(), 400);
    } catch (err: any) {
      console.error("Unlink failed", err);
      setMsg(String(err?.message ?? err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Container sx={{ py: 8, flexGrow: 1 }} maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
        Settings
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }} elevation={1}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Connected accounts
        </Typography>

        <Stack spacing={2}>
          {providerIds.length === 0 && <Typography>No linked providers.</Typography>}
          {providerIds.map((pid) => {
            const onlyOne = providerIds.length === 1;
            return (
              <Box key={pid} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 1, border: '1px solid rgba(0,0,0,0.08)', p: 2 }}>
                <Typography>{providerName(pid)}</Typography>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleUnlink(pid)}
                  disabled={busy || onlyOne}
                >
                  Unlink
                </Button>
              </Box>
            );
          })}
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }} elevation={1}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Link providers
        </Typography>
        <Box>
          {!providerIds.includes("google.com") && (
            <Button variant="contained" disabled={busy} onClick={handleLinkGoogle} sx={{ backgroundColor: '#1976d2' }}>
              {busy ? "Working..." : "Link Google"}
            </Button>
          )}
        </Box>
      </Paper>

      {!providerIds.includes("password") && (
        <Paper sx={{ p: 3, mb: 3 }} elevation={1}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Link email/password
          </Typography>

          <Box component="form" onSubmit={handleLinkEmail} sx={{ maxWidth: 480 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>{user.email}</Typography>

            <TextField
              label="Password"
              type="password"
              required
              fullWidth
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Confirm password"
              type="password"
              required
              fullWidth
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Button type="submit" variant="contained" color="success" disabled={busy}>
              {busy ? "Working..." : "Link Email/Password"}
            </Button>
          </Box>
        </Paper>
      )}

      {msg && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {msg}
        </Alert>
      )}
    </Container>
  );
}
