import React from "react";
import GoogleSignInButton from "./GoogleSignInButton";
import EmailLoginForm from "./EmailLoginForm";

export default function LoginPage() {
  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Sign in</h1>

      <div className="space-y-6">
        <EmailLoginForm />
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t" />
          <div className="text-sm text-zinc-500">or</div>
          <div className="flex-1 border-t" />
        </div>
        <GoogleSignInButton />
      </div>
    </div>
  );
}
