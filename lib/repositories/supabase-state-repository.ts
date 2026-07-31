import { seedData } from "@/data/seed";
import { supabase } from "@/lib/supabase/browser";
import type { TrackerState } from "@/types";

interface UserStateRow {
  id: string;
  user_id: string;
  state_json: TrackerState;
  created_at: string;
  updated_at: string;
}

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

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  console.log("Authenticated user:", user);
  console.log("Authenticated user id:", user?.id);
  console.log("Insert user id:", userId);
  console.log("Auth error:", authError);


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
