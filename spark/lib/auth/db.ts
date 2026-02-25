type User = {
  id: string;
  email: string;
};

// Simple demo verifyUser. Replace with real DB lookup in production.
export async function verifyUser(email: string, password: string): Promise<User | null> {
  // Demo credentials
  const demoEmail = "user@example.com";
  const demoPassword = "password";

  console.log("[auth/db] verifyUser called", { email, passwordLength: String(password).length });

  if (email === demoEmail && password === demoPassword) {
    console.log("[auth/db] credentials matched for", email);
    return { id: "1", email };
  }

  console.log("[auth/db] credentials did not match for", email);
  return null;
}
