"use server";

import { clearSession } from "@/lib/auth/session";

export async function logoutAction() {
  clearSession();
}
