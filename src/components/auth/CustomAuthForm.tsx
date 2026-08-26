"use client";

import React, { useState, useEffect, useRef } from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldAlert,
  KeyRound,
  ShieldCheck,
  ArrowLeft,
  UserPlus,
} from "lucide-react";

interface CustomAuthFormProps {
  initialMode?: "login" | "signup" | "forgot_password";
  onSuccess?: () => void;
  isModal?: boolean;
}

// Rate limit thresholds
const MAX_LOGIN_ATTEMPTS = 8;
const MAX_SIGNUP_ATTEMPTS = 6;
const MAX_FORGOT_ATTEMPTS = 5;
const MAX_OTP_VERIFY_ATTEMPTS = 6;
const MAX_OTP_RESENDS = 3;
const COOLDOWN_SECONDS = 60;
const EXTENDED_LOCKOUT_SECONDS = 300; // 5 minutes for excessive spam

export default function CustomAuthForm({
  initialMode = "login",
  onSuccess,
  isModal = false,
}: CustomAuthFormProps) {
  const router = useRouter();
  const clerk = useClerk();

  const [mode, setMode] = useState<"login" | "signup" | "forgot_password">(initialMode);
  const isAuthReady = Boolean(clerk.loaded && clerk.client);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  // Forgot Password specific states
  const [forgotStep, setForgotStep] = useState<1 | 2>(1); // 1 = request code, 2 = enter code & set new password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotCode, setForgotCode] = useState("");

  // Verification step (when Clerk requires email OTP verification for signup or signin / 2FA)
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationStrategy, setVerificationStrategy] = useState<"signup_email" | "signin_email" | "signin_second_factor">("signup_email");

  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Rate Limiting States
  const [authLockout, setAuthLockout] = useState<number>(0); // Cooldown seconds for login/signup/forgot
  const [otpLockout, setOtpLockout] = useState<number>(0); // Cooldown seconds for OTP code submit
  const [resendCooldown, setResendCooldown] = useState<number>(60); // 60s cooldown for OTP resend
  const [resendAttempts, setResendAttempts] = useState<number>(0);

  // Tracking attempt history in-memory for the session
  const loginAttemptsRef = useRef<number[]>([]);
  const signupAttemptsRef = useRef<number[]>([]);
  const forgotAttemptsRef = useRef<number[]>([]);
  const otpVerifyAttemptsRef = useRef<number[]>([]);

  // Timer countdown hook for Auth Lockout
  useEffect(() => {
    if (authLockout <= 0) return;
    const interval = setInterval(() => {
      setAuthLockout((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [authLockout]);

  // Timer countdown hook for OTP Lockout
  useEffect(() => {
    if (otpLockout <= 0) return;
    const interval = setInterval(() => {
      setOtpLockout((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [otpLockout]);

  // Timer countdown hook for Resend Cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Auto-login with Ticket/Token if present in URL
  useEffect(() => {
    if (!clerk.loaded || !clerk.client) return;
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token") || params.get("ticket") || params.get("__clerk_ticket");

    if (token) {
      setLoading(true);
      clerk.client.signIn
        .create({
          strategy: "ticket",
          ticket: token,
        })
        .then(async (res) => {
          if (res.status === "complete" && res.createdSessionId) {
            await clerk.setActive({ session: res.createdSessionId });
            if (onSuccess) onSuccess();
            else router.push("/");
          }
        })
        .catch((err) => {
          console.error("Token sign in error:", err);
          setError(err.errors?.[0]?.message || err.message || "Invalid or expired sign-in token.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [clerk.loaded, clerk.client, router, onSuccess]);

  // Helper: check sliding window attempts
  const recordAndCheckRateLimit = (
    attemptsRef: React.MutableRefObject<number[]>,
    maxAllowed: number,
    windowMs: number = 60_000
  ): { isLimited: boolean; retryAfter: number } => {
    const now = Date.now();
    attemptsRef.current = attemptsRef.current.filter((ts) => now - ts < windowMs);

    if (attemptsRef.current.length >= maxAllowed) {
      const oldest = attemptsRef.current[0];
      const retryAfter = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
      return { isLimited: true, retryAfter };
    }

    attemptsRef.current.push(now);
    return { isLimited: false, retryAfter: 0 };
  };

  // Handle OAuth (Google / Apple)
  const handleOAuth = async (provider: "oauth_google" | "oauth_apple") => {
    if (authLockout > 0) {
      setError(`Rate limit active. Please wait ${authLockout}s before trying again.`);
      return;
    }

    setError(null);
    setOauthLoading(provider === "oauth_google" ? "google" : "apple");

    try {
      if (!clerk.loaded || !clerk.client) return;

      await clerk.client.signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err: any) {
      console.error("OAuth error:", err);
      setError(
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        err.message ||
        "Failed to authenticate with provider."
      );
      setOauthLoading(null);
    }
  };

  // Handle Email Submit (Sign In / Sign Up) with Rate Limiting
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check Lockout
    if (authLockout > 0) {
      setError(`Too many attempts. Please wait ${authLockout} seconds.`);
      return;
    }

    // Rate Limit Check
    if (mode === "signup") {
      const { isLimited, retryAfter } = recordAndCheckRateLimit(
        signupAttemptsRef,
        MAX_SIGNUP_ATTEMPTS,
        60_000
      );
      if (isLimited) {
        setAuthLockout(retryAfter);
        setError(`Too many sign up attempts. Please wait ${retryAfter} seconds before trying again.`);
        return;
      }
    } else {
      const { isLimited, retryAfter } = recordAndCheckRateLimit(
        loginAttemptsRef,
        MAX_LOGIN_ATTEMPTS,
        60_000
      );
      if (isLimited) {
        setAuthLockout(retryAfter);
        setError(`Too many login attempts. Please wait ${retryAfter} seconds before trying again.`);
        return;
      }
    }

    setError(null);
    setInfoMessage(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    if (mode === "signup") {
      if (password.length < 8) {
        setError("Password must be 8 characters or more.");
        setLoading(false);
        return;
      }

      if (!clerk.loaded || !clerk.client) {
        setError("Authentication service is initializing. Please try again in a moment.");
        setLoading(false);
        return;
      }

      try {
        const nameParts = name.trim().split(" ");
        const firstName = nameParts[0] || "User";
        const lastName = nameParts.slice(1).join(" ") || undefined;

        const signUpRes = await clerk.client.signUp.create({
          emailAddress: cleanEmail,
          password: password || undefined,
          firstName,
          lastName,
        });

        if (signUpRes.status === "complete") {
          const sessionId = signUpRes.createdSessionId || clerk.client.signUp.createdSessionId;
          if (sessionId) {
            await clerk.setActive({ session: sessionId });
          }
          if (onSuccess) onSuccess();
          else router.push("/");
          return;
        }

        // Send email verification code
        await clerk.client.signUp.prepareEmailAddressVerification({ strategy: "email_code" });

        setPendingVerification(true);
        setVerificationStrategy("signup_email");
        setResendCooldown(60); // 60s cooldown for first OTP
        setInfoMessage(`We've sent a 6-digit verification code to ${cleanEmail}`);
      } catch (err: any) {
        console.error("Sign up error:", err);
        const firstErr = err.errors?.[0];
        const code = firstErr?.code || "";
        const msg = firstErr?.longMessage || firstErr?.message || err.message || "";

        const isExists =
          code === "form_identifier_exists" ||
          msg.toLowerCase().includes("taken") ||
          msg.toLowerCase().includes("already exists");

        const isPasswordPwnedOrLength =
          code === "form_password_pwned" ||
          code === "form_password_length_too_short" ||
          msg.toLowerCase().includes("breached") ||
          msg.toLowerCase().includes("pwned");

        if (isExists) {
          setError("An account with this email address already exists.");
        } else if (isPasswordPwnedOrLength) {
          setError(
            "This password was flagged by security as commonly breached or too weak. Please use a unique 8+ character password (e.g. Clerx@2026!)."
          );
        } else {
          setError(
            msg ||
            "Unable to create account. Please check your details."
          );
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Login flow
      if (!clerk.loaded || !clerk.client) {
        setError("Authentication service is initializing. Please try again in a moment.");
        setLoading(false);
        return;
      }

      try {
        // 1. Direct Server-Side Auth (Instant, Reliable across Tunnels/Proxies)
        const res = await fetch("/api/auth/sign-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail, password }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.error || "Invalid email or password. Please try again.");
          setLoading(false);
          return;
        }

        // 2. Activate session with generated Clerk ticket
        if (data.token) {
          const ticketRes = await clerk.client.signIn.create({
            strategy: "ticket",
            ticket: data.token,
          });

          if (ticketRes.status === "complete" && ticketRes.createdSessionId) {
            await clerk.setActive({ session: ticketRes.createdSessionId });
            if (onSuccess) onSuccess();
            else {
              router.push("/");
              router.refresh();
            }
            return;
          }
        }
      } catch (err: any) {
        console.error("Direct sign in error, falling back to standard flow:", err);
        try {
          const result = await clerk.client.signIn.create({
            identifier: cleanEmail,
            password: password || undefined,
          });

          if (result.status === "complete") {
            const sessionId = result.createdSessionId || clerk.client.signIn.createdSessionId;
            if (sessionId) {
              await clerk.setActive({ session: sessionId });
            }
            if (onSuccess) onSuccess();
            else router.push("/");
            return;
          }

          if (result.status === "needs_second_factor") {
            const secondFactor: any = result.supportedSecondFactors?.find(
              (factor: any) => factor.strategy === "email_code"
            );
            try {
              await clerk.client.signIn.prepareSecondFactor({
                strategy: "email_code",
                ...(secondFactor?.emailAddressId ? { emailAddressId: secondFactor.emailAddressId } : {}),
              });
            } catch (prepErr) {
              console.warn("prepareSecondFactor fallback:", prepErr);
            }
            setPendingVerification(true);
            setVerificationStrategy("signin_second_factor");
            setResendCooldown(60);
            setInfoMessage(`Security check: a 6-digit code has been sent to ${cleanEmail}`);
            return;
          }
        } catch (fallbackErr: any) {
          console.error("Sign in error:", fallbackErr);
          const firstErr = fallbackErr.errors?.[0];
          const msg = firstErr?.longMessage || firstErr?.message || fallbackErr.message || "";
          setError(msg || "Invalid email or password. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle Verification Code Submit for regular auth
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otpLockout > 0) {
      setError(`Too many incorrect code attempts. Please wait ${otpLockout} seconds.`);
      return;
    }

    if (!verificationCode.trim()) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    // Rate Limit Check for OTP verification submissions
    const { isLimited, retryAfter } = recordAndCheckRateLimit(
      otpVerifyAttemptsRef,
      MAX_OTP_VERIFY_ATTEMPTS,
      60_000
    );
    if (isLimited) {
      setOtpLockout(retryAfter);
      setError(`Too many verification attempts. Please wait ${retryAfter}s before trying again.`);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (!clerk.loaded || !clerk.client) {
        setError("Authentication service is initializing. Please try again.");
        setLoading(false);
        return;
      }

      if (verificationStrategy === "signup_email") {
        const completeSignUp = await clerk.client.signUp.attemptEmailAddressVerification({
          code: verificationCode.trim(),
        });

        if (completeSignUp.status === "complete") {
          const sessionId = completeSignUp.createdSessionId || clerk.client.signUp.createdSessionId;
          if (sessionId) {
            await clerk.setActive({ session: sessionId });
          }
          if (onSuccess) onSuccess();
          else router.push("/");
        } else {
          setError("Verification incomplete. Please check your code and try again.");
        }
      } else if (verificationStrategy === "signin_second_factor") {
        const completeSignIn = await clerk.client.signIn.attemptSecondFactor({
          strategy: "email_code",
          code: verificationCode.trim(),
        });

        if (completeSignIn.status === "complete") {
          const sessionId = completeSignIn.createdSessionId || clerk.client.signIn.createdSessionId;
          if (sessionId) {
            await clerk.setActive({ session: sessionId });
          }
          if (onSuccess) onSuccess();
          else router.push("/");
        } else {
          setError("Sign in incomplete. Please check your code and try again.");
        }
      } else {
        const completeSignIn = await clerk.client.signIn.attemptFirstFactor({
          strategy: "email_code",
          code: verificationCode.trim(),
        });

        if (completeSignIn.status === "complete") {
          const sessionId = completeSignIn.createdSessionId || clerk.client.signIn.createdSessionId;
          if (sessionId) {
            await clerk.setActive({ session: sessionId });
          }
          if (onSuccess) onSuccess();
          else router.push("/");
        } else {
          setError("Sign in incomplete. Please check your code and try again.");
        }
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      const firstErr = err.errors?.[0];
      const code = firstErr?.code || "";
      const msg = firstErr?.longMessage || firstErr?.message || err.message || "";

      const isCodeIncorrect =
        code === "form_code_incorrect" ||
        msg.toLowerCase().includes("incorrect");

      if (isCodeIncorrect) {
        setError("Incorrect verification code. Please check your email and try again.");
      } else {
        setError(
          msg ||
          "Invalid verification code. Please check and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend code handler for regular auth
  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    if (resendAttempts >= MAX_OTP_RESENDS) {
      setResendCooldown(EXTENDED_LOCKOUT_SECONDS); // 5 minutes lockout
      setError("Maximum verification resend limit reached. Please wait 5 minutes.");
      return;
    }

    setError(null);
    setInfoMessage(null);
    setLoading(true);

    try {
      if (!clerk.loaded || !clerk.client) return;

      if (verificationStrategy === "signup_email") {
        await clerk.client.signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      } else if (verificationStrategy === "signin_second_factor") {
        await clerk.client.signIn.prepareSecondFactor({ strategy: "email_code" });
      } else {
        const emailCodeFactor: any = clerk.client.signIn.supportedFirstFactors?.find(
          (factor: any) => factor.strategy === "email_code"
        );
        if (emailCodeFactor && emailCodeFactor.emailAddressId) {
          await clerk.client.signIn.prepareFirstFactor({
            strategy: "email_code",
            emailAddressId: emailCodeFactor.emailAddressId,
          });
        }
      }

      setResendAttempts((prev) => prev + 1);
      setResendCooldown(COOLDOWN_SECONDS); // Restart 60s cooldown
      setInfoMessage("A fresh 6-digit verification code has been sent.");
    } catch (err: any) {
      setError(err.errors?.[0]?.message || err.message || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // FORGOT PASSWORD HANDLERS (Email-only accounts)
  // -------------------------------------------------------------

  // Step 1: Request Password Reset Code
  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (authLockout > 0) {
      setError(`Too many reset attempts. Please wait ${authLockout} seconds.`);
      return;
    }

    const { isLimited, retryAfter } = recordAndCheckRateLimit(
      forgotAttemptsRef,
      MAX_FORGOT_ATTEMPTS,
      60_000
    );
    if (isLimited) {
      setAuthLockout(retryAfter);
      setError(`Too many password reset requests. Please wait ${retryAfter}s before trying again.`);
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Please enter your account email address.");
      return;
    }

    setError(null);
    setInfoMessage(null);
    setLoading(true);

    try {
      if (!clerk.loaded || !clerk.client) {
        setError("Authentication service is initializing. Please wait a moment.");
        setLoading(false);
        return;
      }

      // Initialize sign in to find supported factors
      const signInAttempt = await clerk.client.signIn.create({
        identifier: cleanEmail,
      });

      // Find the reset_password_email_code factor (only exists for password-based email users)
      const resetFactor: any = signInAttempt.supportedFirstFactors?.find(
        (ff: any) => ff.strategy === "reset_password_email_code"
      );

      if (!resetFactor || !resetFactor.emailAddressId) {
        setError(
          "Password reset is only available for accounts created with email and password. If you signed up with Google or Apple, please use social login."
        );
        setLoading(false);
        return;
      }

      // Send the reset code OTP to email
      await clerk.client.signIn.prepareFirstFactor({
        strategy: "reset_password_email_code",
        emailAddressId: resetFactor.emailAddressId,
      });

      setForgotStep(2);
      setResendCooldown(60);
      setResendAttempts(0);
      setInfoMessage(`We've sent a 6-digit password reset code to ${cleanEmail}`);
    } catch (err: any) {
      console.error("Forgot password request error:", err);
      const isNotFound =
        err.errors?.[0]?.code === "form_identifier_not_found" ||
        err.message?.toLowerCase().includes("not found") ||
        err.errors?.[0]?.message?.toLowerCase().includes("not found");

      if (isNotFound) {
        setError(`No account found with ${cleanEmail}.`);
      } else {
        setError(
          err.errors?.[0]?.longMessage ||
          err.errors?.[0]?.message ||
          err.message ||
          "Unable to send reset code. Please check your email and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit Reset Code & New Password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otpLockout > 0) {
      setError(`Too many attempts. Please wait ${otpLockout} seconds.`);
      return;
    }

    if (!forgotCode.trim()) {
      setError("Please enter the 6-digit verification code sent to your email.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please verify your new password.");
      return;
    }

    const { isLimited, retryAfter } = recordAndCheckRateLimit(
      otpVerifyAttemptsRef,
      MAX_OTP_VERIFY_ATTEMPTS,
      60_000
    );
    if (isLimited) {
      setOtpLockout(retryAfter);
      setError(`Too many code attempts. Please wait ${retryAfter}s before trying again.`);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (!clerk.loaded || !clerk.client) {
        setError("Authentication service is initializing. Please wait.");
        setLoading(false);
        return;
      }

      const result = await clerk.client.signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: forgotCode.trim(),
        password: newPassword,
      });

      if (result.status === "complete" && result.createdSessionId) {
        await clerk.setActive({ session: result.createdSessionId });
        if (onSuccess) onSuccess();
        else router.push("/");
      } else if (result.status === "needs_second_factor") {
        setError("2-Factor Authentication required. Please check your authenticator app.");
      } else {
        setError("Password reset incomplete. Please try again.");
      }
    } catch (err: any) {
      console.error("Reset password submit error:", err);
      const isPwned =
        err.errors?.[0]?.code === "form_password_pwned" ||
        err.errors?.[0]?.code === "form_password_length_too_short" ||
        err.errors?.[0]?.longMessage?.toLowerCase().includes("breached") ||
        err.message?.toLowerCase().includes("breached");

      if (isPwned) {
        setError(
          "This password was flagged by security as commonly breached. Please choose a more secure password."
        );
      } else {
        setError(
          err.errors?.[0]?.longMessage ||
          err.errors?.[0]?.message ||
          err.message ||
          "Invalid reset code or password. Please verify and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend code handler for forgot password
  const handleResendResetCode = async () => {
    if (resendCooldown > 0) return;

    if (resendAttempts >= MAX_OTP_RESENDS) {
      setResendCooldown(EXTENDED_LOCKOUT_SECONDS);
      setError("Maximum reset resend limit reached. Please wait 5 minutes.");
      return;
    }

    setError(null);
    setInfoMessage(null);
    setLoading(true);

    try {
      if (!clerk.loaded || !clerk.client) return;

      const cleanEmail = email.trim().toLowerCase();
      const signInAttempt = await clerk.client.signIn.create({
        identifier: cleanEmail,
      });

      const resetFactor: any = signInAttempt.supportedFirstFactors?.find(
        (ff: any) => ff.strategy === "reset_password_email_code"
      );

      if (resetFactor?.emailAddressId) {
        await clerk.client.signIn.prepareFirstFactor({
          strategy: "reset_password_email_code",
          emailAddressId: resetFactor.emailAddressId,
        });

        setResendAttempts((prev) => prev + 1);
        setResendCooldown(COOLDOWN_SECONDS);
        setInfoMessage("A fresh 6-digit reset code has been sent to your email.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to resend reset code.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // RENDER: Forgot Password Flow
  // -------------------------------------------------------------
  if (mode === "forgot_password") {
    return (
      <div className="w-full max-w-sm mx-auto space-y-5">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 text-white">
            {forgotStep === 1 ? (
              <KeyRound className="w-6 h-6 text-white" />
            ) : (
              <ShieldCheck className="w-6 h-6 text-white" />
            )}
          </div>

          <h2 className="text-2xl font-bold text-white tracking-tight">
            {forgotStep === 1 ? "Reset your password" : "Create new password"}
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
            {forgotStep === 1
              ? "Enter your account email and we'll send you a 6-digit reset code."
              : infoMessage || `Enter the 6-digit code sent to ${email} and choose a new password.`}
          </p>
        </div>

        {/* Error / Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Info Message */}
        {infoMessage && forgotStep === 1 && (
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Lockout Notification Banner */}
        {authLockout > 0 && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 animate-pulse" />
            <span>Too many attempts. Security cooldown active: {authLockout}s remaining.</span>
          </div>
        )}

        {/* Step 1: Request Email Code */}
        {forgotStep === 1 ? (
          <form onSubmit={handleRequestResetCode} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  autoFocus
                  disabled={authLockout > 0 || loading}
                  className="w-full bg-[#111111] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50"
                />
              </div>
              <p className="text-[11px] text-neutral-500 mt-1.5 leading-relaxed">
                Only for accounts registered with email & password. Social logins (Google/Apple) sign in directly.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || authLockout > 0 || !email.trim()}
              className="w-full py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs sm:text-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Sending code...</span>
                </>
              ) : authLockout > 0 ? (
                <span>Wait {authLockout}s</span>
              ) : (
                <>
                  <span>Send Reset Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Step 2: Code + New Password */
          <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                6-Digit Reset Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={forgotCode}
                onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, ""))}
                placeholder="••••••"
                autoFocus
                required
                disabled={otpLockout > 0 || loading}
                className="w-full bg-[#111111] border border-white/10 rounded-xl py-2.5 px-4 text-center text-xl font-mono tracking-[0.3em] text-white placeholder-neutral-600 focus:outline-none focus:border-white/40 transition-colors disabled:opacity-40"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                New Password (min. 8 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  disabled={loading}
                  className="w-full bg-[#111111] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  minLength={8}
                  disabled={loading}
                  className="w-full bg-[#111111] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || forgotCode.length < 6 || newPassword.length < 8 || otpLockout > 0}
              className="w-full mt-2 py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs sm:text-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Resetting password...</span>
                </>
              ) : otpLockout > 0 ? (
                <span>Locked ({otpLockout}s)</span>
              ) : (
                <>
                  <span>Reset Password & Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Resend Code & Back link */}
            <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={handleResendResetCode}
                disabled={resendCooldown > 0 || loading}
                className="hover:text-white transition-colors cursor-pointer disabled:text-neutral-600 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {resendCooldown > 0 ? (
                  <>
                    <Clock className="w-3.5 h-3.5" />
                    <span>Resend in {resendCooldown}s</span>
                  </>
                ) : (
                  <span>Resend code</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setForgotStep(1);
                  setForgotCode("");
                  setError(null);
                }}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Change email
              </button>
            </div>
          </form>
        )}

        {/* Back to Login Link */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setForgotStep(1);
              setError(null);
              setInfoMessage(null);
            }}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </button>
        </div>

        <div id="clerk-captcha" />
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Email Verification Step (for signup / signin factor)
  // -------------------------------------------------------------
  if (pendingVerification) {
    return (
      <div className="w-full max-w-sm mx-auto space-y-5 text-center">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white">
          <CheckCircle2 className="w-6 h-6 text-white" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Verify your email</h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
            {infoMessage || `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {otpLockout > 0 && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2 text-left">
            <Clock className="w-4 h-4 shrink-0 animate-pulse" />
            <span>Too many attempts. Cooldown: {otpLockout}s</span>
          </div>
        )}

        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div>
            <input
              type="text"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
              placeholder="••••••"
              autoFocus
              required
              disabled={otpLockout > 0 || loading}
              className="w-full bg-[#111111] border border-white/10 rounded-2xl py-3 px-4 text-center text-2xl font-mono tracking-[0.4em] text-white placeholder-neutral-600 focus:outline-none focus:border-white/40 transition-colors disabled:opacity-40"
            />
          </div>

          <button
            type="submit"
            disabled={loading || verificationCode.length < 4 || otpLockout > 0}
            className="w-full py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : otpLockout > 0 ? (
              <span>Locked ({otpLockout}s)</span>
            ) : (
              <>
                <span>Verify & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Resend Code with Live Cooldown Timer */}
        <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resendCooldown > 0 || loading}
            className="hover:text-white transition-colors cursor-pointer disabled:text-neutral-600 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {resendCooldown > 0 ? (
              <>
                <Clock className="w-3.5 h-3.5" />
                <span>Resend in {resendCooldown}s</span>
              </>
            ) : (
              <span>Resend code</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setPendingVerification(false);
              setVerificationCode("");
              setError(null);
            }}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Back to {mode === "signup" ? "sign up" : "login"}
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Main Auth Screen (Login / Signup)
  // -------------------------------------------------------------
  return (
    <div className="w-full max-w-sm mx-auto space-y-5">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          {mode === "signup"
            ? "Sign up to sync your chat sessions and workspace"
            : "Sign in to access your intelligence workspace"}
        </p>
      </div>

      {/* Error / Alert message */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
          {(error.includes("No account found") || error.toLowerCase().includes("not found")) && mode === "login" && (
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
              className="mt-1 ml-6 inline-flex items-center gap-1.5 text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg font-semibold cursor-pointer text-xs w-fit transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account with {email ? email : "this email"} &rarr;</span>
            </button>
          )}
          {(error.includes("already exists") || error.toLowerCase().includes("taken")) && mode === "signup" && (
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className="mt-1 ml-6 inline-flex items-center gap-1.5 text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg font-semibold cursor-pointer text-xs w-fit transition-colors"
            >
              <span>Log in to your account instead &rarr;</span>
            </button>
          )}
        </div>
      )}

      {/* Lockout Notification Banner */}
      {authLockout > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 animate-pulse" />
          <span>Too many attempts. Security cooldown active: {authLockout}s remaining.</span>
        </div>
      )}

      {/* Social OAuth Buttons (Google & Apple) */}
      <div className="space-y-2.5">
        {/* Google OAuth */}
        <button
          type="button"
          onClick={() => handleOAuth("oauth_google")}
          disabled={oauthLoading !== null || loading || authLockout > 0}
          className="w-full py-2.5 px-4 rounded-xl bg-[#111111] hover:bg-[#1a1a1a] border border-white/10 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-3 transition-all duration-150 active:scale-[0.99] cursor-pointer disabled:opacity-50"
        >
          {oauthLoading === "google" ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>

        {/* Apple OAuth */}
        <button
          type="button"
          onClick={() => handleOAuth("oauth_apple")}
          disabled={oauthLoading !== null || loading || authLockout > 0}
          className="w-full py-2.5 px-4 rounded-xl bg-[#111111] hover:bg-[#1a1a1a] border border-white/10 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-3 transition-all duration-150 active:scale-[0.99] cursor-pointer disabled:opacity-50"
        >
          {oauthLoading === "apple" ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.37c.62-.75 1.04-1.8 0.92-2.87-.9.04-2 .6-2.65 1.35-.58.65-1.09 1.73-.95 2.76 1.01.08 2.05-.49 2.68-1.24z" />
            </svg>
          )}
          <span>Continue with Apple</span>
        </button>
      </div>

      {/* Centered Divider with Flanking Lines */}
      <div className="flex items-center my-3.5 gap-3">
        <div className="h-[1px] flex-1 bg-white/[0.08]" />
        <span className="text-[10px] sm:text-[11px] font-medium text-neutral-500 uppercase tracking-widest shrink-0 select-none">
          Or with email
        </span>
        <div className="h-[1px] flex-1 bg-white/[0.08]" />
      </div>

      {/* Email / Password Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {mode === "signup" && (
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Full name</label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Mercer"
                required
                disabled={authLockout > 0 || loading}
                className="w-full bg-[#111111] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1">Email address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              disabled={authLockout > 0 || loading}
              className="w-full bg-[#111111] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-neutral-300">
              Password {mode === "signup" ? "(min. 8 characters)" : ""}
            </label>
            {mode === "login" && (
              <button
                type="button"
                onClick={() => {
                  setMode("forgot_password");
                  setForgotStep(1);
                  setError(null);
                  setInfoMessage(null);
                }}
                className="text-[11px] text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            )}
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"}
              required
              minLength={mode === "signup" ? 8 : 1}
              disabled={authLockout > 0 || loading}
              className="w-full bg-[#111111] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || oauthLoading !== null || authLockout > 0 || !isAuthReady}
          className="w-full mt-2 py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs sm:text-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.99]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-black" />
              <span>{mode === "signup" ? "Creating account..." : "Signing in..."}</span>
            </>
          ) : !isAuthReady ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-black" />
              <span>Connecting...</span>
            </>
          ) : authLockout > 0 ? (
            <span>Wait {authLockout}s</span>
          ) : (
            <span>{mode === "signup" ? "Create Account" : "Sign In"}</span>
          )}
        </button>
      </form>

      {/* Switch between Login and Signup */}
      <div className="pt-2 text-center">
        {mode === "signup" ? (
          <p className="text-xs text-neutral-400">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className="text-white hover:underline font-semibold cursor-pointer ml-1"
            >
              Log in
            </button>
          </p>
        ) : (
          <p className="text-xs text-neutral-400">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
              className="text-white hover:underline font-semibold cursor-pointer ml-1"
            >
              Sign up
            </button>
          </p>
        )}
      </div>

      {/* Clerk Turnstile / Bot Protection Captcha Mount */}
      <div id="clerk-captcha" />
    </div>
  );
}
