"use client";

import {
  Bell,
  MoreHorizontal,
  Pin,
  Search,
} from "lucide-react";

interface ChannelActionsProps {
  onSearch?: () => void;
  onPinned?: () => void;
  onNotifications?: () => void;
  onMore?: () => void;
}

export function ChannelActions({
  onSearch,
  onPinned,
  onNotifications,
  onMore,
}: ChannelActionsProps) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        aria-label="Search messages"
        title="Search messages"
        onClick={onSearch}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/[0.06] hover:text-white/70"
      >
        <Search size={14} />
      </button>

      <button
        type="button"
        aria-label="Pinned messages"
        title="Pinned messages"
        onClick={onPinned}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/[0.06] hover:text-white/70"
      >
        <Pin size={14} />
      </button>

      <button
        type="button"
        aria-label="Channel notifications"
        title="Channel notifications"
        onClick={onNotifications}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/[0.06] hover:text-white/70"
      >
        <Bell size={14} />
      </button>

      <button
        type="button"
        aria-label="Channel options"
        title="Channel options"
        onClick={onMore}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/[0.06] hover:text-white/70"
      >
        <MoreHorizontal size={15} />
      </button>
    </div>
  );
}