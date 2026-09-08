"use client";

import { ChevronRight, Pin } from "lucide-react";

interface PinnedBarProps {
  message?: string;
  onClick?: () => void;
}

export function PinnedBar({
  message = "Welcome to the community — share, learn, and build together.",
  onClick,
}: PinnedBarProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-[38px] w-full items-center gap-3 border-b border-white/[0.07] bg-white/[0.025] px-5 text-left backdrop-blur-xl transition-colors hover:bg-white/[0.045]"
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.045] text-white/40">
        <Pin size={12} strokeWidth={1.8} />
      </span>

      <span className="min-w-0 flex-1 truncate text-[10px] text-white/45">
        <span className="mr-1.5 font-medium text-white/65">
          Pinned
        </span>
        {message}
      </span>

      <ChevronRight
        size={13}
        className="shrink-0 text-white/25 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-white/50"
      />
    </button>
  );
}