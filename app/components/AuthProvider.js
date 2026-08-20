"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { getSupabaseBrowser } from "../../lib/supabase/client";
import { clearAllCache } from "../../lib/client-cache";
import { resetInflight } from "../../lib/data-client";

const AuthContext = createContext({
  user: null,
  loading: true,
  isGuest: true,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const LAST_USER_KEY = "vocabularium.lastUser.v1";

function readCachedUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LAST_USER_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data && data.id ? data : null;
  } catch {
    return null;
  }
}

function writeCachedUser(user) {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      // Store only the fields the app actually reads.
      const minimal = {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata || {},
      };
      window.localStorage.setItem(LAST_USER_KEY, JSON.stringify(minimal));
    } else {
      window.localStorage.removeItem(LAST_USER_KEY);
    }
  } catch {
    // ignore
  }
}

export default function AuthProvider({ children, initialUser }) {
  // Start with the same state the server rendered (no localStorage access
  // during render) so hydration matches. The cached snapshot is applied in
  // an effect immediately after mount to keep the "instant render on repeat
  // visits" behavior.
  const [user, setUser] = useState(initialUser || null);
  const [loading, setLoading] = useState(!initialUser);
  const prevUserIdRef = useRef(initialUser?.id || null);

  useEffect(() => {
    const supabase = getSupabaseBrowser();

    if (!initialUser) {
      // Apply cached snapshot first for instant UI on repeat visits.
      const cachedUser = readCachedUser();
      if (cachedUser) {
        setUser(cachedUser);
        prevUserIdRef.current = cachedUser.id;
        setLoading(false);
      }

      // Verify in the background. If the cached user is stale (logged out
      // elsewhere, token expired), this will correct it.
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user);
        writeCachedUser(user);
        setLoading(false);
      });
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user || null;
      const prevUserId = prevUserIdRef.current;
      const nextUserId = nextUser?.id || null;
      if (prevUserId !== nextUserId) {
        clearAllCache();
        resetInflight();
        prevUserIdRef.current = nextUserId;
      }
      setUser(nextUser);
      writeCachedUser(nextUser);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [initialUser]);

  async function signOut() {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    setUser(null);
    writeCachedUser(null);
    clearAllCache();
    resetInflight();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isGuest: !user,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
