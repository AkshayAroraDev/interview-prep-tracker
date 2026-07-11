import { seedData } from "@/data/seed";
import { supabase } from "@/lib/supabase/client";
import { getCurrentSession } from "@/lib/supabase/auth";
import type { TrackerState } from "@/types";

interface UserStateRow {
  id: string;
  user_id: string;
  state_json: TrackerState;
  created_at: string;
  updated_at: string;
}

type SupabaseRepositoryContract = {
  load: () => Promise<TrackerState>;
  save: (state: TrackerState) => Promise<void>;
};

function createInitialState(): TrackerState {
  return structuredClone(seedData);
}

function isTrackerState(value: unknown): value is TrackerState {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as TrackerState).technologies)
  );
}

async function getAuthenticatedUserId(): Promise<string> {
  const session = await getCurrentSession();
  const user = session?.user;

  if (!user) {
    throw new Error("SupabaseRepository requires an authenticated user.");
  }

  return user.id;
}

async function fetchUserState(userId: string): Promise<UserStateRow | null> {
  const { data, error } = await supabase
    .from("user_state")
    .select("id, user_id, state_json, created_at, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return data as UserStateRow;
}

async function insertInitialUserState(userId: string): Promise<TrackerState> {
  const initialState = createInitialState();

  const { data, error } = await supabase
    .from("user_state")
    .insert({
      user_id: userId,
      state_json: initialState,
    })
    .select("state_json")
    .single();

  if (error) {
    throw error;
  }

  const stateJson = (data as { state_json?: unknown } | null)?.state_json;

  return isTrackerState(stateJson) ? structuredClone(stateJson) : initialState;
}

export async function loadUserStateByUserId(userId: string): Promise<TrackerState> {
  const existing = await fetchUserState(userId);

  if (existing && isTrackerState(existing.state_json)) {
    return structuredClone(existing.state_json);
  }

  if (existing) {
    return createInitialState();
  }

  return insertInitialUserState(userId);
}

export async function saveUserStateByUserId(
  userId: string,
  state: TrackerState,
): Promise<void> {
  const { error } = await supabase.from("user_state").upsert(
    {
      user_id: userId,
      state_json: state,
    },
    {
      onConflict: "user_id",
    },
  );

  if (error) {
    throw error;
  }
}

export const supabaseRepository: SupabaseRepositoryContract = {
  async load(): Promise<TrackerState> {
    const userId = await getAuthenticatedUserId();
    return loadUserStateByUserId(userId);
  },

  async save(state: TrackerState): Promise<void> {
    const userId = await getAuthenticatedUserId();
    await saveUserStateByUserId(userId, state);
  },
};
