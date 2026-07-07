"use client";

import { useState } from "react";
import { deleteUserAccount } from "@/server/actions";

import { useToast } from "@/contexts/ToastContext";
import { authClient } from "@/lib/auth-client";

export default function DangerZone() {
  const [step, setStep] = useState<"IDLE" | "CONFIRM">("IDLE");
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  const handleDelete = async () => {
    if (confirmText !== "DELETE") return;
    
    setIsDeleting(true);
    try {
      await deleteUserAccount();
      // Sign out on the client to clear the session cookie properly
      await authClient.signOut();
      window.location.href = "/login";
    } catch {
      toast.error("Failed to delete account.");
      setIsDeleting(false);
    }
  };

  return (
    <section className="mt-24 mb-16 pt-12 border-t border-red-200/20 dark:border-red-900/20">
      <h2 className="text-[11px] font-sans tracking-[0.15em] uppercase text-red-500 font-bold mb-6 flex items-center gap-4">
        Danger Zone
        <div className="flex-1 h-px bg-red-200/50 dark:bg-red-900/50"></div>
      </h2>
      
      {step === "IDLE" && (
        <button 
          onClick={() => setStep("CONFIRM")}
          className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm font-medium transition-colors"
        >
          Delete Account
        </button>
      )}

      {step === "CONFIRM" && (
        <div className="flex flex-col gap-3 max-w-sm">
          <p className="text-sm text-red-500">This action cannot be undone. Type DELETE to confirm.</p>
          <input 
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="px-4 py-2 bg-red-50 dark:bg-red-950/20 rounded-lg outline-none border border-red-200 dark:border-red-900 text-sm text-red-500 placeholder:text-red-300 dark:placeholder:text-red-700"
            placeholder="DELETE"
          />
          <div className="flex gap-2 mt-2">
            <button 
              onClick={handleDelete}
              disabled={confirmText !== "DELETE" || isDeleting}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-opacity"
            >
              {isDeleting ? "Deleting..." : "Delete Forever"}
            </button>
            <button 
              onClick={() => { setStep("IDLE"); setConfirmText(""); }}
              className="px-4 py-2 text-stone-500 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
