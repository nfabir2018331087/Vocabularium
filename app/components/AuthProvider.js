"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { getSupabaseBrowser } from "../../lib/supabase/client";
import { clearAllCache } from "../../lib/client-cache";

const AuthContext = createContext({
  user: null,
  loading: true,
  isGuest: true,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children, initialUser }) {
  const [user, setUser] = useState(initialUser || null);
  const [loading, setLoading] = useState(!initialUser);
  const prevUserIdRef = useRef(initialUser?.id || null);

  useEffect(() => {
    const supabase = getSupabaseBrowser();

    if (!initialUser) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user);
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
        prevUserIdRef.current = nextUserId;
      }
      setUser(nextUser);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [initialUser]);

  async function signOut() {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    setUser(null);
    clearAllCache();
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
