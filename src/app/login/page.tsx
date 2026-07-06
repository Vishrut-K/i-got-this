"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { signIn, signUp, forgetPassword } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

export default function LoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  
  // State
  const [isSignUp, setIsSignUp] = useState(pathname === "/signup");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  // Refs for autofocus
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, [isSignUp]); // Refocus when switching modes

  const handleEmailAuth = async () => {
    if (!email || !password) return;
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp.email({ 
            email, 
            password, 
            name: name || email.split("@")[0] // Fallback to email prefix if left blank
        });
        if (error) toast.error(error.message || "An error occurred"); 
        else router.replace("/"); 
      } else {
        const { error } = await signIn.email({ 
            email, 
            password 
        });
        if (error) toast.error(error.message || "An error occurred");
        else router.replace("/");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/"
      });
    } catch (error: any) {
      toast.error(error.message || "An error occurred during Google sign in");
      setIsGoogleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address first.");
      emailRef.current?.focus();
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await forgetPassword({
        email: email,
        redirectTo: "/reset-password",
      });
      if (error) {
        toast.error(error.message || "An error occurred");
      } else {
        toast.success("If an account exists, a password reset link has been sent to your email.");
        setIsForgotPassword(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F1EE] text-[#423D33] overflow-hidden px-6 py-8 sm:py-10">
      
      {/* Tiny radial gradient + Noise texture */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent opacity-50" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>
      </div>

      {/* Main Content */}
      <main className="w-full max-w-[380px] flex flex-col z-10 pt-4 pb-12">
        
        <div className="w-full flex justify-center mb-8 animate-fade-up delay-0">
          <Image src="/logo.png" alt="I-got-this Logo" width={44} height={44} className="w-11 h-11 object-contain grayscale opacity-90 rounded-[10px] overflow-hidden shadow-sm" priority unoptimized />
        </div>

        {/* Heading & Subtitle */}
        <div className="text-center mb-8">
          <h1 className="text-[26px] font-serif tracking-tight text-stone-900 animate-fade-up delay-100">
            {isForgotPassword ? "Reset password." : (isSignUp ? "Begin your story." : "Welcome back.")}
          </h1>
          <p className="text-[13px] text-stone-500 mt-2 animate-fade-up delay-200">
            {isForgotPassword ? "We'll send you a link to get back in." : (isSignUp ? "Your future self is waiting." : "Continue becoming.")}
          </p>
        </div>

        {/* Form area depending on mode */}
        {!isForgotPassword ? (
          <>
            {/* Google Button */}
            <div className="animate-fade-up delay-300">
              <button
                onClick={handleGoogleAuth}
                disabled={isGoogleLoading || isLoading}
                className="w-full h-11 flex items-center justify-center gap-3 bg-white border border-stone-200 rounded-[10px] text-stone-900 font-medium text-[14px] hover:bg-stone-50 transition-colors shadow-sm disabled:opacity-50"
              >
                {isGoogleLoading ? (
                  <span className="animate-pulse">Continuing...</span>
                ) : (
                  <>
                    <svg viewBox="0 0 268.152 273.883" className="w-[16px] h-[16px]">
                      <defs>
                        <linearGradient id="a"><stop offset={0} stopColor="#0fbc5c" /><stop offset={1} stopColor="#0cba65" /></linearGradient>
                        <linearGradient id="g"><stop offset=".231" stopColor="#0fbc5f" /><stop offset=".312" stopColor="#0fbc5f" /><stop offset=".366" stopColor="#0fbc5e" /><stop offset=".458" stopColor="#0fbc5d" /><stop offset=".54" stopColor="#12bc58" /><stop offset=".699" stopColor="#28bf3c" /><stop offset=".771" stopColor="#38c02b" /><stop offset=".861" stopColor="#52c218" /><stop offset=".915" stopColor="#67c30f" /><stop offset={1} stopColor="#86c504" /></linearGradient>
                        <linearGradient id="h"><stop offset=".142" stopColor="#1abd4d" /><stop offset=".248" stopColor="#6ec30d" /><stop offset=".312" stopColor="#8ac502" /><stop offset=".366" stopColor="#a2c600" /><stop offset=".446" stopColor="#c8c903" /><stop offset=".54" stopColor="#ebcb03" /><stop offset=".616" stopColor="#f7cd07" /><stop offset=".699" stopColor="#fdcd04" /><stop offset=".771" stopColor="#fdce05" /><stop offset=".861" stopColor="#ffce0a" /></linearGradient>
                        <linearGradient id="f"><stop offset=".316" stopColor="#ff4c3c" /><stop offset=".604" stopColor="#ff692c" /><stop offset=".727" stopColor="#ff7825" /><stop offset=".885" stopColor="#ff8d1b" /><stop offset={1} stopColor="#ff9f13" /></linearGradient>
                        <linearGradient id="b"><stop offset=".231" stopColor="#ff4541" /><stop offset=".312" stopColor="#ff4540" /><stop offset=".458" stopColor="#ff4640" /><stop offset=".54" stopColor="#ff473f" /><stop offset=".699" stopColor="#ff5138" /><stop offset=".771" stopColor="#ff5b33" /><stop offset=".861" stopColor="#ff6c29" /><stop offset={1} stopColor="#ff8c18" /></linearGradient>
                        <linearGradient id="d"><stop offset=".408" stopColor="#fb4e5a" /><stop offset={1} stopColor="#ff4540" /></linearGradient>
                        <linearGradient id="c"><stop offset=".132" stopColor="#0cba65" /><stop offset=".21" stopColor="#0bb86d" /><stop offset=".297" stopColor="#09b479" /><stop offset=".396" stopColor="#08ad93" /><stop offset=".477" stopColor="#0aa6a9" /><stop offset=".568" stopColor="#0d9cc6" /><stop offset=".667" stopColor="#1893dd" /><stop offset=".769" stopColor="#258bf1" /><stop offset=".859" stopColor="#3086ff" /></linearGradient>
                        <linearGradient id="e"><stop offset=".366" stopColor="#ff4e3a" /><stop offset=".458" stopColor="#ff8a1b" /><stop offset=".54" stopColor="#ffa312" /><stop offset=".616" stopColor="#ffb60c" /><stop offset=".771" stopColor="#ffcd0a" /><stop offset=".861" stopColor="#fecf0a" /><stop offset=".915" stopColor="#fecf08" /><stop offset={1} stopColor="#fdcd01" /></linearGradient>
                        <linearGradient href="#a" id="s" x1="219.7" y1="329.535" x2="254.467" y2="329.535" gradientUnits="userSpaceOnUse" />
                        <radialGradient href="#b" id="m" gradientUnits="userSpaceOnUse" gradientTransform="matrix(-1.93688 1.043 1.45573 2.55542 290.525 -400.634)" cx="109.627" cy="135.862" fx="109.627" fy="135.862" r="71.46" />
                        <radialGradient href="#c" id="n" gradientUnits="userSpaceOnUse" gradientTransform="matrix(-3.5126 -4.45809 -1.69255 1.26062 870.8 191.554)" cx="45.259" cy="279.274" fx="45.259" fy="279.274" r="71.46" />
                        <radialGradient href="#d" id="l" cx="304.017" cy="118.009" fx="304.017" fy="118.009" r="47.854" gradientTransform="matrix(2.06435 0 0 2.59204 -297.679 -151.747)" gradientUnits="userSpaceOnUse" />
                        <radialGradient href="#e" id="o" gradientUnits="userSpaceOnUse" gradientTransform="matrix(-.24858 2.08314 2.96249 .33417 -255.146 -331.164)" cx="181.001" cy="177.201" fx="181.001" fy="177.201" r="71.46" />
                        <radialGradient href="#f" id="p" cx="207.673" cy="108.097" fx="207.673" fy="108.097" r="41.102" gradientTransform="matrix(-1.2492 1.34326 -3.89684 -3.4257 880.501 194.905)" gradientUnits="userSpaceOnUse" />
                        <radialGradient href="#g" id="r" gradientUnits="userSpaceOnUse" gradientTransform="matrix(-1.93688 -1.043 1.45573 -2.55542 290.525 838.683)" cx="109.627" cy="135.862" fx="109.627" fy="135.862" r="71.46" />
                        <radialGradient href="#h" id="j" gradientUnits="userSpaceOnUse" gradientTransform="matrix(-.0814 -1.93722 2.92674 -.11625 -215.135 632.86)" cx="154.87" cy="145.969" fx="154.87" fy="145.969" r="71.46" />
                        <filter id="q" x="-.048" y="-.058" width="1.097" height="1.116" colorInterpolationFilters="sRGB"><feGaussianBlur stdDeviation="1.701" /></filter>
                        <filter id="k" x="-.017" y="-.01" width="1.033" height="1.02" colorInterpolationFilters="sRGB"><feGaussianBlur stdDeviation=".242" /></filter>
                        <clipPath clipPathUnits="userSpaceOnUse" id="i"><path d="M371.378 193.24H237.083v53.438h77.167c-1.241 7.563-4.026 15.003-8.105 21.786-4.674 7.773-10.451 13.69-16.373 18.196-17.74 13.498-38.42 16.258-52.783 16.258-36.283 0-67.283-23.286-79.285-54.928-.484-1.149-.805-2.335-1.197-3.507a81.1 81.1 0 0 1-4.101-25.448c0-9.226 1.569-18.057 4.43-26.398 11.285-32.897 42.985-57.467 80.179-57.467 7.481 0 14.685.884 21.517 2.648a77.7 77.7 0 0 1 33.425 18.25l40.834-39.712c-24.839-22.616-57.219-36.32-95.844-36.32-30.878 0-59.386 9.553-82.748 25.7-18.945 13.093-34.483 30.625-44.97 50.985-9.753 18.879-15.094 39.8-15.094 62.294 0 22.495 5.35 43.633 15.103 62.337v.126c10.302 19.857 25.368 36.954 43.678 49.988 15.997 11.386 44.68 26.551 84.031 26.551 22.63 0 42.687-4.051 60.375-11.644 12.76-5.478 24.065-12.622 34.301-21.804 13.525-12.132 24.117-27.139 31.347-44.404s11.097-36.79 11.097-57.957c0-9.858-.998-19.87-2.689-28.968" /></clipPath>
                      </defs>
                      <g clipPath="url(#i)" transform="matrix(.95792 0 0 .98525 -90.174 -78.856)">
                        <path d="M92.076 219.959c.148 22.14 6.501 44.982 16.117 63.423v.127c6.949 13.392 16.445 23.97 27.26 34.452l65.327-23.67c-12.36-6.235-14.246-10.055-23.105-17.026-9.054-9.066-15.802-19.473-20.004-31.677h-.17l.17-.127c-2.765-8.058-3.037-16.613-3.14-25.503Z" fill="url(#j)" filter="url(#k)" />
                        <path d="M237.084 79.025c-6.457 22.526-3.989 44.421 0 57.161 7.456.006 14.638.888 21.449 2.647a77.66 77.66 0 0 1 33.424 18.25l41.88-40.726c-24.81-22.59-54.667-37.296-96.754-37.332" fill="url(#l)" filter="url(#k)" />
                        <path d="M236.943 78.847c-31.67 0-60.91 9.798-84.871 26.359a145.5 145.5 0 0 0-24.332 21.15c-1.904 17.744 14.257 39.551 46.262 39.37 15.528-17.936 38.495-29.542 64.056-29.542l.07.002-1.044-57.335z" fill="url(#m)" filter="url(#k)" />
                        <path d="m341.475 226.379-28.268 19.285c-1.24 7.562-4.028 15.002-8.107 21.786-4.674 7.772-10.45 13.69-16.373 18.196-17.702 13.47-38.328 16.244-52.687 16.255-14.842 25.102-17.444 37.675 1.043 57.934 22.877-.016 43.157-4.117 61.046-11.796 12.931-5.551 24.388-12.792 34.761-22.097 13.706-12.295 24.442-27.503 31.769-45s11.245-37.282 11.245-58.734Z" fill="url(#n)" filter="url(#k)" />
                        <path d="M234.996 191.21v57.498h136.006c1.196-7.874 5.152-18.064 5.152-26.5 0-9.858-.996-21.899-2.687-30.998Z" fill="#3086ff" filter="url(#k)" />
                        <path d="M128.39 124.327c-8.394 9.119-15.564 19.326-21.249 30.364-9.753 18.879-15.094 41.83-15.094 64.324 0 .317.026.627.029.944 4.32 8.224 59.666 6.649 62.456 0-.004-.31-.039-.613-.039-.924 0-9.226 1.57-16.026 4.43-24.367 3.53-10.289 9.056-19.763 16.123-27.926 1.602-2.031 5.875-6.397 7.121-9.016.475-.997-.862-1.557-.937-1.908-.083-.393-1.876-.077-2.277-.37-1.275-.929-3.8-1.414-5.334-1.845-3.277-.921-8.708-2.953-11.725-5.06-9.536-6.658-24.417-14.612-33.505-24.216" fill="url(#o)" filter="url(#k)" />
                        <path d="M162.099 155.857c22.112 13.301 28.471-6.714 43.173-12.977l-25.574-52.664a144.7 144.7 0 0 0-26.543 14.504c-12.316 8.512-23.192 18.9-32.176 30.72Z" fill="url(#p)" filter="url(#q)" />
                        <path d="M171.099 290.222c-29.683 10.641-34.33 11.023-37.062 29.29a145 145 0 0 0 16.792 13.984c15.996 11.386 46.766 26.551 86.118 26.551l.137-.004v-59.157l-.094.002c-14.736 0-26.512-3.843-38.585-10.527-2.977-1.648-8.378 2.777-11.123.799-3.786-2.729-12.9 2.35-16.183-.938" fill="url(#r)" filter="url(#k)" />
                        <path d="M219.7 299.023v59.996c5.506.64 11.236 1.028 17.247 1.028 6.026 0 11.855-.307 17.52-.872v-59.748a105 105 0 0 1-17.477 1.461c-5.932 0-11.7-.686-17.29-1.865" opacity=".5" fill="url(#s)" filter="url(#k)" />
                      </g>
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center my-5 animate-fade-up delay-400">
              <div className="flex-1 h-px bg-stone-200"></div>
              <span className="px-4 text-[11px] uppercase tracking-widest text-stone-400">or</span>
              <div className="flex-1 h-px bg-stone-200"></div>
            </div>
          </>
        ) : null}

        {/* Email & Password Form */}
        <div className="flex flex-col gap-5 animate-fade-up delay-500">
          
          {isSignUp && !isForgotPassword && (
            <div className="flex flex-col animate-fade-up delay-0">
              <label className="text-[11px] uppercase tracking-widest font-semibold text-stone-400 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border-b border-stone-200 py-2 text-[14px] text-stone-900 placeholder:text-stone-300 outline-none focus:border-stone-400 transition-colors"
                placeholder=""
                onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
              />
            </div>
          )}

          <div className="flex flex-col">
            <label className="text-[11px] uppercase tracking-widest font-semibold text-stone-400 mb-1">Email</label>
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-stone-200 py-2 text-[14px] text-stone-900 placeholder:text-stone-300 outline-none focus:border-stone-400 transition-colors"
              placeholder=""
              onKeyDown={(e) => e.key === "Enter" && (isForgotPassword ? handleForgotPassword() : handleEmailAuth())}
            />
          </div>

          {!isForgotPassword && (
            <div className="flex flex-col relative">
              <label className="text-[11px] uppercase tracking-widest font-semibold text-stone-400 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-b border-stone-200 py-2 text-[14px] text-stone-900 placeholder:text-stone-300 outline-none focus:border-stone-400 transition-colors pr-8"
                  placeholder=""
                  onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
                />
                <button 
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              
              {!isSignUp && (
                <div className="flex justify-end mt-2">
                  <button 
                    onClick={() => setIsForgotPassword(true)}
                    className="text-[11px] text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Continue Button */}
          {isForgotPassword ? (
            <button
              onClick={handleForgotPassword}
              disabled={isLoading || !email}
              className="w-full h-11 bg-stone-900 text-white rounded-[10px] font-medium text-[14px] hover:bg-stone-800 transition-colors shadow-sm disabled:opacity-50 mt-1"
            >
              {isLoading ? (
                <span className="animate-pulse">Sending...</span>
              ) : (
                "Send Reset Link"
              )}
            </button>
          ) : (
            <button
              onClick={handleEmailAuth}
              disabled={isLoading || isGoogleLoading || !email || !password || (isSignUp && !name)}
              className="w-full h-11 bg-stone-900 text-white rounded-[10px] font-medium text-[14px] hover:bg-stone-800 transition-colors shadow-sm disabled:opacity-50 mt-1"
            >
              {isLoading ? (
                <span className="animate-pulse">Continuing...</span>
              ) : (
                "Continue"
              )}
            </button>
          )}
          
          {/* Toggle Create Account / Back to login */}
          <div className="flex justify-center mt-1">
            {isForgotPassword ? (
              <button 
                onClick={() => setIsForgotPassword(false)}
                className="text-[13px] font-medium text-stone-500 hover:text-stone-800 transition-colors"
              >
                ← Back to login
              </button>
            ) : (
              <button 
                onClick={() => {
                  const nextIsSignUp = !isSignUp;
                  setIsSignUp(nextIsSignUp);
                  router.replace(nextIsSignUp ? "/signup" : "/login");
                }}
                className="text-[13px] font-medium text-stone-500 hover:text-stone-800 transition-colors"
              >
                {isSignUp ? "Already have an account? Sign in →" : "New here? Create account →"}
              </button>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center z-10 animate-fade-up delay-500 mt-2">
        <p className="text-[11px] text-stone-400">
          Designed to help you become who you want to be.
        </p>
      </footer>

    </div>
  );
}
