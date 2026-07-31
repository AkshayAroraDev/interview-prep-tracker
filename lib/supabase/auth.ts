import {
  type AuthChangeEvent,
  type AuthError,
  type Session,
  type User,
} from "@supabase/supabase-js";

import { supabase } from "./browser";

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: AuthError | null;
}

export type AuthStateChangeHandler = (
  state: AuthState,
  event: AuthChangeEvent,
) => void;

export const createLoadingAuthState = (): AuthState => ({
  user: null,
  session: null,
  isLoading: true,
  error: null,
});

export async function signInWithGoogle(redirectTo?: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });

  if (error) {
    throw error;
  }
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function getCurrentSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export async function getCurrentAuthState(): Promise<AuthState> {
  const loadingState = createLoadingAuthState();

  try {
    const session = await getCurrentSession();

    return {
      user: session?.user ?? null,
      session,
      isLoading: false,
      error: null,
    };
  } catch (error) {
    return {
      ...loadingState,
      isLoading: false,
      error: error instanceof Error ? (error as AuthError) : null,
    };
  }
}

export function listenForAuthChanges(handler: AuthStateChangeHandler): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    handler(
      {
        user: session?.user ?? null,
        session,
        isLoading: false,
        error: null,
      },
      event,
    );
  });

  return () => {
    subscription.unsubscribe();
  };
}
