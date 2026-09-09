"use client";

import type { Channel } from "../types/channel";

import { ChannelActions } from "./ChannelActions";
import { ChannelInfo } from "./ChannelInfo";

interface ChannelToolbarProps {
  channel: Channel;
  onSearch?: () => void;
  onPinned?: () => void;
  onNotifications?: () => void;
  onMore?: () => void;
}

export function ChannelToolbar({
  channel,
  onSearch,
  onPinned,
  onNotifications,
  onMore,
}: ChannelToolbarProps) {
  return (
    <header
      className="
        relative
        shrink-0
        overflow-hidden
        border-b
        border-white/[0.07]
        bg-white/[0.018]
        px-5
        py-3
        backdrop-blur-3xl
      "
    >
      {/* top glass reflection */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-px
          bg-white/[0.075]
        "
      />

      {/* subtle ambient light */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-[15%]
          top-[-90px]
          h-[180px]
          w-[320px]
          rounded-full
          bg-white/[0.018]
          blur-[70px]
        "
      />

      <div className="relative flex min-w-0 items-center justify-between gap-4">
        <ChannelInfo channel={channel} />

        <ChannelActions
          onSearch={onSearch}
          onPinned={onPinned}
          onNotifications={onNotifications}
          onMore={onMore}
        />
      </div>
    </header>
  );
}