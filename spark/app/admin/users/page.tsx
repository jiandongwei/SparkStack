"use client";
import React, { useEffect, useState } from "react";

type User = { uid: string; email?: string | null; displayName?: string | null; admin?: boolean };

export default function AdminUsers() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setUsers(data.users ?? []);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleAdmin(uid: string, makeAdmin: boolean) {
    setError(null);
    try {
      const url = `/api/admin/users/${encodeURIComponent(uid)}`;
      const res = await fetch(url, { method: makeAdmin ? "POST" : "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Request failed");
      // Refresh list
      load();
    } catch (err: any) {
      setError(err?.message ?? String(err));
    }
  }

  return (
    <section>
      <h2>Users</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {users && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8 }}>UID</th>
              <th style={{ textAlign: "left", padding: 8 }}>Email</th>
              <th style={{ textAlign: "left", padding: 8 }}>Name</th>
              <th style={{ textAlign: "left", padding: 8 }}>Admin</th>
              <th style={{ textAlign: "left", padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.uid} style={{ borderTop: "1px solid #eee" }}>
                <td style={{ padding: 8, fontFamily: "monospace" }}>{u.uid}</td>
                <td style={{ padding: 8 }}>{u.email}</td>
                <td style={{ padding: 8 }}>{u.displayName}</td>
                <td style={{ padding: 8 }}>{u.admin ? "Yes" : "No"}</td>
                <td style={{ padding: 8 }}>
                  {u.admin ? (
                    <button onClick={() => toggleAdmin(u.uid, false)}>Remove Admin</button>
                  ) : (
                    <button onClick={() => toggleAdmin(u.uid, true)}>Make Admin</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

