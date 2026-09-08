"use client";

import { Search } from "lucide-react";

interface ChannelSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ChannelSearch({
  value,
  onChange,
  placeholder = "Search channels...",
}: ChannelSearchProps) {
  return (
    <div className="relative">
      <Search
        size={15}
        strokeWidth={1.8}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35"
      />

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Search channels"
        className="h-[38px] w-full rounded-xl border border-white/[0.12] bg-black/20 pl-9 pr-3 text-[12px] text-white outline-none backdrop-blur-xl transition-all placeholder:text-white/35 focus:border-white/[0.2] focus:bg-black/25 focus:ring-1 focus:ring-white/[0.04]"
      />
    </div>
  );
}