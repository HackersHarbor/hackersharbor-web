"use client";

import {
  Check,
  ChevronDown,
  Filter,
} from "lucide-react";

export type MessageFilter =
  | "all"
  | "questions"
  | "code"
  | "pinned";

interface MessageFiltersProps {
  value?: MessageFilter;
  onChange?: (value: MessageFilter) => void;
}

const FILTERS: {
  value: MessageFilter;
  label: string;
}[] = [
  {
    value: "all",
    label: "All messages",
  },
  {
    value: "questions",
    label: "Questions",
  },
  {
    value: "code",
    label: "Code",
  },
  {
    value: "pinned",
    label: "Pinned",
  },
];

export function MessageFilters({
  value = "all",
  onChange,
}: MessageFiltersProps) {
  const activeFilter =
    FILTERS.find(
      (filter) => filter.value === value,
    ) ?? FILTERS[0];

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-7 items-center gap-1.5 text-[9px] text-white/25">
        <Filter size={11} />

        <span>Filter</span>
      </div>

      <div className="relative">
        <select
          value={value}
          onChange={(event) =>
            onChange?.(
              event.target.value as MessageFilter,
            )
          }
          aria-label="Filter messages"
          className="h-7 appearance-none rounded-lg border border-white/[0.08] bg-white/[0.035] py-0 pl-2.5 pr-7 text-[9px] text-white/50 outline-none transition hover:border-white/[0.13] hover:bg-white/[0.05] focus:border-white/[0.16]"
        >
          {FILTERS.map((filter) => (
            <option
              key={filter.value}
              value={filter.value}
              className="bg-[#11161d] text-white"
            >
              {filter.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={11}
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white/25"
        />
      </div>

      {activeFilter.value !== "all" && (
        <button
          type="button"
          onClick={() => onChange?.("all")}
          className="flex h-7 items-center gap-1 rounded-lg border border-white/[0.07] bg-white/[0.025] px-2 text-[9px] text-white/35 transition hover:bg-white/[0.05] hover:text-white/60"
        >
          <Check size={10} />

          Clear
        </button>
      )}
    </div>
  );
}