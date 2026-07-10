"use server";

import { cookies } from "next/headers";
import { z } from "zod";

const credentialsSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export async function loginAdminAction(data: unknown) {
  const result = credentialsSchema.safeParse(data);
  if (!result.success) {
    return { error: "Username and password are required." };
  }

  const { username, password } = result.data;

  const expectedUsername = process.env.ADMIN_USERNAME || "admin";
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedPassword) {
    return { error: "Admin authentication is disabled because ADMIN_PASSWORD is not set." };
  }

  if (username === expectedUsername && password === expectedPassword) {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "authenticated", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400, // 24 hours
    });
    return { success: true };
  }

  return { error: "Invalid admin credentials." };
}

export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return { success: true };
}
