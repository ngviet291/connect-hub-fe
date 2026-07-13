import { useEffect, useState } from "react";
import { userService } from "../service/userService";
import type { UserProfile } from "../types/user.types";

export const useUserById = (userId?: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(!!userId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    userService
      .getUserById(userId)
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load user");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { profile, isLoading, error };
};
