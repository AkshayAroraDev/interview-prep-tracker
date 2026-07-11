"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";

import {
  createLoadingAuthState,
  getCurrentAuthState,
  listenForAuthChanges,
  signInWithGoogle as authSignInWithGoogle,
  signOut as authSignOut,
  type AuthState,
} from "@/lib/supabase/auth";

interface AuthContextValue {
  authState: AuthState;
  user: User | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(createLoadingAuthState);
  const [isActionPending, setIsActionPending] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const state = await getCurrentAuthState();
      if (isMounted) {
        setAuthState(state);
      }
    };

    void initializeAuth();

    const unsubscribe = listenForAuthChanges((state) => {
      if (isMounted) {
        setAuthState(state);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setIsActionPending(true);
    try {
      await authSignInWithGoogle(typeof window !== "undefined" ? window.location.origin : undefined);
    } finally {
      setIsActionPending(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsActionPending(true);
    try {
      await authSignOut();
    } finally {
      setIsActionPending(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      authState,
      user: authState.user,
      isLoading: authState.isLoading || isActionPending,
      signInWithGoogle,
      signOut,
    }),
    [authState, isActionPending, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
