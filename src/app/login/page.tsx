"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { signUp } from "@/lib/auth-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async () => {
  console.log("Sending order to the kitchen...");
  
  // We AWAIT the signup process to finish
  const { data, error } = await signUp.email({ 
      email: email, 
      password: password, 
      name: "My First User" 
  });

  if (error) {
    alert(error.message); // If the kitchen says "no", show an alert
  } else {
    alert("Account created successfully!");
  }
};

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black p-4">
      <div className="w-full max-w-sm p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-md flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-center">Login to i-got-it</h1>
        
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
          onClick={handleSignUp}
          className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}