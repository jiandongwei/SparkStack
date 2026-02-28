"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import safeRedirect from "@/lib/navigation";
import { useAuth } from "../providers/AuthProvider";
import Button from "@mui/material/Button";

export default function UserNav({ color, buttonSx }: { color?: string; buttonSx?: any }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      safeRedirect(router, "/login");
    }
  };

  if (loading) return null;

  const baseSx = {
    color: color || "inherit",
    textTransform: "none",
    fontWeight: 600,
    fontSize: "0.95rem",
    px: 1.5,
    borderRadius: 1,
    ...buttonSx,
  };

  return (
    <div>
      {user ? (
        <div className="flex items-center gap-3">
          <Button component={Link} href="/settings" variant="text" sx={baseSx}>
            Settings
          </Button>
          <Button onClick={handleLogout} variant="text" sx={baseSx}>
            Logout
          </Button>
        </div>
      ) : (
        <Button component={Link} href="/login" variant="text" sx={baseSx}>
          Login
        </Button>
      )}
    </div>
  );
}

