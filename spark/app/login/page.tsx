"use client";

import React from "react";
import { useAuth } from "../providers/AuthProvider";

export default function LoginPage() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Login</h1>

      {loading && (
        <p className="text-gray-600">Loading...</p>
      )}

      {!loading && user && (
        <div className="space-y-4">
          <p className="text-lg">Signed in as <strong>{user.email}</strong></p>

          <button
            onClick={signOut}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
          >
            Sign out
          </button>
        </div>
      )}

      {!loading && !user && (
        <div>
          <button
            onClick={signInWithGoogle}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
          >
            Sign in with Google
          </button>
        </div>
      )}
    </div>
  );
}
