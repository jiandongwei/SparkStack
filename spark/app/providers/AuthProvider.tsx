"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, User } from "firebase/auth";
import { loadFirebase } from "@/lib/firebaseClient";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [fb, setFb] = useState<any>(null);

  useEffect(() => {
    loadFirebase().then((firebase) => {
      setFb(firebase);

      const unsubscribe = onAuthStateChanged(firebase.auth, (u) => {
        setUser(u);
        setLoading(false);
      });

      return () => unsubscribe();
    });
  }, []);

  const signInWithGoogle = async () => {
    if (!fb) return;
    setLoading(true);
    try {
      const result = await signInWithPopup(fb.auth, fb.googleAuthProvider);

      // Exchange Firebase ID token for a secure server session cookie
      const idToken = await result.user.getIdToken();
      await fetch("/api/auth/firebase-login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (!fb) return;
    setLoading(true);
    try {
      // Clear server session cookie
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      await firebaseSignOut(fb.auth);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
