"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { createNavigatorContext, getNavigatorPageName } from "@/lib/navigator/navigator-context";
import { useNavigator } from "@/hooks/useNavigator";

import { NavigatorLauncher } from "./NavigatorLauncher";
import { NavigatorPanel } from "./NavigatorPanel";

import styles from "./navigator.module.css";

export default function Navigator() {
  const pathname = usePathname();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
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

    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!active) return;

      setIsAuthenticated(!error && Boolean(data.session));
      setAuthChecked(true);
    };

    void checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      setIsAuthenticated(Boolean(session));
      setAuthChecked(true);

      if (!session) {
        setIsOpen(false);
        navigator.clearConversation();
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [navigator.clearConversation]);

  useEffect(() => {
    navigator.setContext(pageContext);
  }, [pageContext, navigator.setContext]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  if (!authChecked || !isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.navigatorRoot}>
      {!isOpen && (
        <NavigatorLauncher onClick={handleOpen} />
      )}

      {isOpen && (
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
