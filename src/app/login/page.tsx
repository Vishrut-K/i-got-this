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
      const { error } = await signUp.email({ 
          email: email, 
          password: password, 
          name: name || "Anonymous User" 
      });
      if (error) alert(error.message); 
      else router.push("/"); 
    } else {
      const { error } = await signIn.email({ 
          email: email, 
          password: password 
      });
      if (error) alert(error.message);
      else router.push("/");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-stone-800">
      
      {/* Handcrafted Card */}
      <div className="w-full max-w-md p-10 bg-white/60 backdrop-blur-md border border-stone-200/60 rounded-3xl shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] flex flex-col gap-6">
        
        <div className="text-center mb-4">
          <h1 className="text-3xl font-serif text-stone-900 tracking-tight">
            {isSignUp ? "Begin Your Story" : "Welcome Back"}
          </h1>
          <p className="text-stone-500 font-serif italic mt-2">
            {isSignUp ? "A new chapter awaits." : "Pick up where you left off."}
          </p>
        </div>
        
        {isSignUp && (
          <input 
            type="text" 
            placeholder="Your Name" 
            className="w-full p-4 bg-white/40 backdrop-blur-sm border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition-all placeholder:text-stone-400 text-stone-800 shadow-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        
        <input 
          type="email" 
          placeholder="Email Address" 
          className="w-full p-4 bg-white/40 backdrop-blur-sm border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition-all placeholder:text-stone-400 text-stone-800 shadow-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <input 
          type="password" 
          placeholder="Password" 
          className="w-full p-4 bg-white/40 backdrop-blur-sm border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition-all placeholder:text-stone-400 text-stone-800 shadow-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <button 
          onClick={handleSubmit}
          className="w-full mt-2 p-4 bg-stone-800 hover:bg-stone-700 text-stone-50 rounded-xl transition-all shadow-md font-medium uppercase tracking-widest text-sm"
        >
          {isSignUp ? "Create Account" : "Sign In"}
        </button>

        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-stone-400 hover:text-stone-700 transition-colors mt-2 uppercase tracking-wider font-medium"
        >
          {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
        </button>
      </div>
    </div>
  );
}