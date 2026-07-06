"use client";

import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(); // Tell Better Auth to destroy the session
    router.push("/login"); // Kick them back to the login page!
  };

  return (
    <button 
      onClick={handleLogout}
      className="text-sm font-medium text-zinc-500 hover:text-red-500 transition-colors"
    >
      Logout
    </button>
  );
}
