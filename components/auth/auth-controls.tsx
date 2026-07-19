"use client";

import { Loader2, LogIn, LogOut } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function getMetadataValue(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function resolveAvatarSource(user: ReturnType<typeof useAuth>["user"]): {
  avatarUrl: string | null;
  avatarSource: string | null;
} {
  const avatarUrl =
    getMetadataValue(user?.user_metadata?.avatar_url) ??
    getMetadataValue(user?.user_metadata?.picture) ??
    getMetadataValue(user?.user_metadata?.avatar) ??
    null;

  if (avatarUrl === getMetadataValue(user?.user_metadata?.avatar_url)) {
    return { avatarUrl, avatarSource: "user_metadata.avatar_url" };
  }

  if (avatarUrl === getMetadataValue(user?.user_metadata?.picture)) {
    return { avatarUrl, avatarSource: "user_metadata.picture" };
  }

  if (avatarUrl === getMetadataValue(user?.user_metadata?.avatar)) {
    return { avatarUrl, avatarSource: "user_metadata.avatar" };
  }

  return { avatarUrl: null, avatarSource: null };
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
  const [avatarState, setAvatarState] = useState<"idle" | "loaded" | "error">("idle");

  const displayName = getMetadataValue(user?.user_metadata?.full_name) ?? getMetadataValue(user?.user_metadata?.name);
  const email = user?.email ?? null;
  const { avatarUrl, avatarSource } = resolveAvatarSource(user);
  const label = displayName ?? email ?? "User";

  useEffect(() => {
    setAvatarState("idle");

    if (process.env.NODE_ENV !== "production") {
      console.debug("[AuthControls][debug] avatar metadata received", {
        avatarUrl,
        avatarSource,
        displayName,
        email,
      });
    }
  }, [avatarSource, avatarUrl, displayName, email]);

  const handleAvatarLoad = () => {
    setAvatarState("loaded");

    if (process.env.NODE_ENV !== "production") {
      console.debug("[AuthControls][debug] avatar image loaded", { avatarUrl, avatarSource });
    }
  };

  const handleAvatarError = () => {
    setAvatarState("error");

    if (process.env.NODE_ENV !== "production") {
      console.debug("[AuthControls][debug] avatar image failed to load", { avatarUrl, avatarSource });
    }
  };

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
        <div className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-fluid-helper font-semibold text-foreground">
          <span
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-opacity duration-150",
              avatarUrl && avatarState === "loaded" ? "opacity-0" : "opacity-100",
            )}
          >
            {getInitials(label)}
          </span>

          {avatarUrl && avatarState !== "error" ? (
            <Image
              src={avatarUrl}
              alt={label}
              fill
              sizes="32px"
              unoptimized
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onLoad={handleAvatarLoad}
              onError={handleAvatarError}
              className={cn(
                "absolute inset-0 rounded-full object-cover transition-opacity duration-150",
                avatarState === "loaded" ? "opacity-100" : "opacity-0",
              )}
            />
          ) : null}
        </div>
        <div className="hidden max-w-[180px] sm:block">
          <p className="truncate text-fluid-label font-medium leading-none">{displayName ?? "Signed in user"}</p>
          <p className="truncate text-fluid-helper text-muted-foreground">{email ?? "No email available"}</p>
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={() => void signOut()}>
        <LogOut className="size-4" />
        Logout
      </Button>
    </div>
  );
}
