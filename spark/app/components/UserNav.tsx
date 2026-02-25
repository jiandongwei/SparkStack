"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers/AuthProvider";

export default function UserNav() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      router.push("/login");
    }
  };

  if (loading) return null;

  return (
    <div>
      {user ? (
        <button onClick={handleLogout} className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Logout
        </button>
      ) : (
        <Link href="/login" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Login
        </Link>
      )}
    </div>
  );
}
