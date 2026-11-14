
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function JournalRoleCheckPage() {
  const [result, setResult] = useState("Checking session...");

  useEffect(() => {
    async function checkRole() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        setResult("No authenticated user. Please log in first.");
        return;
      }

      setResult(
        JSON.stringify(
          {
            email: user.email,
            journal_role:
              user.app_metadata?.journal_role ?? "Not assigned",
            app_metadata: user.app_metadata,
          },
          null,
          2
        )
      );
    }

    checkRole();
  }, []);

  return (
    <main style={{ padding: 40, fontFamily: "monospace" }}>
      <h1>Journal Account Verification</h1>
      <pre>{result}</pre>
    </main>
  );
}
