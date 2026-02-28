"use client";

import React from "react";
import { loadFirebase } from "@/lib/firebaseClient";
import { signInWithPopup } from "firebase/auth";
import { Button, CircularProgress } from "@mui/material";

export default function GoogleSignInButton() {
  const [loading, setLoading] = React.useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      const { auth, googleAuthProvider } = await loadFirebase();
      const result = await signInWithPopup(auth, googleAuthProvider);
      const idToken = await result.user.getIdToken();

      const res = await fetch("/api/auth/firebase-login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("Server returned error", json);
        alert(json?.error ?? `Server error: ${res.status}`);
        return;
      }

      // Do not automatically redirect after sign-in; the caller will handle navigation
    } catch (err) {
      console.error("Google sign-in failed", err);
      alert("Google sign-in failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      variant="contained"
      size="medium"
      disableElevation
      sx={{ backgroundColor: "#DB4437", color: "#fff", '&:hover': { backgroundColor: '#c33a2f' }, minWidth: 220 }}
    >
      {loading ? <CircularProgress size={20} color="inherit" /> : "Sign in with Google"}
    </Button>
  );
}
