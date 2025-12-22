"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { migrateAnonymousData } from "@/app/actions";
import { logAuditEvent } from "@/lib/audit-log";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasClaimed, setHasClaimed] = useState(false);

  useEffect(() => {
    // Check for existing session
    const initAuth = async () => {
      try {
        // Check for OAuth errors in URL
        const params = new URLSearchParams(window.location.search);
        const error = params.get('error');
        const errorCode = params.get('error_code');

        // If identity already exists, retry with regular OAuth sign-in
        if (errorCode === 'identity_already_exists') {
          console.log('Identity already linked, signing in with OAuth instead');
          // Clear the error from URL
          window.history.replaceState({}, '', window.location.pathname);
          // Sign in with OAuth instead
          await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/`
            }
          });
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);

          // Check for pending migration after OAuth
          const pendingMigrationUserId = localStorage.getItem('gif-stash-pending-migration-user-id');
          if (pendingMigrationUserId && !session.user.is_anonymous) {
            console.log('Detected pending migration from:', pendingMigrationUserId, 'to:', session.user.id);

            // Run migration
            try {
              const result = await migrateAnonymousData(pendingMigrationUserId, session.user.id);
              if (result.success) {
                console.log(`Migration successful: ${result.migratedLinks} links, ${result.migratedFolders} folders`);
                // Clear the migration flag
                localStorage.removeItem('gif-stash-pending-migration-user-id');
                // Reload to show combined data
                window.location.reload();
              } else {
                console.error('Migration failed:', result.error);
                // Clear flag even on failure to avoid retry loop
                localStorage.removeItem('gif-stash-pending-migration-user-id');
              }
            } catch (error) {
              console.error('Migration error:', error);
              // Clear flag to avoid retry loop
              localStorage.removeItem('gif-stash-pending-migration-user-id');
            }
          }
        } else {
          // No session - sign in anonymously
          const { data, error } = await supabase.auth.signInAnonymously();
          if (error) {
            console.error("Anonymous sign-in failed:", error);
          } else {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Check if migration has been done
  useEffect(() => {
    const claimed = localStorage.getItem("gif-stash-claimed");
    setHasClaimed(claimed === "true");
  }, []);

  const markAsClaimed = () => {
    localStorage.setItem("gif-stash-claimed", "true");
    setHasClaimed(true);
  };

  const signInWithGoogle = async () => {
    try {
      // Store anonymous user ID for potential migration
      if (isAnonymous && user) {
        localStorage.setItem('gif-stash-pending-migration-user-id', user.id);
        console.log('Stored anonymous user ID for migration:', user.id);
      }

      // First try to link identity (for new anonymous users)
      const { error: linkError } = await supabase.auth.linkIdentity({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      // If linking fails because identity already exists, sign in normally
      if (linkError) {
        if (linkError.message?.includes('already linked') || linkError.message?.includes('identity_already_exists')) {
          // This is a returning user - use regular OAuth sign-in
          const { error: signInError } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/`
            }
          });
          if (signInError) throw signInError;

          // Audit log: OAuth sign-in
          logAuditEvent('AUTH_SIGN_IN', undefined, { provider: 'google', type: 'oauth' });
        } else {
          // Some other error
          throw linkError;
        }
      } else {
        // Audit log: Identity linking
        logAuditEvent('AUTH_LINK_IDENTITY', user?.id, { provider: 'google' });
      }
    } catch (error) {
      console.error('Google sign-in failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Audit log: Sign out
      if (user) {
        logAuditEvent('AUTH_SIGN_OUT', user.id);
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  };

  const isAnonymous = user?.is_anonymous ?? false;

  return {
    user,
    isLoading,
    hasClaimed,
    markAsClaimed,
    isAnonymous,
    signInWithGoogle,
    signOut,
  };
}
