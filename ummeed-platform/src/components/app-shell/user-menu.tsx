"use client";

import React from "react";
import { useUser } from "../providers/user-provider";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function UserMenu() {
  const user = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          router.refresh();
        },
      },
    });
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: "0.9rem", fontWeight: "bold" }}>{user.name}</div>
        <div style={{ fontSize: "0.75rem", color: "#666" }}>
          {user.email} • Rating: {user.rating} ({user.role})
        </div>
      </div>
      <button
        onClick={handleLogout}
        style={{
          padding: "0.4rem 0.8rem",
          fontSize: "0.85rem",
          backgroundColor: "#fee2e2",
          color: "#991b1b",
          border: "1px solid #fca5a5",
          borderRadius: "0.25rem",
          cursor: "pointer",
          fontWeight: "500",
        }}
      >
        Logout
      </button>
    </div>
  );
}
