"use server";

import { setSession } from "@/lib/auth/session";
import { verifyUser } from "@/lib/auth/db";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const user = await verifyUser(email, password);
  if (!user) throw new Error("Invalid credentials");

  setSession(user.id);
  redirect("/dashboard");
}
