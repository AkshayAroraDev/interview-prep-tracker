"use client";

import { Loader2, LogIn, LogOut } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function getMetadataValue(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function getInitials(nameOrEmail: string): string {
  const parts = nameOrEmail
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "U";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function AuthControls({ className }: { className?: string }) {
  const { user, isLoading, signInWithGoogle, signOut } = useAuth();

  const displayName = getMetadataValue(user?.user_metadata?.full_name) ?? getMetadataValue(user?.user_metadata?.name);
  const email = user?.email ?? null;
  const avatarUrl = getMetadataValue(user?.user_metadata?.avatar_url) ?? null;
  const label = displayName ?? email ?? "User";

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button variant="outline" size="sm" disabled>
          <Loader2 className="size-4 animate-spin" />
          Loading...
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button variant="outline" size="sm" onClick={() => void signInWithGoogle()}>
          <LogIn className="size-4" />
          Login with Google
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-card px-2 py-1">
        <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-semibold text-foreground">
          {avatarUrl ? (
            <img src={avatarUrl} alt={label} className="size-full object-cover" />
          ) : (
            getInitials(label)
          )}
        </div>
        <div className="hidden max-w-[180px] sm:block">
          <p className="truncate text-sm font-medium leading-none">{displayName ?? "Signed in user"}</p>
          <p className="truncate text-xs text-muted-foreground">{email ?? "No email available"}</p>
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={() => void signOut()}>
        <LogOut className="size-4" />
        Logout
      </Button>
    </div>
  );
}
