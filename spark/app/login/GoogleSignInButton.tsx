"use client";

import React from "react";
import { loadFirebase } from "@/lib/firebaseClient";
import { signInWithPopup } from "firebase/auth";

export default function GoogleSignInButton() {
  const [loading, setLoading] = React.useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      const { auth, googleAuthProvider } = await loadFirebase();
      const result = await signInWithPopup(auth, googleAuthProvider);
      const idToken = await result.user.getIdToken();

      await fetch("/api/auth/firebase-login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Google sign-in failed", err);
      alert("Google sign-in failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="px-4 py-2 bg-red-600 text-white rounded"
    >
      {loading ? "Signing in..." : "Sign in with Google"}
    </button>
  );
}
