"use client";

import {
  Code2,
  Database,
  GitFork,
  Hash,
} from "lucide-react";

import type {
  Channel,
  ChannelIcon,
} from "../types/channel";

interface ChannelListItemProps {
  channel: Channel;
  active: boolean;
  onSelect: (channelId: string) => void;
}

const ICONS: Record<
  ChannelIcon,
  typeof Hash
> = {
  hash: Hash,
  code: Code2,
  database: Database,
  "git-fork": GitFork,
};

export function ChannelListItem({
  channel,
  active,
  onSelect,
}: ChannelListItemProps) {
  const Icon = ICONS[channel.icon];

  return (
    <button
      type="button"
      onClick={() => onSelect(channel.id)}
      className={[
        "group relative flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left",
        "transition-all duration-200",
        active
          ? [
              "bg-white/[0.11]",
              "border border-white/[0.08]",
              "shadow-[0_8px_25px_rgba(0,0,0,.12)]",
            ].join(" ")
          : [
              "border border-transparent",
              "hover:bg-white/[0.045]",
              "hover:border-white/[0.05]",
            ].join(" "),
      ].join(" ")}
    >
      {/* Active indicator */}

      {active && (
        <span className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-[#d5b86d] shadow-[0_0_8px_rgba(213,184,109,.35)]" />
      )}

      {/* Channel icon */}

      <span
        className={[
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          "border border-white/[0.08]",
          "bg-black/15",
          "backdrop-blur-xl",
          active
            ? "text-white/75"
            : "text-white/45 group-hover:text-white/65",
        ].join(" ")}
      >
        <Icon size={15} strokeWidth={1.8} />
      </span>

      {/* Channel information */}

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span
            className={[
              "truncate text-[13px] font-medium",
              active
                ? "text-white"
                : "text-white/72",
            ].join(" ")}
          >
            {channel.name}
          </span>

          {channel.online && (
            <span
              aria-label="Online"
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#67a77b] shadow-[0_0_7px_rgba(103,167,123,.45)]"
            />
          )}
        </span>

        <span className="mt-0.5 block truncate text-[10px] text-white/38">
          {channel.description}
        </span>
      </span>

      {/* Unread count */}

      {channel.unreadCount > 0 && (
        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md bg-[#8ba7df] px-1.5 text-[10px] font-semibold text-[#18243a]">
          {channel.unreadCount}
        </span>
      )}
    </button>
  );
}