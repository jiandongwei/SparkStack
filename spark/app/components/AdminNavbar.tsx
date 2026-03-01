"use client";
import React from "react";

export default function AdminNavbar() {
  return (
    <nav style={{ marginBottom: 12 }}>
      <a href="/admin" style={{ marginRight: 12 }}>
        Dashboard
      </a>
      <a href="/admin/users" style={{ marginRight: 12 }}>
        Users
      </a>
      <a href="/" style={{ marginRight: 12 }}>
        Home
      </a>
    </nav>
  );
}
