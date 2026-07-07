"use client";

import Image from "next/image";
import { useState, Suspense } from "react";
import { resetPassword } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const toast = useToast();
  
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }
    if (!password) {
      toast.error("Please enter a new password.");
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await resetPassword({
        newPassword: password,
      });
      
      if (error) {
        toast.error(error.message || "An error occurred");
      } else {
        toast.success("Password updated successfully! You can now log in.");
        router.push("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background text-foreground overflow-hidden px-6">
      
      <div className="w-full max-w-[380px] relative z-10 flex flex-col justify-center">
        
        <div className="w-full flex justify-center mb-8 animate-fade-up delay-0">
          <Image src="/logo.png" alt="I-got-this Logo" width={48} height={48} className="w-12 h-12 object-contain grayscale opacity-90 dark:invert rounded-[12px] overflow-hidden" priority unoptimized />
        </div>

        {/* Heading & Subtitle */}
        <div className="text-center mb-8">
          <h1 className="text-[26px] font-serif tracking-tight text-stone-900 dark:text-stone-100 animate-fade-up delay-100">
            Set new password.
          </h1>
          <p className="text-[13px] text-stone-500 mt-2 animate-fade-up delay-200">
            Make sure it&apos;s a strong one.
          </p>
        </div>

        {/* Email & Password Form */}
        <div className="flex flex-col gap-5 animate-fade-up delay-300">
          
          <div className="flex flex-col relative">
            <label className="text-[11px] uppercase tracking-widest font-semibold text-stone-400 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b border-stone-200 dark:border-stone-800 py-2 text-[14px] text-stone-900 dark:text-stone-100 placeholder:text-stone-300 dark:placeholder:text-stone-700 outline-none focus:border-stone-400 dark:focus:border-stone-600 transition-colors pr-8"
                placeholder=""
                onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
              />
              <button 
                className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleResetPassword}
            disabled={isLoading || !password}
            className="w-full h-11 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-[10px] font-medium text-[14px] hover:bg-stone-800 dark:hover:bg-white transition-colors shadow-sm disabled:opacity-50 mt-1"
          >
            {isLoading ? (
              <span className="animate-pulse">Updating...</span>
            ) : (
              "Update Password"
            )}
          </button>
          
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-background"><span className="animate-pulse">Loading...</span></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
