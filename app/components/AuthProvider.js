"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getSupabaseBrowser } from "../../lib/supabase/client";

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
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [initialUser]);

  async function signOut() {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    setUser(null);
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
