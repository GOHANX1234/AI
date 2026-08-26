"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { useAuth } from "@/context/AuthContext";
import ClerXLogo from "@/components/ui/ClerXLogo";
import UserAvatar from "@/components/ui/UserAvatar";
import {
  ArrowLeft,
  User,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Camera,
  LogOut,
  Calendar,
  Check,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  Clock,
  X,
  ArrowRight,
  Shield,
  Brain,
  Sliders,
} from "lucide-react";
import MemoryModal from "@/components/chat/MemoryModal";

// High-quality modern avatar presets
const AVATAR_PRESETS = [
  {
    id: "cosmic-wave",
    name: "Cosmic Obsidian",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=256&h=256&fit=crop&q=80",
  },
  {
    id: "neon-prism",
    name: "Neon Prism",
    url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=256&h=256&fit=crop&q=80",
  },
  {
    id: "liquid-chrome",
    name: "Liquid Chrome",
    url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=256&h=256&fit=crop&q=80",
  },
  {
    id: "aurora-velvet",
    name: "Aurora Velvet",
    url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=256&h=256&fit=crop&q=80",
  },
  {
    id: "gradient-flow",
    name: "Cyber Horizon",
    url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=256&h=256&fit=crop&q=80",
  },
  {
    id: "neural-mesh",
    name: "Neural Mesh",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=256&h=256&fit=crop&q=80",
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useUser();
  const clerk = useClerk();
  const { signOut } = clerk;
  const { user: dbUser, refreshUser, updateUserLocal, logout } = useAuth();

  // Name editing
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // Avatar upload & presets
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // Password Management (Only for Email-based accounts)
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // In-profile Forgot Password Reset via Email Code
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [resetCode, setResetCode] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [showResetNewPassword, setShowResetNewPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetInfo, setResetInfo] = useState<string | null>(null);
  const [resetCooldown, setResetCooldown] = useState(0);
  const [showMemoryModal, setShowMemoryModal] = useState(false);

  // Cooldown timer for profile reset
  useEffect(() => {
    if (resetCooldown <= 0) return;
    const timer = setInterval(() => {
      setResetCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resetCooldown]);

  // Sync state when clerkUser loads
  useEffect(() => {
    if (clerkUser) {
      setFirstName(clerkUser.firstName || "");
      setLastName(clerkUser.lastName || "");
    }
  }, [clerkUser]);

  // Redirect to login if not signed in after loading
  useEffect(() => {
    if (clerkLoaded && !isSignedIn) {
      router.push("/login");
    }
  }, [clerkLoaded, isSignedIn, router]);

  if (!clerkLoaded || !clerkUser) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          <p className="text-xs text-neutral-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Determine if this user is registered via email & password vs social OAuth (Google/Apple)
  const hasPassword = Boolean(clerkUser.passwordEnabled);
  const hasSocialAccounts = Boolean(
    clerkUser.externalAccounts && clerkUser.externalAccounts.length > 0
  );
  // Email-only account check
  const isEmailPasswordUser = hasPassword || !hasSocialAccounts;

  // Handle Name Update
  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(null);
    setNameSuccess(false);
    setSavingName(true);

    try {
      await clerkUser.update({
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
      });
      if (clerkUser.reload) await clerkUser.reload();
      updateUserLocal({ name: `${firstName.trim()} ${lastName.trim()}`.trim() });
      await refreshUser();
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3500);
    } catch (err: any) {
      setNameError(err.errors?.[0]?.message || err.message || "Failed to update name.");
    } finally {
      setSavingName(false);
    }
  };

  // Handle Avatar Image Upload from File
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image must be smaller than 5MB.");
      return;
    }

    setAvatarError(null);
    setAvatarSuccess(false);
    setUploadingAvatar(true);

    try {
      const res: any = await clerkUser.setProfileImage({ file });
      if (clerkUser.reload) await clerkUser.reload();
      const newAvatarUrl = res?.publicUrl || clerkUser.imageUrl;
      if (newAvatarUrl) {
        updateUserLocal({ avatar: newAvatarUrl });
      }
      await refreshUser();
      setAvatarSuccess(true);
      setTimeout(() => setAvatarSuccess(false), 3500);
    } catch (err: any) {
      setAvatarError(err.errors?.[0]?.message || err.message || "Failed to upload avatar.");
    } finally {
      setUploadingAvatar(false);
      if (e.target) e.target.value = "";
    }
  };

  // Handle High-Quality Preset Selection
  const handleSelectPreset = async (preset: { id: string; url: string }) => {
    setSelectedPreset(preset.id);
    setAvatarError(null);
    setAvatarSuccess(false);
    setUploadingAvatar(true);

    try {
      const response = await fetch(preset.url);
      const blob = await response.blob();
      const file = new File([blob], `${preset.id}.jpg`, { type: "image/jpeg" });

      const res: any = await clerkUser.setProfileImage({ file });
      if (clerkUser.reload) await clerkUser.reload();
      const newAvatarUrl = res?.publicUrl || clerkUser.imageUrl;
      if (newAvatarUrl) {
        updateUserLocal({ avatar: newAvatarUrl });
      }
      await refreshUser();
      setAvatarSuccess(true);
      setTimeout(() => setAvatarSuccess(false), 3500);
    } catch (err: any) {
      setAvatarError("Failed to apply avatar preset.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle Password Update (Direct Update)
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match. Please verify.");
      return;
    }

    if (hasPassword && !currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }

    setSavingPassword(true);

    try {
      if (hasPassword && currentPassword) {
        await clerkUser.updatePassword({
          currentPassword,
          newPassword,
        });
      } else {
        await clerkUser.updatePassword({
          newPassword,
        });
      }

      if (clerkUser.reload) await clerkUser.reload();
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err: any) {
      console.error("Update password error:", err);
      const isIncorrect =
        err.errors?.[0]?.code === "form_password_incorrect" ||
        err.errors?.[0]?.message?.toLowerCase().includes("incorrect") ||
        err.errors?.[0]?.longMessage?.toLowerCase().includes("incorrect");

      const isPwned =
        err.errors?.[0]?.code === "form_password_pwned" ||
        err.errors?.[0]?.longMessage?.toLowerCase().includes("breached") ||
        err.message?.toLowerCase().includes("breached");

      if (isIncorrect) {
        setPasswordError("Current password is incorrect. If you forgot it, use the reset option below.");
      } else if (isPwned) {
        setPasswordError("This password has been flagged by security as commonly breached. Please choose a more unique 8+ character password.");
      } else {
        setPasswordError(
          err.errors?.[0]?.longMessage ||
          err.errors?.[0]?.message ||
          err.message ||
          "Failed to update password. Please verify your details."
        );
      }
    } finally {
      setSavingPassword(false);
    }
  };

  // Handle In-Profile Password Reset: Request Code
  const handleProfileRequestReset = async () => {
    setResetLoading(true);
    setResetError(null);
    setResetInfo(null);

    const userEmail = clerkUser.primaryEmailAddress?.emailAddress;
    if (!userEmail) {
      setResetError("No primary email found for your account.");
      setResetLoading(false);
      return;
    }

    try {
      if (!clerk.loaded || !clerk.client) return;

      const signInAttempt = await clerk.client.signIn.create({
        identifier: userEmail,
      });

      const resetFactor: any = signInAttempt.supportedFirstFactors?.find(
        (ff: any) => ff.strategy === "reset_password_email_code"
      );

      if (!resetFactor || !resetFactor.emailAddressId) {
        setResetError("Password reset is not enabled for this authentication provider.");
        setResetLoading(false);
        return;
      }

      await clerk.client.signIn.prepareFirstFactor({
        strategy: "reset_password_email_code",
        emailAddressId: resetFactor.emailAddressId,
      });

      setResetStep(2);
      setResetCooldown(60);
      setResetInfo(`A 6-digit reset code has been sent to ${userEmail}`);
    } catch (err: any) {
      console.error("Profile reset request error:", err);
      setResetError(
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        err.message ||
        "Unable to send reset code. Please try again."
      );
    } finally {
      setResetLoading(false);
    }
  };

  // Handle In-Profile Password Reset: Submit Code & New Password
  const handleProfileSubmitReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetCode.trim()) {
      setResetError("Please enter the 6-digit code sent to your email.");
      return;
    }

    if (resetNewPassword.length < 8) {
      setResetError("New password must be at least 8 characters.");
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setResetError("Passwords do not match.");
      return;
    }

    setResetLoading(true);
    setResetError(null);

    try {
      if (!clerk.loaded || !clerk.client) return;

      const result = await clerk.client.signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: resetCode.trim(),
        password: resetNewPassword,
      });

      if (result.status === "complete" && result.createdSessionId) {
        await clerk.setActive({ session: result.createdSessionId });
        if (clerkUser.reload) await clerkUser.reload();
        setShowResetModal(false);
        setPasswordSuccess(true);
        setResetStep(1);
        setResetCode("");
        setResetNewPassword("");
        setResetConfirmPassword("");
        setTimeout(() => setPasswordSuccess(false), 4000);
      } else {
        setResetError("Password reset incomplete. Please try again.");
      }
    } catch (err: any) {
      console.error("Profile reset submit error:", err);
      const isPwned =
        err.errors?.[0]?.code === "form_password_pwned" ||
        err.errors?.[0]?.longMessage?.toLowerCase().includes("breached");

      if (isPwned) {
        setResetError("This password has been flagged by security as commonly breached. Please choose a more unique password.");
      } else {
        setResetError(
          err.errors?.[0]?.longMessage ||
          err.errors?.[0]?.message ||
          err.message ||
          "Invalid reset code or password."
        );
      }
    } finally {
      setResetLoading(false);
    }
  };

  const memberSince = clerkUser.createdAt
    ? new Date(clerkUser.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recent";

  return (
    <div className="min-h-screen bg-[#000000] text-[#ececec] flex flex-col">
      {/* Top Navigation */}
      <header className="h-16 px-4 sm:px-8 border-b border-white/[0.08] bg-[#000000]/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <ClerXLogo size="md" />
          </Link>
          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest hidden sm:inline-block">
            Account & Profile
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#161616] hover:bg-[#222222] border border-white/10 text-xs font-medium text-white transition-all active:scale-[0.98]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Chat</span>
          </Link>

          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Profile Overview Card */}
        <div className="bg-[#0c0c0c] border border-white/[0.08] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          {/* Subtle Glow Background */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            {/* Avatar with Upload Trigger */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/15">
                <UserAvatar
                  src={clerkUser.imageUrl}
                  name={clerkUser.fullName || clerkUser.firstName}
                  email={clerkUser.primaryEmailAddress?.emailAddress}
                  size="2xl"
                  className="w-full h-full rounded-none"
                />
              </div>

              {/* Upload Hover Overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 rounded-3xl bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 text-white text-[11px] font-medium transition-all backdrop-blur-[2px] cursor-pointer"
                title="Change photo"
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    <span>Upload</span>
                  </>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* User Meta Information */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {clerkUser.fullName || clerkUser.firstName || "ClerX User"}
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10 text-[11px] font-medium text-neutral-300">
                  {dbUser?.plan || "Free"} Workspace
                </span>
              </div>

              <p className="text-xs sm:text-sm text-neutral-400 flex items-center justify-center sm:justify-start gap-2">
                <span>{clerkUser.primaryEmailAddress?.emailAddress}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-neutral-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Member since {memberSince}</span>
                </div>
              </div>

              {avatarSuccess && (
                <p className="text-xs text-emerald-400 pt-1">Avatar updated successfully!</p>
              )}
              {avatarError && (
                <p className="text-xs text-red-400 pt-1">{avatarError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Choose Avatar Presets Section */}
        <div className="bg-[#0c0c0c] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Avatar Style</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Choose a high-resolution 3D preset or upload your custom photo above.
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2">
            {AVATAR_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                disabled={uploadingAvatar}
                className="group relative rounded-2xl overflow-hidden border-2 border-white/10 hover:border-white/40 focus:border-white transition-all cursor-pointer aspect-square bg-[#161616] p-0.5 disabled:opacity-50 active:scale-95"
                title={`Apply ${preset.name}`}
              >
                <img
                  src={preset.url}
                  alt={preset.name}
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                  {uploadingAvatar && selectedPreset === preset.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Personal Details Form */}
        <div className="bg-[#0c0c0c] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Personal Details</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Update your display name and view your account information.
            </p>
          </div>

          {nameSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Profile updated successfully.</span>
            </div>
          )}

          {nameError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{nameError}</span>
            </div>
          )}

          <form onSubmit={handleSaveName} className="space-y-4 max-w-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  First Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full bg-[#161616] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-3 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-[#161616] border border-white/[0.08] rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Primary Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={clerkUser.primaryEmailAddress?.emailAddress || ""}
                  disabled
                  className="w-full bg-[#141414] border border-white/[0.06] rounded-xl py-2.5 pl-10 pr-3 text-xs sm:text-sm text-neutral-400 cursor-not-allowed opacity-75"
                />
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Email address is linked to your authentication provider.
              </p>
            </div>

            <button
              type="submit"
              disabled={savingName}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {savingName ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </form>
        </div>

        {/* Security & Password Section (Exclusively for Email-registered users) */}
        {isEmailPasswordUser ? (
          <div className="bg-[#0c0c0c] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Lock className="w-4 h-4 text-neutral-400" />
                  <span>Security & Password</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Update your password or reset it via email verification code.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowResetModal(true);
                  setResetStep(1);
                  setResetError(null);
                  setResetInfo(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white font-medium px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Forgot password?</span>
              </button>
            </div>

            {passwordSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Password updated successfully.</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
              {hasPassword && (
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-[#161616] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      required
                      minLength={8}
                      className="w-full bg-[#161616] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
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
                      placeholder="Repeat password"
                      required
                      minLength={8}
                      className="w-full bg-[#161616] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
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
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={savingPassword || newPassword.length < 8 || confirmPassword.length < 8}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {savingPassword ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Social OAuth User Notice */
          <div className="bg-[#0c0c0c] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-3 shadow-xl">
            <div className="flex items-center gap-2.5 text-neutral-300">
              <Shield className="w-5 h-5 text-neutral-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Authentication & Security
              </h2>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-lg">
              Your account is authenticated via{" "}
              <strong className="text-neutral-200">
                {clerkUser.externalAccounts?.[0]?.provider === "google"
                  ? "Google"
                  : clerkUser.externalAccounts?.[0]?.provider === "apple"
                  ? "Apple"
                  : "Social Sign-In"}
              </strong>
              . Passwords and two-factor authentication are securely managed by your identity provider.
            </p>
          </div>
        )}

        {/* AI Memory & Personalization Card */}
        <div className="bg-[#0c0c0c] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Brain className="w-5 h-5 text-sky-400" />
                <span>AI Memory & Personalization</span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Active
                </span>
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-xl">
                ClerX AI learns your coding preferences, project details, and guidelines across sessions. Manage what the AI remembers or customize response instructions.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowMemoryModal(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold transition-all cursor-pointer shadow-md shrink-0 self-start sm:self-auto"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Manage Memory</span>
            </button>
          </div>
        </div>

        {/* Memory & Personalization Hub Modal */}
        <MemoryModal
          isOpen={showMemoryModal}
          onClose={() => setShowMemoryModal(false)}
        />

        {/* IN-PROFILE FORGOT PASSWORD MODAL */}
        {showResetModal && (
          <div
            onClick={() => setShowResetModal(false)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0c0c0c] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-5"
            >
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 text-white">
                  {resetStep === 1 ? (
                    <KeyRound className="w-6 h-6 text-white" />
                  ) : (
                    <ShieldCheck className="w-6 h-6 text-white" />
                  )}
                </div>

                <h3 className="text-xl font-bold text-white tracking-tight">
                  {resetStep === 1 ? "Reset Account Password" : "Enter Code & New Password"}
                </h3>
                <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
                  {resetStep === 1
                    ? `We will send a 6-digit verification code to ${clerkUser.primaryEmailAddress?.emailAddress}.`
                    : resetInfo || "Enter the 6-digit code and set your new password."}
                </p>
              </div>

              {resetError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{resetError}</span>
                </div>
              )}

              {resetStep === 1 ? (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-[#141414] border border-white/[0.06] text-xs text-neutral-300 flex items-center gap-3">
                    <Mail className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span className="font-mono text-white truncate">
                      {clerkUser.primaryEmailAddress?.emailAddress}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleProfileRequestReset}
                    disabled={resetLoading || resetCooldown > 0}
                    className="w-full py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs sm:text-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    {resetLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>Sending reset code...</span>
                      </>
                    ) : resetCooldown > 0 ? (
                      <span>Wait {resetCooldown}s</span>
                    ) : (
                      <>
                        <span>Send 6-Digit Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleProfileSubmitReset} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      6-Digit Reset Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="••••••"
                      autoFocus
                      required
                      className="w-full bg-[#161616] border border-white/10 rounded-xl py-2.5 px-4 text-center text-xl font-mono tracking-[0.3em] text-white placeholder-neutral-600 focus:outline-none focus:border-white/40 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      New Password (min. 8 characters)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showResetNewPassword ? "text" : "password"}
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        required
                        minLength={8}
                        className="w-full bg-[#161616] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetNewPassword(!showResetNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 cursor-pointer"
                      >
                        {showResetNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                        type={showResetConfirmPassword ? "text" : "password"}
                        value={resetConfirmPassword}
                        onChange={(e) => setResetConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        required
                        minLength={8}
                        className="w-full bg-[#161616] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 cursor-pointer"
                      >
                        {showResetConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading || resetCode.length < 6 || resetNewPassword.length < 8}
                    className="w-full mt-2 py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs sm:text-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    {resetLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>Updating password...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm & Reset Password</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-white/[0.06]">
                    <button
                      type="button"
                      onClick={handleProfileRequestReset}
                      disabled={resetCooldown > 0 || resetLoading}
                      className="hover:text-white transition-colors cursor-pointer disabled:text-neutral-600 flex items-center gap-1.5"
                    >
                      {resetCooldown > 0 ? (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span>Resend in {resetCooldown}s</span>
                        </>
                      ) : (
                        <span>Resend code</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setResetStep(1)}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

