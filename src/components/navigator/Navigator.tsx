
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";
import {
  createNavigatorContext,
  getNavigatorPageName,
} from "@/lib/navigator/navigator-context";
import { useNavigator } from "@/hooks/useNavigator";

import { NavigatorLauncher } from "./NavigatorLauncher";
import { NavigatorPanel } from "./NavigatorPanel";

import styles from "./navigator.module.css";

export default function Navigator() {
  const pathname = usePathname();
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const pageContext = useMemo(() => {
    return createNavigatorContext(
      pathname,
      getNavigatorPageName(pathname),
      pathname?.includes("/dock") ? "Dock Studio" : undefined
    );
  }, [pathname]);

  const navigator = useNavigator({
    context: pageContext,
  });

  useEffect(() => {
    let active = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      const authenticated = Boolean(session);

      setIsAuthenticated(authenticated);

      if (!authenticated) {
        setIsOpen(false);
        navigator.clearConversation();
      }
    });

    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!active) return;

        if (error) {
          console.error("Navigator session check failed:", error);
          setIsAuthenticated(false);
          setIsOpen(false);
          return;
        }

        setIsAuthenticated(Boolean(data.session));
      } catch (error) {
        console.error("Navigator session check failed:", error);

        if (active) {
          setIsAuthenticated(false);
          setIsOpen(false);
        }
      }
    };

    void checkSession();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [navigator.clearConversation]);

  useEffect(() => {
    navigator.setContext(pageContext);
  }, [pageContext, navigator.setContext]);

  const handleOpen = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        setIsAuthenticated(false);
        setIsOpen(false);
        router.push("/login");
        return;
      }

      setIsAuthenticated(true);
      setIsOpen(true);
    } catch (error) {
      console.error("Could not open Navigator:", error);
      setIsOpen(false);
    }
  }, [router]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <div className={styles.navigatorRoot}>
      {isAuthenticated && !isOpen && (
        <NavigatorLauncher onClick={handleOpen} />
      )}

      {isOpen && isAuthenticated && (
        <NavigatorPanel
          messages={navigator.messages}
          isLoading={navigator.isLoading}
          error={navigator.error}
          pageTitle={pageContext.pageTitle ?? "HackersHarbor"}
          onClose={handleClose}
          onSend={navigator.sendMessage}
          onStop={navigator.stopGeneration}
          onClear={navigator.clearConversation}
        />
      )}
    </div>
  );
}
