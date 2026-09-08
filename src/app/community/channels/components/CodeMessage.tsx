"use client";

import {
  Check,
  Copy,
  Play,
} from "lucide-react";

import { useState } from "react";

import type { CodeBlock } from "../types/message";

interface CodeMessageProps {
  code: CodeBlock;
}

export function CodeMessage({
  code,
}: CodeMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code.code);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.1] bg-[#080a0d]/55 shadow-[0_12px_35px_rgba(0,0,0,.22)] backdrop-blur-2xl">
      {/* Code header */}

      <div className="flex h-9 items-center justify-between border-b border-white/[0.07] bg-white/[0.025] px-3">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/[0.06] text-white/45">
            <Play size={10} fill="currentColor" />
          </span>

          <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/40">
            {code.language}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code"
          className="flex h-6 items-center gap-1.5 rounded-md px-2 text-[9px] text-white/35 transition hover:bg-white/[0.06] hover:text-white/70"
        >
          {copied ? (
            <>
              <Check size={11} />
              Copied
            </>
          ) : (
            <>
              <Copy size={11} />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code */}

      <pre className="overflow-x-auto px-4 py-3.5 text-[11px] leading-[1.7] text-white/75">
        <code>{code.code}</code>
      </pre>

      {/* Output */}

      {code.output && (
        <div className="border-t border-white/[0.07]">
          <div className="px-4 py-2 text-[8px] font-semibold uppercase tracking-[0.14em] text-white/25">
            Output
          </div>

          <pre className="overflow-x-auto px-4 pb-3 text-[10px] leading-[1.6] text-white/45">
            <code>{code.output}</code>
          </pre>
        </div>
      )}

      {/* Exit status */}

      {typeof code.exitCode === "number" && (
        <div className="flex h-7 items-center border-t border-white/[0.06] px-4">
          <span
            className={[
              "text-[8px] font-medium",
              code.exitCode === 0
                ? "text-[#71aa82]"
                : "text-[#c77b7b]",
            ].join(" ")}
          >
            {code.exitCode === 0
              ? "✓ Executed successfully"
              : `✕ Process exited with code ${code.exitCode}`}
          </span>
        </div>
      )}
    </div>
  );
}