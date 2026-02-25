"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const res = await fetch("/api/user", { credentials: "include" });
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (!cancelled) setUserId(data.userId ?? null);
      } catch (err) {
        console.error("Failed to fetch user", err);
        router.push("/login");
      }
    }
    check();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!userId) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome back! Your user id is <strong>{userId}</strong>.</p>
    </div>
  );
}
