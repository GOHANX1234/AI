"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useUser, useClerk } from "@clerk/nextjs";

export interface UserProfile {
  id: string;
  clerkId?: string;
  name: string;
  email: string;
  company?: string;
  role?: string;
  plan: string;
  avatar?: string;
  tokensUsed: number;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserLocal: (partial: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const updateUserLocal = useCallback((partial: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : null));
  }, []);

  const refreshUser = useCallback(async () => {
    if (!isSignedIn || !clerkUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      if (clerkUser.reload) {
        await clerkUser.reload();
      }

      const currentAvatar = clerkUser.imageUrl || undefined;
      const currentName = clerkUser.fullName || clerkUser.firstName || "User";
      const currentEmail = clerkUser.primaryEmailAddress?.emailAddress || "";

      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser({
            ...data.user,
            avatar: currentAvatar || data.user.avatar,
            name: currentName || data.user.name,
          });
          return;
        }
      }

      // Fallback directly to latest clerkUser
      setUser({
        id: clerkUser.id,
        clerkId: clerkUser.id,
        name: currentName,
        email: currentEmail,
        avatar: currentAvatar,
        plan: "Free",
        tokensUsed: 0,
      });
    } catch (err) {
      console.error("refreshUser error:", err);
      if (clerkUser) {
        setUser({
          id: clerkUser.id,
          clerkId: clerkUser.id,
          name: clerkUser.fullName || clerkUser.firstName || "User",
          email: clerkUser.primaryEmailAddress?.emailAddress || "",
          avatar: clerkUser.imageUrl,
          plan: "Free",
          tokensUsed: 0,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, clerkUser]);

  // Keep local user in sync when clerkUser avatar or name changes
  useEffect(() => {
    if (clerkLoaded) {
      if (isSignedIn && clerkUser) {
        refreshUser();
      } else {
        setUser(null);
        setLoading(false);
      }
    }
  }, [clerkLoaded, isSignedIn, clerkUser?.id, clerkUser?.imageUrl, clerkUser?.fullName, refreshUser]);

  const logout = async () => {
    setUser(null);
    try {
      await signOut();
    } catch (err) {
      console.error("Logout signOut error:", err);
    }
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading: !clerkLoaded || loading, logout, refreshUser, updateUserLocal }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
