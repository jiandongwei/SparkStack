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

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in to view settings.</div>;

  const providerIds = user.providerData.map((p) => p.providerId);

  const handleLinkGoogle = async () => {
    setMsg(null);
    setBusy(true);
    try {
      const { auth, googleAuthProvider } = await loadFirebase();
      // Link Google provider to currently signed-in user
      await linkWithPopup(user as any, googleAuthProvider);
      setMsg("Google account linked successfully. Refreshing...");
      // allow AuthProvider to pick up new state
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
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>

      <section className="mb-6">
        <h2 className="text-lg font-medium mb-2">Connected accounts</h2>
        <div className="space-y-2">
          {providerIds.length === 0 && <div>No linked providers.</div>}
          {providerIds.map((pid) => {
            const onlyOne = providerIds.length === 1;
            return (
              <div key={pid} className="flex items-center justify-between border rounded p-3">
                <div>{providerName(pid)}</div>
                <div>
                  <button
                    onClick={() => handleUnlink(pid)}
                    disabled={busy || onlyOne}
                    title={onlyOne ? "Cannot unlink the only connected account" : "Unlink this provider"}
                    className={`px-3 py-1 text-sm rounded ${busy || onlyOne ? "bg-zinc-300 text-zinc-600" : "bg-red-600 text-white"}`}
                  >
                    Unlink
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-medium mb-2">Link providers</h2>
        <div className="flex gap-3">
          {!providerIds.includes("google.com") && (
            <button onClick={handleLinkGoogle} disabled={busy} className="px-4 py-2 bg-blue-600 text-white rounded">
              {busy ? "Working..." : "Link Google"}
            </button>
          )}
        </div>
      </section>

      {!providerIds.includes("password") && (
        <section className="mb-6">
          <h2 className="text-lg font-medium mb-2">Link email/password</h2>
          <form onSubmit={handleLinkEmail} className="space-y-3 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <div className="w-full border rounded px-3 py-2 bg-zinc-50">{user.email}</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                minLength={6}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Confirm password</label>
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                required
                minLength={6}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <button type="submit" disabled={busy} className="px-4 py-2 bg-green-600 text-white rounded">
                {busy ? "Working..." : "Link Email/Password"}
              </button>
            </div>
          </form>
        </section>
      )}

      {msg && <div className="mt-4 p-3 bg-zinc-100 rounded">{msg}</div>}
    </div>
  );
}
