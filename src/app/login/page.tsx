"use client";

import { useState } from "react";
import { signIn, signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); 
  
  // 1. The Magic Switch: Are we logging in or creating an account?
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async () => {
    if (isSignUp) {
      // Create a brand new account
      const { error } = await signUp.email({ 
          email: email, 
          password: password, 
          name: name || "Anonymous User" // Fallback if they leave it blank
      });
      if (error) alert(error.message); 
      else router.push("/"); // Send them to the dashboard!
    } else {
      // Log into an existing account
      const { error } = await signIn.email({ 
          email: email, 
          password: password 
      });
      if (error) alert(error.message);
      else router.push("/");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black p-4">
      <div className="w-full max-w-sm p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-md flex flex-col gap-4">
        {/* 2. The title changes based on the switch */}
        <h1 className="text-2xl font-bold text-center">
          {isSignUp ? "Create an Account" : "Welcome Back"}
        </h1>
        
        {/* 3. Conditional Rendering: Only show the Name box if creating an account */}
        {isSignUp && (
          <input 
            type="text" 
            placeholder="Your Name" 
            className="w-full p-2 border rounded-md dark:bg-black dark:border-zinc-800"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        
        <input 
          type="email" 
          placeholder="Email" 
          className="w-full p-2 border rounded-md dark:bg-black dark:border-zinc-800"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <input 
          type="password" 
          placeholder="Password" 
          className="w-full p-2 border rounded-md dark:bg-black dark:border-zinc-800"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <button 
          onClick={handleSubmit}
          className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
        >
          {isSignUp ? "Sign Up" : "Sign In"}
        </button>

        {/* 4. This button flips the switch! */}
        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 mt-2"
        >
          {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
        </button>
      </div>
    </div>
  );
}