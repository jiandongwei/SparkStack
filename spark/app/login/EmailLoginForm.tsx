"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { loadFirebase } from "@/lib/firebaseClient";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

export default function EmailLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { auth } = await loadFirebase();
      console.debug("Firebase app options:", (auth as any).app?.options ?? null);
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();
      await fetch("/api/auth/firebase-login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Email sign-in failed", err);
      const code = err?.code ?? err?.status ?? null;
      const message = err?.message ?? String(err);
      alert(code ? `${code}: ${message}` : message);
    } finally {
      setLoading(false);
    }
  };

  const register = async () => {
    setLoading(true);
    try {
      const { auth } = await loadFirebase();
      console.debug("Firebase app options:", (auth as any).app?.options ?? null);
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await userCred.user.getIdToken();
      await fetch("/api/auth/firebase-login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Registration failed", err);
      const code = err?.code ?? err?.status ?? null;
      const message = err?.message ?? String(err);
      alert(code ? `${code}: ${message}` : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={signIn} className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <button type="button" disabled={loading} onClick={register} className="px-4 py-2 bg-gray-600 text-white rounded">
          {loading ? "..." : "Register"}
        </button>
      </div>
    </form>
  );
}
