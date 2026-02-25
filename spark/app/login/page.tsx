import React from "react";
import { loginAction } from "./actions";
import GoogleSignInButton from "./GoogleSignInButton";

export default function LoginPage() {
  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Login</h1>

      <form action="/api/auth/login" method="post" className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input name="email" type="email" required className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input name="password" type="password" required className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Log in</button>
        </div>
      </form>

      <div className="mt-4">
        <GoogleSignInButton />
      </div>
    </div>
  );
}
